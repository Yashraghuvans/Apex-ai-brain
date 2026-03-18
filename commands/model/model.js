import { aiClient } from '../../ai/client.js';
import { modelRouter } from '../../ai/model-router.js';
import * as renderer from '../../cli/renderer.js';
import chalk from 'chalk';

export default {
  command: '/model',
  description: 'Manage active AI model and provider',
  usage: '/model [set <name> | auto]',
  handler: async (args) => {
    if (args.length === 0) {
      const mode = modelRouter.mode;
      const provider = aiClient.activeProviderName;
      const model = aiClient.activeModel;
      
      renderer.renderSection('Model Settings', `
Mode: ${mode === 'auto' ? chalk.green('Auto-routing') : chalk.yellow('Manual')}
Active Provider: ${chalk.cyan(provider)}
Active Model: ${chalk.cyan(model)}
      `);
      return;
    }

    const action = args[0];
    
    if (action === 'auto') {
      modelRouter.setMode('auto');
      renderer.renderSuccess('Model routing set to AUTO (complexity based)');
    } else if (action === 'set' && args[1]) {
      const modelName = args[1];
      try {
        modelRouter.setMode('manual');
        aiClient.setModel(modelName);
        renderer.renderSuccess(`Model manually set to ${chalk.cyan(modelName)}`);
      } catch (error) {
        renderer.renderError(error.message);
      }
    } else {
      renderer.renderTable(
        ['Provider', 'Model', 'Cost (In/Out per 1k)'],
        [
          ['gemini', 'gemini-1.5-flash', '$0.000075 / $0.00030'],
          ['gemini', 'gemini-1.5-pro', '$0.00125 / $0.0050'],
          ['claude', 'claude-3-haiku-20240307', '$0.00025 / $0.00125'],
          ['claude', 'claude-3-sonnet-20240229', '$0.0030 / $0.0150']
        ]
      );
      renderer.renderInfo('Usage: /model set <name> OR /model auto');
    }
  }
};
