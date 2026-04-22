/**
 * SOQL Command - Entry point for SOQL generation and optimization
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/soql',
  description: 'Generate or optimize SOQL queries',
  usage: '/soql generate --object <ObjectName> --filters "<filters>"',
  flags: [
    { name: '--object', description: 'The Salesforce object name' },
    { name: '--filters', description: 'Query filters (e.g., "Status=Open")' },
    { name: '--query', description: 'Existing query to optimize' }
  ],
  handler: async (args, options = {}) => {
    const { object, filters, query } = options;
    
    let task = '';
    if (query) {
      task = `Optimize the following SOQL query: ${query}. 
      Ensure it is selective, uses bind variables, and includes WITH SECURITY_ENFORCED.`;
    } else if (object) {
      task = `Generate an optimized SOQL query for the ${object} object with these filters: ${filters || 'none'}.
      Ensure it follows all Salesforce security and performance best practices.`;
    } else {
      renderer.renderError('Either --object or --query is required.');
      return;
    }

    renderer.renderInfo('Dispatching SOQL optimizer agent...');

    try {
      await orchestrator.assign(task);
      renderer.renderSuccess('Agent assigned to SOQL task');
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
