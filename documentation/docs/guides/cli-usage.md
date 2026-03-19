---
sidebar_position: 1
---

# CLI Usage Guide

Complete reference for all Apex AI Brain commands.

## Command Syntax

```bash
sfai <command> [options] [arguments]
```

## Foundation Commands

### /init
Initialize a new Salesforce project context.

```bash
sfai /init
```

**What it does:**
- Scans your project structure
- Extracts Apex classes, LWC components, metadata
- Builds a context graph
- Stores configuration in `.sfai/` folder

**Output:**
```
✓ Project Initialization Complete
  ├─ Project Type: Salesforce DX
  ├─ Files Scanned: 2,847
  ├─ Apex Classes: 42
  ├─ LWC Components: 8
  ├─ Custom Objects: 15
  └─ Context Size: 2.3 MB
```

### /status
Show current project status and configuration.

```bash
sfai /status
```

**Output:**
```
Project Status
==============
Name:          My Salesforce Org
Type:          DX Project
Initialized:   Yes
Last Scanned:  2 hours ago
Complexity:    medium

Agents Ready:  16/16
Context Loaded: Yes

File Statistics:
  - Apex Classes: 42
  - LWC Components: 8
  - Aura Components: 2
  - Custom Objects: 15
  - Workflows: 23
```

### /help
Display all available commands.

```bash
sfai /help
```

Or get help for a specific command:

```bash
sfai /help /plan
sfai /help /spawn
```

---

## Development Commands

### /plan
Create a structured plan for a feature request.

```bash
sfai /plan "Feature description"
```

**Examples:**
```bash
sfai /plan "Create customer portal with LWC"
sfai /plan "Add lead scoring with Apex batch job"
sfai /plan "Build multi-select picklist with filtering"
```

**Output:** Structured JSON plan with:
- Task breakdown
- Agent assignments
- Dependency mapping
- Estimated complexity
- Suggested execution order

### /spawn
Execute a specific agent for a focused task.

```bash
sfai /spawn <agent-name> "<task description>"
```

**Examples:**
```bash
sfai /spawn apex-architect "Design service layer for lead management"
sfai /spawn lwc-builder "Create form component with validation"
sfai /spawn soql-optimizer "Optimize account queries for dashboard"
sfai /spawn test-writer "Write tests for User_Management service"
```

**Agent Names Available:**
- `apex-architect` - Apex class design & patterns
- `lwc-builder` - Lightning Web Component development
- `apex-reviewer` - Code review & quality checks
- `test-writer` - Apex test class generation
- `soql-optimizer` - Query optimization
- `security-agent` - Security & compliance checks
- `schema-analyst` - Data model design
- `flow-advisor` - Flow creation & optimization
- `metadata-manager` - Metadata configuration
- `planner` - Feature planning
- `git-agent` - Git commits & PRs
- `deployment-agent` - Deployment strategies
- `debug-agent` - Debugging & troubleshooting
- `diff-reviewer` - Git diff analysis
- `kanban-agent` - Task management
- `memory-agent` - Memory management

---

## Agent Management Commands

### /agents
List all available agents with brief descriptions.

```bash
sfai /agents
```

**Output:**
```
Available Agents (16 total)
===========================

🏗  ARCHITECT AGENTS
  ├─ apex-architect          Design Apex structures & patterns
  ├─ lwc-builder             Build Lightning Web Components
  ├─ schema-analyst          Design data models
  └─ flow-advisor            Create & optimize flows

🔍 REVIEWER & QUALITY
  ├─ apex-reviewer           Review Apex code quality
  ├─ security-agent          Check security & compliance
  ├─ test-writer             Write comprehensive tests
  └─ diff-reviewer           Analyze code changes

  OPERATIONS
  ├─ soql-optimizer          Optimize SOQL queries
  ├─ metadata-manager        Manage metadata
  ├─ git-agent               Handle git operations
  ├─ deployment-agent        Plan deployments
  └─ kanban-agent            Manage tasks

🧠 UTILITIES
  ├─ planner                 Break down features
  ├─ debug-agent             Troubleshoot issues
  └─ memory-agent            Manage memory
```

### /agent-spawn
Alternative syntax for spawning agents.

```bash
sfai /agent-spawn <agent-name> "<task>"
```

Same as `/spawn`.

### /agent-kill
Stop a running agent.

```bash
sfai /agent-kill <agent-id>
```

### /agent-logs
View agent execution logs.

```bash
sfai /agent-logs                    # All logs
sfai /agent-logs <agent-name>      # Specific agent
sfai /agent-logs --tail 50         # Last 50 lines
sfai /agent-logs --filter error    # Only errors
```

---

## Model & Cost Tracking

### /model
Manage AI model selection.

```bash
sfai /model list              # Show available models
sfai /model set claude        # Set default model
sfai /model info              # Show current settings
```

**Models:**
- `claude` - Claude 3 (default, most capable)
- `gemini` - Google Gemini (fast, cost-effective)
- `gpt4` - OpenAI GPT-4 (experimental)

### /tokens
Check token usage and cost tracking.

```bash
sfai /tokens                  # Current session
sfai /tokens --daily         # Today's usage
sfai /tokens --monthly       # This month's usage
sfai /tokens --breakdown     # By model breakdown
```

**Output:**
```
Token Usage Report
==================
Period:    Current Session
Tokens:    45,234
Cost:      $0.68

By Model:
  Claude 3 Opus:     30,000 tokens  ($0.45)
  Gemini Pro:        15,234 tokens  ($0.23)

Monthly Tracking:
  Used:     $87.45
  Budget:   $100.00
  Remaining: $12.55
```

### /cost
Analyze cost by model and feature.

```bash
sfai /cost --by-model        # Cost breakdown by model
sfai /cost --by-agent        # Cost by agent
sfai /cost --projection      # Projected costs
```

---

## Memory & Context

### /memory
Manage shared memory storage.

```bash
sfai /memory list            # List all stored items
sfai /memory get <key>       # Get specific item
sfai /memory set <key> <value>
sfai /memory clear          # Clear all memory
sfai /memory export         # Export to JSON
sfai /memory import <file>  # Import from JSON
```

---

## Utility Commands

### /clear
Clear the terminal screen.

```bash
sfai /clear
```

### /exit
Exit the Apex AI Brain CLI.

```bash
sfai /exit
```

Or use: `Ctrl+C`

---

## Command Workflow Examples

### Example 1: Building a Complete Feature

```bash
# 1. Plan the feature
sfai /plan "Add customer feedback system"

# 2. Design data model
sfai /spawn schema-analyst "Design feedback custom objects"

# 3. Build Apex layer
sfai /spawn apex-architect "Create FeedbackHandler service with bulkified logic"

# 4. Build LWC layer
sfai /spawn lwc-builder "Create FeedbackForm LWC component"

# 5. Write tests
sfai /spawn test-writer "Write tests for FeedbackHandler"

# 6. Review code
sfai /spawn apex-reviewer "Review FeedbackHandler for best practices"

# 7. Check costs
sfai /tokens --breakdown

# 8. Commit and deploy
sfai /spawn git-agent "Create meaningful commit and PR"
```

### Example 2: Quick Code Review

```bash
sfai /spawn apex-reviewer "Review AccountService class for security issues"
sfai /spawn soql-optimizer "Optimize queries in AccountService"
```

### Example 3: Troubleshooting

```bash
sfai /spawn debug-agent "Why is my LWC component not rendering?"
sfai /spawn security-agent "Check for security vulnerabilities in authentication flow"
```

---

## Interactive Mode Tips

The CLI runs in an interactive REPL mode. Tips:

 **Use arrow keys** to navigate command history
 **Type `/help`** for a quick reminder
 **Press Tab** for command autocomplete (if enabled)
 **Type keywords** to search previous agent outputs
 **Use `/memory get`** to retrieve previous results

---

## Advanced Options

### Environment Variables

```bash
# Set default model globally
export SFAI_DEFAULT_MODEL=claude

# Disable token tracking
export SFAI_DISABLE_TRACKING=true

# Verbose logging
export SFAI_DEBUG=true
```

### Configuration File

Create `sfai.config.json`:

```json
{
  "defaultModel": "claude",
  "tokenTracking": {
    "enabled": true,
    "monthlyBudget": 100
  },
  "agents": {
    "timeout": 60000
  }
}
```

---

## Troubleshooting Commands

### Debug Mode

```bash
DEBUG=true sfai /status
```

Shows detailed logs and system information.

### Check Agent Status

```bash
sfai /agents
sfai /agent-logs --filter error
```

### Verify Installation

```bash
node -v && npm -v
sfai /help
sfai /status
```

---

## FAQ

**Q: What if an agent times out?**
A: Check `/agent-logs` and try with simpler task or use `--timeout 120` option.

**Q: Can I cancel a running agent?**
A: Use `Ctrl+C` or `/agent-kill <agent-id>`.

**Q: How do I export agent outputs?**
A: Use `/memory export` to get all results as JSON.

**Q: Can I use multiple models in one plan?**
A: Yes, different agents can use different models automatically.

**Q: How do I track costs per feature?**
A: Check `/tokens --breakdown` and `/memory` for feature-specific outputs.

