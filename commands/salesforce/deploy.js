/**
 * Deploy Command - Entry point for Metadata Deployment
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/deploy',
  description: 'Deploy metadata to a Salesforce org',
  usage: '/deploy --path <SourcePath> [--checkOnly]',
  flags: [
    { name: '--path', description: 'The path to the metadata to deploy' },
    { name: '--checkOnly', description: 'Perform a validation-only deployment' }
  ],
  handler: async (args, options = {}) => {
    const sourcePath = options.path || 'force-app';
    const checkOnly = options.checkOnly ? '--checkonly' : '';

    renderer.renderInfo(`Dispatching deployment agent for ${sourcePath}...`);

    try {
      const task = `Deploy the metadata at ${sourcePath} to the target org. ${checkOnly ? 'Perform a validation-only deployment (checkOnly).' : ''}
      Use the 'sf project deploy start' command via the runCommand tool. 
      Analyze any deployment errors and suggest fixes if needed.`;

      await orchestrator.assign(task);
      renderer.renderSuccess('Agent assigned to deployment task');
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
