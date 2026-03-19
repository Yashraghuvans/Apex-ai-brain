# Trigger Framework — One Trigger Per Object

## The Rule: ONE Trigger Per Object

**ENFORCE** this rule strictly:
- 1 Trigger per object maximum
- All contexts handled in single trigger
- All logic routes through handler
- Handler routes to service layer

```apex
// ✅ CORRECT: Single trigger for Account
trigger AccountTrigger on Account (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new AccountTriggerHandler().handle();
}

// ❌ WRONG: Multiple triggers on Account
trigger AccountValidation on Account (before insert) { }
trigger AccountProcessing on Account (after insert) { }
// This creates race conditions and ordering issues!
```

## Why One Trigger?

1. **Order is unpredictable** — Multiple triggers may fire in any order
2. **Recursion issues** — Multiple triggers can cause infinite loops
3. **Maintenance nightmare** — Hard to track which trigger runs when
4. **Debugging** — Which trigger caused the error?
5. **Performance** — Multiple queries/DML across separate triggers

## Single Trigger, All Contexts Structure

```apex
trigger AccountTrigger on Account (
    before insert, 
    after insert,
    before update, 
    after update,
    before delete, 
    after delete,
    after undelete
) {
    AccountTriggerHandler handler = new AccountTriggerHandler();
    handler.handle();
}
```

## TriggerHandler Interface Pattern

```apex
public class AccountTriggerHandler {
    
    /**
     * Route to appropriate context handler
     */
    public void handle() {
        if (Trigger.isBefore) {
            if (Trigger.isInsert) beforeInsert(Trigger.new);
            else if (Trigger.isUpdate) beforeUpdate(Trigger.new, Trigger.oldMap);
            else if (Trigger.isDelete) beforeDelete(Trigger.old);
        }
        
        if (Trigger.isAfter) {
            if (Trigger.isInsert) afterInsert(Trigger.new);
            else if (Trigger.isUpdate) afterUpdate(Trigger.new, Trigger.oldMap);
            else if (Trigger.isDelete) afterDelete(Trigger.old);
            else if (Trigger.isUndelete) afterUndelete(Trigger.new);
        }
    }
    
    private void beforeInsert(List<Account> newRecords) {
        AccountService.handleBeforeInsert(newRecords);
    }
    
    private void afterInsert(List<Account> newRecords) {
        AccountService.handleAfterInsert(newRecords);
    }
    
    private void beforeUpdate(List<Account> newRecords, Map<Id, Account> oldMap) {
        AccountService.handleBeforeUpdate(newRecords, oldMap);
    }
    
    private void afterUpdate(List<Account> newRecords, Map<Id, Account> oldMap) {
        AccountService.handleAfterUpdate(newRecords, oldMap);
    }
    
    private void beforeDelete(List<Account> oldRecords) {
        AccountService.handleBeforeDelete(oldRecords);
    }
    
    private void afterDelete(List<Account> oldRecords) {
        AccountService.handleAfterDelete(oldRecords);
    }
    
    private void afterUndelete(List<Account> newRecords) {
        AccountService.handleAfterUndelete(newRecords);
    }
}
```

## Recursion Prevention

Static flag prevents trigger from running multiple times:

```apex
public class TriggerRecursionPrevention {
    private static Boolean isExecuting = false;
    
    public static void prevent() {
        if (isExecuting) {
            throw new TriggerException('Recursive trigger execution prevented');
        }
        isExecuting = true;
    }
    
    public static void allow() {
        isExecuting = false;
    }
}

// In handler:
public void handle() {
    if (isExecuting) return; // Exit if already running
    
    try {
        isExecuting = true;
        // Do work
    } finally {
        isExecuting = false;
    }
}
```

## Trigger Disable Switches

Use custom metadata or settings to disable triggers without code changes:

```apex
// Custom Metadata Type: Trigger_Settings__mdt
// Field: Disable_Account_Trigger__c (Checkbox)

public class AccountTriggerHandler {
    public void handle() {
        Trigger_Settings__mdt settings = Trigger_Settings__mdt.getInstance('Default');
        
        if (settings.Disable_Account_Trigger__c) {
            return; // Trigger disabled
        }
        
        // Continue with normal flow
    }
}

// Or via custom setting:
Account_Settings__c settings = Account_Settings__c.getInstance();
if (settings.Trigger_Disabled__c) return;
```

## Bypass Using Apex Context

```apex
// In service class:
public class AccountService {
    private static Boolean bypassTrigger = false;
    
    public static void setBypassTrigger(Boolean bypass) {
        bypassTrigger = bypass;
    }
    
    public static Boolean getBypassTrigger() {
        return bypassTrigger;
    }
}

// In trigger:
public void handle() {
    if (AccountService.getBypassTrigger()) {
        return;
    }
    // Continue
}

// In other code:
AccountService.setBypassTrigger(true);
update records;
AccountService.setBypassTrigger(false);
```

## Batch Processing — Avoid Trigger Recursion

When batch updates records, triggers fire again. Prevent recursion:

```apex
global class AccountBatch implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id, Name FROM Account]);
    }

    global void execute(Database.BatchableContext bc, List<Account> accounts) {
        // Bypass trigger since batch is orchestrated update
        AccountService.setBypassTrigger(true);
        
        try {
            for (Account a : accounts) {
                a.Updated_By_Batch__c = true;
            }
            update accounts;
        } finally {
            // Always restore bypass flag
            AccountService.setBypassTrigger(false);
        }
    }

    global void finish(Database.BatchableContext bc) {}
}
```

## Trigger Order of Execution

When a record is inserted/updated, execution order is:

```
1. BEFORE TRIGGERS (all objects)
2. VALIDATION RULES
3. SAVE: Insert/Update record to database
4. AFTER TRIGGERS (all objects)
5. WORKFLOWS (if enabled)
6. PROCESSES (if enabled)
7. FLOWS (if enabled)
```

## Common Trigger Patterns

### Pattern 1: Set Default Values (Before Insert)

```apex
private void beforeInsert(List<Account> newRecords) {
    for (Account a : newRecords) {
        if (String.isBlank(a.AccountNumber)) {
            a.AccountNumber = 'ACC-' + System.now().getTime();
        }
        if (a.BillingCountry == null) {
            a.BillingCountry = 'USA'; // Default
        }
    }
}
```

### Pattern 2: Update Related Records (After Insert)

```apex
private void afterInsert(List<Account> newRecords) {
    // Create related records
    List<Contact> contactsToCreate = new List<Contact>();
    
    for (Account a : newRecords) {
        Contact c = new Contact(
            LastName = a.Name,
            AccountId = a.Id
        );
        contactsToCreate.add(c);
    }
    
    insert contactsToCreate;
}
```

### Pattern 3: Prevent Deletion (Before Delete)

```apex
private void beforeDelete(List<Account> oldRecords) {
    for (Account a : oldRecords) {
        if (a.Status__c == 'Locked') {
            a.addError('Cannot delete locked accounts');
        }
    }
}
```

### Pattern 4: Track Field Changes (Before Update)

```apex
private void beforeUpdate(List<Account> newRecords, Map<Id, Account> oldMap) {
    for (Account a : newRecords) {
        Account oldAccount = oldMap.get(a.Id);
        
        if (a.Status__c != oldAccount.Status__c) {
            // Status changed
            a.Status_Changed_Date__c = System.now();
        }
    }
}
```

## fflib Trigger Framework (Optional Advanced)

For enterprise complexity, use fflib (FinancialForce common library):

```apex
public inherited sharing class AccountTriggerHandler extends fflib_SObjectDomain {
    
    public static void handleBeforeInsert(List<Account> records) {
        new AccountTriggerHandler(records, SObjectType.Account)
            .onBeforeInsert();
    }

    public override void onBeforeInsert() {
        for (Account a : (List<Account>) Records) {
            // Business logic
        }
    }
    
    public override void onAfterInsert() {
        for (Account a : (List<Account>) Records) {
            // Business logic
        }
    }
}
```

## Trigger Best Practices Checklist

✅ One trigger per object
✅ All logic in handler, not trigger
✅ Handler calls service, not business logic
✅ Recursion prevention in place
✅ Error handling with try/finally
✅ Bulk data handling (not single records)
✅ CRUD/FLS checked in service
✅ Trigger disable switches available
✅ Has corresponding unit tests
✅ No hardcoded IDs in trigger

## Key Takeaway

**One trigger per object, routing to handler to service.** This pattern scales from small orgs to large enterprises. Always prevent recursion, always handle errors, and always bulkify processing.
