import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';
import chalk from 'chalk';

export default {
  command: '/agents',
  description: 'List available and active AI agents',
  usage: '/agents [--active]',
  flags: [
    { name: '--active', description: 'Show only currently running agents' }
  ],
  handler: async (args, options = {}) => {
    if (options.active) {
      const active = orchestrator.getActive();
      if (active.length === 0) {
        renderer.renderInfo('No active agents running.');
        return;
      }
      
      const tableData = active.map(a => [
        chalk.cyan(a.name),
        a.id.substring(0, 8),
        a.status === 'error' ? chalk.red(a.status) : chalk.green(a.status),
        a.modelComplexity
      ]);
      renderer.renderTable(['Agent', 'ID', 'Status', 'Complexity'], tableData);
    } else {
      const allAgents = orchestrator.list();
      const activeNames = orchestrator.getActive().map(a => a.name);
      
      const tableData = allAgents.map(name => [
        activeNames.includes(name) ? chalk.green(name) : chalk.cyan(name),
        activeNames.includes(name) ? chalk.green('Running') : chalk.gray('Available')
      ]);
      
      renderer.renderTable(['Agent Name', 'State'], tableData);
      renderer.renderInfo('Run /agent spawn <name> to start an agent.');
    }
  }
};
