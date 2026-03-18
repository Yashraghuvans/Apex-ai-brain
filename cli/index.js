import { showBanner } from './banner.js';
import { startRepl } from './repl.js';
import * as store from '../memory/store.js';
import * as renderer from './renderer.js';
import { initializeRegistry } from '../core/command-registry.js';
import { clearScreen } from '../utils/terminal-utils.js';
import { orchestrator } from '../agents/index.js';
import { sharedMemory } from '../agents/shared-memory.js';

export async function startCli() {
  clearScreen();
  showBanner();
  
  initializeRegistry();
  
  // Initialize Phase 2 core systems
  await sharedMemory.load();
  await orchestrator.init();
  
  const isProjectInitialized = await store.exists();
  
  if (isProjectInitialized) {
    const context = await store.loadContext();
    if (context) {
      renderer.renderInfo(`Project loaded: ${context.projectType} [${context.complexity}]`);
      renderer.renderSuccess('Type /help for commands');
    } else {
      renderer.renderWarning('Project .sfai folder exists but context is missing. Run /init to rebuild.');
    }
  } else {
    renderer.renderInfo('Project not initialized.');
    renderer.renderWarning('Run /init to get started scanning your Salesforce project.');
  }
  
  console.log();
  await startRepl();
}
