import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import boxen from 'boxen';

export function renderSuccess(msg) {
  console.log(chalk.green(`✅ ${msg}`));
}

export function renderError(msg) {
  console.log(chalk.red(`❌ ${msg}`));
}

export function renderInfo(msg) {
  console.log(chalk.cyan(`ℹ️ ${msg}`));
}

export function renderWarning(msg) {
  console.log(chalk.yellow(`⚠️ ${msg}`));
}

export function renderTable(headers, data) {
  const table = new Table({
    head: headers.map(h => chalk.cyan(h)),
    style: { head: [], border: [] }
  });
  
  data.forEach(row => {
    table.push(row);
  });
  
  console.log(table.toString());
}

let activeSpinner = null;

export function renderSpinner(msg) {
  if (activeSpinner) activeSpinner.stop();
  activeSpinner = ora({
    text: msg,
    color: 'cyan'
  }).start();
  return activeSpinner;
}

export function clearSpinner() {
  if (activeSpinner) {
    activeSpinner.stop();
    activeSpinner = null;
  }
}

export function renderSection(title, content) {
  console.log(boxen(content, {
    title: chalk.blue.bold(title),
    titleAlignment: 'left',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }));
}
