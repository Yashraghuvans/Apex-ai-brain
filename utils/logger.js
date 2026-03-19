import chalk from 'chalk';
import path from 'path';
import { access, mkdir, appendFile } from 'fs/promises';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

let currentLogLevel = LOG_LEVELS.INFO;

export function setLogLevel(level) {
  if (LOG_LEVELS[level.toUpperCase()] !== undefined) {
    currentLogLevel = LOG_LEVELS[level.toUpperCase()];
  }
}

async function writeToLogFile(level, message) {
  const sfaiDir = path.join(process.cwd(), '.sfai');
  const logDir = path.join(sfaiDir, 'logs');
  const logFile = path.join(logDir, 'sfai.log');
  
  try {
    await access(sfaiDir);
    // Try to access logDir, if it fails, create it
    try {
      await access(logDir);
    } catch {
      await mkdir(logDir, { recursive: true });
    }
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    await appendFile(logFile, logMessage);
  } catch (error) {
    // .sfai doesn't exist or other error, just ignore file logging
  }
}

export async function debug(message) {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    console.log(chalk.gray(`[DEBUG] ${message}`));
  }
  await writeToLogFile('debug', message);
}

export async function info(message) {
  if (currentLogLevel <= LOG_LEVELS.INFO) {
    console.log(chalk.cyan(`[INFO] ${message}`));
  }
  await writeToLogFile('info', message);
}

export async function warn(message) {
  if (currentLogLevel <= LOG_LEVELS.WARN) {
    console.log(chalk.yellow(`[WARN] ${message}`));
  }
  await writeToLogFile('warn', message);
}

export async function error(message) {
  if (currentLogLevel <= LOG_LEVELS.ERROR) {
    console.log(chalk.red(`[ERROR] ${message}`));
  }
  await writeToLogFile('error', message);
}
