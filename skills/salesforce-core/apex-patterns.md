# Apex Patterns — FSD Architecture

## Overview
Feature Sliced Design (FSD) in Salesforce organizes code into distinct layers, each with a specific responsibility. This pattern makes code more testable, maintainable, and scalable.

## The 5 Layers

### Layer 1: Trigger
**Responsibility:** Event routing only, zero logic
- Receives trigger context
- Routes to handler based on context
- Implements recursion prevention

```apex
trigger AccountTrigger on Account (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    // All logic in handler — trigger is routing only
    new AccountTriggerHandler().handle();
}
```

### Layer 2: Handler
**Responsibility:** Map trigger contexts to service calls
- Differentiates before/after operations
- Extracts old values where needed
- Calls service layer with collections

```apex
public class AccountTriggerHandler {
    private static Boolean isExecuting = false;

    public void handle() {
        if (isExecuting) return;
        try {
            isExecuting = true;
            if (Trigger.isBefore && Trigger.isInsert) {
                beforeInsert(Trigger.new);
            }
        } finally {
            isExecuting = false;
        }
    }

    private void beforeInsert(List<Account> newRecords) {
        // Minimal validation here, bulk of logic in service
        AccountService.handleBeforeInsert(newRecords);
    }
}
```

### Layer 3: Service
**Responsibility:** Orchestration and business logic coordination
- Calls selector for data retrieval
- Calls domain for business rules
- Handles transaction boundaries
- Catches and logs exceptions

```apex
public class AccountService {
    private static void handleBeforeInsert(List<Account> accounts) {
        try {
            // Step 1: Validate
            Account Domain.validateAccounts(accounts);
            // Step 2: Fetch related data
            Map<Id, Customer__c> customers = 
                CustomerSelector.selectById(getCustomerIds(accounts));
            // Step 3: Apply business logic
            new AccountDomain(accounts)
                .setDefaultOwner()
                .applyCreditRules(customers);
        } catch (Exception e) {
            // Log and re-throw
            throw new AccountServiceException(e.getMessage());
        }
    }
}
```

### Layer 4: Selector
**Responsibility:** ALL SOQL queries live exclusively here
- Query methods return data
- Always enforce WITH SECURITY_ENFORCED
- Never accept raw strings for dynamic SOQL
- Methods named descriptively

```apex
public class AccountSelector {
    public static List<Account> selectById(Set<Id> accountIds) {
        return [
            SELECT Id, Name, ParentId, Owner.Id, Owner.Name, 
                   (SELECT Id FROM Opportunities LIMIT 100)
            FROM Account
            WHERE Id IN :accountIds
            WITH SECURITY_ENFORCED
        ];
    }

    public static List<Account> selectByAccountNumber(Set<String> numbers) {
        return [
            SELECT Id, Name, AccountNumber
            FROM Account
            WHERE AccountNumber IN :numbers
            WITH SECURITY_ENFORCED
            LIMIT 10000
        ];
    }
}
```

### Layer 5: Domain
**Responsibility:** Business logic on collections, stateless
- Validates records
- Applies business rules
- Works only with collections
- Designed for testing

```apex
public class AccountDomain {
    private List<Account> records;
    private Map<Id, Account> oldMap;

    public AccountDomain(List<Account> records) {
        this.records = records;
        this.oldMap = new Map<Id, Account>();
    }

    public AccountDomain setDefaultOwner() {
        User defaultOwner = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];
        for (Account account : records) {
            if (account.OwnerId == null) {
                account.OwnerId = defaultOwner.Id;
            }
        }
        return this; // Fluent API
    }

    public AccountDomain applyCreditRules(Map<Id, Customer__c> customers) {
        for (Account account : records) {
            Customer__c customer = customers.get(account.id);
            if (customer.Credit_Limit__c > 10000) {
                account.Status__c = 'Premium';
            }
        }
        return this;
    }

    public List<Account> getRecords() {
        return records;
    }
}
```

## Data Flow Diagram

```
Trigger Event
    ↓
TriggerHandler (routes context)
    ↓
Service (orchestrates)
    ├→ Selector (fetches data with SOQL)
    └→ Domain (applies business logic)
    ↓
Save changes via handler
```

## Benefits

1. **Testability**: Each layer can be tested independently
2. **Reusability**: Service can be called from trigger, batch, scheduled job, or API
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Easy to add new features without breaking existing code
5. **Performance**: Consolidated queries in selector layer

## Anti-Patterns to Avoid

❌ **DO NOT** put SOQL in trigger or handler
❌ **DO NOT** put business logic in domain that calls DML
❌ **DO NOT** mix selector queries into service layer
❌ **DO NOT** create new domain instance for each record
❌ **DO NOT** put logic inside loop (not bulkified)

## Real-World Example

### Requirement: When Lead is created, update related Account
1. **Trigger** → Route to handler
2. **Handler** → Extract leads, call service
3. **Service** → Call selector for accounts, call domain for logic
4. **Selector** → Query accounts by parent ID with security enforced
5. **Domain** → Apply updates to account records
6. **Service** → Update records and handle exceptions

```apex
// Trigger
trigger LeadTrigger on Lead (after insert) {
    new LeadTriggerHandler().handle();
}

// Handler
private void afterInsert(List<Lead> newRecords) {
    LeadService.handleAfterInsert(newRecords);
}

// Service
public static void handleAfterInsert(List<Lead> leads) {
    Set<Id> accountIds = getAccountIds(leads);
    Map<Id, Account> accounts = AccountSelector.selectById(accountIds);
    new LeadDomain(leads).updateRelatedAccounts(accounts);
    // Persistence handled by caller
}

// Domain
public void updateRelatedAccounts(Map<Id, Account> accounts) {
    for (Lead lead : records) {
        if (accounts.containsKey(lead.CompanyId)) {
            Account account = accounts.get(lead.CompanyId);
            account.Last_Lead_Date__c = System.today();
        }
    }
}
```

## When to Use FSD

✅ **Use FSD when**: Logic is complex, changes frequently, needs testing
✅ **Use FSD when**: Multiple entry points (trigger, API, batch)
✅ **Simpler alternative**: If small org, < 50 Apex classes, can use simpler pattern

## Key Takeaway
**FSD makes Apex development scalable, testable, and maintainable by enforcing clear responsibility boundaries.** Each layer does one thing well.
