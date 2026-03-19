/**
 * Flow Command - Generate Flow configuration and automation
 * Generates flow definition, subflows, and related metadata
 */

import AgentBase from '../../agents/agent-base.js';
import skillsLoader from '../../core/skills-loader.js';
import rulesLoader from '../../core/rules-loader.js';

class FlowCommand extends AgentBase {
    constructor() {
        super('flow');
        this.description = 'Generate Salesforce Flow definitions and automation';
        this.examples = [
            'sfai /flow generate --name leadQualification --type decision',
            'sfai /flow generate --name accountUpdate --type record-update',
            'sfai /flow generate --name notificationSubflow --type subflow'
        ];
    }

    async execute(args = {}) {
        const { name, type, trigger, action } = args;

        if (!name) {
            throw new Error('--name required: sfai /flow generate --name leadQualification --type decision');
        }

        if (action === 'generate') {
            return this.generateFlow(name, type || 'decision', trigger);
        }

        return this.showUsage();
    }

    async generateFlow(flowName, flowType, triggerOn) {
        this.logger.start(`Generating Flow: ${flowName}...`);

        try {
            const skills = await skillsLoader.getInjectableForContext('apex-generation');
            const coreRules = rulesLoader.getInjectableCore();

            const prompt = `
You are a Salesforce Flow expert. Generate production-grade Flow definition.

${coreRules}

${skills}

## Task
Generate Flow definition (XML) for: ${flowName}
Type: ${flowType}
${triggerOn ? `Trigger: ${triggerOn}` : ''}

Types:
- decision: Decision-tree flow with branches
- record-update: Bulk record update flow
- subflow: Reusable subflow component
- scheduled-action: Scheduled automation flow

Requirements:
- Clear variable definitions
- Fault handling
- Status tracking
- Error messages for end user
- Governor limit aware (avoid loops of 1000+)
- Bulkified operations (batch updates)
- Security: Validate access before update

Output: Flow XML definition only (*.flow-meta.xml format)
        `;

            const flowXml = await this.callAI(prompt);
            
            this.logger.success('✅ Generated Flow definition');
            return {
                success: true,
                flow: flowName,
                type: flowType,
                xml: flowXml
            };

        } catch (error) {
            this.logger.error(`Failed to generate flow: ${error.message}`);
            throw error;
        }
    }

    showUsage() {
        return `
Flow Command - Generate Salesforce Flows

Usage:
  sfai /flow generate --name <FlowName> --type <decision|record-update|subflow|scheduled-action>

Types:
  decision        - Decision-tree flow with branching logic
  record-update   - Bulk record update flow
  subflow         - Reusable subflow component
  scheduled-action - Scheduled automation

Examples:
  sfai /flow generate --name leadQualification --type decision
  sfai /flow generate --name accountUpdate --type record-update
  sfai /flow generate --name notificationSubflow --type subflow

What you get:
  ✓ Flow definition (XML)
  ✓ Variable declarations
  ✓ Fault handling
  ✓ Governor limit considerations
  ✓ Bulkified operations
  ✓ Error messaging
  ✓ Production-ready
        `;
    }
}

export default FlowCommand;
