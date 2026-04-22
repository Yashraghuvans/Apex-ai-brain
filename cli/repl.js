import inquirer from 'inquirer';
import { parseInput, route } from '../core/router.js';
import * as renderer from './renderer.js';
import chalk from 'chalk';

export async function startRepl() {
  let active = true;

  while (active) {
    try {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.magenta.bold('sfai') + chalk.gray(' ❯'),
          prefix: ''
        }
      ]);

      if (input.trim()) {
        const { words, options } = parseInput(input);
        
        const firstWord = words[0] ? words[0].toLowerCase() : '';
        if (firstWord === '/exit' || firstWord === 'exit') {
          renderer.renderInfo('Exiting SFAI. Goodbye!');
          active = false;
          process.exit(0);
        }
        
        await route(words, options);
      }
    } catch (error) {
      if (error.name === 'Error' && error.message.includes('force close')) {
        // Handle Ctrl+C if inquirer doesn't
        active = false;
        process.exit(0);
      }
      
      if (error.isTtyError) {
        renderer.renderError('Prompt couldn\'t be rendered in the current environment.');
        active = false;
      } else {
        renderer.renderError(`REPL Error: ${error.message}`);
      }
    }
  }
}
