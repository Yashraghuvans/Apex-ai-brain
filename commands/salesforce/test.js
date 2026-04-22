/**
 * Test Command - Entry point for Test generation
 */

import { orchestrator } from '../../agents/index.js';
import * as renderer from '../../cli/renderer.js';

export default {
  command: '/test',
  description: 'Generate Apex test classes (75%+ coverage, no SeeAllData)',
  usage: '/test generate --class <ClassName>',
  flags: [
    { name: '--class', description: 'The name of the class to test' }
  ],
  handler: async (args, options = {}) => {
    const className = options.class;

    if (!className || className === true) {
      renderer.renderError('--class required with a class name: /test generate --class LeadService');
      return;
    }

    renderer.renderInfo(`Dispatching agent for ${className} test generation...`);

    try {
      const task = `Generate a comprehensive Apex test class for the ${className} class.
      Follow the Arrange-Act-Assert pattern, use @TestSetup, and ensure 75%+ coverage.
      Ensure no SeeAllData=true is used. Save to force-app/main/default/classes/ using writeFile.`;

      await orchestrator.assign(task);
      renderer.renderSuccess(`Agent assigned to task: Test for ${className}`);
    } catch (error) {
      renderer.renderError(`Failed to dispatch agent: ${error.message}`);
    }
  }
};
