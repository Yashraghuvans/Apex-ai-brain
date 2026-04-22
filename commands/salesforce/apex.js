/**
 * Apex Command - Entry point for Apex generation
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/apex',
  description: 'Generate FSD-compliant Apex classes (Service, Selector, Domain, Tests)',
  usage: '/apex generate --object <ObjectName> --type <service|selector|domain>',
  flags: [
    { name: '--object', description: 'The Salesforce object name' },
    { name: '--type', description: 'The FSD layer (service, selector, domain)' }
  ],
  handler: async (args, options = {}) => {
    const object = options.object;
    const type = options.type === true ? 'service' : (options.type || 'service');

    if (!object || object === true) {
      renderer.renderError('--object required with a name: /apex generate --object Lead --type service');
      return;
    }

    renderer.renderInfo(`Dispatching agent for ${type} generation on ${object}...`);

    try {
      const task = `Generate a ${type} class for the ${object} Salesforce object. 
      Ensure it follows FSD architecture, includes error handling, and is governor limit aware.
      Save the file to force-app/main/default/classes/ using the writeFile tool.`;

      // The orchestrator will now use the planner/agent system to fulfill this
      await orchestrator.assign(task);
      renderer.renderSuccess(`Agent assigned to task: ${object} ${type}`);
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
