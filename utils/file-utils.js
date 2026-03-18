import { readFile as fsReadFile, writeFile as fsWriteFile, mkdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { globby } from 'globby';

export async function readFile(filePath) {
  return await fsReadFile(filePath, 'utf8');
}

export async function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  await createDir(dir);
  await fsWriteFile(filePath, content, 'utf8');
}

export async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function createDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function listFiles(dirPath, extensions = []) {
  const patterns = extensions.length > 0 
    ? extensions.map(ext => `**/*.${ext.replace(/^\./, '')}`) 
    : ['**/*'];
  
  return await globby(patterns, {
    cwd: dirPath,
    absolute: true,
    dot: true,
    gitignore: true
  });
}

export async function readJson(filePath) {
  const content = await readFile(filePath);
  return JSON.parse(content);
}

export async function writeJson(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content);
}
