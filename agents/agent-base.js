import EventEmitter from 'eventemitter3';
import { aiClient } from '../ai/client.js';
import { promptBuilder } from '../ai/prompt-builder.js';
import { sharedMemory } from './shared-memory.js';
import { v4 as uuidv4 } from 'uuid';

export class AgentBase extends EventEmitter {
  constructor(definition) {
    super();
    this.id = uuidv4();
    this.name = definition.name;
    this.description = definition.description;
    this.tools = definition.tools || [];
    this.modelComplexity = definition.model || 'medium'; // mapped in runner to actual model
    this.definitionContent = definition.content;
    
    this.status = 'idle'; // idle, thinking, working, done, error
  }

  setStatus(newStatus, message = '') {
    this.status = newStatus;
    this.emit('statusChange', { agentId: this.id, name: this.name, status: newStatus, message });
  }

  log(message) {
    this.emit('log', { agentId: this.id, name: this.name, message });
  }

  getSystemContext() {
    // To be overridden by specific agent subclasses if they need code-level injection beyond the .md content
    return {};
  }

  async run(task, context = {}) {
    this.setStatus('thinking', `Analyzing task: ${typeof task === 'string' ? task.substring(0, 50) : 'complex object'}`);
    
    try {
      const allMemory = sharedMemory.getAll();
      const prompt = promptBuilder.buildAgentPrompt(
        { content: this.definitionContent },
        task,
        allMemory
      );

      this.setStatus('working', 'Generating response via AI...');
      
      const response = await aiClient.complete(prompt, {
        // model routing can be handled at orchestrator level or overridden here
      });

      this.setStatus('done', 'Task complete.');
      
      // Auto-store result if it's significant (simplified logic for phase 2)
      await sharedMemory.set(`last_${this.name}_result`, response.text, this.name);
      
      return response.text;
    } catch (error) {
      this.setStatus('error', error.message);
      throw error;
    }
  }

  async stream(task, context = {}, onChunk) {
    this.setStatus('thinking', 'Preparing to stream response...');
    try {
       const allMemory = sharedMemory.getAll();
       const prompt = promptBuilder.buildAgentPrompt(
         { content: this.definitionContent },
         task,
         allMemory
       );
       
       this.setStatus('working', 'Streaming response...');
       const response = await aiClient.stream(prompt, {}, (chunk) => {
         if (onChunk) onChunk(chunk);
       });
       
       this.setStatus('done', 'Stream complete.');
       await sharedMemory.set(`last_${this.name}_result`, response.text, this.name);
       return response.text;
    } catch (error) {
       this.setStatus('error', error.message);
       throw error;
    }
  }

  getMemory() {
    return sharedMemory.getByAgent(this.name);
  }
}
