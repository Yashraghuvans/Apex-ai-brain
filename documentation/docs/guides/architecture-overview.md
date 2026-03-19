---
sidebar_position: 2
---

# Architecture Overview

Understand the core architecture of Apex AI Brain.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Apex AI Brain CLI                      │
│                  (REPL Interface)                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼─────┐  ┌──▼──────┐  ┌─▼──────────┐
   │  Command  │  │  Agent  │  │  Memory    │
   │ Registry  │  │Manager  │  │  System    │
   └────┬─────┘  └──┬──────┘  └─┬──────────┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────▼──────────┐
        │  Context Engine      │
        │  - Scanner           │
        │  - Analyzer          │
        │  - Graph Builder     │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────────────┐
        │  Multi-Agent Orchestrator     │
        │  ┌─────────────────────────┐  │
        │  │  16 Specialized Agents  │  │
        │  └─────────────────────────┘  │
        └───────────┬──────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │   Prompt & Context Builder    │
        │   - Task Analysis             │
        │   - Memory Integration        │
        │   - Guardrail Injection       │
        └───────────┬──────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │     AI Client Layer            │
        │  ┌──────────┬──────────────┐   │
        │  │  Claude  │  Gemini  │GPT4 │ │
        │  └──────────┴──────────────┘   │
        │                                │
        │  Token Tracker & Cost Mgmt     │
        └────────────────────────────────┘
```

## Core Components

### 1. CLI Engine (`cli/index.js`)

Entry point for the command-line interface.

**Responsibilities:**
- Initialize the REPL (Read-Eval-Print Loop)
- Load and display banner
- Route commands to registry
- Handle user input
- Display formatted output

**Key Functions:**
- `startCli()` - Main entry point
- `loadBanner()` - Show startup banner
- `initializeRegistry()` - Load all commands
- `clearScreen()` - Terminal management

### 2. Command Registry (`core/command-registry.js`)

Routes commands to appropriate handlers.

```
/init          →  initialization command
/status        →  status command
/plan          →  planning command
/spawn         →  agent spawning
/tokens        →  token tracking
/help          →  help command
```

**Key Registers:**
- Foundation commands (init, status, help)
- Development commands (plan, fix)
- Agent commands (spawn, kill, logs)
- Model commands (model, tokens, cost)

### 3. Context Engine (`core/init/`)

Analyzes and builds project context.

#### Scanner
- Discovers Apex classes
- Identifies LWC components
- Maps custom objects
- Extracts metadata
- Finds dependencies

#### Analyzer
- Builds relationship graph
- Identifies patterns
- Categorizes complexity
- Detects anti-patterns

#### Context Builder
- Serializes context
- Creates memory store
- Prepares for agents

### 4. Multi-Agent Orchestrator (`agents/index.js`)

Manages 16 specialized agents.

**Agent Categories:**

| Category | Agents |
|----------|--------|
| **Architects** | apex-architect, lwc-builder, schema-analyst, flow-advisor |
| **Reviewers** | apex-reviewer, security-agent, test-writer, diff-reviewer |
| **Specialists** | soql-optimizer, metadata-manager, deployment-agent, kanban-agent |
| **Utilities** | planner, git-agent, debug-agent, memory-agent |

**Agent Lifecycle:**
```
1. Initialize    - Set up agent with definition
2. Validate      - Check prerequisites
3. Run           - Execute task
4. Stream        - Stream results to user
5. Store         - Save to memory
6. Cleanup       - Release resources
```

### 5. AI Client Layer (`ai/client.js`)

Multi-model abstraction layer.

**Features:**
- Model routing (Claude, Gemini, GPT-4)
- Streaming support
- Error handling & retries
- Token tracking
- Cost calculation

**Interface:**
```javascript
aiClient.complete(prompt, options)    // One-shot
aiClient.stream(prompt, options, cb)  // Streaming
```

### 6. Memory System (`memory/store.js`)

Persistent shared context across agents.

**Storage Tiers:**
- **Session Memory** - Current REPL session
- **Project Memory** - Persistent `.sfai/` folder
- **Shared Memory** - Between agents

**Key Operations:**
```
get(key)          - Retrieve value
set(key, value)   - Store value
list()            - List all keys
clear()           - Wipe all memory
export()          - JSON export
import()          - JSON import
```

---

## Data Flow

### Feature Planning Flow

```
User Request
    ↓
┌─────────────────────┐
│  Planner Agent      │
│  - Parse request    │
│  - Break into tasks │
│  - Assign agents    │
│  - Map dependencies │
└────────┬────────────┘
         ↓
Store in Memory
         ↓
Return Structured Plan JSON
```

### Agent Execution Flow

```
/spawn command
    ↓
Load Agent Definition
    ↓
Build System Context:
    ├─ Task description
    ├─ Project context
    ├─ Shared memory
    └─ Guardrails
    ↓
Build Prompt
    ├─ System instruction
    ├─ Context content
    ├─ Current task
    └─ Memory reference
    ↓
Route to AI Model
    ├─ Select model
    ├─ Add token tracking
    └─ Stream response
    ↓
Process Response
    ├─ Parse output
    ├─ Validate syntax
    └─ Apply guardrails
    ↓
Store in Memory
    ↓
Display to User
```

---

## Integration Points

### Salesforce DX Integration

```
Your Salesforce Project
    ↓
Scanner reads:
    ├─ force-app/main/default/**
    ├─ sfdx-project.json
    ├─ Apex metadata
    └─ Component files
    ↓
Creates Context Graph
    ├─ Dependency maps
    ├─ Pattern detection
    └─ Complexity scoring
```

### AI Provider Integration

```
Apex AI Brain
    ├─ Anthropic (Claude)
    │  ├─ 200k token context
    │  ├─ Opus/Sonnet/Haiku models
    │  └─ $15/$3/$0.80 per 1M tokens
    │
    ├─ Google (Gemini)
    │  ├─ 1M token context
    │  ├─ Pro/Pro Vision models
    │  └─ $0.50/$0.10 per 1M tokens
    │
    └─ OpenAI (GPT-4)
       ├─ 128k token context
       ├─ GPT-4/GPT-4 Turbo models
       └─ $30/$60 per 1M tokens
```

---

## Design Patterns Used

### 1. Agent Pattern
Each agent:
- Has a `.md` definition file
- Receives focused instructions
- Processes one type of task
- Returns structured output

### 2. Event-Driven Architecture
Agents emit events:
- `statusChange` - Agent status updates
- `log` - Agent logging
- `complete` - Task completion
- `error` - Error events

### 3. Memory/Memoization
- Shared memory across agents
- REPL session persistence
- Project-level storage
- Cost tracking

### 4. Prompt Injection
Guardrails are injected at prompt build time:
- Governor limits
- FSD structure rules
- Security best practices
- Bulkification requirements

---

## Execution Models

### Synchronous Execution
```javascript
const result = await agent.run(task);
```

### Streaming Execution
```javascript
await agent.stream(task, {}, (chunk) => {
  process.stdout.write(chunk);
});
```

### Parallel Execution (Orchestrator)
```javascript
const results = await Promise.all([
  agent1.run(task1),
  agent2.run(task2),
  agent3.run(task3)
]);
```

---

## Key Design Decisions

### Why Multi-Agent?
- **Separation of Concerns** - Each agent focuses on one domain
- **Scalability** - Easy to add new agents
- **Reusability** - Agents can be composed
- **Testing** - Each agent tested independently

### Why Feature-Sliced Design?
- **Maintainability** - Clear structure for large projects
- **Scalability** - Easy to grow features independently
- **Testability** - Isolated test coverage
- **Collaboration** - Team agreement on structure

### Why Token Tracking?
- **Cost Management** - Monitor AI spending
- **Budget Control** - Set and track budgets
- **ROI Analysis** - Understand AI value
- **Optimization** - Right-size model selection

---

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Project Init | 30-60s | Depends on project size |
| Plan Generation | 10-20s | Claude process time |
| Agent Execution | 20-60s | Per agent, varies by task |
| Memory Operations | <100ms | In-memory, very fast |
| Token Calculation | <50ms | Simple arithmetic |

---

## Security Architecture

```
┌──────────────────────────────────┐
│  User Input Validation           │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│  Guardrail Injection             │
│  - Security rules                │
│  - Governor limits               │
│  - Pattern requirements          │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│  Output Validation               │
│  - Syntax checking               │
│  - Pattern compliance            │
│  - No hardcoded credentials      │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│  Storage Encryption              │
│  - Credentials in .env           │
│  - Memory files protected        │
│  - Audit logging                 │
└──────────────────────────────────┘
```

