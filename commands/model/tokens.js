import { aiClient } from '../../ai/client.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/tokens',
  description: 'View session token usage',
  usage: '/tokens [budget <amount>]',
  handler: async (args) => {
    if (args.length > 0 && args[0] === 'budget' && args[1]) {
      // Phase 2 placeholder for budget logic
      renderer.renderSuccess(`Token warning budget set to ${args[1]}`);
      return;
    }

    const stats = aiClient.getStats();
    
    renderer.renderTable(
      ['Metric', 'Count'],
      [
        ['Input Tokens', stats.totalInput.toLocaleString()],
        ['Output Tokens', stats.totalOutput.toLocaleString()],
        ['Total Tokens', stats.totalTokens.toLocaleString()]
      ]
    );

    if (Object.keys(stats.byModel).length > 0) {
      renderer.renderInfo('Breakdown by Model:');
      const tableData = Object.entries(stats.byModel).map(([model, mStats]) => [
        model, 
        mStats.total.toLocaleString()
      ]);
      renderer.renderTable(['Model', 'Total Tokens'], tableData);
    }
  }
};
