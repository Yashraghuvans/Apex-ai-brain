import path from 'path';
import { readJson, writeJson, fileExists } from '../utils/file-utils.js';

class SharedMemory {
  constructor() {
    this.memory = {};
    this.projectRoot = process.cwd();
    this.filePath = path.join(this.projectRoot, '.sfai', 'memory.json');
  }

  async load() {
    if (await fileExists(this.filePath)) {
      try {
        this.memory = await readJson(this.filePath);
      } catch (e) {
        this.memory = {};
      }
    } else {
      this.memory = {};
    }
  }

  async persist() {
    await writeJson(this.filePath, this.memory);
  }

  async set(key, value, agentName = 'system') {
    if (!this.memory[key]) {
      this.memory[key] = {
        value,
        storedBy: agentName,
        timestamp: new Date().toISOString(),
        accessCount: 0
      };
    } else {
      this.memory[key].value = value;
      this.memory[key].storedBy = agentName;
      this.memory[key].timestamp = new Date().toISOString();
    }
    await this.persist();
  }

  get(key) {
    if (this.memory[key]) {
      this.memory[key].accessCount = (this.memory[key].accessCount || 0) + 1;
      // Note: we don't await persist() here to avoid blocking reads, 
      // but the updated accessCount will be saved next time persist() is called.
      return this.memory[key].value;
    }
    return null;
  }

  getAll() {
    return this.memory;
  }

  getByAgent(agentName) {
    const result = {};
    for (const [key, item] of Object.entries(this.memory)) {
      if (item.storedBy === agentName) {
        result[key] = item.value;
      }
    }
    return result;
  }

  async append(key, value, agentName = 'system') {
    if (!this.memory[key]) {
      await this.set(key, [value], agentName);
    } else if (Array.isArray(this.memory[key].value)) {
      this.memory[key].value.push(value);
      this.memory[key].timestamp = new Date().toISOString();
      this.memory[key].storedBy = agentName;
      await this.persist();
    } else {
      throw new Error(`Cannot append to non-array memory key: ${key}`);
    }
  }

  search(query) {
    const q = query.toLowerCase();
    const results = {};
    for (const [key, item] of Object.entries(this.memory)) {
      if (key.toLowerCase().includes(q) || 
          (typeof item.value === 'string' && item.value.toLowerCase().includes(q))) {
        results[key] = item;
      }
    }
    return results;
  }
}

export const sharedMemory = new SharedMemory();
