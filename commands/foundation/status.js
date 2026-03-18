import * as store from '../../memory/store.js';
import * as renderer from '../../cli/renderer.js';
import chalk from 'chalk';

export default {
  command: '/status',
  description: 'Display project information and status',
  usage: '/status',
  handler: async () => {
    const context = await store.loadContext();
    if (!context) {
      renderer.renderError('Project not initialized. Please run /init first.');
      return;
    }

    renderer.renderSection('Project Status', `
Project Type: ${chalk.cyan(context.projectType)}
Complexity: ${chalk.yellow(context.complexity)}
Framework: ${chalk.blue(context.detectedFramework)}
Last Analyzed: ${chalk.gray(new Date(context.timestamp).toLocaleString())}
    `);

    renderer.renderTable(
      ['Statistic', 'Count'],
      [
        ['Apex Classes', context.stats.classCount],
        ['Triggers', context.stats.triggerCount],
        ['LWC Components', context.stats.lwcCount],
        ['Metadata Files', context.stats.metadataCount]
      ]
    );

    if (context.antiPatterns && context.antiPatterns.length > 0) {
      renderer.renderSection('Anti-patterns Detected', context.antiPatterns.join('\n'));
    }

    renderer.renderSection('Capabilities', `
Active Skills: None (Phase 1)
Active Agents: None (Phase 1)
    `);
  }
};
