---
sidebar_position: 5
---

# Command Registry API

Reference for command registration and execution.

## Command Structure

```javascript
{
  command: '/command-name',
  description: 'What this does',
  usage: '/command-name [options]',
  handler: async (args) => {
    // Command implementation
  }
}
```

## Register Command

```javascript
import { registerCommand } from '../core/command-registry.js';

registerCommand({
  command: '/mycommand',
  description: 'My awesome command',
  usage: '/mycommand <arg>',
  handler: async (args) => {
    // Implementation
  }
});
```

## Initialize Registry

```javascript
import { initializeRegistry } from '../core/command-registry.js';

initializeRegistry();  // Load all default commands
```

---

See Also: [CLI Commands](./cli-commands.md)

