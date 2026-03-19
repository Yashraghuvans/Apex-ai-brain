---
sidebar_position: 4
---

# Memory System API

Reference for shared memory and context storage.

## Core Operations

### get()

Retrieve a value from memory.

```bash
sfai /memory get "key_name"
```

### set()

Store a value in memory.

```bash
sfai /memory set "key_name" "value"
```

### list()

List all memory entries.

```bash
sfai /memory list
sfai /memory list --project
sfai /memory list --session
```

### search()

Search memory entries.

```bash
sfai /memory search "pattern"
sfai /memory search --regex "^account_.*"
```

### snapshot()

Create memory backup.

```bash
sfai /memory snapshot "name"
sfai /memory restore "name"
```

---

See Also: [Memory System Guide](../guides/memory-system.md)

