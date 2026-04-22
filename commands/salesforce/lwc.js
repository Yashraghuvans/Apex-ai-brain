/**
 * LWC Command - Entry point for Lightning Web Component generation
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/lwc',
  description: 'Generate Lightning Web Components (SLDS patterns, reactive binding)',
  usage: '/lwc generate --name <ComponentName> --type <form|datatable|detail|component>',
  flags: [
    { name: '--name', description: 'The component name' },
    { name: '--type', description: 'The template type (form, datatable, detail, component)' }
  ],
  handler: async (args, options = {}) => {
    const name = options.name;
    const type = options.type === true ? 'component' : (options.type || 'component');

    if (!name || name === true) {
      renderer.renderError('--name required with a component name: /lwc generate --name leadForm --type form');
      return;
    }

    renderer.renderInfo(`Dispatching agent for LWC ${name} (${type}) generation...`);

    try {
      const task = `Generate a Lightning Web Component named ${name} of type ${type}.
      Include HTML, JS, CSS, and meta.xml files. 
      Follow SLDS patterns and ensure responsive design.
      Save the files to force-app/main/default/lwc/${name}/ using the writeFile tool for each file.`;

      await orchestrator.assign(task);
      renderer.renderSuccess(`Agent assigned to task: ${name} (${type})`);
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
