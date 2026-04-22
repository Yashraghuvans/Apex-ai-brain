/**
 * Trigger Command - Entry point for Trigger generation
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/trigger',
  description: 'Generate Trigger + TriggerHandler (routing only, FSD pattern)',
  usage: '/trigger generate --object <ObjectName>',
  flags: [
    { name: '--object', description: 'The Salesforce object name' }
  ],
  handler: async (args, options = {}) => {
    const object = options.object;

    if (!object || object === true) {
      renderer.renderError('--object required with a name: /trigger generate --object Lead');
      return;
    }

    renderer.renderInfo(`Dispatching agent for ${object} trigger generation...`);

    try {
      const task = `Generate a single trigger and a TriggerHandler for the ${object} object.
      The trigger must be routing-only with no logic. 
      The handler must handle all 7 contexts and route to a service layer.
      Follow FSD patterns. Save files to force-app/main/default/ using writeFile.`;

      await orchestrator.assign(task);
      renderer.renderSuccess(`Agent assigned to task: ${object} Trigger`);
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
