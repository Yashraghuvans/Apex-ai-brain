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
  registerCommand(initCommand);
  registerCommand(statusCommand);
  registerCommand(helpCommand);
  registerCommand(agentsCommand);
  registerCommand(agentSpawnCommand);
  registerCommand(agentKillCommand);
  registerCommand(agentLogsCommand);
  registerCommand(planCommand);
  registerCommand(fixCommand);
  registerCommand(modelCommand);
  registerCommand(tokensCommand);
  registerCommand(costCommand);

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
