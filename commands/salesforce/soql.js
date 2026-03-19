/**
 * SOQL Command - Generate optimized SOQL queries
 * Generates selective, indexed, injection-safe queries with explanations
 */

import AgentBase from '../../agents/agent-base.js';
import skillsLoader from '../../core/skills-loader.js';
import rulesLoader from '../../core/rules-loader.js';

class SoqlCommand extends AgentBase {
    constructor() {
        super('soql');
        this.description = 'Generate optimized SOQL queries (selective fields, bind variables)';
        this.examples = [
            'sfai /soql generate --object Lead --filters "Status=Open,Score>100"',
            'sfai /soql optimize --object Account --query "SELECT * FROM Account"',
            'sfai /soql explain --object Opportunity --relationships "Account,Owner"'
        ];
    }

    async execute(args = {}) {
        const { object, filters, query, action, relationships } = args;

        if (action === 'generate' && object) {
            return this.generateQuery(object, filters);
        }
        if (action === 'optimize' && query) {
            return this.optimizeQuery(query);
        }
        if (action === 'explain' && object) {
            return this.explainQuery(object, relationships);
        }

        return this.showUsage();
    }

    async generateQuery(objectName, filters) {
        this.logger.start(`Generating optimized SOQL for ${objectName}...`);

        try {
            const skills = await skillsLoader.getInjectableForContext('soql-optimization');
            const coreRules = rulesLoader.getInjectableCore();
            const securityRules = rulesLoader.getInjectableForContext('security-audit');

            const prompt = `
You are a Salesforce SOQL expert. Generate optimized queries.

${coreRules}

${securityRules}

${skills}

## Task
Generate optimized SOQL query for ${objectName}.

Filters: ${filters || 'none'}

Requirements:
- SELECT specific fields (no SELECT *)
- Use bind variables (no concatenation)
- Indexed field filters preferred
- WITH SECURITY_ENFORCED
- LIMIT clause to prevent Large Data Set operations
- Include related fields if applicable

Output:
1. SOQL query (fully formatted)
2. Explanation of:
   - Why fields are selected
   - Indexed fields used
   - Security enforcement
   - Governor limit considerations
3. Performance notes
        `;

            const result = await this.callAI(prompt);
            this.logger.success('✅ Generated optimized SOQL');
            return result;

        } catch (error) {
            this.logger.error(`Failed to generate SOQL: ${error.message}`);
            throw error;
        }
    }

    async optimizeQuery(query) {
        this.logger.start('Optimizing SOQL query...');

        try {
            const skills = await skillsLoader.getInjectableForContext('soql-optimization');

            const prompt = `
You are a Salesforce SOQL optimization expert.

${skills}

## Task
Optimize this SOQL query:

${query}

Provide:
1. Optimized version
2. Improvements made
3. Performance impact
4. Security checks passed
        `;

            const result = await this.callAI(prompt);
            this.logger.success('✅ Query optimized');
            return result;

        } catch (error) {
            this.logger.error(`Failed to optimize SOQL: ${error.message}`);
            throw error;
        }
    }

    async explainQuery(objectName, relationships) {
        this.logger.start(`Explaining query patterns for ${objectName}...`);

        try {
            const skills = await skillsLoader.getInjectableForContext('soql-optimization');

            const prompt = `
You are a Salesforce SOQL expert.

${skills}

## Task
Explain query best practices for ${objectName} object.

Relationships to consider: ${relationships || 'none'}

Provide:
1. Standard query patterns
2. Relationship query patterns
3. Aggregation patterns
4. Performance considerations
5. Security requirements
        `;

            const result = await this.callAI(prompt);
            this.logger.success('✅ Query patterns explained');
            return result;

        } catch (error) {
            this.logger.error(`Failed to explain query: ${error.message}`);
            throw error;
        }
    }

    showUsage() {
        return `
SOQL Command - Generate and optimize SOQL queries

Usage:
  sfai /soql generate --object <ObjectName> [--filters "field=value,field2>value2"]
  sfai /soql optimize --query "SELECT ... FROM ..."
  sfai /soql explain --object <ObjectName> [--relationships "Object1,Object2"]

Examples:
  sfai /soql generate --object Lead --filters "Status=Open,Score>100"
  sfai /soql optimize --query "SELECT * FROM Account"
  sfai /soql explain --object Opportunity --relationships "Account,Owner"

What you get:
  ✓ Selective field queries (no SELECT *)
  ✓ Bind variables (injection-safe)
  ✓ Indexed field optimization
  ✓ Security enforced (WITH SECURITY_ENFORCED)
  ✓ Proper LIMIT clauses
  ✓ Performance analysis
  ✓ Governor limit awareness

Best Practices:
  - Always specify fields (not *)
  - Use bind variables for parameters
  - Filter on indexed fields
  - Include WITH SECURITY_ENFORCED
  - Set LIMIT to avoid large datasets
        `;
    }
}

export default SoqlCommand;
