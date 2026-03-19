---
sidebar_position: 3
---

# Guardrails & Security

How Apex AI Brain enforces security and best practices.

## Guardrails System

Guardrails are injected rules that constrain AI outputs to enterprise standards.

```
AI Response
    ↓
┌─────────────────┐
│ Guardrail Check │
├─────────────────┤
│ ✓ Syntax valid  │
│ ✓ Pattern match │
│ ✓ Security OK   │
│ ✓ Performance OK│
└────────┬────────┘
         ↓
    ✅ Approved
```

## Key Guardrails

### Governor Limits Enforcement

No governor limit violations allowed:
- Max SOQL queries
- Max DML statements
- Batch sizes
- CPU time limits
- Heap memory limits

### Bulkification Requirements

All code must be bulkified:
- No queries in loops
- Batch DML operations only
- Efficient collection usage
- Map-based lookups

### FSD Architecture

All code follows FSD:
- Proper folder structure
- Clear layer separation
- Appropriate dependencies
- Naming conventions

### Security Requirements

All code validated for:
- Input sanitization
- Query parameter binding
- XSS prevention
- CSRF protection
- Data access restrictions

---

**Full Details:**
See [Guardrails & Security Guide](../guides/guardrails.md)

