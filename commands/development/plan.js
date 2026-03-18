import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';
import { sharedMemory } from '../../agents/shared-memory.js';
import chalk from 'chalk';

export default {
  command: '/plan',
  description: 'Break down a feature request into tasks',
  usage: '/plan <feature description>',
  handler: async (args) => {
    if (args.length === 0) {
      renderer.renderError('Please describe the feature to plan. Usage: /plan <description>');
      return;
    }

    const featureDescription = args.join(' ');
    const spinner = renderer.renderSpinner('Planning feature...');

    try {
      const planner = await orchestrator.spawn('planner');
      const response = await planner.run(featureDescription);
      
      spinner.succeed('Planning complete');

      try {
        // Try to parse the response as JSON (extracting from markdown block if needed)
        let jsonStr = response;
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const plan = JSON.parse(jsonStr);

        renderer.renderSection(`Plan: ${plan.feature}`, '');

        plan.tasks.forEach((task, index) => {
          console.log(chalk.blue.bold(`
Task ${index + 1}: ${task.title} [${task.id}]`));
          console.log(`Assignee: ${chalk.cyan(task.assignedAgent)} | Complexity: ${chalk.yellow(task.estimatedComplexity)}`);
          console.log(`Description: ${task.description}`);
          if (task.dependencies && task.dependencies.length > 0) {
             console.log(`Dependencies: ${chalk.gray(task.dependencies.join(', '))}`);
          }
        });

        if (plan.warnings && plan.warnings.length > 0) {
          console.log('\n' + chalk.yellow.bold('Warnings:'));
          plan.warnings.forEach(w => console.log(chalk.yellow(`- ${w}`)));
        }

        await sharedMemory.set('current_plan', plan, 'planner');
        
        console.log();
        renderer.renderSuccess('Plan saved to shared memory.');
        renderer.renderInfo('Run /build <task-id> to start. (Coming in Phase 3)');

      } catch (parseError) {
        // Fallback to text rendering if JSON parsing fails
        renderer.renderSection('Plan (Raw Text)', response);
        await sharedMemory.set('current_plan_raw', response, 'planner');
      }

    } catch (error) {
      spinner.fail('Planning failed');
      renderer.renderError(error.message);
    }
  }
};
