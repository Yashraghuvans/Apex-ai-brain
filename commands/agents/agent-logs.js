import { agentLogger } from '../../agents/runners/logger.js';
import * as renderer from '../../cli/renderer.js';
import chalk from 'chalk';

export default {
  command: '/agent logs',
  description: 'View logs for a specific agent',
  usage: '/agent logs <name>',
  flags: [
    { name: '--follow', description: 'Stream live logs' }
  ],
  handler: async (args, options) => {
    if (args.length < 1) {
      renderer.renderError('Agent name required. Usage: /agent logs <name>');
      return;
    }

    const name = args[0];
    
    if (options.follow) {
      renderer.renderInfo(`Following logs for ${name} (Ctrl+C to stop)...`);
      // For Phase 2 simplicity, --follow is just a placeholder print since the REPL loop 
      // doesn't easily support interrupting a continuous stream without custom tty handling.
      // We will just print recent logs.
    }

    const logs = agentLogger.getLogsForAgent(name, 20);
    
    if (logs.length === 0) {
      renderer.renderInfo(`No logs found for agent ${name}.`);
      return;
    }

    renderer.renderSection(`Logs: ${name}`, logs.map(l => l.message).join('\n'));
  }
};
