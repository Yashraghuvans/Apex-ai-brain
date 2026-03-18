import { aiClient } from '../../ai/client.js';
import * as renderer from '../../cli/renderer.js';
import chalk from 'chalk';

export default {
  command: '/cost',
  description: 'View estimated session cost',
  usage: '/cost',
  handler: async () => {
    const stats = aiClient.getStats();
    
    renderer.renderSection('Session Cost', `
Estimated Total: ${chalk.green(`$${stats.estimatedCost.toFixed(4)}`)}
    `);

    if (Object.keys(stats.byModel).length > 0) {
      const tableData = Object.entries(stats.byModel).map(([model, mStats]) => [
        model,
        `$${mStats.cost.toFixed(4)}`
      ]);
      renderer.renderTable(['Model', 'Estimated Cost'], tableData);
    }
  }
};
