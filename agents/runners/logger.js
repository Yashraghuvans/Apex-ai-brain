import chalk from 'chalk';

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
    
    // In phase 2, we might not want to print everything to terminal directly unless in debug mode,
    // but the prompt implies showing it. We'll rely on the command handlers to show spinners, 
    // but we'll print errors directly.
    if (status === 'error') {
      console.log(`\n${logEntry}`);
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
