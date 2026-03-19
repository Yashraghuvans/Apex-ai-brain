---
sidebar_position: 1
---

# CLI Commands Reference

Complete reference for all Apex AI Brain CLI commands.

## Command Groups

### Foundation Commands

#### /init
Initialize project context by scanning Salesforce project structure.

```bash
sfai /init
```

**Parameters:**
- Optional: `--path <project_path>` - Specify project location

**Output:** Project context configuration

---

#### /status
Display current project and system status.

```bash
sfai /status
```

**Shows:**
- Project initialization status
- Available agents
- Loaded context
- Statistics

---

#### /help
Display command help and documentation.

```bash
sfai /help [command]
```

**Examples:**
```bash
sfai /help              # All commands
sfai /help /plan       # Plan command help
```

---

### Development Commands

#### /plan
Create a structured development plan for a feature request.

```bash
sfai /plan "<feature description>"
```

**Returns:** JSON plan with task breakdown, dependencies, and agents

**Example:**
```bash
sfai /plan "Add customer portal with approval workflow"
```

---

#### /fix
Fix or refactor existing code.

```bash
sfai /fix "<description of issue or preferred fix>"
```

---

### Agent Commands

#### /spawn (or /agent-spawn)
Execute a specific agent for a task.

```bash
sfai /spawn <agent-name> "<task>"
sfai /agent-spawn <agent-name> "<task>"
```

**Agents:**
- See [Agents Overview](../agents/overview.md) for complete list

**Example:**
```bash
sfai /spawn apex-architect "Design lead service"
```

---

#### /agents
List all available agents.

```bash
sfai /agents
```

**Output:** Agent list with descriptions

---

#### /agent-kill
Stop a running agent.

```bash
sfai /agent-kill <agent-id>
```

---

#### /agent-logs
View agent execution logs.

```bash
sfai /agent-logs [agent-name] [options]
```

**Options:**
- `--tail N` - Show last N lines
- `--filter <keyword>` - Filter by keyword
- `--watch` - Watch live

**Examples:**
```bash
sfai /agent-logs                      # All logs
sfai /agent-logs apex-architect       # Specific agent
sfai /agent-logs --tail 50            # Last 50 lines
sfai /agent-logs --filter error       # Errors only
```

---

### Model & Cost Commands

#### /model
Manage AI model selection.

```bash
sfai /model <subcommand>
```

**Subcommands:**
- `list` - Show available models
- `set <model>` - Set default model
- `info` - Show current settings

**Models:**
- `claude` - Claude 3 (default)
- `gemini` - Google Gemini
- `gpt4` - OpenAI GPT-4

**Examples:**
```bash
sfai /model list
sfai /model set gemini
```

---

#### /tokens
Check token usage and costs.

```bash
sfai /tokens [options]
```

**Options:**
- `--breakdown` - By model breakdown
- `--by-agent` - By agent breakdown
- `--budget` - Budget status
- `--daily` - Daily stats
- `--monthly` - Monthly stats
- `--export <file>` - Export to file

**Examples:**
```bash
sfai /tokens
sfai /tokens --breakdown
sfai /tokens --export report.json
```

---

#### /cost
Analyze AI costs.

```bash
sfai /cost [options]
```

**Options:**
- `--by-model` - Cost per model
- `--by-agent` - Cost per agent
- `--projection` - Projected costs
- `--report <type>` - Generate report

**Examples:**
```bash
sfai /cost --by-agent
sfai /cost --report monthly
```

---

### Memory Commands

#### /memory
Manage shared memory and knowledge base.

```bash
sfai /memory <subcommand> [options]
```

**Subcommands:**
- `list` - List all memory entries
- `get <key>` - Retrieve value
- `set <key> <value>` - Store value
- `delete <key>` - Delete entry
- `clear` - Clear all memory
- `search <query>` - Search memory
- `export` - Export to file
- `import <file>` - Import from file
- `snapshot <name>` - Create snapshot

**Examples:**
```bash
sfai /memory list
sfai /memory get "design_output"
sfai /memory set "schema" "{...}"
sfai /memory search "account pattern"
sfai /memory export backup.json
```

---

## Command Syntax

### Basic Format

```bash
sfai /<command> [options] [arguments]
```

### Options Format

```bash
sfai /command --option value
sfai /command --flag
```

### Examples

```bash
# No options
sfai /help

# With options
sfai /tokens --breakdown

# With arguments
sfai /spawn apex-architect "Design service"

# Multiple options
sfai /agent-logs --tail 100 --filter error
```

---

## Global Options

### Available Everywhere

```bash
--debug          # Enable debug logging
--quiet          # Suppress output
--json           # JSON output format
--no-color       # No colored output
```

### Examples

```bash
sfai /status --json
sfai /spawn --debug apex-architect "..."
```

---

## Exit Commands

### Leave the CLI

```bash
/exit            # Normal exit
Ctrl+C           # Interrupt
```

---

## Command Chaining

### Run Multiple Commands

```bash
# Sequential
sfai /init
sfai /status
sfai /plan "feature"

# With logical operators
sfai /init && sfai /status && sfai /plan "feature"
```

---

## Tips & Tricks

✅ **Use command history**
- Arrow up/down to navigate
- Ctrl+R to search history

✅ **Abbreviate if possible**
- Many commands have shorter forms
- `/spawn` = `/agent-spawn`

✅ **Save useful outputs**
- Use `/memory export` for backup
- Use `/tokens --export` for billing

✅ **Chain dependent tasks**
- Store outputs in memory
- Reference in next command

---

## Troubleshooting Commands

### Verify Installation

```bash
sfai /help               # Check commands work
sfai /status            # Check project loaded
sfai /agents            # Check agents ready
```

### Debug Issues

```bash
sfai --debug /status    # Verbose output
sfai /agent-logs        # Check agent operations
sfai /memory list       # Verify memory system
```

### Reset/Cleanup

```bash
sfai /memory clear --session    # Clear session
sfai /memory cleanup            # Cleanup old entries
```

---

## See Also

- [Quick Start Guide](../getting-started/quick-start.md)
- [CLI Usage Guide](../guides/cli-usage.md)
- [Agents Reference](../agents/overview.md)

