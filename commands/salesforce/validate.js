/**
 * Validate Command - Entry point for Code Validation
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/validate',
  description: 'Validate code against Salesforce best practices and governor limits',
  usage: '/validate --file <FilePath>',
  flags: [
    { name: '--file', description: 'The path to the file to validate' }
  ],
  handler: async (args, options = {}) => {
    const filePath = options.file;

    if (!filePath) {
      renderer.renderError('--file required: /validate --file force-app/main/default/classes/MyClass.cls');
      return;
    }

    renderer.renderInfo(`Dispatching agent to validate ${filePath}...`);

    try {
      const task = `Perform a deep validation of the file at ${filePath}. 
      Check for governor limit risks, FSD compliance, security vulnerabilities (SOQL injection, CRUD/FLS), and bulkification.
      Provide a detailed report of findings and suggestions for improvement.`;

      await orchestrator.assign(task);
      renderer.renderSuccess('Agent assigned to validation task');
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
