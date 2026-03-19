---
sidebar_position: 1
---

# Context Awareness

How Apex AI Brain maintains deep project understanding.

## What is Context?

Context is the deep understanding of your project that Apex AI Brain builds during initialization.

```
Project Files
    ↓
Scanner analyzes structure
    ↓
Creates dependency graphs
    ↓
Stores in memory
    ↓
All agents reference context
    ↓
AI understands your architecture
```

## Context Components

### 1. Code Structure

- Apex classes and their relationships
- LWC component hierarchy
- Metadata organizations
- Custom objects and fields

### 2. Patterns

- Existing design patterns
- Naming conventions
- Folder structure
- Code organization

### 3. Complexity

- Project size classification
- Feature maturity levels
- Dependency complexity
- Integration count

### 4. Metadata

- Salesforce configuration
- Custom settings
- Field definitions
- Security rules

## How Context Works

```
┌─────────────────────────┐
│  Your Project Files     │
└────────────┬────────────┘
             │
↓────────────────────────↓
Scanner      Analyzer
             │
      ┌──────▼───────┐
      │ Context Graph│
      │ (in Memory)  │
      └──────┬───────┘
             │
      All Agents Read
      and Reference
```

## Context Awareness in Action

### Example 1: Agent Design Reference

Agent A designs LeadService

```apex
public class LeadService { ... }
```

Agent B automatically knows about LeadService because it:
- Read the context graph
- Found LeadService in project
- Can reference it in new code

### Example 2: Pattern Recognition

The system recognizes:
- Your FSD structure
- Your naming conventions
- Your existing patterns
- Your dependencies

Generates code matching your style.

### Example 3: Complexity-Based Routing

For a complex feature:
- Recognizes complexity from context
- Routes to powerful agents (Opus)
- Includes more context in prompts

For simple task:
- Uses less context
- Routes to efficient agents (Gemini)
- Faster execution

## Using Context

### View Current Context

```bash
sfai /status        # See context loaded
sfai /memory get "project.context"    # View details
```

### Reload Context

When project changes:

```bash
sfai /init          # Re-scan project
```

### Reset Context

Start fresh:

```bash
rm -rf .sfai/
sfai /init          # Initialize new context
```

---

See Also:
- [Architecture Overview](../guides/architecture-overview.md)
- [Memory System](../guides/memory-system.md)

