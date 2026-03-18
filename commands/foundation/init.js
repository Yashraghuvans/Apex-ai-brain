import { run } from '../../core/init/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/init',
  description: 'Initialize the project context by scanning the codebase',
  usage: '/init [--deep] [--refresh]',
  flags: [
    { name: '--deep', description: 'Perform deep analysis' },
    { name: '--refresh', description: 'Force refresh existing context' }
  ],
  handler: async (args, options = {}) => {
    renderer.renderInfo('Starting initialization...');
    const projectRoot = process.cwd();
    await run(projectRoot, options);
  }
};
