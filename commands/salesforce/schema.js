/**
 * Schema Command - Entry point for Schema generation
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/schema',
  description: 'Generate Salesforce metadata: objects, fields, permission sets',
  usage: '/schema generate --name <EntityName> --type <custom-object|permission-set|field|validation-rule>',
  flags: [
    { name: '--name', description: 'The metadata entity name' },
    { name: '--type', description: 'The metadata type' },
    { name: '--fields', description: 'Optional comma-separated fields' }
  ],
  handler: async (args, options = {}) => {
    const { name, type, fields } = options;

    if (!name) {
      renderer.renderError('--name required: /schema generate --name Partner__c --type custom-object');
      return;
    }

    renderer.renderInfo(`Dispatching agent for ${type || 'custom-object'} ${name} generation...`);

    try {
      const task = `Generate Salesforce metadata for ${name} of type ${type || 'custom-object'}.
      ${fields ? `Include these fields: ${fields}.` : ''}
      Provide the corresponding .xml metadata definition.
      Save the file to force-app/main/default/ using writeFile in the appropriate folder (objects, permissionsets, etc.).`;

      await orchestrator.assign(task);
      renderer.renderSuccess(`Agent assigned to task: Schema ${name}`);
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
