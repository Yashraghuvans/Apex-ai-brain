import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';
import { sharedMemory } from '../../agents/shared-memory.js';
import chalk from 'chalk';

export default {
  command: '/fix',
  description: 'Analyze and fix a bug or error',
  usage: '/fix <error message or description>',
  handler: async (args) => {
    if (args.length === 0) {
      renderer.renderError('Please provide the error message. Usage: /fix <error>');
      return;
    }

    const errorDescription = args.join(' ');
    const spinner = renderer.renderSpinner('Analyzing error...');

    try {
      const debugAgent = await orchestrator.spawn('debug-agent');
      const response = await debugAgent.run(errorDescription);
      
      spinner.succeed('Analysis complete');

      try {
        let jsonStr = response;
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const analysis = JSON.parse(jsonStr);

        renderer.renderSection('Bug Analysis', `
${chalk.red.bold('Error Type:')} ${analysis.errorType}
${chalk.red('Root Cause:')} ${analysis.rootCause}
${chalk.cyan('Affected Files:')} ${analysis.affectedFiles.join(', ')}

${chalk.green.bold('Solution:')}
${analysis.solution}

${chalk.yellow('Prevention:')} ${analysis.preventionTip}
        `);

        if (analysis.codeChanges && analysis.codeChanges.length > 0) {
          renderer.renderInfo('\nRequired Changes:');
          analysis.codeChanges.forEach(change => {
            console.log(chalk.blue(`\nFile: ${change.file}`));
            console.log(`Reason: ${chalk.gray(change.reason)}`);
            console.log(chalk.cyan(change.change));
          });
        }

        await sharedMemory.set('last_bug_analysis', analysis, 'debug-agent');

      } catch (parseError) {
        renderer.renderSection('Bug Analysis (Raw Text)', response);
        await sharedMemory.set('last_bug_analysis_raw', response, 'debug-agent');
      }

    } catch (error) {
      spinner.fail('Analysis failed');
      renderer.renderError(error.message);
    }
  }
};
