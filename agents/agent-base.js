import EventEmitter from 'eventemitter3';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { aiClient } from '../ai/client.js';
import promptBuilder from '../ai/prompt-builder.js';
import { sharedMemory } from './shared-memory.js';
import { TokenTracker } from '../ai/token-tracker.js';
import * as fileUtils from '../utils/file-utils.js';
import * as logger from '../utils/logger.js';
import * as store from '../memory/store.js';

const execAsync = promisify(exec);

export class AgentBase extends EventEmitter {
  constructor(definition) {
    super();
    this.id = uuidv4();
    this.name = definition.name || 'unknown-agent';
    this.description = definition.description || '';
    this.tools = definition.tools || [];
    this.model = definition.model || 'medium';
    this.systemContext = definition.content || '';
    this.status = 'idle'; // idle, thinking, working, done, error
    this.maxToolLoops = 10;
    this.tokenTracker = new TokenTracker();
  }

  /**
   * Main entry point - runs the full tool loop
   * Implements: Plan → Tool Call → Observe → Act
   */
  async run(task, context = {}) {
    this.setStatus('thinking', `Analyzing task`);
    logger.info(`[${this.name}] Starting task: ${task.slice(0, 80)}...`);

    try {
      // Build initial system prompt
      const systemPrompt = await promptBuilder.buildAgentPrompt(
        { name: this.name, content: this.systemContext, description: this.description },
        task,
        sharedMemory.getAll(),
        context
      );

      // Initialize conversation history
      const messages = [
        { role: 'user', content: task }
      ];

      let loopCount = 0;

      // ========== THE TOOL LOOP ==========
      while (loopCount < this.maxToolLoops) {
        loopCount++;
        logger.debug(`[${this.name}] Tool loop iteration ${loopCount}/${this.maxToolLoops}`);

        // Step 1: Plan - AI generates next action
        this.setStatus('working', `Planning (iteration ${loopCount})`);

        const response = await aiClient.complete(systemPrompt, {
          messages,
          tools: this.getToolDefinitions(),
          model: this.model,
        });

        // Track token usage
        if (this.tokenTracker && response.tokens) {
          this.tokenTracker.track(response.tokens);
        }

        // Step 2: Check for tool calls
        if (response.toolCalls && response.toolCalls.length > 0) {
          // Tool calls requested - execute them
          logger.info(`[${this.name}] Tool calls: ${response.toolCalls.map(t => t.name).join(', ')}`);
          this.setStatus('working', `Executing tools: ${response.toolCalls.map(t => t.name).join(', ')}`);

          // Step 3: Observe - execute tools and collect results
          const toolResults = await Promise.all(
            response.toolCalls.map(toolCall => this.executeTool(toolCall))
          );

          // Step 4: Act - add exchange to message history
          messages.push({
            role: 'assistant',
            content: response.text || '',
            toolCalls: response.toolCalls
          });

          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResults, null, 2)
          });

          // Continue loop to get next response from AI
        } else {
          // No tool calls - agent has completed the task
          this.setStatus('done', 'Task complete');
          logger.info(`[${this.name}] Task complete after ${loopCount} tool loop(s)`);

          // Save result to shared memory
          await sharedMemory.set(
            `${this.name}_lastResult`,
            {
              task: task.slice(0, 100),
              result: response.text,
              loops: loopCount,
              timestamp: Date.now()
            },
            this.name
          );

          return {
            text: response.text,
            agent: this.name,
            agentId: this.id,
            loops: loopCount,
            tokens: response.tokens || {}
          };
        }
      }

      // Hit max loops without finishing
      this.setStatus('error', `Exceeded max tool loops (${this.maxToolLoops})`);
      throw new Error(`Agent ${this.name} exceeded max tool loops (${this.maxToolLoops}). Consider breaking task into smaller parts.`);

    } catch (error) {
      this.setStatus('error', error.message);
      logger.error(`[${this.name}] Error: ${error.message}`);
      logger.debug(`Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Execute a tool call from the AI
   * Each tool returns { tool, success, ... } object
   */
  async executeTool(toolCall) {
    logger.debug(`[${this.name}] Executing tool: ${toolCall.name}`);

    // Tool registry - will expand in Phase 4 with MCP tools
    const toolRegistry = {
      
      readFile: async ({ path: filePath }) => {
        try {
          fileUtils.validatePath(filePath);
          const content = await fileUtils.readFile(filePath);
          // Limit size to prevent token explosion
          return {
            success: true,
            content: content.length > 10000
              ? content.slice(0, 9500) + '\n... (truncated)'
              : content
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      writeFile: async ({ path: filePath, content }) => {
        try {
          fileUtils.validatePath(filePath);
          await fileUtils.writeFile(filePath, content);
          return { success: true, path: filePath };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      listFiles: async ({ dir, extensions = [] }) => {
        try {
          fileUtils.validatePath(dir);
          const files = await fileUtils.listFiles(dir, extensions);
          return {
            success: true,
            files: files.slice(0, 100), // Limit to 100 files
            count: files.length
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      runCommand: async ({ command }) => {
        // Whitelist safe commands only
        const safePrefix = ['sf ', 'git ', 'node ', 'npm ', 'grep '];
        const isSafe = safePrefix.some(prefix => command.startsWith(prefix));

        if (!isSafe) {
          return {
            success: false,
            error: `Command not whitelisted. Allowed: sf, git, node, npm, grep`
          };
        }

        try {
          const { stdout, stderr } = await execAsync(command, {
            cwd: process.cwd(),
            timeout: 30000,
            maxBuffer: 10 * 1024 * 1024 // 10MB max output
          });

          return {
            success: true,
            stdout: stdout.slice(0, 5000),
            stderr: stderr.slice(0, 2000)
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            stdout: (error.stdout || '').slice(0, 5000),
            stderr: (error.stderr || '').slice(0, 2000)
          };
        }
      },

      searchMemory: async ({ query }) => {
        try {
          const results = sharedMemory.search(query);
          return {
            success: true,
            results: results.slice(0, 10) // Limit to 10 results
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      getProjectContext: async () => {
        try {
          const exists = await store.exists();
          if (!exists) {
            return { success: true, context: null, message: 'No project context. Run /init first.' };
          }
          const context = await store.loadContext();
          return { success: true, context };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Phase 4 onwards - MCP and Git tools will be added here
      // mcpSalesforce: async (args) => { ... }
      // mcpGithub: async (args) => { ... }
      // gitOperation: async (args) => { ... }
    };

    const tool = toolRegistry[toolCall.name];
    if (!tool) {
      logger.warn(`[${this.name}] Unknown tool requested: ${toolCall.name}`);
      return {
        tool: toolCall.name,
        success: false,
        error: `Unknown tool: ${toolCall.name}. Use one of: ${Object.keys(toolRegistry).join(', ')}`
      };
    }

    try {
      const result = await tool(toolCall.arguments || {});
      return { tool: toolCall.name, ...result };
    } catch (error) {
      logger.error(`[${this.name}] Tool error (${toolCall.name}): ${error.message}`);
      return { tool: toolCall.name, success: false, error: error.message };
    }
  }

  /**
   * Tool definitions for AI providers (Claude function calling schema)
   */
  getToolDefinitions() {
    return [
      {
        name: 'readFile',
        description: 'Read the entire contents of a file in the Salesforce project',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to file from project root (e.g., force-app/main/default/classes/MyClass.cls)'
            }
          },
          required: ['path']
        }
      },
      {
        name: 'writeFile',
        description: 'Write or overwrite the contents of a file in the Salesforce project',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Relative path to write to (will create directories if needed)'
            },
            content: {
              type: 'string',
              description: 'The complete file content to write'
            }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'listFiles',
        description: 'List files in a directory, optionally filtered by file extension',
        inputSchema: {
          type: 'object',
          properties: {
            dir: {
              type: 'string',
              description: 'Directory path relative to project root (e.g., force-app/main/default/classes)'
            },
            extensions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional file extension filters (e.g., [".cls", ".trigger"])'
            }
          },
          required: ['dir']
        }
      },
      {
        name: 'runCommand',
        description: 'Run a shell command (sf, git, node, npm only) - other commands blocked for security',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Shell command to run (must start with: sf, git, node, npm, or grep)'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'searchMemory',
        description: 'Search shared agent memory for relevant past findings and context',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Keyword or phrase to search for in shared memory'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'getProjectContext',
        description: 'Get the full Salesforce project context from the /init scan',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  /**
   * Set agent status and emit change event
   */
  setStatus(newStatus, message = '') {
    this.status = newStatus;
    this.emit('statusChange', {
      agentId: this.id,
      name: this.name,
      status: newStatus,
      message,
      timestamp: Date.now()
    });
  }

  /**
   * Get current agent status
   */
  getStatus() {
    return {
      name: this.name,
      id: this.id,
      status: this.status,
      model: this.model
    };
  }
}

export default AgentBase;
