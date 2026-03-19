# RULE: ALWAYS BULKIFY — NON-NEGOTIABLE

## Rule Statement
**Code MUST process collections, never single records. No DML/SOQL in loops.**

Violation Level: **CRITICAL** — Reject and rewrite immediately

## Forbidden Patterns

### ❌ FORBIDDEN: Query in Loop
```apex
// Executes 100 queries for 100 records
for (Lead lead : leads) {
    Account account = [SELECT Id FROM Account WHERE Id = :lead.CompanyId];
    // N+1 query problem - VIOLATES RULE
}

// ✅ CORRECT: Query once, use map
Map<Id, Account> accountsById = new Map<Id, Account>([
    SELECT Id FROM Account WHERE Id IN :getAccountIds(leads)
]);
for (Lead lead : leads) {
    Account account = accountsById.get(lead.CompanyId);
    // One query total
}
```

### ❌ FORBIDDEN: DML in Loop
```apex
// Executes 100 DML statements
List<Contact> contacts = new List<Contact>();
for (Integer i = 0; i < 100; i++) {
    Contact c = new Contact(LastName = 'Test' + i);
    insert c; // One DML per record - VIOLATES RULE
}

// ✅ CORRECT: Collect then DML once
List<Contact> contacts = new List<Contact>();
for (Integer i = 0; i < 100; i++) {
    contacts.add(new Contact(LastName = 'Test' + i));
}
insert contacts; // One DML statement total
```

### ❌ FORBIDDEN: Callout in Loop
```apex
// Executes 100 HTTP callouts (governor limit!)
for (Account account : accounts) {
    HttpResponse response = callExternalAPI(account.Id);
    // Callout per record - VIOLATES RULE
}

// ✅ CORRECT: Batch callouts or async
System.enqueueJob(new CalloutQueueable(accountIds));
// Or make single callout for batch
```

## Required Patterns

### Pattern 1: Map for Parent-Child Lookup
```apex
// ✅ CORRECT: Fetch all parent data once
Map<Id, Account> accountsById = new Map<Id, Account>([
    SELECT Id, Name, AnnualRevenue FROM Account WHERE Id IN :accountIds
]);

// Use map for O(1) lookup
for (Contact contact : contacts) {
    Account account = accountsById.get(contact.AccountId);
    contact.Account_Revenue__c = account.AnnualRevenue;
}
```

### Pattern 2: Multi-Map for One-to-Many
```apex
// ✅ CORRECT: Group related records
Map<Id, List<Contact>> contactsByAccountId = new Map<Id, List<Contact>>();
for (Contact contact : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
    if (!contactsByAccountId.containsKey(contact.AccountId)) {
        contactsByAccountId.put(contact.AccountId, new List<Contact>());
    }
    contactsByAccountId.get(contact.AccountId).add(contact);
}

// Use multi-map
for (Account account : accounts) {
    List<Contact> contacts = contactsByAccountId.get(account.Id) ?? new List<Contact>();
}
```

### Pattern 3: Aggregation Query
```apex
// ✅ CORRECT: Group by in SOQL
Map<Id, Integer> contactCountByAccountId = new Map<Id, Integer>();
for (AggregateResult ar : [
    SELECT AccountId, COUNT(Id) cnt FROM Contact WHERE AccountId IN :accountIds GROUP BY AccountId
]) {
    contactCountByAccountId.put((Id)ar.get('AccountId'), (Integer)ar.get('cnt'));
}
```

### Pattern 4: Batch for Large Datasets
```apex
// ✅ CORRECT: Use Batch Apex for 10k+ records
global class ProcessAccountsBatch implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id FROM Account]);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        // scope = 200 records with fresh limits
        update scope;
    }

    global void finish(Database.BatchableContext bc) {}
}
```

## Bulkification Checklist

- [ ] All queries outside loops
- [ ] All DML in bulk (collect first, execute once)
- [ ] All callouts outside loops (or in Queueable/Batch)
- [ ] Using maps for lookups, not nested queries
- [ ] Large datasets (10k+) use Batch Apex
- [ ] No direct field assignment in loops (use maps)

## Violation Response

When code violates bulkification:

```
❌ VIOLATION DETECTED: Query in loop

Your code:
for (Lead lead : leads) {
    Account account = [SELECT Id FROM Account WHERE Id = :lead.CompanyId];
}

Issues:
- SOQL query inside loop (100 leads = 100 queries)
- Exceeds SOQL governor limit of 100
- Governor Limit: 100 queries

Rewriting...

✅ Corrected:
Map<Id, Account> accountsById = new Map<Id, Account>([
    SELECT Id FROM Account WHERE Id IN :getAccountIds(leads)
]);
for (Lead lead : leads) {
    Account account = accountsById.get(lead.CompanyId);
}

Improvement: 1 query instead of 100 queries
```

## Governor Limits Quick Reference

| Operation | Sync Limit | Async Limit |
|-----------|-----------|-----------|
| SOQL Queries | 100 | 200 |
| DML Statements | 150 | 150 |
| Bulk DML | 1 statement (all records) | 1 statement (all records) |
| Individual DML | 1 statement each | 1 statement each |

## Key Takeaway
**Never loop-DML, never loop-SOQL, never loop-callout.** Fetch data once, use maps for lookups, execute bulk operations. This is the difference between working code and code that fails in production.
