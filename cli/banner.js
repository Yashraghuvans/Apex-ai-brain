import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(await readFile(path.join(__dirname, '../package.json'), 'utf8'));

export function showBanner() {
  const banner = `
   _____  ______  _      _____ 
  / ____||  ____|/ \\    |_   _|
 | (___  | |__  / _ \\     | |  
  \\___ \\ |  __|/ ___ \\    | |  
  ____) || |  / /   \\ \\  _| |_ 
 |_____/ |_| /_/     \\_\\|_____|
  `;
  
  console.log(chalk.cyan(banner));
  console.log(chalk.blue.bold('  Salesforce AI Terminal'));
  console.log(chalk.gray(`  Version: ${packageJson.version}`));
  console.log();
}
