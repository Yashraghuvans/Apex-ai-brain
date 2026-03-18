import { getCommandRegistry } from '../../core/command-registry.js';
import * as renderer from '../../cli/renderer.js';
import chalk from 'chalk';

export default {
  command: '/help',
  description: 'Display available commands and detailed help',
  usage: '/help [command]',
  handler: async (args) => {
    const registry = getCommandRegistry();
    const commandName = args && args[0];

    if (commandName) {
      const cmd = registry.find(c => c.command === commandName || c.command === `/${commandName}`);
      if (cmd) {
        renderer.renderSection(`Help: ${cmd.command}`, `
Description: ${cmd.description}
Usage: ${cmd.usage || cmd.command}
Flags: ${cmd.flags ? cmd.flags.map(f => `
  ${chalk.cyan(f.name)}: ${f.description}`).join('') : 'None'}
        `);
      } else {
        renderer.renderError(`Command ${commandName} not found.`);
      }
    } else {
      renderer.renderInfo('Available Commands:');
      const tableData = registry.map(cmd => [
        chalk.cyan(cmd.command),
        cmd.description
      ]);
      renderer.renderTable(['Command', 'Description'], tableData);
      renderer.renderInfo('Type /help <command> for detailed information.');
    }
  }
};
