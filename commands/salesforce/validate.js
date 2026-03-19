/**
 * Validate Command - Validate Salesforce code before deployment
 * Checks code against all enforcement rules and best practices
 */

import AgentBase from '../../agents/agent-base.js';
import rulesLoader from '../../core/rules-loader.js';
import fs from 'fs/promises';
import path from 'path';

class ValidateCommand extends AgentBase {
    constructor() {
        super('validate');
        this.description = 'Validate Salesforce code against enforcement rules';
        this.examples = [
            'sfai /validate file --path src/classes/LeadService.cls',
            'sfai /validate directory --path force-app/main/default/classes',
            'sfai /validate org', // Validate entire environment
        ];
    }

    async execute(args = {}) {
        const { action, path: filePath } = args;

        if (action === 'file' && filePath) {
            return this.validateFile(filePath);
        }
        if (action === 'directory' && filePath) {
            return this.validateDirectory(filePath);
        }
        if (action === 'org') {
            return this.validateOrg();
        }

        return this.showUsage();
    }

    async validateFile(filePath) {
        this.logger.start(`Validating ${filePath}...`);

        try {
            try {
                const code = await fs.readFile(filePath, 'utf-8');
                const violations = this.checkViolations(code);

                if (violations.length === 0) {
                    this.logger.success('✅ File validated - No violations');
                    return { success: true, violations: [] };
                }

                this.logger.warn(`⚠️  Found ${violations.length} violations`);
                for (const violation of violations) {
                    this.logger.error(`  - [${violation.severity}] ${violation.message}`);
                }

                return { success: false, violations };
            } catch (e) {
                throw new Error(`File not found: ${filePath}`);
            }

        } catch (error) {
            this.logger.error(`Validation error: ${error.message}`);
            throw error;
        }
    }

    async validateDirectory(dirPath) {
        this.logger.start(`Validating directory: ${dirPath}...`);

        try {
            try {
                await fs.stat(dirPath);
            } catch (e) {
                throw new Error(`Directory not found: ${dirPath}`);
            }

            const files = await this.getApexFiles(dirPath);
            let totalViolations = 0;
            const results = [];

            for (const file of files) {
                const code = await fs.readFile(file, 'utf-8');
                const violations = this.checkViolations(code);
                
                if (violations.length > 0) {
                    results.push({
                        file,
                        violations,
                        count: violations.length
                    });
                    totalViolations += violations.length;
                }
            }

            if (totalViolations === 0) {
                this.logger.success(`✅ Directory validated - All ${files.length} files OK`);
                return { success: true, filesChecked: files.length, violations: [] };
            }

            this.logger.warn(`⚠️  Found ${totalViolations} violations in ${results.length} files`);
            return { success: false, filesChecked: files.length, results, totalViolations };

        } catch (error) {
            this.logger.error(`Validation error: ${error.message}`);
            throw error;
        }
    }

    async validateOrg() {
        this.logger.start('Validating entire org...');

        try {
            const rulesContent = rulesLoader.getInjectableCore();
            this.logger.success('✅ Core rules loaded');
            
            this.logger.info('Org validation requires SF CLI integration.');
            this.logger.info('Run: sf project validate deploy --target-org <org>');
            
            return { success: true, method: 'sf-cli' };

        } catch (error) {
            this.logger.error(`Validation error: ${error.message}`);
            throw error;
        }
    }

    checkViolations(code) {
        const violations = [];

        // Rule: No SOQL in loops
        if (this.detectSoqlInLoop(code)) {
            violations.push({
                severity: 'CRITICAL',
                message: 'SOQL query detected in loop (bulkification violation)'
            });
        }

        // Rule: No DML in loops
        if (this.detectDmlInLoop(code)) {
            violations.push({
                severity: 'CRITICAL',
                message: 'DML statement detected in loop (bulkification violation)'
            });
        }

        // Rule: No SeeAllData
        if (code.includes('SeeAllData=true')) {
            violations.push({
                severity: 'HIGH',
                message: 'SeeAllData=true forbidden - use @TestSetup + TestDataFactory'
            });
        }

        // Rule: No hardcoded IDs
        if (this.detectHardcodedIds(code)) {
            violations.push({
                severity: 'HIGH',
                message: 'Hardcoded ID detected - use queries instead'
            });
        }

        // Rule: No SOQL concatenation (injection risk)
        if (this.detectSoqlInjectionRisk(code)) {
            violations.push({
                severity: 'CRITICAL',
                message: 'Potential SOQL injection - use bind variables'
            });
        }

        // Rule: Logic in trigger
        if (this.detectLogicInTrigger(code)) {
            violations.push({
                severity: 'CRITICAL',
                message: 'Business logic in trigger - move to service layer'
            });
        }

        // Rule: SELECT * forbidden
        if (code.includes('SELECT *')) {
            violations.push({
                severity: 'HIGH',
                message: 'SELECT * forbidden - specify fields'
            });
        }

        return violations;
    }

    detectSoqlInLoop(code) {
        return /for\s*\([^)]*\)\s*\{[^}]*\[SELECT/.test(code) ||
               /for\s*\([^)]*\)\s*\{[^}]*Database\.query/.test(code);
    }

    detectDmlInLoop(code) {
        return /for\s*\([^)]*\)\s*\{[^}]*(insert|update|delete|upsert)/.test(code);
    }

    detectHardcodedIds(code) {
        // Look for 15 or 18 character hex strings that look like Salesforce IDs
        return /['"][0-9a-zA-Z]{15,18}['"]/.test(code);
    }

    detectSoqlInjectionRisk(code) {
        return /Database\.query\s*\([^:]*\+|'SELECT.*'\s*\+/.test(code);
    }

    detectLogicInTrigger(code) {
        if (!code.includes('trigger ')) return false;
        
        // Trigger should only have handler call
        const triggerMatch = code.match(/trigger\s+\w+\s+on\s+\w+\s*\([^)]*\)\s*\{([^}]*)\}/);
        if (!triggerMatch) return false;
        
        const triggerBody = triggerMatch[1];
        const hasLogic = /if\s*\(|for\s*\(|\[SELECT|insert|update|delete/.test(triggerBody);
        
        return hasLogic;
    }

    async getApexFiles(dirPath) {
        const files = [];
        const items = await fs.readdir(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = await fs.stat(itemPath);

            if (stat.isDirectory()) {
                files.push(...await this.getApexFiles(itemPath));
            } else if (item.endsWith('.cls')) {
                files.push(itemPath);
            }
        }

        return files;
    }

    showUsage() {
        return `
Validate Command - Check code against enforcement rules

Usage:
  sfai /validate file --path <FilePath>
  sfai /validate directory --path <DirectoryPath>
  sfai /validate org

Examples:
  sfai /validate file --path src/classes/LeadService.cls
  sfai /validate directory --path force-app/main/default/classes
  sfai /validate org

Checks:
  ✓ SOQL in loops (bulkification)
  ✓ DML in loops (bulkification)
  ✓ SeeAllData=true (test isolation)
  ✓ Hardcoded IDs (portability)
  ✓ SOQL injection risks (security)
  ✓ Logic in triggers (FSD)
  ✓ SELECT * queries (performance)

Severity Levels:
  CRITICAL - Must fix before deploy
  HIGH     - Should fix before deploy
  MEDIUM   - Code review recommended

For org validation:
  sf project validate deploy --target-org <org> --wait 30
        `;
    }
}

export default ValidateCommand;
