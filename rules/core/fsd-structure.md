# RULE: FSD ARCHITECTURE — NON-NEGOTIABLE

## Rule Statement
**All Apex code MUST follow Feature Sliced Design (FSD). Each layer has ONE responsibility.**

Violation Level: **CRITICAL** — Reject and restructure immediately

## Required 5-Layer Structure

```
Trigger → Handler → Service → Selector/Domain
```

### Layer 1: Trigger (Zero Logic)
```apex
// ✅ CORRECT: Routing only
trigger AccountTrigger on Account (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new AccountTriggerHandler().handle();
}

// ❌ FORBIDDEN: Any logic in trigger
trigger AccountTrigger on Account (after insert) {
    if (trigger.new[0].Name == 'Test') { } // VIOLATES RULE
}
```

### Layer 2: Handler (Context Mapping)
```apex
// ✅ CORRECT: Map contexts to service
public class AccountTriggerHandler {
    public void handle() {
        if (Trigger.isBefore && Trigger.isInsert) beforeInsert(Trigger.new);
        else if (Trigger.isAfter && Trigger.isInsert) afterInsert(Trigger.new);
    }
    
    private void beforeInsert(List<Account> records) {
        AccountService.handleBeforeInsert(records);
    }
}

// ❌ FORBIDDEN: Business logic in handler
public class AccountTriggerHandler {
    private void beforeInsert(List<Account> records) {
        for (Account a : records) {
            a.Status__c = 'Active'; // VIOLATES RULE - logic here
        }
    }
}
```

### Layer 3: Service (Orchestration)
```apex
// ✅ CORRECT: Call selector + domain
public class AccountService {
    public static void handleBeforeInsert(List<Account> accounts) {
        new AccountDomain(accounts).validate().applyBusinessRules();
    }
}

// ❌ FORBIDDEN: SOQL in service
public class AccountService {
    public static void handleBeforeInsert(List<Account> accounts) {
        List<Account> existing = [SELECT Id FROM Account]; // VIOLATES RULE
    }
}
```

### Layer 4: Selector (All SOQL here)
```apex
// ✅ CORRECT: Query only
public class AccountSelector {
    public static List<Account> selectById(Set<Id> ids) {
        return [SELECT Id, Name FROM Account WHERE Id IN :ids WITH SECURITY_ENFORCED];
    }
}

// ❌ FORBIDDEN: Business logic in selector
public class AccountSelector {
    public static List<Account> selectById(Set<Id> ids) {
        List<Account> results = [...];
        for (Account a : results) {
            a.Status__c = 'Active'; // VIOLATES RULE
        }
        return results;
    }
}
```

### Layer 5: Domain (Business Logic)
```apex
// ✅ CORRECT: Logic and validation
public class AccountDomain {
    public AccountDomain validate() {
        for (Account a : records) {
            if (a.Name == null) throw new Exception('Name required');
        }
        return this;
    }
    
    public AccountDomain applyBusinessRules() {
        for (Account a : records) {
            if (a.AnnualRevenue > 1000000) a.Status__c = 'Enterprise';
        }
        return this;
    }
}

// ❌ FORBIDDEN: DML in domain
public class AccountDomain {
    public void save() {
        update records; // VIOLATES RULE
    }
}
```

## Naming Conventions (Strict)

```
✅ CORRECT:
- LeadTrigger (trigger routing)
- LeadTriggerHandler (context mapping)
- LeadService (orchestration)
- LeadSelector (SOQL queries)
- LeadDomain (business logic)
- LeadTriggerHandlerTest
- LeadServiceTest

❌ FORBIDDEN:
- Lead_Trigger (underscore)
- LeadTriger (typo)
- LeadProcess (unclear purpose)
- LeadHelper (too vague)
- AccountServiceHelper (nested responsibility)
```

## Flow Diagram

```
Insert Event
     ↓
LeadTrigger (routing)
     ↓
LeadTriggerHandler (context map)
     ↓
LeadService (orchestration)
     ├→ LeadSelector (GET data)
     └→ LeadDomain (APPLY logic)
     ↓
Update Records (service handles)
```

## Violation Response

When code doesn't follow FSD:

```
❌ VIOLATION DETECTED: Non-FSD code structure

Your code:
trigger LeadTrigger on Lead (after insert) {
    List<Account> accounts = [SELECT Id FROM Account];
    for (Lead l : Trigger.new) {
        if (l.Status == 'Open') {
            l.Score = calculateScore(l);
            update l;
        }
    }
}

Issues:
1. SOQL query in trigger (should be in Selector)
2. Business logic in trigger (should be in Domain)
3. DML in trigger (should be in Service)
4. No handler layer (violates FSD)

Rewriting to FSD:

✅ Trigger (routing only):
trigger LeadTrigger on Lead (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new LeadTriggerHandler().handle();
}

✅ Handler (context mapping):
public class LeadTriggerHandler {
    public void handle() {
        if (Trigger.isAfter && Trigger.isInsert) {
            LeadService.handleAfterInsert(Trigger.new);
        }
    }
}

✅ Service (orchestration):
public class LeadService {
    public static void handleAfterInsert(List<Lead> leads) {
        Set<Id> accountIds = getAccountIds(leads);
        Map<Id, Account> accountsById = AccountSelector.selectById(accountIds);
        
        new LeadDomain(leads)
            .validate()
            .scoreLeads(accountsById);
        
        update leads;
    }
}

✅ Selector (SOQL only):
public class AccountSelector {
    public static Map<Id, Account> selectById(Set<Id> ids) {
        return new Map<Id, Account>([
            SELECT Id, Name FROM Account WHERE Id IN :ids WITH SECURITY_ENFORCED
        ]);
    }
}

✅ Domain (logic only):
public class LeadDomain {
    public LeadDomain scoreLeads(Map<Id, Account> accounts) {
        for (Lead l : records) {
            if (l.Status == 'Open') {
                l.Score = calculateScore(l, accounts);
            }
        }
        return this;
    }
}
```

## When FSD is Required

✅ **Always use FSD** for any production code
✅ **Enterprise orgs** (10+ developers)
✅ **Large data volumes** (1M+ records)
✅ **Complex business logic**
✅ **Multi-team development**

## Key Takeaway
**FSD is the production-grade architecture for Salesforce.** Triggers route, handlers map contexts, services orchestrate, selectors query, domains rule. This is non-negotiable.
