import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/agent spawn',
  description: 'Spawn a new agent instance',
  usage: '/agent spawn <name> [task]',
  handler: async (args) => {
    if (args.length < 1) {
      renderer.renderError('Agent name required. Usage: /agent spawn <name>');
      return;
    }

    const name = args[0];
    const task = args.slice(1).join(' ');
    
    const spinner = renderer.renderSpinner(`Spawning agent ${name}...`);
    try {
      const agent = await orchestrator.spawn(name);
      spinner.succeed(`Agent ${name} spawned successfully (ID: ${agent.id})`);
      
      if (task) {
        renderer.renderInfo(`Assigning task to ${name}...`);
        agent.run(task).catch(e => renderer.renderError(`Agent error: ${e.message}`));
      }
    } catch (error) {
      spinner.fail(`Failed to spawn agent ${name}`);
      renderer.renderError(error.message);
    }
  }
};
