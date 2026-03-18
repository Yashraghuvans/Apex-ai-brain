import { scanProject } from './scanner.js';
import { analyzeProject } from './analyzer.js';
import { buildContext } from './context-builder.js';
import * as store from '../../memory/store.js';
import * as renderer from '../../cli/renderer.js';
import { printDivider } from '../../utils/terminal-utils.js';
import chalk from 'chalk';

export async function run(projectRoot, options = {}) {
  const { deep = false, refresh = false } = options;

  if (refresh) {
    renderer.renderInfo('Refreshing project context...');
  }

  const scanSpinner = renderer.renderSpinner('Scanning project files...');
  try {
    const scanResult = await scanProject(projectRoot);
    scanSpinner.succeed('Scanning complete');

    const analysisSpinner = renderer.renderSpinner('Analyzing codebase structure...');
    const analysisResult = await analyzeProject(scanResult);
    analysisSpinner.succeed('Analysis complete');

    const contextSpinner = renderer.renderSpinner('Building project context...');
    const context = buildContext(scanResult, analysisResult);
    contextSpinner.succeed('Context built');

    const saveSpinner = renderer.renderSpinner('Saving context...');
    await store.initialize(projectRoot);
    await store.saveContext(context);
    saveSpinner.succeed('Context saved to .sfai/project-context.json');

    printDivider();
    renderer.renderTable(
      ['Category', 'Count'],
      [
        ['Apex Classes', analysisResult.stats.classCount],
        ['Triggers', analysisResult.stats.triggerCount],
        ['LWC Components', analysisResult.stats.lwcCount],
        ['Metadata Files', analysisResult.stats.metadataCount]
      ]
    );

    if (analysisResult.antiPatterns.length > 0) {
      analysisResult.antiPatterns.forEach(ap => renderer.renderWarning(ap));
    }

    renderer.renderSection('Suggestions', `
Suggested Skills: ${context.suggestedSkills.join(', ')}
Suggested Agents: ${context.suggestedAgents.join(', ')}
    `);

    renderer.renderSuccess('Run /status to see full analysis');
  } catch (error) {
    scanSpinner.fail('Initialization failed');
    renderer.renderError(error.message);
  }
}
