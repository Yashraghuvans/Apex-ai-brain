# RULE: GOVERNOR LIMITS AWARENESS — NON-NEGOTIABLE

## Rule Statement
**Before writing ANY Apex code, check if it will exceed governor limits. Refactor to async if needed.**

Violation Level: **CRITICAL** — Flag risk and suggest alternative

## Limits to Always Check

```apex
// Limits class checks current usage
System.debug(Limits.getQueries() + ' / ' + Limits.getLimitQueries()); // Current / Max
System.debug(Limits.getDmlStatements() + ' / ' + Limits.getLimitDmlStatements());
System.debug(Limits.getCpuTime() + ' / ' + Limits.getLimitCpuTime()); // milliseconds
System.debug(Limits.getHeapSize() + ' / ' + Limits.getLimitHeapSize()); // bytes
System.debug(Limits.getCallouts() + ' / ' + Limits.getLimitCallouts());
```

## Synchronous Limits (Trigger, UI)

| Limit | Value | Risk |
|-------|-------|------|
| SOQL Queries | 100 | Most common limit hit |
| DML Statements | 150 | Second most common |
| CPU Time | 10s | Complex calculations |
| Heap Memory | 6MB | Large data structures |
| Callouts | 100 | Rare in normal flow |

## Asynchronous Limits (Batch, Queueable, Scheduled)

| Limit | Value | Impact |
|-------|-------|--------|
| SOQL Queries | 200 | Double the sync limit |
| DML Statements | 150 | Same as sync |
| CPU Time | 60s | 6x longer than sync |
| Heap Memory | 12MB | Double the sync limit |
| Callouts | 100 | Same as sync |

## Pre-Code Check Pattern

```apex
// ✅ CORRECT: Ask before coding
boolean willExceedLimits(List<Account> accounts) {
    // Check: Will I hit SOQL limit?
    // 1 account = 2 SOQL at most (selector + related query)
    // 100 accounts × 2 = 200 SOQL queries
    if (accounts.size() > 50) {
        // Risk: Could exceed 100 SOQL limit in trigger context
        // Solution: Move to Batch Apex
        return TRUE;
    }
    
    // Check: Will I hit CPU time?
    // If complex calculation per record:
    // 100 records × 100ms calc = 10 seconds = AT LIMIT
    if (accounts.size() > 100 && hasComplexCalculations) {
        return TRUE;
    }
    
    // Check: Will I hit DML?
    // 100 accounts + 5 related records each = 600 DML
    if (accounts.size() * 6 > 150) {
        // Risk: Would exceed 150 DML limit
        // Solution: Split into multiple transactions or batch
        return TRUE;
    }
    
    return FALSE;
}
```

## Decision Tree

```
Processing N records?

N < 10
├─ Trigger OK → Service method sufficient
└─ Use synchronous limits (100 SOQL, 150 DML, 10s CPU)

N = 10-100
├─ Quick to process? → Trigger + Service OK
├─ Complex logic? → Queueable recommended
└─ Monitor: getQueries(), getDmlStatements(), getCpuTime()

N = 100-1000
├─ Must use Queueable or Batch
└─ Fresh limits per execution: 200 SOQL, 150 DML, 60s CPU

N > 1000
├─ Use Batch Apex (chunked processing)
├─ Default chunk: 200 records per execution
└─ Get 200 SOQL, 150 DML, 60s CPU, 12MB heap per batch
```

## Violation Response

When code risks exceeding limits:

```
⚠️  GOVERNOR LIMIT RISK DETECTED

Your code:
for (Account account : [SELECT Id FROM Account]) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :account.Id];
    update contacts;
}

Analysis:
- SOQL in loop: potentially 100+ queries
- Gov Limit: 100 sync queries
- Risk: EXCEEDS LIMIT on large orgs
- Trigger context limit: 100 SOQL

Recommendation: Refactor to:
1. Queueable for chaining with fresh limits (200 SOQL)
2. Batch Apex for very large dataset (5M+ records)

✅ Suggested refactor:
public class ContactUpdateQueueable implements Queueable {
    private Set<Id> accountIds;
    
    public void execute(QueueableContext context) {
        Map<Id, List<Contact>> contactsByAccountId = ...
        // One SOQL query with relationship
    }
}
```

## Monitoring During Execution

```apex
public class MonitoredService {
    
    public static void processAccountsWithLimitCheck(List<Account> accounts) {
        // Monitor limits during execution
        if (Limits.getQueries() > 95) {
            throw new Exception('Approaching SOQL query limit. '
                + Limits.getQueries() + ' / ' + Limits.getLimitQueries());
        }
        
        if (Limits.getDmlStatements() > 140) {
            throw new Exception('Approaching DML statement limit. '
                + Limits.getDmlStatements() + ' / ' + Limits.getLimitDmlStatements());
        }
        
        if (Limits.getCpuTime() > 9000) { // milliseconds
            throw new Exception('Approaching CPU time limit: '
                + Limits.getCpuTime() + 'ms / ' + Limits.getLimitCpuTime() + 'ms');
        }
        
        // Safe to continue
        processAccounts(accounts);
    }
}
```

## Safe Patterns by Limit

### Approaching SOQL Limit?
```apex
// ❌ DON'T: Continue processing
List<Account> accounts = [SELECT Id FROM Account]; // Query 99 - ALMOST AT LIMIT

// ✅ DO: Stop or move to async
if (Limits.getQueries() > 80) {
    // Move to Queueable/Batch for fresh limits
    System.enqueueJob(new ProcessingQueueable(accountIds));
    return;
}
```

### Approaching DML Limit?
```apex
// ❌ DON'T: Continue updating
List<Contact> contacts = new List<Contact>();
for (Integer i = 0; i < 100; i++) {
    contacts.add(...);
}
update contacts; // Could exceed 150 DML limit

// ✅ DO: Chunk updates
List<List<Contact>> batches = chunkList(contacts, 50);
for (List<Contact> batch : batches) {
    update batch; // 3 DML statements instead of 1 large one
}
```

### Approaching CPU Time Limit?
```apex
// ❌ DON'T: Complex calculation in loop
for (Account account : largeList) {
    calculateComplexMetric(account); // Slow
}

// ✅ DO: Move to Batch Apex or Scheduled Job
Database.executeBatch(new ComplexCalculationBatch(), 50); // Smaller chunks
```

## Best Practices

✅ Check limits BEFORE writing code
✅ Monitor limits DURING execution
✅ Have a plan if limit is approached
✅ Use async patterns (Batch/Queueable) for large data
✅ Refactor non-bulkified code
✅ Test with large datasets (% of production volume)
✅ Document why limits won't be exceeded

## Key Takeaway
**Governor limits are hard boundaries. Know your limits before coding. If approaching limits, move to async Batch/Queueable for fresh limits per execution. This is non-negotiable for production code.**
