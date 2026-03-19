import EventEmitter from 'eventemitter3';
import { spawnAgent } from './runners/spawn.js';
import { killAgent } from './runners/kill.js';
import { agentLogger } from './runners/logger.js';
import { fileExists } from '../utils/file-utils.js';
import * as logger from '../utils/logger.js';
import path from 'path';

class AgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.activeAgents = new Map(); // id -> AgentBase
  }

  async init() {
    const projectRoot = process.cwd();
    const isInitialized = await fileExists(path.join(projectRoot, '.sfai'));
    
    if (isInitialized) {
      try {
        await this.spawn('memory-agent');
      } catch (e) {
        // Silently fail if memory agent isn't defined yet during initial setup
      }
    }
  }

  async spawn(name, task) {
    const agent = await spawnAgent(name, this.activeAgents);
    
    agent.on('statusChange', (e) => {
      agentLogger.handleStatusChange(e);
      this.emit('agentStatusChange', e);
    });
    
    agent.on('log', (e) => {
      agentLogger.handleLog(e);
      this.emit('agentLog', e);
    });

    if (task) {
      // Run task in background and track with promise
      const taskPromise = agent.run(task, {}).catch(e => {
        logger.error(`Agent ${name} task failed: ${e.message}`);
        agent.setStatus('error', e.message);
      });
      
      // Store promise for tracking
      agent._taskPromise = taskPromise;
    }
    
    return agent;
  }

  kill(nameOrId) {
    return killAgent(nameOrId, this.activeAgents);
  }

  list() {
    // Return all known definitions (hardcoded for phase 2 simplicity, 
    // ideally read from fs but we know the 16 we made)
    return [
      'planner', 'apex-architect', 'apex-reviewer', 'lwc-builder', 
      'test-writer', 'schema-analyst', 'soql-optimizer', 'metadata-manager', 
      'flow-advisor', 'deployment-agent', 'git-agent', 'diff-reviewer', 
      'memory-agent', 'debug-agent', 'security-agent', 'kanban-agent'
    ];
  }

  getActive() {
    return Array.from(this.activeAgents.values());
  }

  async assign(task) {
    // Phase 2: Simple routing based on keywords
    const t = typeof task === 'string' ? task.toLowerCase() : JSON.stringify(task).toLowerCase();
    
    let bestAgent = 'planner';
    if (t.includes('lwc') || t.includes('ui')) bestAgent = 'lwc-builder';
    else if (t.includes('test')) bestAgent = 'test-writer';
    else if (t.includes('soql')) bestAgent = 'soql-optimizer';
    else if (t.includes('error') || t.includes('bug') || t.includes('fix')) bestAgent = 'debug-agent';
    else if (t.includes('review')) bestAgent = 'apex-reviewer';
    else if (t.includes('architect') || t.includes('design')) bestAgent = 'apex-architect';

    return await this.spawn(bestAgent, task);
  }

  broadcast(message) {
    for (const agent of this.activeAgents.values()) {
      // Simple broadcast mechanism
      agent.emit('message', { from: 'system', content: message });
    }
  }

  onAnyStatusChange(callback) {
    this.on('agentStatusChange', callback);
  }
}

export const orchestrator = new AgentOrchestrator();
