import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/agent kill',
  description: 'Kill a running agent',
  usage: '/agent kill <nameOrId>',
  handler: async (args) => {
    if (args.length < 1) {
      renderer.renderError('Agent name or ID required. Usage: /agent kill <nameOrId>');
      return;
    }

    const target = args[0];
    const success = orchestrator.kill(target);
    
    if (success) {
      renderer.renderSuccess(`Agent ${target} killed.`);
    } else {
      renderer.renderWarning(`Agent ${target} not found or not running.`);
    }
  }
};
