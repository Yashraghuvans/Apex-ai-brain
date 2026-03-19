---
sidebar_position: 2
---

# Core Modules Reference

Technical reference for Apex AI Brain core modules.

## Module Structure

```
core/
├── command-registry.js      Command routing
├── router.js               Request routing
└── init/
    ├── analyzer.js         Project analysis
    ├── context-builder.js  Context creation
    ├── index.js            Init orchestration
    └── scanner.js          File scanning

ai/
├── client.js               AI provider abstraction
├── model-router.js         Model selection
├── prompt-builder.js       Prompt construction
└── token-tracker.js        Token counting

agents/
├── agent-base.js           Base agent class
├── index.js                Agent orchestration
└── shared-memory.js        Memory management
```

## Key Classes

### CommandRegistry

Manages CLI command routing.

```javascript
registerCommand(command)  // Register new command
getCommandRegistry()      // List all commands
initializeRegistry()      // Load default commands
```

### InitAnalyzer

Analyzes project structure.

```javascript
analyzeProject(path)      // Scan and analyze
buildContextGraph()       // Create graph
detectPatterns()          // Identify patterns
```

### AIClient

Multi-model AI abstraction.

```javascript
complete(prompt, options) // One-shot completion
stream(prompt, options)   // Streaming response
trackTokens()             // Count tokens
```

### AgentBase

Base class for all agents.

```javascript
run(task, context)        // Execute task
stream(task, context)     // Streaming execution
setStatus(status)         // Update status
```

---

See Full Documentation: [CLI Commands](./cli-commands.md)

