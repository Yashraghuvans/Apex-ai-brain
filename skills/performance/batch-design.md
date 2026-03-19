# Batch Design — Processing at Scale

## Batch Apex Fundamentals

Batch jobs process data in chunks with fresh governor limits per execution.

### Chunk Processing

```apex
global class ProcessAccountsBatch implements Database.Batchable<SObject> {
    
    // Every record from this query is processed in chunks
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name FROM Account
        ]);
    }

    // Processes up to 200 records (configurable)
    // Fresh limits: 200 SOQL, 150 DML, 60s CPU, 12MB heap
    global void execute(Database.BatchableContext bc, List<Account> scope) {
        // Process this chunk
        for (Account a : scope) {
            a.Batch_Processed__c = true;
        }
        update scope;
    }

    // Called once after all chunks processed
    global void finish(Database.BatchableContext bc) {
        System.debug('All batches complete');
    }
}

// Execute with chunk size (default 200)
Database.executeBatch(new ProcessAccountsBatch(), 200);
```

### How Chunking Works

```
Dataset: 5,000 accounts
Batch size: 200

Execution 1: Accounts 1-200
  - Fresh: 200 SOQL, 150 DML, 60s CPU, 12MB heap
  - Execute method runs, updates completed
  - Memory freed after completion

Execution 2: Accounts 201-400
  - Fresh: 200 SOQL, 150 DML, 60s CPU, 12MB heap
  - Continue processing

Execution 3-25: Continue chunking

Finish: Called once at the end
```

## Optimal Batch Size

### Size Considerations

| Batch Size | Use Case | Pro | Con |
|-----------|----------|-----|-----|
| 1-10 | Complex logic, heavy CPU | Minimal memory | More executions |
| 50-100 | Balanced | Good performance | Moderate executions |
| 200 | Default, recommended | Fast completion | High memory |
| 500-1000 | Simple operations | Fewest executions | High memory risk |
| 2000 | Very simple, large dataset | Fastest | Memory risk on complex |

**Rule of thumb: 100-200 is optimal for most use cases**

## Stateful Batch — Share State Across Executions

```apex
global class StatefulProcessingBatch implements Database.Batchable<SObject>, Database.Stateful {
    
    // These variables persist across all executions
    public Integer totalProcessed = 0;
    public Integer totalErrors = 0;
    public List<String> errorLog = new List<String>();
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id FROM Account]);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        try {
            // Process records
            for (Account a : scope) {
                a.Processed__c = true;
            }
            update scope;
            
            // Accumulate stats
            totalProcessed += scope.size();
            
        } catch (DmlException e) {
            for (Account a : scope) {
                errorLog.add(a.Id + ': ' + e.getMessage());
            }
            totalErrors += scope.size();
        }
    }

    global void finish(Database.BatchableContext bc) {
        // Now have accumulated stats from all executions
        System.debug('Total processed: ' + totalProcessed);
        System.debug('Total errors: ' + totalErrors);
        
        // Send summary email
        String body = 'Processed: ' + totalProcessed + '\n' +
                      'Errors: ' + totalErrors + '\n' +
                      'Error details: ' + errorLog;
        
        sendSummaryEmail(body);
    }
}
```

## Error Handling in Batch

```apex
global void execute(Database.BatchableContext bc, List<Account> scope) {
    List<Database.SaveResult> results = Database.update(scope, false);
    // false = continue on error, don't throw
    
    // Check results for partial failures
    for (Integer i = 0; i < results.size(); i++) {
        Database.SaveResult sr = results[i];
        if (!sr.isSuccess()) {
            Account a = scope[i];
            System.debug('Failed to update ' + a.Id + ': ' + sr.getErrors()[0].getMessage());
        }
    }
}
```

## Chaining Batches

Execute one batch after another for multi-stage processing:

```apex
// Batch 1: Validate and prepare data
global class ValidateBatch implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id FROM Account WHERE Status__c = null]);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        for (Account a : scope) {
            a.Status__c = 'Active';
        }
        update scope;
    }

    global void finish(Database.BatchableContext bc) {
        // Chain to Batch 2
        Database.executeBatch(new TransformBatch(), 100);
    }
}

// Batch 2: Transform data
global class TransformBatch implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id FROM Account WHERE Status__c = 'Active']);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        for (Account a : scope) {
            a.Score__c = calculateScore(a);
        }
        update scope;
    }

    global void finish(Database.BatchableContext bc) {
        System.debug('All batches complete');
    }
}

// Start chain
Database.executeBatch(new ValidateBatch(), 200);
```

## Database.QueryLocator for Batch Safety

```apex
global class SafeBatch implements Database.Batchable<SObject> {
    
    // QueryLocator is safer than iterable
    // Handles 50M records properly
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name FROM Account
            ORDER BY CreatedDate DESC
        ]);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        // scope size is limited to batch size
        // scope.size() <= 200 (or whatever batch size specified)
    }

    global void finish(Database.BatchableContext bc) {}
}

// Good for very large datasets (millions of records)
```

## Performance Monitoring

```apex
global void finish(Database.BatchableContext bc) {
    // Get job details
    AsyncApexJob job = [
        SELECT Id, Status, JobItemsProcessed, TotalJobItems, NumberOfErrors
        FROM AsyncApexJob
        WHERE Id = :bc.getJobId()
    ];
    
    System.debug('Job completed with status: ' + job.Status);
    System.debug('Batches processed: ' + job.JobItemsProcessed + ' / ' + job.TotalJobItems);
    System.debug('Errors: ' + job.NumberOfErrors);
    
    // Take action on errors
    if (job.NumberOfErrors > 0) {
        sendAlertEmail('Batch had ' + job.NumberOfErrors + ' errors');
    }
}
```

## Batch vs Queueable vs Scheduled

| Feature | Batch | Queueable | Scheduled |
|---------|-------|-----------|-----------|
| Large datasets | ✅ (5M+) | ❌ (smaller) | ❌ (limited) |
| Chunking | ✅ Automatic | ❌ Manual | ❌ No |
| Chainable | ✅ Yes | ✅ Yes | ✅ Yes |
| Tracking | ✅ Job ID | ✅ Job ID | ✅ Scheduled ID |
| Repeatable | ✅ Schedule it | ❌ One time | ✅ Recurring |
| Best for | Mass data processing | Complex async | Scheduled work |

## Batch Design Patterns

### Pattern 1: Validation → Transform → Load

```apex
// Stage 1: Validate all records
Database.executeBatch(new ValidationStageBatch(), 100);

// Stage 2: Called from Stage 1 finish()
// Transform validated data

// Stage 3: Called from Stage 2 finish()
// Load to external system
```

### Pattern 2: Chunking with Offset

```apex
global class ChunkedBatch implements Database.Batchable<SObject> {
    
    private Integer offset = 0;
    private Integer pageSize = 10000;

    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id FROM Account
            ORDER BY CreatedDate
            LIMIT :pageSize
            OFFSET :offset
        ]);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        // Process
        update scope;
    }

    global void finish(Database.BatchableContext bc) {
        // Chain if more records
        offset += pageSize;
        List<Account> nextSet = [
            SELECT COUNT() FROM Account OFFSET :offset LIMIT 1
        ];
        if (!nextSet.isEmpty()) {
            Database.executeBatch(new ChunkedBatch(), 100);
        }
    }
}
```

## Batch Best Practices

✅ Use query with WHERE clause to limit dataset
✅ Keep batch size 100-200 by default
✅ Use Stateful only if state needed across executions
✅ Always handle partial failures (Database.update with false)
✅ Log errors for debugging
✅ Monitor via AsyncApexJob table
✅ Chain batches for multi-stage processing
✅ Test with realistic data volumes

## Key Takeaway

**Batches are for processing large datasets reliably.** Use optimal chunk sizes (100-200), handle errors gracefully, chain for complex workflows, and monitor progress. Batch Apex scales to millions of records that trigger limits would choke on.
