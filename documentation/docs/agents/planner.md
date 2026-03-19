---
sidebar_position: 2
---

# Planner Agent

The strategic planner agent that breaks down complex features into actionable tasks.

## Overview

The Planner Agent is the starting point for any development work. It takes high-level feature requests and produces structured plans with task decomposition, agent assignments, and dependency mapping.

## When to Use

**Always start here for complex features!**

```bash
sfai /plan "Your feature request"
```

## Example

```bash
sfai /plan "Build a customer portal with LWC and approval workflow"
```

**Output includes:**
- Task list (as JSON)
- Agent assignments
- Dependencies
- Suggested execution order
- Complexity estimates

## Features

 Decomposes features into atomic tasks
 Assigns best-fit agents to each task
 Identifies task dependencies
 Suggests execution order
 Estimates complexity levels
 Stores plan in shared memory

## Output Format

```json
{
  "feature": "Build customer portal",
  "tasks": [
    {
      "id": "task_1",
      "title": "Design data model",
      "assignedAgent": "schema-analyst",
      "estimatedComplexity": "low",
      "dependencies": []
    },
    {
      "id": "task_2",
      "title": "Create service layer",
      "assignedAgent": "apex-architect",
      "estimatedComplexity": "medium",
      "dependencies": ["task_1"]
    }
  ],
  "suggestedOrder": ["task_1", "task_2", ...],
  "warnings": []
}
```

## Next Steps

After planning:
1. Execute tasks in suggested order
2. Use plan ID to reference in memory
3. Other agents read the plan for context

---

**See Also:**
- [Agent Overview](./overview.md)
- [CLI Usage](../guides/cli-usage.md)

