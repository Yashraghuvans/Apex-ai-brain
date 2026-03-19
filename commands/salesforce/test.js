/**
 * Test Command - Generate Apex test classes
 * Generates test classes with @TestSetup, Arrange-Act-Assert pattern, 75%+ coverage
 */

import AgentBase from '../../agents/agent-base.js';
import skillsLoader from '../../core/skills-loader.js';
import rulesLoader from '../../core/rules-loader.js';
import fs from 'fs/promises';
import path from 'path';

class TestCommand extends AgentBase {
    constructor() {
        super('test');
        this.description = 'Generate Apex test classes (75%+ coverage, no SeeAllData)';
        this.examples = [
            'sfai /test generate --class LeadService',
            'sfai /test generate --class AccountSelector',
            'sfai /test generate --class LeadTrigger'
        ];
    }

    async execute(args = {}) {
        const { class: className, action } = args;

        if (!className) {
            throw new Error('--class required: sfai /test generate --class LeadService');
        }

        if (action === 'generate') {
            return this.generateTest(className);
        }

        return this.showUsage();
    }

    async generateTest(classNameToTest) {
        this.logger.start(`Generating test class for ${classNameToTest}...`);

        try {
            // Get source class for context
            const sourceCode = await this.getSourceClass(classNameToTest);
            
            // Inject skills + rules
            const skills = await skillsLoader.getInjectableForContext('test-generation');
            const coreRules = rulesLoader.getInjectableCore();
            const testRules = rulesLoader.getInjectableForContext('test-generation');

            const prompt = this.buildPrompt(classNameToTest, sourceCode, skills, coreRules, testRules);
            const testCode = await this.callAI(prompt);

            // Validate test follows rules
            this.validateTestCode(testCode);

            // Save test file
            const testFileName = `${classNameToTest}Test`;
            const classesDir = path.join(process.cwd(), 'force-app', 'main', 'default', 'classes');
            await this.ensureDir(classesDir);

            const filePath = path.join(classesDir, `${testFileName}.cls`);
            await fs.writeFile(filePath, testCode);

            this.logger.success(`✅ Generated test: ${testFileName}.cls`);
            return {
                success: true,
                testClass: testFileName,
                path: filePath,
                code: testCode
            };

        } catch (error) {
            this.logger.error(`Failed to generate test: ${error.message}`);
            throw error;
        }
    }

    buildPrompt(classNameToTest, sourceCode, skills, coreRules, testRules) {
        return `
You are an expert Salesforce test developer. Generate production-grade test classes.

${coreRules}

${testRules}

${skills}

## Task
Generate test class for: ${classNameToTest}

Source class context:
\`\`\`apex
${sourceCode}
\`\`\`

Requirements:
- @TestSetup for shared test data
- No SeeAllData=true (forbidden - use TestDataFactory)
- Arrange-Act-Assert pattern
- 75%+ code coverage
- Test scenarios:
  1. Happy path (success case)
  2. Boundary conditions (empty, single, bulk)
  3. Error cases (null, invalid data, exceptions)
  4. Data integrity (data preserved)
  5. Security (CRUD, FLS enforcement)
- Meaningful assertions (no empty asserts)
- Custom TestDataFactory if needed
- Use Test.startTest() / Test.stopTest() for govs

Output ONLY the test class Apex code. No explanation.
Start with \`\`\`apex and end with \`\`\`
        `;
    }

    async getSourceClass(className) {
        try {
            const filePath = path.join(
                process.cwd(),
                'force-app', 'main', 'default', 'classes',
                `${className}.cls`
            );
            try {
                return await fs.readFile(filePath, 'utf-8');
            } catch (e) {
                // Class not found locally, continue with generic prompt
                return `// Source class not found locally, generating generic test`;
            }
        } catch (e) {
            return `// Source class not found locally, generating generic test`;
        }
    }

    validateTestCode(testCode) {
        // Check for forbidden patterns
        if (testCode.includes('SeeAllData')) {
            throw new Error('VIOLATION: SeeAllData forbidden. Use @TestSetup + TestDataFactory');
        }
        if (!testCode.includes('@TestSetup')) {
            throw new Error('VIOLATION: Missing @TestSetup. Use it for shared test data');
        }
        if (!testCode.includes('Test.startTest()')) {
            throw new Error('VIOLATION: Missing Test.startTest() / Test.stopTest()');
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
Test Command - Generate Apex test classes

Usage:
  sfai /test generate --class <ClassName>

Examples:
  sfai /test generate --class LeadService
  sfai /test generate --class AccountSelector
  sfai /test generate --class LeadTriggerHandler

What you get:
  ✓ @TestSetup for shared test data
  ✓ Arrange-Act-Assert pattern
  ✓ No SeeAllData=true (data isolation)
  ✓ 75%+ code coverage
  ✓ Test scenarios:
    - Happy path
    - Boundary conditions
    - Error cases
    - Data integrity
    - Security (CRUD/FLS)
  ✓ Meaningful assertions
  ✓ Test.startTest() / Test.stopTest()
  ✓ Production-ready

Best Practices:
  - Use @TestSetup for common test data
  - Never use SeeAllData=true
  - Test all code paths (positive, negative, boundary)
  - Use meaningful assertion messages
  - 75%+ coverage minimum
  - No hardcoded IDs
        `;
    }
}

export default TestCommand;
