/**
 * Trigger Command - Generate Trigger + TriggerHandler
 * Generates single trigger per object + handler with all contexts
 */

import AgentBase from '../../agents/agent-base.js';
import skillsLoader from '../../core/skills-loader.js';
import rulesLoader from '../../core/rules-loader.js';
import fs from 'fs/promises';
import path from 'path';

class TriggerCommand extends AgentBase {
    constructor() {
        super('trigger');
        this.description = 'Generate Trigger + TriggerHandler (routing only, FSD pattern)';
        this.examples = [
            'sfai /trigger generate --object Lead',
            'sfai /trigger generate --object Account',
            'sfai /trigger generate --object Opportunity'
        ];
    }

    async execute(args = {}) {
        const { object, action } = args;

        if (!object) {
            throw new Error('--object required: sfai /trigger generate --object Lead');
        }

        if (action === 'generate') {
            return this.generateTrigger(object);
        }

        return this.showUsage();
    }

    async generateTrigger(objectName) {
        this.logger.start(`Generating Trigger + Handler for ${objectName}...`);

        try {
            // Inject skills + rules into prompt
            const skills = await skillsLoader.getInjectableForContext('trigger-generation');
            const coreRules = rulesLoader.getInjectableCore();
            const triggerRules = rulesLoader.getInjectableForContext('apex-generation');

            // Generate trigger (routing only - non-negotiable)
            const triggerCode = this.generateTriggerCode(objectName);

            // Generate handler with prompting
            const handlerPrompt = this.buildHandlerPrompt(objectName, skills, coreRules, triggerRules);
            const handlerCode = await this.callAI(handlerPrompt);

            // Validate trigger is routing-only
            this.validateTriggerIsRoutingOnly(triggerCode);
            
            // Validate handler routes all contexts
            this.validateHandlerHasAllContexts(handlerCode);

            // Save files
            const classesDir = path.join(process.cwd(), 'force-app', 'main', 'default', 'classes');
            const triggersDir = path.join(process.cwd(), 'force-app', 'main', 'default', 'triggers');

            await this.ensureDir(classesDir);
            await this.ensureDir(triggersDir);

            const triggerFileName = `${objectName}Trigger`;
            const handlerFileName = `${objectName}TriggerHandler`;

            await fs.writeFile(path.join(triggersDir, `${triggerFileName}.trigger`), triggerCode);
            await fs.writeFile(path.join(classesDir, `${handlerFileName}.cls`), handlerCode);

            this.logger.success(`✅ Generated trigger: ${triggerFileName}.trigger`);
            this.logger.success(`✅ Generated handler: ${handlerFileName}.cls`);

            return {
                success: true,
                trigger: path.join(triggersDir, `${triggerFileName}.trigger`),
                handler: path.join(classesDir, `${handlerFileName}.cls`)
            };

        } catch (error) {
            this.logger.error(`Failed to generate trigger: ${error.message}`);
            throw error;
        }
    }

    generateTriggerCode(objectName) {
        return `/**
 * Single trigger for ${objectName} object
 * Routes to handler - contains ZERO business logic (non-negotiable)
 */
trigger ${objectName}Trigger on ${objectName} (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new ${objectName}TriggerHandler().handle();
}
`;
    }

    buildHandlerPrompt(objectName, skills, coreRules, triggerRules) {
        return `
You are an expert Salesforce trigger architect. Generate production-grade trigger handler.

${coreRules}

${triggerRules}

${skills}

## Task
Generate TriggerHandler for ${objectName} object.

Requirements:
- Route all 7 contexts: beforeInsert, afterInsert, beforeUpdate, afterUpdate, beforeDelete, afterDelete, afterUndelete
- Include recursion prevention (static isExecuting flag)
- Call corresponding service methods
- ZERO business logic (pass records to service)
- FSD pattern: Handler → Service → Domain/Selector

Structure:
1. Static recursion flag
2. handle() method routing all contexts
3. Private methods for each context
4. Service method calls only

Output ONLY the handler class. No explanation.
Start with \`\`\`typescript and end with \`\`\`
        `;
    }

    validateTriggerIsRoutingOnly(triggerCode) {
        // Check for forbidden patterns in trigger
        if (triggerCode.includes('new Database')) {
            throw new Error('VIOLATION: DML in trigger. Move to service layer.');
        }
        if (triggerCode.includes('[SELECT')) {
            throw new Error('VIOLATION: SOQL in trigger. Move to selector layer.');
        }
        if (triggerCode.includes('for (')) {
            throw new Error('VIOLATION: Loop in trigger. Move to service layer.');
        }
        if (triggerCode.includes('if (')) {
            throw new Error('VIOLATION: Business logic in trigger. Move to domain layer.');
        }
    }

    validateHandlerHasAllContexts(handlerCode) {
        const contexts = ['beforeInsert', 'afterInsert', 'beforeUpdate', 'afterUpdate', 'beforeDelete', 'afterDelete', 'afterUndelete'];
        for (const context of contexts) {
            if (!handlerCode.includes(context)) {
                throw new Error(`VIOLATION: Missing context handler: ${context}`);
            }
        }
    }

    async ensureDir(dir) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;
        }
    }

    showUsage() {
        return `
Trigger Command - Generate Trigger + TriggerHandler

Usage:
  sfai /trigger generate --object <ObjectName>

Examples:
  sfai /trigger generate --object Lead
  sfai /trigger generate --object Account
  sfai /trigger generate --object Opportunity

What you get:
  ✓ Single trigger per object (non-negotiable)
  ✓ TriggerHandler with all 7 contexts
  ✓ Recursion prevention built-in
  ✓ Routes to service layer (FSD pattern)
  ✓ ZERO business logic in trigger
  ✓ Production-ready
  ✓ Error handling

Best Practice:
  One trigger per object. All logic in handler → service.
        `;
    }
}

export default TriggerCommand;
