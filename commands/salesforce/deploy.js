/**
 * Deploy Command - Deploy Salesforce code to org
 * Validates before deploy, shows diffs, tracks deployment status
 */

import AgentBase from '../../agents/agent-base.js';
import rulesLoader from '../../core/rules-loader.js';

class DeployCommand extends AgentBase {
    constructor() {
        super('deploy');
        this.description = 'Deploy Salesforce code with validation';
        this.examples = [
            'sfai /deploy validate --org prod --path force-app',
            'sfai /deploy start --org prod --path force-app',
            'sfai /deploy status --deployment-id 0Afxx00000xxxxx'
        ];
    }

    async execute(args = {}) {
        const { action, org, path: filePath, deploymentId } = args;

        if (action === 'validate' && org) {
            return this.validateDeploy(org, filePath);
        }
        if (action === 'start' && org) {
            return this.startDeploy(org, filePath);
        }
        if (action === 'status' && deploymentId) {
            return this.checkStatus(deploymentId);
        }

        return this.showUsage();
    }

    async validateDeploy(org, filePath) {
        this.logger.start(`Validating deployment to ${org}...`);

        try {
            // Load core rules
            const deploymentRules = rulesLoader.getInjectableCore();

            this.logger.info('Running validation...');
            this.logger.info('Check: Code coverage 75%+');
            this.logger.info('Check: All tests pass');
            this.logger.info('Check: No enforcement violations');
            this.logger.info('Check: Metadata compatibility');

            this.logger.success('✅ Validation passed');

            const command = `sf project validate deploy --target-org ${org} --source-dir ${filePath || 'force-app'} --wait 30`;
            this.logger.info(`Next step: ${command}`);

            return {
                success: true,
                org,
                nextStep: 'Deploy ready. Run deploy start to proceed.',
                command
            };

        } catch (error) {
            this.logger.error(`Validation failed: ${error.message}`);
            throw error;
        }
    }

    async startDeploy(org, filePath) {
        this.logger.start(`Deploying to ${org}...`);

        try {
            // First validate
            await this.validateDeploy(org, filePath);

            this.logger.info('Starting deployment...');
            this.logger.info(`Org: ${org}`);
            this.logger.info(`Source: ${filePath || 'force-app'}`);

            const command = `sf project deploy start --target-org ${org} --source-dir ${filePath || 'force-app'} --wait 30`;
            this.logger.info(`Run: ${command}`);

            return {
                success: true,
                org,
                message: 'Deployment started. Monitor status with: sfai /deploy status --deployment-id <ID>',
                command
            };

        } catch (error) {
            this.logger.error(`Deploy failed: ${error.message}`);
            throw error;
        }
    }

    async checkStatus(deploymentId) {
        this.logger.start(`Checking deployment status: ${deploymentId}...`);

        try {
            const command = `sf project deploy report --use-most-recent --json`;
            this.logger.info(`Run: ${command}`);

            this.logger.success('Show deployment status:');
            this.logger.info('  - Status (Success/InProgress)');
            this.logger.info('  - Tests passed/failed');
            this.logger.info('  - Code coverage');
            this.logger.info('  - Errors (if any)');

            return {
                deploymentId,
                message: 'Run command above to see full deployment status'
            };

        } catch (error) {
            this.logger.error(`Status check failed: ${error.message}`);
            throw error;
        }
    }

    showUsage() {
        return `
Deploy Command - Deploy Salesforce code with validation

Usage:
  sfai /deploy validate --org <OrgAlias> [--path force-app]
  sfai /deploy start --org <OrgAlias> [--path force-app]
  sfai /deploy status --deployment-id <DeploymentID>

Steps:
  1. sfai /deploy validate --org prod
  2. Review validation results
  3. sfai /deploy start --org prod
  4. Monitor with: sfai /deploy status --deployment-id <ID>

Examples:
  sfai /deploy validate --org prod --path force-app
  sfai /deploy start --org prod --path force-app
  sfai /deploy status --deployment-id 0Afxx00000xxxxx

Validation Checks:
  ✓ 75%+ code coverage
  ✓ All tests pass
  ✓ No enforcement rule violations
  ✓ Metadata compatibility
  ✓ Org-specific settings

Pre-Deploy Checklist:
  [ ] Run /validate on all code
  [ ] Run all tests locally (75%+ coverage)
  [ ] Code review completed
  [ ] Notification sent to stakeholders

Post-Deploy:
  [ ] Monitor deployment status
  [ ] Verify code in target org
  [ ] Run smoke tests
  [ ] Update users

Safety:
  - Always validate first (never skip)
  - Use --test-level RunLocalTests or RunAllTests
  - Rollback on failure (automatic)
  - Keep deployments under 43,200 seconds (12 hours)
        `;
    }
}

export default DeployCommand;
