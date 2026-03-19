---
sidebar_position: 7
---

# Memory System

Understand how Apex AI Brain maintains persistent context and shared knowledge.

## Memory Architecture

The Memory System is the knowledge backbone of Apex AI Brain.

```
┌──────────────────────────────────┐
│      Shared Memory              │
│  (Current REPL Session)         │
├──────────────────────────────────┤
│ • Task results                   │
│ • Agent outputs                  │
│ • Context snapshots              │
│ • Decision history               │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│   Project Memory                 │
│  (.sfai/ persistent)             │
├──────────────────────────────────┤
│ • Project configuration          │
│ • Scanned context                │
│ • Previous plans                 │
│ • Architecture decisions         │
└────────────┬─────────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│   Agent Access Layer             │
├──────────────────────────────────┤
│ All agents can read/write        │
└──────────────────────────────────┘
```

## Memory Types

### 1. Session Memory

**Scope:** Current REPL session
**Duration:** Until exit
**Access:** All agents
**Typical content:**
- Current agent results
- Intermediate outputs
- Conversation history

```bash
# View session memory
sfai /memory list --session

# Get specific value
sfai /memory get "planner_output"
```

### 2. Project Memory

**Scope:** `.sfai/` folder in project
**Duration:** Persistent
**Access:** All agents
**Typical content:**
- Project configuration
- Scanned codebase context
- Previous plans & outputs
- Architecture decisions

```bash
# View project memory
sfai /memory list --project

# Search memory
sfai /memory search "account pattern"
```

### 3. Shared Memory

**Scope:** Between agents
**Duration:** Session or persistent
**Access:** All agents
**Typical content:**
- Shared context
- Common patterns
- Dependencies

```bash
# Set shared value
sfai /memory set "account_schema" "{...schema...}" "shared"
```

## Memory Operations

### View Memory

```bash
# All memory
sfai /memory list

# By type
sfai /memory list --session
sfai /memory list --project
sfai /memory list --shared

# Specific entry
sfai /memory get "key_name"

# Search
sfai /memory search "pattern"
sfai /memory search --regex "^account_.*"
```

### Store Values

```bash
# Session only
sfai /memory set "temp_key" "value"

# Persistent
sfai /memory set "important_key" "value" --project

# Shared between agents  
sfai /memory set "schema_design" "{...}" --shared
```

### Manage Memory

```bash
# Clear session
sfai /memory clear --session

# Clear project
sfai /memory clear --project

# Delete specific entry
sfai /memory delete "key_name"

# Export all
sfai /memory export --format json

# Import
sfai /memory import backup.json
```

## Memory Structure

### Default Memory Items

After `/init`:

```json
{
  "project.config": {
    "name": "My Org",
    "type": "salesforce-dx",
    "complexity": "medium"
  },
  "project.context": {
    "classes": 42,
    "components": 8,
    "objects": 15,
    "metadata": {...}
  },
  "project.structure": {
    "paths": {...},
    "patterns": {...}
  }
}
```

### Task Results Structure

After agent execution:

```json
{
  "task_id_123": {
    "agent": "apex-architect",
    "task": "Design service layer",
    "status": "complete",
    "timestamp": "2024-03-19T10:00:00Z",
    "duration": "15s",
    "tokens": 5234,
    "cost": 0.075,
    "output": "...generated code...",
    "tags": ["architecture", "lead-module"]
  }
}
```

## Inter-Agent Communication

### Agent Writes to Memory

```javascript
// Agent completes task
const result = "Generated Apex code...";

// Store in memory
await sharedMemory.set(
  "apex_architect_design",
  result,
  "architect"  // source/owner
);
```

### Agent Reads from Memory

```javascript
// Another agent needs previous result
const design = await sharedMemory.get("apex_architect_design");

// Use in new context
const prompt = `
  Based on this architecture design:
  ${design}
  
  Now build the LWC component...
`;
```

### Memory Chain Example

```
1. Planner writes plan to memory
   memory["plan"] = {...structured plan...}

2. Architect reads plan
   reads memory["plan"] → designs schema

3. Architect stores design
   memory["schema_design"] = {...schema...}

4. LWC Builder reads schema
   reads memory["schema_design"] → builds component

5. Test Writer reads both
   reads memory["schema_design"] + implementation
   → writes comprehensive tests
```

## Tagging & Organization

### Auto-Tagging

Memory entries automatically get tags:

```
By agent:      [agent_name]
By task:       [task_type]  (architecture, component, test)
By feature:    [feature_name]
By date:       [YYYY-MM-DD]
By status:     [complete|draft|error]
```

### Search with Tags

```bash
# All architecture tasks
sfai /memory search --tag architecture

# Specific agent outputs
sfai /memory search --tag apex-architect

# Completed tasks from March
sfai /memory search --tag "2024-03-*" --status complete

# Feature-specific
sfai /memory search --tag "portal-feature"
```

## Memory Snapshots

### Create Snapshot

Save entire memory state:

```bash
sfai /memory snapshot "before-refactor"
```

Output:
```
✓ Snapshot created: before-refactor
  Size: 2.3 MB
  Entries: 127
  Timestamp: 2024-03-19T10:00:00Z
```

### List Snapshots

```bash
sfai /memory snapshots --list
```

### Restore Snapshot

```bash
sfai /memory restore "before-refactor"
```

## Persistence & Backup

### Auto-Backups

By default, backups created:
- Every 30 minutes (session)
- At `/init` (project)
- Before major operations

### Manual Backup

```bash
sfai /memory backup
```

Creates: `.sfai/backups/memory_YYYYMMDDHHmmss.json`

### Backup Strategy

```json
{
  "backup": {
    "autoBak up": true,
    "backupInterval": 1800,  // 30 min
    "maxBackups": 10,
    "backupLocation": ".sfai/backups"
  }
}
```

## Advanced Memory Usage

### Memory Queries

Find patterns:

```bash
# All "approved" designs
sfai /memory query "status = 'complete' AND tag contains 'design'"

# Recent modifications
sfai /memory query "modified > '2024-03-18'"

# All outputs for feature
sfai /memory query "tag contains 'portal-feature' order by timestamp DESC"
```

### Memory Analytics

Analyze memory usage:

```bash
sfai /memory stats
```

Output:
```
Memory Statistics
=================

Storage:
  Session:   1.2 MB (23 entries)
  Project:   4.5 MB (156 entries)
  Total:     5.7 MB

Growth:
  Past 24h:  +820 KB
  Past week: +2.3 MB
  Trend:     Accelerating

Largest Entries:
  1. apex_architect_design     450 KB
  2. project.context           380 KB
  3. lwc_builder_output        290 KB
```

### Memory Optimization

Optimize memory storage:

```bash
sfai /memory optimize
```

Output:
```
Optimization Results
====================

Compression: 8.5%
  Before: 5.7 MB
  After:  5.2 MB

Cleanup:
  ✓ Removed 12 expired entries
  ✓ Consolidated 3 duplicate entries
  ✓ Archived old tasks

Recommendations:
  • Archive entries > 30 days old
  • Consider exporting large outputs
```

## Memory Patterns

### Pattern 1: Plan-Based Memory

```
1. Create plan  → memory["plan"]
2. All agents read "memory["plan"]
3. Each agent stores output
4. Compare all outputs to plan
```

### Pattern 2: Dependency Chain

```
Schema → Service → Component → Tests
  ↓       ↓          ↓         ↓
Stores → Reads    Reads      Reads
```

### Pattern 3: Template Reuse

```
1. Designer creates template
2. Store in memory["templates.feature_name"]
3. Other agents reuse template
4. Maintains consistency
```

## Best Practices

✅ **Do This:**
- Regular memory exports (backups)
- Tag entries meaningfully
- Clear old session entries
- Use snapshots before major changes
- Search before duplicating work

❌ **Don't Do This:**
- Store sensitive data in memory
- Exceed memory limits
- Delete entries without backup
- Mix concerns in entries
- Forget to tag important outputs

## Memory Limits

Default configuration:

```json
{
  "memory": {
    "sessionLimit": "50 MB",
    "projectLimit": "500 MB",
    "entryLimit": "10 MB",
    "autoCleanup": true,
    "cleanupAge": 30  // days
  }
}
```

## Troubleshooting

### Memory Full

```bash
# Cleanup old entries
sfai /memory cleanup --older-than 7days

# Archive old entries
sfai /memory archive --older-than 30days

# View using space
sfai /memory stats --detail
```

### Corrupted Memory

```bash
# Validate memory
sfai /memory validate

# Repair if possible
sfai /memory repair

# Restore from backup
sfai /memory restore <snapshot_name>
```

