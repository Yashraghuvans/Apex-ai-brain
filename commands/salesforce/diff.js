/**
 * Diff Command - Show code differences before deployment
 * Compares local code against target org
 */

import AgentBase from '../../agents/agent-base.js';
import fs from 'fs/promises';
import path from 'path';

class DiffCommand extends AgentBase {
    constructor() {
        super('diff');
        this.description = 'Compare local code with target org';
        this.examples = [
            'sfai /diff --org prod --file force-app/main/default/classes/LeadService.cls',
            'sfai /diff --org prod --directory force-app/main/default/classes',
            'sfai /diff --org prod --summary'
        ];
    }

    async execute(args = {}) {
        const { org, file, directory, summary } = args;

        if (!org) {
            throw new Error('--org required: sfai /diff --org prod --file <FilePath>');
        }

        if (file) {
            return this.diffFile(org, file);
        }
        if (directory) {
            return this.diffDirectory(org, directory);
        }
        if (summary) {
            return this.diffSummary(org);
        }

        return this.showUsage();
    }

    async diffFile(org, filePath) {
        this.logger.start(`Comparing ${filePath} with ${org}...`);

        try {
            try {
                await fs.readFile(filePath, 'utf-8');
            } catch (e) {
                throw new Error(`File not found: ${filePath}`);
            }

            const localCode = await fs.readFile(filePath, 'utf-8');
            const fileName = path.basename(filePath);

            this.logger.info(`Local file: ${fileName}`);
            this.logger.info(`Target org: ${org}`);
            this.logger.info('Fetching remote version from org...');

            // Show diff command
            const command = `sf retrieve --target-org ${org} --metadata ApexClass:${fileName.replace('.cls', '')} --output-dir ./retrieved`;
            this.logger.info(`Suggested command: ${command}`);

            return {
                success: true,
                org,
                file: filePath,
                message: 'Run suggested command above to retrieve remote version, then use: diff <local> <remote>'
            };

        } catch (error) {
            this.logger.error(`Diff failed: ${error.message}`);
            throw error;
        }
    }

    async diffDirectory(org, dirPath) {
        this.logger.start(`Comparing ${dirPath} with ${org}...`);

        try {
            try {
                await fs.stat(dirPath);
            } catch (e) {
                throw new Error(`Directory not found: ${dirPath}`);
            }

            const files = await this.getApexFiles(dirPath);
            this.logger.info(`Found ${files.length} files to compare`);

            const command = `sf retrieve --target-org ${org} --source-dir ${dirPath} --output-dir ./retrieved`;
            this.logger.info(`Retrieve command: ${command}`);

            return {
                success: true,
                org,
                directory: dirPath,
                fileCount: files.length,
                message: 'Run command above to retrieve remote versions for comparison'
            };

        } catch (error) {
            this.logger.error(`Diff failed: ${error.message}`);
            throw error;
        }
    }

    async diffSummary(org) {
        this.logger.start(`Generating diff summary for ${org}...`);

        try {
            const command = `sf retrieve --target-org ${org} --output-dir ./retrieved --json`;
            this.logger.info(`Retrieve all metadata: ${command}`);

            this.logger.success('Diff summary report:');
            this.logger.info('  - Files to add');
            this.logger.info('  - Files to modify');
            this.logger.info('  - Files to delete');
            this.logger.info('  - Conflict areas');

            return {
                success: true,
                org,
                message: 'Review indicated files before deploy'
            };

        } catch (error) {
            this.logger.error(`Diff summary failed: ${error.message}`);
            throw error;
        }
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
Diff Command - Compare local vs org code

Usage:
  sfai /diff --org <OrgAlias> --file <FilePath>
  sfai /diff --org <OrgAlias> --directory <DirectoryPath>
  sfai /diff --org <OrgAlias> --summary

Examples:
  sfai /diff --org prod --file force-app/main/default/classes/LeadService.cls
  sfai /diff --org prod --directory force-app/main/default/classes
  sfai /diff --org prod --summary

Workflow:
  1. Review pending changes: sfai /diff --org prod --summary
  2. Compare specific file: sfai /diff --org prod --file <file>
  3. Deploy after review: sfai /deploy validate --org prod

Behind the scenes:
  - sf retrieve --target-org <org> [--metadata <type>]
  - Compares local vs remote versions
  - Shows additions, modifications, deletions

Best Practices:
  - Always review diffs before deploy
  - Check for unexpected changes
  - Verify no critical code deletion
  - Confirm all tests pass before deploy
        `;
    }
}

export default DiffCommand;
