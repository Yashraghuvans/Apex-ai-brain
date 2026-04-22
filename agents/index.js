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
    // Phase 3: Intelligent routing using the planner agent
    logger.info(`Orchestrator: Planning task execution...`);
    
    try {
      // 1. Spawn the planner agent
      const planner = await this.spawn('planner');
      
      // 2. Run the task through the planner to get the breakdown
      const planResult = await planner.run(task, {
        availableAgents: this.list()
      });

      // 3. Parse the plan from the result
      // The planner is instructed to output JSON, but we'll try to extract it from the markdown-wrapped text
      let plan;
      try {
        const jsonMatch = planResult.text.match(/```json\n([\s\S]*?)\n```/) || 
                          planResult.text.match(/{[\s\S]*}/);
        plan = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : planResult.text);
      } catch (e) {
        logger.warn('Failed to parse plan JSON. Falling back to simple routing.');
        // Fallback is still keyword-based but slightly smarter now
        return this.legacyAssign(task);
      }

      // 4. Execute the plan (Phase 4: Multi-agent execution logic)
      // For now, spawn the first assigned agent for the most important task
      if (plan.tasks && plan.tasks.length > 0) {
        const mainTask = plan.tasks[0];
        logger.info(`Orchestrator: Plan created. Primary agent: ${mainTask.assignedAgent}`);
        return await this.spawn(mainTask.assignedAgent, mainTask.description);
      }

      return await this.legacyAssign(task);

    } catch (error) {
      logger.error(`Planning failed: ${error.message}. Falling back to legacy routing.`);
      return this.legacyAssign(task);
    }
  }

  async legacyAssign(task) {
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
