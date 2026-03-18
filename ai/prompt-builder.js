export class PromptBuilder {
  constructor() {
    this.coreRules = `
You are a senior Salesforce architect. You MUST follow these rules on every response:

RULE 1 - NO LOGIC IN TRIGGERS: Triggers must only call handler methods. All logic goes in handler/service classes.

RULE 2 - ALWAYS BULKIFY: Always process collections. Never put DML or SOQL inside for loops. Always use List, Map, Set for bulk operations.

RULE 3 - GOVERNOR LIMITS: Always be aware of:
- Max 100 SOQL queries per transaction
- Max 150 DML statements per transaction
- Max 6MB heap size
- Max 10 seconds CPU time
Design all solutions with these limits in mind.

RULE 4 - FSD ARCHITECTURE: Follow Feature Sliced Design:
- Trigger → TriggerHandler → Service → Selector → Domain
- Each layer has one responsibility
- No cross-layer dependencies going backwards

RULE 5 - SECURITY: Always enforce CRUD and FLS. Never hardcode IDs or credentials.
Always use WITH SECURITY_ENFORCED or stripInaccessible().

RULE 6 - TESTING: Test classes must:
- Use @isTest annotation
- Use Test.startTest() and Test.stopTest()
- Never use SeeAllData=true
- Always use TestDataFactory
- Assert specific values, not just that no exception was thrown
`;
  }

  buildSystemPrompt(context) {
    let prompt = this.coreRules + '\n\n';
    if (context) {
      prompt += this.injectContext('', context);
    }
    return prompt;
  }

  buildUserPrompt(command, args, context) {
    return `Command: ${command}\nArguments: ${args.join(' ')}\n\nProject Context:\n${JSON.stringify(context, null, 2)}`;
  }

  buildAgentPrompt(agentDefinition, task, sharedMemory) {
    let prompt = `${this.coreRules}\n\n`;
    prompt += `Agent Role:\n${agentDefinition.content}\n\n`;
    
    if (sharedMemory) {
      prompt += `Shared Memory Context:\n${JSON.stringify(sharedMemory, null, 2)}\n\n`;
    }
    
    prompt += `Current Task:\n${typeof task === 'string' ? task : JSON.stringify(task)}`;
    return prompt;
  }

  injectRules(prompt) {
    return `${this.coreRules}\n\n${prompt}`;
  }

  injectContext(prompt, context) {
    if (!context) return prompt;
    const contextStr = `\n\n--- Project Context ---\n${JSON.stringify(context, null, 2)}\n-----------------------\n`;
    return prompt + contextStr;
  }

  injectSkills(prompt, skillNames) {
    // Phase 2 placeholder for skills injection
    return prompt + `\n\nActive Skills: ${skillNames.join(', ')}\n`;
  }
}

export const promptBuilder = new PromptBuilder();
