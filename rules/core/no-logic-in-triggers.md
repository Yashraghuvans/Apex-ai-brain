# RULE: NO LOGIC IN TRIGGERS — NON-NEGOTIABLE

## Rule Statement
**Triggers MUST contain zero business logic. Triggers route ONLY.**

Violation Level: **CRITICAL** — Reject and rewrite immediately

## What is Forbidden in Triggers

```apex
// ❌ FORBIDDEN: SOQL queries in trigger
trigger LeadTrigger on Lead (after insert) {
    List<Account> accounts = [SELECT Id FROM Account];
    // Violates rule
}

// ❌ FORBIDDEN: DML operations in trigger
trigger LeadTrigger on Lead (after insert) {
    Account acc = new Account();
    insert acc;
    // Violates rule
}

// ❌ FORBIDDEN: Business logic  
trigger LeadTrigger on Lead (after insert) {
    for (Lead lead : Trigger.new) {
        if (lead.LeadSource == 'Web') {
            lead.Status = 'Hot';
        }
    }
    // Violates rule
}

// ❌ FORBIDDEN: Conditional logic (business rules)
trigger LeadTrigger on Lead (after insert) {
    for (Lead lead : Trigger.new) {
        if (lead.Score > 100) {
            lead.Priority = 'High';
        }
    }
    // Violates rule
}

// ❌ FORBIDDEN: Calculations
trigger LeadTrigger on Lead (after insert) {
    Integer score = calculateLeadScore(Trigger.new);
    // Violates rule
}

// ❌ FORBIDDEN: String manipulation / data transformation
trigger LeadTrigger on Lead (after insert) {
    String formatted = Trigger.new[0].Name.toUpperCase();
    // Violates rule
}
```

## What Triggers MUST Do

### Required Structure

```apex
// ✅ CORRECT: Trigger routes ONLY
trigger LeadTrigger on Lead (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new LeadTriggerHandler().handle();
}
```

### Handler Routes to Service

```apex
// ✅ CORRECT: Handler maps contexts
public class LeadTriggerHandler {
    private static Boolean isExecuting = false;

    public void handle() {
        if (isExecuting) return;
        try {
            isExecuting = true;
            
            // Route based on context ONLY
            if (Trigger.isBefore && Trigger.isInsert) {
                beforeInsert(Trigger.new);
            } else if (Trigger.isAfter && Trigger.isInsert) {
                afterInsert(Trigger.new);
            }
        } finally {
            isExecuting = false;
        }
    }

    private void beforeInsert(List<Lead> records) {
        // Call service with records
        LeadService.handleBeforeInsert(records);
    }

    private void afterInsert(List<Lead> records) {
        // Call service with records
        LeadService.handleAfterInsert(records);
    }
}
```

### Service Contains Logic

```apex
// ✅ CORRECT: Logic in service
public class LeadService {
    public static void handleBeforeInsert(List<Lead> leads) {
        // Validation
        for (Lead l : leads) {
            if (String.isBlank(l.Email)) {
                l.addError('Email required');
            }
        }
    }

    public static void handleAfterInsert(List<Lead> leads) {
        // Business logic
        for (Lead l : leads) {
            if (l.LeadSource == 'Web') {
                l.Status = 'Hot';
            }
        }
        // Query related data
        List<Account> accounts = [SELECT Id FROM Account LIMIT 100];
        
        // Update related records
        update accounts;
    }
}
```

## Why This Rule?

| Benefit | Impact |
|---------|--------|
| Testability | Service logic tested independently |
| Reusability | Same logic from API, batch, scheduled job |
| Maintenance | Clear responsibility separation |
| Performance | Predictable execution pattern |
| Debugging | Know exactly where to look |

## Enforcement

When generating Apex code:
1. ✅ Generate trigger as routing-only
2. ✅ Generate handler that calls service
3. ✅ Generate service with actual logic
4. ❌ NEVER include logic in trigger
5. ❌ REJECT code that violates this

## One Trigger Per Object

**Also enforce:** one trigger maximum per object.

```apex
// ❌ FORBIDDEN: Multiple triggers
trigger LeadValidation on Lead (before insert) { }
trigger LeadProcessing on Lead (after insert) { }
// Multiple triggers cause race conditions

// ✅ CORRECT: Single trigger
trigger LeadTrigger on Lead (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new LeadTriggerHandler().handle();
}
```

## Violation = Reject Immediately

If code suggests any logic in trigger:

```
❌ VIOLATION DETECTED: Business logic in trigger

Your code:
trigger LeadTrigger on Lead (after insert) {
    List<Account> accounts = [SELECT Id FROM Account];
}

Issues:
- SOQL query in trigger (forbidden)
- Should use service layer

Rewriting...

✅ Corrected:
trigger LeadTrigger on Lead (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new LeadTriggerHandler().handle();
}
```

## Key Takeaway
**Triggers route ONLY. All logic goes to handler → service → domain/selector.** This is the cornerstone of enterprise Apex architecture.
