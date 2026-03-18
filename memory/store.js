import path from 'path';
import { fileExists, createDir, readJson, writeJson } from '../utils/file-utils.js';

let projectRoot = process.cwd();

export function setProjectRoot(root) {
  projectRoot = root;
}

export async function initialize(root) {
  projectRoot = root;
  const sfaiDir = path.join(projectRoot, '.sfai');
  const logsDir = path.join(sfaiDir, 'logs');
  
  await createDir(sfaiDir);
  await createDir(logsDir);
}

export async function exists() {
  const sfaiDir = path.join(projectRoot, '.sfai');
  return await fileExists(sfaiDir);
}

export async function saveContext(data) {
  const filePath = path.join(projectRoot, '.sfai', 'project-context.json');
  await writeJson(filePath, data);
}

export async function loadContext() {
  const filePath = path.join(projectRoot, '.sfai', 'project-context.json');
  if (await fileExists(filePath)) {
    return await readJson(filePath);
  }
  return null;
}

export async function saveMemory(data) {
  const filePath = path.join(projectRoot, '.sfai', 'memory.json');
  await writeJson(filePath, data);
}

export async function loadMemory() {
  const filePath = path.join(projectRoot, '.sfai', 'memory.json');
  if (await fileExists(filePath)) {
    return await readJson(filePath);
  }
  return {};
}
