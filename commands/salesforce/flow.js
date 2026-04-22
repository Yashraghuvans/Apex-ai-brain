/**
 * Flow Command - Entry point for Flow generation
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/flow',
  description: 'Generate Salesforce Flow definitions and automation',
  usage: '/flow generate --name <FlowName> --type <decision|record-update|subflow|scheduled-action>',
  flags: [
    { name: '--name', description: 'The Flow name' },
    { name: '--type', description: 'The Flow type (decision, record-update, subflow, etc.)' }
  ],
  handler: async (args, options = {}) => {
    const { name, type } = options;

    if (!name) {
      renderer.renderError('--name required: /flow generate --name leadQualification --type decision');
      return;
    }

    renderer.renderInfo(`Dispatching agent for Flow ${name} (${type || 'decision'}) generation...`);

    try {
      const task = `Generate a Salesforce Flow named ${name} of type ${type || 'decision'}.
      Provide the flow-meta.xml definition. Ensure it handles faults and is governor limit aware.
      Save the file to force-app/main/default/flows/${name}.flow-meta.xml using writeFile.`;

      await orchestrator.assign(task);
      renderer.renderSuccess(`Agent assigned to task: Flow ${name}`);
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
