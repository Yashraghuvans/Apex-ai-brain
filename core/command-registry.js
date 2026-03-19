import initCommand from '../commands/foundation/init.js';
import statusCommand from '../commands/foundation/status.js';
import helpCommand from '../commands/foundation/help.js';
import agentsCommand from '../commands/agents/agents.js';
import agentSpawnCommand from '../commands/agents/agent-spawn.js';
import agentKillCommand from '../commands/agents/agent-kill.js';
import agentLogsCommand from '../commands/agents/agent-logs.js';
import planCommand from '../commands/development/plan.js';
import fixCommand from '../commands/development/fix.js';
import modelCommand from '../commands/model/model.js';
import tokensCommand from '../commands/model/tokens.js';
import costCommand from '../commands/model/cost.js';

// Phase 3: Salesforce Commands
import ApexCommand from '../commands/salesforce/apex.js';
import LwcCommand from '../commands/salesforce/lwc.js';
import TriggerCommand from '../commands/salesforce/trigger.js';
import SoqlCommand from '../commands/salesforce/soql.js';
import FlowCommand from '../commands/salesforce/flow.js';
import SchemaCommand from '../commands/salesforce/schema.js';
import TestCommand from '../commands/salesforce/test.js';
import ValidateCommand from '../commands/salesforce/validate.js';
import DeployCommand from '../commands/salesforce/deploy.js';
import DiffCommand from '../commands/salesforce/diff.js';

import * as terminalUtils from '../utils/terminal-utils.js';
import * as renderer from '../cli/renderer.js';

const registry = [];

export function registerCommand(command) {
  registry.push(command);
}

export function getCommandRegistry() {
  return registry;
}

export function initializeRegistry() {
  // Foundation Commands
  registerCommand(initCommand);
  registerCommand(statusCommand);
  registerCommand(helpCommand);
  
  // Agent Commands
  registerCommand(agentsCommand);
  registerCommand(agentSpawnCommand);
  registerCommand(agentKillCommand);
  registerCommand(agentLogsCommand);
  
  // Development Commands
  registerCommand(planCommand);
  registerCommand(fixCommand);
  
  // Model Commands
  registerCommand(modelCommand);
  registerCommand(tokensCommand);
  registerCommand(costCommand);

  // Phase 3: Salesforce Commands
  registerCommand(new ApexCommand());
  registerCommand(new LwcCommand());
  registerCommand(new TriggerCommand());
  registerCommand(new SoqlCommand());
  registerCommand(new FlowCommand());
  registerCommand(new SchemaCommand());
  registerCommand(new TestCommand());
  registerCommand(new ValidateCommand());
  registerCommand(new DeployCommand());
  registerCommand(new DiffCommand());

  registerCommand({
    command: '/clear',
    description: 'Clear the terminal screen',
    usage: '/clear',
    handler: async () => {
      terminalUtils.clearScreen();
    }
  });

  registerCommand({
    command: '/exit',
    description: 'Exit the Salesforce AI Terminal',
    usage: '/exit',
    handler: async () => {
      renderer.renderInfo('Exiting SFAI. Goodbye!');
      process.exit(0);
    }
  });
}
