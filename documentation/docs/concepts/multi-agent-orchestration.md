---
sidebar_position: 2
---

# Multi-Agent Orchestration

How agents work together to build complete features.

## Orchestration Model

```
┌──────────────────┐
│  Feature Request │
└────────┬─────────┘
         │
┌────────▼─────────────┐
│ Agent Orchestrator   │
│ - Routes tasks      │
│ - Manages memory    │
│ - Sequences work    │
└────────┬─────────────┘
         │
    ┌────┴─────┬──────────┬──────────┐
    │           │          │          │
  Agent 1    Agent 2   Agent 3   Agent 4
    │           │          │          │
    └────┬─────┬──────────┬──────────┘
         │
    ┌────▼──────────┐
    │ Shared Memory │
    │ Results Store │
    └───────────────┘
```

## Agent Communication

### Memory-Based Communication

Agents don't talk directly—they communicate through shared memory:

```
Agent A
 ├─ Generates design
 └─ Stores in memory["design"]
         ↓
    Memory System
         │
 Agent B
 ├─ Reads memory["design"]
 └─ Uses as input for own work
```

### Task Dependencies

The orchestrator respects dependencies:

```
Task 1 (Independent)
  ↓
Tasks 2, 3, 4 (Parallel - all depend on 1)
  ↓
Task 5 (Depends on all)
```

## Execution Patterns

### Pattern 1: Sequential

For dependent tasks:

1. Schema Design (Agent 1)
2. Service Layer (Agent 2) - reads schema
3. Components (Agent 3) - reads service
4. Tests (Agent 4) - reads all

### Pattern 2: Parallel

For independent tasks:

1. UX Design (parallel)
2. API Design (parallel)
3. Database Design (parallel)
4. Converge and integrate

### Pattern 3: Hierarchical

For complex features:

```
         Planner
        ↙   ↓   ↘
    Level 1 subtasks
    ↙   ↓   ↘
  Level 2 subtasks
```

---

See Also:
- [Multi-Agent System Guide](../guides/multi-agent-system.md)
- [Agents Overview](../agents/overview.md)

