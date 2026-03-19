---
sidebar_position: 2
---

# Quick Start

Get your first AI-powered Salesforce development task running in minutes.

## 1. Start the CLI

```bash
npm start
# or
node bin/sfai.js
```

You'll see the Apex AI Brain banner and welcome message.

## 2. View Available Commands

```
/help
```

This displays all available commands, organized by category.

## 3. Initialize Your Project

```
/init
```

This scans your Salesforce project and builds the context. You'll see:
- Project type detected
- File count scanned
- Context summary

## 4. Check Project Status

```
/status
```

Displays:
- Project initialization status
- Complexity level
- Available agents
- Token/cost tracking

## 5. Create a Development Plan

Try planning a feature:

```
/plan Add a custom object with LWC portal
```

The Planner Agent will:
- Break down the request into atomic tasks
- Assign to appropriate agents
- Identify dependencies
- Generate execution order

## 6. Spawn an Agent

Execute a specific agent for a task:

```
/spawn architect "Design the Account Portal module"
```

The agent will:
- Analyze project context
- Generate architectural recommendations
- Store results in memory
- Provide structured output

## 7. Run Multiple Agents

Typical workflow for a feature:

```
/spawn planner "New customer feedback system"
/spawn apex-architect "Design service layer"
/spawn lwc-builder "Create feedback form component"
/spawn test-writer "Write Apex tests"
/spawn soql-optimizer "Optimize queries"
```

## 8. Monitor Token Usage

Check how many tokens you've used:

```
/tokens
```

Shows:
- Total tokens used
- Cost breakdown by model
- Current session usage

## 9. Access Agent Logs

View what agents have been doing:

```
/agent-logs
```

Or get specific agent logs:

```
/agent-logs architect
```

## 10. Exit the CLI

```
/exit
# or Ctrl+C
```

---

## Example: Building a Lead Management Feature

### Step 1: Plan it out
```
/plan "Create lead scoring system with Apex batch and reporting dashboard"
```

### Step 2: Have architect design it
```
/spawn apex-architect "Design Lead scoring service with domain model and unit of work pattern"
```

### Step 3: Generate SOQL optimizations
```
/spawn soql-optimizer "Create optimized queries for lead analytics dashboard"
```

### Step 4: Build the LWC component
```
/spawn lwc-builder "Create lead scoring dashboard component using aura data service pattern"
```

### Step 5: Write tests
```
/spawn test-writer "Create comprehensive unit tests for lead scoring service"
```

### Step 6: Review everything
```
/spawn apex-reviewer "Review the generated lead scoring Apex code for best practices"
```

---

## Common Commands Reference

| Command | Purpose |
|---------|---------|
| `/help` | Show all available commands |
| `/init` | Initialize project context |
| `/status` | Show project status |
| `/plan <request>` | Plan a feature |
| `/spawn <agent> <task>` | Run a specific agent |
| `/agents` | List all available agents |
| `/tokens` | Check token usage & costs |
| `/model list` | Show available models |
| `/clear` | Clear terminal |
| `/exit` | Exit the program |

---

## Tips for Success

 **Be specific** - The more detail in your request, the better the output
- ❌ `/plan "Build a portal"`
-  `/plan "Build a customer self-service portal with LWC that uses enterprise record access"`

 **Use context** - Agents read previous context
- Run `/init` first to populate project knowledge
- Results are stored in shared memory

 **Plan before building** - Use `/plan` command first
- Breaks down work logically
- Identifies dependencies
- Prevents rework

 **Review in stages** - Check agent output before going deeper
- Use `/agent-logs` to review
- Adjust approach if needed

 **Monitor costs** - Check tokens regularly
- Different models cost different amounts
- Use `/tokens` to track spending
- Set budgets if needed

---

## Next Steps

- 📖 Read the [CLI Usage Guide](../guides/cli-usage.md) for detailed command reference
-  Learn about [Agents](../agents/overview.md)
- 🏗 Understand [Architecture](../guides/architecture-overview.md)
-  Explore [Concepts](../concepts/multi-agent-orchestration.md)

