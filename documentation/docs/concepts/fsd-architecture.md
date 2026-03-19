---
sidebar_position: 5
---

# Feature-Sliced Design (FSD)

The architectural pattern enforced by Apex AI Brain.

## What is FSD?

Feature-Sliced Design is an architectural pattern that organizes code by features, not by technical layers.

## Structure

```
force-app/main/default/classes/
├── leads/
│   ├── domain/        ← Domain model
│   ├── service/       ← Business logic
│   ├── selector/      ← Query layer
│   ├── handler/       ← Event handlers
│   └── test/          ← Tests
├── accounts/
│   ├── domain/
│   ├── service/
│   └── ...
└── shared/
    └── utilities/
```

## Benefits

 **Clear Organization** - Easy to find code
 **Scalability** - Add features independently  
 **Testability** - Isolated test coverage
 **Collaboration** - Teams work independently

## Layer Responsibilities

| Layer | Purpose | Example |
|-------|---------|---------|
| **Selector** | Read data | `LeadSelector.getById()` |
| **Domain** | Business logic | `LeadDomain.score()` |
| **Service** | Public API | `LeadService.scoreLeads()` |
| **Handler** | Event response | `LeadTriggerHandler` |
| **Test** | Validation | `LeadServiceTest` |

## Dependencies

Valid dependency directions:

```
Handler → Service 
Service → Domain 
Service → Selector 
Domain → Selector 
Selector → nothing 

Handler → Selector ❌ (skip layer)
Domain → Service ❌ (backwards)
```

---

**See Also:**
- [Guardrails Guide](../guides/guardrails.md)
- [Architecture Overview](../guides/architecture-overview.md)

