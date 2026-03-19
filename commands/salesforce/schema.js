/**
 * Schema Command - Generate Salesforce metadata and schema objects
 * Generates custom objects, fields, permission sets, profiles
 */

import AgentBase from '../../agents/agent-base.js';
import skillsLoader from '../../core/skills-loader.js';
import rulesLoader from '../../core/rules-loader.js';

class SchemaCommand extends AgentBase {
    constructor() {
        super('schema');
        this.description = 'Generate Salesforce metadata: objects, fields, permission sets';
        this.examples = [
            'sfai /schema generate --name Account --type object --fields "Name,Revenue,Industry"',
            'sfai /schema generate --name SalesUser --type permission-set',
            'sfai /schema generate --name Partner__c --type custom-object'
        ];
    }

    async execute(args = {}) {
        const { name, type, fields, action } = args;

        if (!name) {
            throw new Error('--name required: sfai /schema generate --name Account --type object');
        }

        if (action === 'generate') {
            return this.generateSchema(name, type || 'custom-object', fields);
        }

        return this.showUsage();
    }

    async generateSchema(objectName, metadataType, fields) {
        this.logger.start(`Generating ${metadataType}: ${objectName}...`);

        try {
            const prompt = `
You are a Salesforce metadata architect. Generate production-grade schema definitions.

## Task
Generate ${metadataType} metadata for: ${objectName}
${fields ? `Fields: ${fields}` : ''}

Types:
- custom-object: Custom SObject definition
- permission-set: Permission set (field-level security)
- sharing-rule: Sharing rule
- validation-rule: Validation rule
- field: Custom field definition

Requirements:
- Security: Appropriate field-level access
- Data types: Correct for use case
- Validation: Data integrity rules
- Sharing: Appropriate data access model
- Naming: Follows Salesforce conventions

Output: Metadata XML definition only
        `;

            const metadata = await this.callAI(prompt);
            
            this.logger.success('✅ Generated metadata definition');
            return {
                success: true,
                metadata: objectName,
                type: metadataType,
                xml: metadata
            };

        } catch (error) {
            this.logger.error(`Failed to generate schema: ${error.message}`);
            throw error;
        }
    }

    showUsage() {
        return `
Schema Command - Generate Salesforce metadata

Usage:
  sfai /schema generate --name <EntityName> --type <custom-object|permission-set|field|sharing-rule|validation-rule>

Types:
  custom-object   - Custom SObject definition
  permission-set  - Permission set with field-level security
  field           - Custom field definition
  sharing-rule    - Sharing rule for data access
  validation-rule - Validation rule for data integrity

Examples:
  sfai /schema generate --name Partner__c --type custom-object --fields "Name,Rating,Website"
  sfai /schema generate --name SalesUser --type permission-set
  sfai /schema generate --name PartnerName__c --type field
  sfai /schema generate --name PartnerSharing --type sharing-rule

What you get:
  ✓ Metadata XML definition
  ✓ Security considerations
  ✓ Field-level access control
  ✓ Sharing rules
  ✓ Validation rules
  ✓ Production-ready

Best Practices:
  - Define security upfront
  - Use permission sets for granular access
  - Sharing rules for data visibility
  - Validation rules for data quality
        `;
    }
}

export default SchemaCommand;
