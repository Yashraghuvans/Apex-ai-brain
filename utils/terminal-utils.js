import chalk from 'chalk';
import path from 'path';

export function clearScreen() {
  process.stdout.write('\x1Bc');
}

export function printDivider() {
  console.log(chalk.gray('─'.repeat(process.stdout.columns || 80)));
}

export function formatPath(filePath, projectRoot = process.cwd()) {
  const relativePath = path.relative(projectRoot, filePath);
  if (relativePath.length < filePath.length) {
    return `.${path.sep}${relativePath}`;
  }
  return filePath;
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
