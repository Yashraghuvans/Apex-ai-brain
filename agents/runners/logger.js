import chalk from 'chalk';
import * as renderer from '../../cli/renderer.js';

export class AgentLogger {
  constructor() {
    this.logs = []; // Store session logs
  }

  handleStatusChange(event) {
    const { name, status, message } = event;
    let formattedStatus = '';
    
    switch (status) {
      case 'idle': formattedStatus = chalk.gray('IDLE'); break;
      case 'thinking': formattedStatus = chalk.yellow('THINKING'); break;
      case 'working': formattedStatus = chalk.blue('WORKING'); break;
      case 'done': formattedStatus = chalk.green('DONE'); break;
      case 'error': formattedStatus = chalk.red('ERROR'); break;
    }

    const logEntry = `[${chalk.cyan(name)}] STATUS: ${formattedStatus} - ${message}`;
    this.logs.push({ timestamp: new Date(), name, type: 'status', message: logEntry });
    
    // Better visual for thinking/working
    if (status === 'thinking' || status === 'working') {
      renderer.renderAgentThought(name, message);
    }

    if (status === 'error') {
      renderer.renderError(`${name}: ${message}`);
    }
  }

  handleLog(event) {
    const { name, message } = event;
    const logEntry = `[${chalk.cyan(name)}] ${message}`;
    this.logs.push({ timestamp: new Date(), name, type: 'log', message: logEntry });
  }

  getLogsForAgent(name, limit = 20) {
    return this.logs
      .filter(l => l.name === name)
      .slice(-limit);
  }
}

export const agentLogger = new AgentLogger();
