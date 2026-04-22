/**
 * Diff Command - Entry point for Metadata Diffing
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/diff',
  description: 'Review differences between local and remote metadata',
  usage: '/diff --file <FilePath>',
  flags: [
    { name: '--file', description: 'The path to the file to diff' }
  ],
  handler: async (args, options = {}) => {
    const filePath = options.file;

    if (!filePath) {
      renderer.renderError('--file required: /diff --file force-app/main/default/classes/MyClass.cls');
      return;
    }

    renderer.renderInfo(`Dispatching agent to review diff for ${filePath}...`);

    try {
      const task = `Retrieve the remote version of ${filePath} and compare it with the local version.
      Use 'sf project retrieve start' to a temp location or 'git diff' if applicable.
      Analyze the differences, focusing on potential regressions or architectural violations.`;

      await orchestrator.assign(task);
      renderer.renderSuccess('Agent assigned to diff review task');
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
