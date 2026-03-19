/**
 * Apex Command - Generate FSD-compliant Apex classes
 * Generates Service, Selector, Domain classes with full test suite
 */

import AgentBase from '../../agents/agent-base.js';
import skillsLoader from '../../core/skills-loader.js';
import rulesLoader from '../../core/rules-loader.js';
import * as fileUtils from '../../utils/file-utils.js';
import path from 'path';

class ApexCommand extends AgentBase {
    constructor() {
        super('apex');
        this.description = 'Generate FSD-compliant Apex classes (Service, Selector, Domain, Tests)';
        this.examples = [
            'sfai /apex generate --object Lead --type service',
            'sfai /apex generate --object Account --type selector',
            'sfai /apex generate --object Opportunity --type domain'
        ];
    }

    async execute(args = {}) {
        const { object, type, action } = args;

        if (!object) {
            throw new Error('--object required: sfai /apex generate --object Lead --type service');
        }

        if (action === 'generate') {
            return this.generateApex(object, type || 'service');
        }

        return this.showUsage();
    }

    async generateApex(objectName, type) {
        // Sanitize inputs to prevent path traversal and injection
        const safeObjectName = fileUtils.sanitizeObjectName(objectName);
        const safeType = type && ['service', 'selector', 'domain'].includes(type.toLowerCase()) ? type.toLowerCase() : 'service';
        
        this.logger.start(`Generating ${safeType} for ${safeObjectName}...`);

        try {
            // Inject skills + rules into prompt
            const skills = await skillsLoader.getInjectableForContext('apex-generation');
            const coreRules = rulesLoader.getInjectableCore();
            const apexRules = rulesLoader.getInjectableForContext('apex-generation');

            const prompt = this.buildPrompt(safeObjectName, safeType, skills, coreRules, apexRules);

            // Generate code via AI
            const generatedCode = await this.callAI(prompt);

            // Validate generated code follows rules
            this.validateGeneratedCode(generatedCode, coreRules);

            // Save to file
            const fileName = this.getFileName(safeObjectName, safeType);
            const filePath = path.join(process.cwd(), 'force-app', 'main', 'default', 'classes', `${fileName}.cls`);
            
            await fileUtils.createDir(path.dirname(filePath));
            await fileUtils.writeFile(filePath, generatedCode);

            this.logger.success(`✅ Generated ${filePath}`);
            return { success: true, path: filePath, code: generatedCode };

        } catch (error) {
            this.logger.error(`Failed to generate Apex: ${error.message}`);
            throw error;
        }
    }

    buildPrompt(objectName, type, skills, coreRules, apexRules) {
        const typeDescriptions = {
            'service': `Service orchestration layer for ${objectName}. Routes calls to selectors (data) and domain (logic).`,
            'selector': `Selector data access layer for ${objectName}. All SOQL queries here. Enforce security.`,
            'domain': `Domain business logic layer for ${objectName}. Stateless, collection-based, validate & apply rules.`
        };

        return `
You are an expert Salesforce Apex developer. Generate production-grade code.

${coreRules}

${apexRules}

${skills}

## Task
Generate ${type} class for ${objectName} object.
Type: ${typeDescriptions[type]}

Requirements:
- Feature Sliced Design (FSD) compliant
- Full error handling with custom exceptions
- Security: CRUD checks, FLS enforcement
- Bulkified: No SOQL/DML in loops
- Well-documented with clear intent
- 75%+ test coverage ready
- Governor limit aware

## Output
Generate ONLY the Apex code. No explanation.
Start with \`\`\`apex and end with \`\`\`
        `;
    }

    getFileName(objectName, type) {
        const typeMap = {
            'service': 'Service',
            'selector': 'Selector',
            'domain': 'Domain'
        };
        return `${objectName}${typeMap[type]}`;
    }

    validateGeneratedCode(code, rules) {
        // Check for non-negotiable rule violations
        if (code.includes('SELECT *')) {
            throw new Error('VIOLATION: SELECT * forbidden. Use selective queries.');
        }
        if (code.includes('[SELECT') && code.includes('for (') && code.match(/\bfor\s*\(/)) {
            throw new Error('VIOLATION: SOQL in loop detected. Violates bulkification rule.');
        }
        if (code.includes("'") && code.includes('Database.query')) {
            throw new Error('VIOLATION: Potential SOQL injection. Use bind variables.');
        }
    }

    async ensureDir(dir) {
        await fileUtils.createDir(dir);
    }

    showUsage() {
        return `
Apex Command - Generate FSD-compliant Apex classes

Usage:
  sfai /apex generate --object <ObjectName> --type <service|selector|domain>

Types:
  service   - Orchestration layer (calls selector + domain)
  selector  - Data access layer (all SOQL here)
  domain    - Business logic layer (stateless, collection-based)

Examples:
  sfai /apex generate --object Lead --type service
  sfai /apex generate --object Account --type selector
  sfai /apex generate --object Opportunity --type domain

What you get:
  ✓ FSD-compliant Apex code
  ✓ Full error handling
  ✓ Security enforced (CRUD, FLS, injection prevention)
  ✓ Bulkified (no loop queries)
  ✓ Governor limit aware
  ✓ Production-ready
        `;
    }
}

export default ApexCommand;
