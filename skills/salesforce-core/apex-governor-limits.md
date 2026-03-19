# Apex Governor Limits — Critical Reference

## Governor Limits Overview

Governor limits are hard boundaries enforced by the Salesforce platform. Exceeding these limits throws an exception and rolls back the transaction.

## Synchronous Execution Limits (most common)

| Limit | Value | Impact |
|-------|-------|--------|
| SOQL Queries | 100 | Hitting this means not enough data fetching upfront |
| DML Statements | 150 | Each insert/update/delete counts as 1 statement |
| CPU Time | 10 seconds | Complex calculations or large loops |
| Heap Memory | 6 MB | Too much data in memory at once |
| Callouts | 100 | External HTTP requests |
| Email Messages | 5,000 | Per transaction |

## Asynchronous Limits (Batch/Queueable/Scheduled)

| Limit | Value | Impact |
|-------|-------|--------|
| SOQL Queries | 200 | More time to query = can fetch more data |
| DML Statements | 150 | Same as sync but with more processing time |
| CPU Time | 60 seconds | Much more computational time available |
| Heap Memory | 12 MB | Twice the sync limit for larger objects |
| Callouts | 100 | Same as sync |
| Batch Job Size | 5M records |  |

## SOQL Query Limits (Detailed)

### Limit: 100 synchronous queries
```apex
// ❌ BAD: Loop with query inside = 10 SOQL queries for 10 leads
public static void badBulkification(List<Lead> leads) {
    for (Lead lead : leads) {
        List<Contact> contacts = [
            SELECT Id FROM Contact WHERE AccountId = :lead.CompanyId
        ];
        // 100 leads = 100 SOQL queries = GOVERNOR LIMIT EXCEEDED
    }
}

// ✅ GOOD: Query once with IN clause = 1 SOQL query
public static void goodBulkification(List<Lead> leads) {
    Set<Id> accountIds = new Set<Id>();
    for (Lead lead : leads) {
        accountIds.add(lead.CompanyId);
    }
    Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
    for (Contact contact : [
        SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds
    ]) {
        if (!contactsByAccount.containsKey(contact.AccountId)) {
            contactsByAccount.put(contact.AccountId, new List<Contact>());
        }
        contactsByAccount.get(contact.AccountId).add(contact);
    }
    // Only 1 SOQL query regardless of lead count
}
```

### Query Size Limits
- **Batch Apex**: 50,000 records returned per query
- **Regular**: 50,000 records returned per query
- Use `LIMIT 50000` in SOQL for loops to handle large datasets safely

```apex
// Safe for large data volumes
public static Database.QueryLocator selectLargeDataset() {
    return Database.getQueryLocator([
        SELECT Id, Name FROM Account LIMIT 50000
    ]);
}
```

## DML Limits (Detailed)

### Limit: 150 DML statements per transaction

**What counts as 1 DML statement?**
- `insert records` (inserts all records in list as 1 statement)
- `update records` (updates all records in list as 1 statement)
- `delete records` (deletes all records in list as 1 statement)
- `upsert records` (counts as 1 statement per operation)

```apex
// ❌ BAD: 100 DML statements
List<Contact> contacts = new List<Contact>();
for (Integer i = 0; i < 100; i++) {
    Contact c = new Contact();
    insert c; // Each insert = 1 DML statement (100 total)
}

// ✅ GOOD: 1 DML statement
List<Contact> contacts = new List<Contact>();
for (Integer i = 0; i < 100; i++) {
    contacts.add(new Contact());
}
insert contacts; // All inserts = 1 DML statement
```

## CPU Time Limit (10 seconds sync, 60 async)

CPU time is consumed by:
- Loops
- String operations
- Calculations
- List/Map operations

```apex
// ❌ BAD: O(n²) complexity - too slow
public static void calculateScores(List<Lead> leads) {
    for (Lead lead : leads) {
        Integer score = 0;
        for (Lead qlead : leads) { // Nested loop!
            if (lead.Company == qlead.Company) {
                score++;
            }
        }
        lead.Score__c = score;
    }
    // For 1000 leads: 1,000,000 iterations = potential timeout
}

// ✅ GOOD: O(n) complexity - uses map
public static void calculateScores(List<Lead> leads) {
    Map<String, Integer> companyCount = new Map<String, Integer>();
    for (Lead lead : leads) {
        String company = lead.Company;
        companyCount.put(company, (companyCount.get(company) ?? 0) + 1);
    }
    for (Lead lead : leads) {
        lead.Score__c = companyCount.get(lead.Company);
    }
    // For 1000 leads: 2,000 iterations = fast
}
```

## Heap Memory Limit (6 MB sync, 12 MB async)

Memory is consumed by:
- Collections (List, Map, Set)
- Large strings
- Objects with many fields

```apex
// ❌ BAD: Load all records into memory at once
public static void loadAllAccounts() {
    List<Account> allAccounts = [SELECT Id, Name, ... FROM Account];
    // Could be millions of records trying to fit in 6 MB
}

// ✅ GOOD: Use SOQL for loops to process in chunks
public static void processAllAccounts() {
    for (Account account : [SELECT Id, Name FROM Account]) {
        // Process 1-2000 records at a time, garbage collected after
        processAccount(account);
    }
}
```

## Callout Limits (100 per transaction)

```apex
// ❌ BAD: 100 callouts
public static void calloutInLoop(List<Account> accounts) {
    for (Account account : accounts) {
        HttpResponse response = makeCallout(account.Id);
        // If 100 accounts, you hit the limit
    }
}

// ✅ GOOD: Batch callouts or async processing
public static void calloutOneTime(List<Account> accounts) {
    HttpResponse response = makeCalloutForMultiple(accounts);
    // 1 callout for batch
}

// OR: Use Queueable to distribute across transactions
public class CalloutQueueable implements Queueable, Database.AllowsCallouts {
    private List<Account> accounts;
    
    public CalloutQueueable(List<Account> accounts) {
        this.accounts = accounts.subList(0, Math.min(10, accounts.size()));
    }
    
    public void execute(QueueableContext context) {
        for (Account account : accounts) {
            makeCallout(account.Id);
        }
        // Chain to next batch if more records
    }
}
```

## Monitoring Limits Programmatically

```apex
// Check current limit usage
System.debug('SOQL queries: ' + Limits.getQueries() + ' / ' + Limits.getLimitQueries());
System.debug('DML statements: ' + Limits.getDmlStatements() + ' / ' + Limits.getLimitDmlStatements());
System.debug('CPU time: ' + Limits.getCpuTime() + ' / ' + Limits.getLimitCpuTime());
System.debug('Heap size: ' + Limits.getHeapSize() + ' / ' + Limits.getLimitHeapSize());

// Strategy: Stop processing if approaching limit
if (Limits.getQueries() > 95) {
    throw new Exception('Approaching SOQL query limit');
}

if (Limits.getDmlStatements() > 140) {
    throw new Exception('Approaching DML statement limit');
}

if (Limits.getCpuTime() > 9000) { // milliseconds
    throw new Exception('Approaching CPU time limit');
}
```

## Strategies to Avoid Hitting Limits

### 1. Bulkification
- Query once with IN clause
- DML records in bulk (not loop)
- Process collections, not individual records

### 2. Move to Async
- If SOQL/DML limits exceeded → use Batch or Queueable
- If CPU time exceeded → use Scheduled job
- Async gets 60s CPU + 200 SOQL queries

### 3. Reduce Data Size
- Add WHERE clauses to queries
- Use LIMIT in queries
- Query only needed fields
- Use indexes on WHERE clause fields

### 4. Optimize Logic
- Avoid nested loops (O(n²) → O(n))
- Use Maps instead of nested queries
- Pre-fetch data into collections
- Avoid string concatenation in loops

### 5. Distribute Processing
- Use batch job for large datasets
- Chain Queueable jobs
- Use scheduled jobs for recurring work
- Use scheduled actions for time-based

## Real-World Decision Tree

```
Is data volume large (> 1000 records)?
├─ YES → Use Batch Apex (50M records)
│       Get: 200 SOQL, 150 DML, 60s CPU, 12MB heap
├─ NO → Can process in trigger?
    ├─ YES → Use trigger + service
    │       Get: 100 SOQL, 150 DML, 10s CPU, 6MB heap
    └─ NO → Too complex
            Use Queueable for async + callout support
```

## Key Takeaway
**Always plan for scale.** Write code that works for 10 records AND 10,000 records. Use the Limits class to monitor. When limits are approached, refactor to async patterns.
