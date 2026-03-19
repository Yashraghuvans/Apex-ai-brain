import rulesLoader from '../core/rules-loader.js';
import skillsLoader from '../core/skills-loader.js';

class PromptBuilder {
  constructor() {
    this.skillMap = {
      apex: ['apex-patterns', 'apex-governor-limits', 'apex-bulkification', 'apex-security'],
      lwc: ['lwc-patterns', 'lwc-best-practices'],
      trigger: ['trigger-framework', 'apex-bulkification'],
      soql: ['soql-mastery', 'query-optimization'],
      deploy: ['deployment-strategy', 'sfdx-workflow'],
      test: ['apex-tdd', 'test-data-factory'],
      plan: ['fsd-architecture', 'task-decomposition'],
      fix: ['apex-governor-limits', 'apex-bulkification'],
    };
  }

  /**
   * Build system prompt for any AI call
   * Dynamically loads rules and injects project summary
   */
  async buildSystemPrompt(context) {
    const coreRules = await rulesLoader.getInjectableCore();
    const projectSummary = this.extractProjectSummary(context);

    return `You are a senior Salesforce architect and expert AI assistant.

You MUST strictly follow these enforcement rules on every single response:

${coreRules}

---

PROJECT CONTEXT:
${projectSummary}

---

GUIDELINES:
- Never violate any of the above rules, even if asked
- When in doubt, ask for clarification
- Always optimize for security, performance, and maintainability
- Consider governor limits and bulk operations in every response
- Use FSD architecture pattern in all Salesforce code generation
`;
  }

  /**
   * Build prompt for a specific agent
   * Includes role, task, and relevant memory
   */
  async buildAgentPrompt(agentDefinition, task, sharedMemory, context) {
    const systemPrompt = await this.buildSystemPrompt(context);
    const memoryContext = this.formatMemory(sharedMemory);
    const agentRole = agentDefinition.content || agentDefinition.description || '';

    return `${systemPrompt}

AGENT ROLE:
${agentRole}

RECENT CONTEXT (Last 5 entries):
${memoryContext}

TASK:
${typeof task === 'string' ? task : JSON.stringify(task, null, 2)}

Please complete this task following all enforcement rules above.`;
  }

  /**
   * Build prompt for user command
   * Includes command-specific rules and relevant context only
   */
  async buildUserPrompt(command, args, context) {
    const coreRules = await rulesLoader.getInjectableCore();
    const relevantContext = this.extractRelevantContext(context, command);

    return `You are a helpful Salesforce development assistant.

Follow these core enforcement rules:
${coreRules}

---

PROJECT CONTEXT (relevant to this command):
${relevantContext}

---

USER COMMAND:
/${command} ${args.join(' ')}

Please help complete this command while following all rules above.`;
  }

  /**
   * Extract only relevant context based on command type
   * Prevents token waste by including only needed information
   */
  extractRelevantContext(context, command) {
    if (!context) {
      return 'No project context. Run /init first to scan your Salesforce project.';
    }

    const base = {
      projectType: context.projectType || 'unknown',
      complexity: context.complexity || 'unknown',
      framework: context.detectedFramework || 'none detected',
    };

    // Add relevant file lists based on command
    if (command.includes('apex') || command.includes('trigger')) {
      base.apexClasses = (context.allFiles?.apexClasses || []).slice(0, 15);
      base.triggers = context.allFiles?.triggers || [];
    }
    if (command.includes('lwc')) {
      base.lwcComponents = (context.allFiles?.lwcComponents || []).slice(0, 15);
    }
    if (command.includes('deploy') || command.includes('diff')) {
      base.fileStats = context.stats || {};
    }
    if (command.includes('test')) {
      base.testClasses = (context.allFiles?.testClasses || []).slice(0, 10);
    }

    // Always include anti-patterns if found
    if (context.antiPatterns && context.antiPatterns.length > 0) {
      base.knownIssues = context.antiPatterns;
    }

    return JSON.stringify(base, null, 2);
  }

  /**
   * Extract project summary for system prompt
   * Brief overview of the Salesforce project
   */
  extractProjectSummary(context) {
    if (!context) {
      return 'No project analyzed yet.\nRun: /init to scan your Salesforce project.';
    }

    const lines = [
      `Project Type: ${context.projectType || 'unknown'}`,
      `Complexity Level: ${context.complexity || 'unknown'}`,
      `Framework: ${context.detectedFramework || 'none detected'}`,
    ];

    if (context.stats) {
      lines.push(
        `Files: ${context.stats.classCount || 0} Apex classes, ` +
        `${context.stats.triggerCount || 0} triggers, ` +
        `${context.stats.lwcCount || 0} LWC components, ` +
        `${context.stats.testCount || 0} test classes`
      );
    }

    if (context.antiPatterns && context.antiPatterns.length > 0) {
      lines.push(`Known Issues: ${context.antiPatterns.join(', ')}`);
    }

    return lines.join('\n');
  }

  /**
   * Format shared memory entries for inclusion in prompt
   * Only includes last 5 entries to conserve tokens
   */
  formatMemory(sharedMemory) {
    if (!sharedMemory || Object.keys(sharedMemory).length === 0) {
      return '(No shared context yet)';
    }

    return Object.entries(sharedMemory)
      .slice(-5)
      .map(([key, entry]) => {
        const value = entry.value || entry;
        const summary = JSON.stringify(value).slice(0, 150);
        return `- ${key}: ${summary}${JSON.stringify(value).length > 150 ? '...' : ''}`;
      })
      .join('\n');
  }

  /**
   * Get skills relevant to a command
   * Returns skill content for injection into prompts
   */
  async getSkillsForCommand(command) {
    const key = Object.keys(this.skillMap).find(k => command.includes(k));
    if (!key) {
      return ''; // No skills mapped to this command
    }

    const skillNames = this.skillMap[key];
    let skillContent = '';

    for (const skillName of skillNames) {
      try {
        const skill = await skillsLoader.load(skillName, 'salesforce-core');
        if (skill && skill.enabled) {
          skillContent += `\n## ${skill.name}\n${skill.content}\n`;
        }
      } catch (error) {
        // Skill not found, continue
      }
    }

    return skillContent;
  }

  /**
   * Inject rules dynamically into a custom prompt
   * Useful for one-off prompts not covered by build methods
   */
  async injectRules(prompt) {
    const coreRules = await rulesLoader.getInjectableCore();
    return `${coreRules}\n\n${prompt}`;
  }

  /**
   * Inject context into a custom prompt
   */
  injectContext(prompt, context) {
    if (!context) return prompt;
    const contextStr = `\n\n--- Project Context ---\n${this.extractProjectSummary(context)}\n---\n`;
    return prompt + contextStr;
  }
}

export default new PromptBuilder();
