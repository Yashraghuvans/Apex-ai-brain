import { showBanner } from './banner.js';
import { startRepl } from './repl.js';
import * as store from '../memory/store.js';
import * as renderer from './renderer.js';
import { initializeRegistry } from '../core/command-registry.js';
import { clearScreen } from '../utils/terminal-utils.js';
import { orchestrator } from '../agents/index.js';
import { sharedMemory } from '../agents/shared-memory.js';
import rulesLoader from '../core/rules-loader.js';
import skillsLoader from '../core/skills-loader.js';
import * as logger from '../utils/logger.js';

export async function startCli() {
  try {
    // 1. Show banner first
    clearScreen();
    showBanner();
    console.log();

    // 2. Load dotenv (already loaded in bin/sfai.js, but ensure here)
    
    // 3. Initialize AI client (already done in bin/sfai.js)
    
    // 4. Load rules with spinner
    renderer.renderSpinner('Loading enforcement rules...');
    try {
      await rulesLoader.loadCore();
      const rulesSummary = rulesLoader.getSummary();
      renderer.clearSpinner();
      renderer.renderSuccess(
        `✓ Loaded ${rulesSummary.coreRulesCount || 11} core enforcement rules`
      );
    } catch (error) {
      renderer.clearSpinner();
      renderer.renderError(`✗ Failed to load rules: ${error.message}`);
      logger.error(`Rules loader failed: ${error.stack}`);
      throw error;
    }

    // 5. Load skills with spinner
    renderer.renderSpinner('Loading Salesforce development skills...');
    try {
      await skillsLoader.loadAll();
      const skillsSummary = skillsLoader.getSummary();
      renderer.clearSpinner();
      renderer.renderSuccess(
        `✓ Loaded ${skillsSummary.total || 0} skills across 5 categories`
      );
    } catch (error) {
      renderer.clearSpinner();
      renderer.renderError(`✗ Failed to load skills: ${error.message}`);
      logger.error(`Skills loader failed: ${error.stack}`);
      throw error;
    }

    // 6. Initialize command registry
    try {
      initializeRegistry();
    } catch (error) {
      renderer.renderError(`✗ Failed to initialize commands: ${error.message}`);
      logger.error(`Registry initialization failed: ${error.stack}`);
      throw error;
    }

    // 7. Load shared memory with spinner
    renderer.renderSpinner('Loading shared memory...');
    try {
      await sharedMemory.load();
      renderer.clearSpinner();
      renderer.renderSuccess('✓ Shared memory initialized');
    } catch (error) {
      renderer.clearSpinner();
      renderer.renderWarning(`Could not load shared memory: ${error.message}`);
      logger.warn(`Shared memory load failed: ${error.message}`);
    }

    // 8. Initialize orchestrator with spinner
    renderer.renderSpinner('Initializing agent orchestrator...');
    try {
      await orchestrator.init();
      renderer.clearSpinner();
      renderer.renderSuccess('✓ Agent orchestrator ready');
    } catch (error) {
      renderer.clearSpinner();
      renderer.renderWarning(`Orchestrator initialization partial: ${error.message}`);
      logger.warn(`Orchestrator init: ${error.message}`);
    }

    // 9. Check for project context
    console.log();
    const isProjectInitialized = await store.exists();
    
    if (isProjectInitialized) {
      try {
        const context = await store.loadContext();
        if (context) {
          const fileStats = context.stats || {};
          renderer.renderSuccess(
            `✓ Project loaded: ${fileStats.classCount || 0} classes, ` +
            `${fileStats.triggerCount || 0} triggers, ` +
            `${fileStats.lwcCount || 0} LWC components`
          );
        } else {
          renderer.renderWarning(
            'Project .sfai folder exists but context missing. Run /init to rebuild.'
          );
        }
      } catch (error) {
        renderer.renderWarning(`Could not load project context: ${error.message}`);
        logger.warn(`Project context load: ${error.message}`);
      }
    } else {
      renderer.renderInfo('No project context found.');
      renderer.renderWarning('Run /init to scan your Salesforce project.');
    }

    console.log();
    renderer.renderInfo('Type /help for available commands');
    console.log();

    // 10. Start REPL loop
    await startRepl();

  } catch (error) {
    console.error();
    renderer.renderError('╔════════════════════════════════════════════════════════════╗');
    renderer.renderError('║              STARTUP FAILED - CANNOT CONTINUE              ║');
    renderer.renderError('╚════════════════════════════════════════════════════════════╝');
    console.error();
    renderer.renderError(`Error: ${error.message}`);
    if (error.stack) {
      logger.error(`Full stack: ${error.stack}`);
    }
    console.error();
    renderer.renderInfo('Troubleshooting:');
    renderer.renderInfo('1. Check that all dependencies are installed: npm install');
    renderer.renderInfo('2. Ensure .env file exists with required variables');
    renderer.renderInfo('3. Check file permissions in rules/ and skills/ folders');
    renderer.renderInfo('4. Run with debug: DEBUG=* sfai to see detailed logs');
    console.error();
    process.exit(1);
  }
}
