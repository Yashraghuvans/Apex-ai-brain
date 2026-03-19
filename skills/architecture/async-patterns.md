# Async Patterns — Future, Queueable, Batch, Scheduled

## Overview

Asynchronous patterns allow long-running or resource-intensive operations to run outside the synchronous transaction.

### Governor Limit Comparison

| Type | CPU Time | SOQL | DML | Heap | Best For |
|------|----------|------|-----|------|----------|
| Synchronous | 10s | 100 | 150 | 6MB | UI, triggers (< 100 records) |
| Future | 60s | 200 | 150 | 12MB | Simple async, no chaining |
| Queueable | 60s | 200 | 150 | 12MB | Complex async, chainable |
| Batch | 60s/batch | 200 | 150 | 12MB | Large datasets (5M+) |
| Scheduled | 60s/exec | 200 | 150 | 12MB | Recurring jobs |

## Future Methods

Simple async for non-chainable operations (fire and forget).

### Basic Pattern

```apex
public class ProcessingService {
    
    @future(callout=true)
    public static void processRecordsFuture(Set<Id> recordIds) {
        // This runs asynchronously
        // Can make callouts if callout=true
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE Id IN :recordIds];
        
        for (Account a : accounts) {
            a.Status__c = 'Processed';
        }
        
        update accounts;
    }
}

// Call it:
ProcessingService.processRecordsFuture(new Set<Id>{acc.Id});
```

### Limitations

❌ Cannot return values
❌ Cannot chain (no guarantee of order)
❌ Cannot track progress
❌ Cannot use callouts without adding ` callout=true`

### When to Use

✅ Send emails async
✅ Make external callouts
✅ Long-running calculations
✅ Don't need to know result

## Queueable — Chainable, Trackable

Queueable allows chaining jobs and gives job ID for tracking.

### Basic Pattern

```apex
public class ProcessingQueueable implements Queueable {
    
    private List<Id> recordIds;
    
    public ProcessingQueueable(List<Id> recordIds) {
        this.recordIds = recordIds;
    }
    
    public void execute(QueueableContext context) {
        // Process records
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE Id IN :recordIds];
        
        for (Account a : accounts) {
            a.Status__c = 'Processed';
        }
        
        update accounts;
        
        // Chain to next job if needed
        if (recordIds.size() > 100) {
            System.enqueueJob(new ProcessingQueueable(getNextBatch()));
        }
    }
    
    private List<Id> getNextBatch() {
        return recordIds.sublist(0, Math.min(99, recordIds.size()));
    }
}

// Call it:
Id jobId = System.enqueueJob(new ProcessingQueueable(recordIds));
System.debug('Job ID: ' + jobId);
```

### Chaining Pattern

```apex
public class ChainedQueueable implements Queueable {
    
    private Integer iteration = 0;
    
    public ChainedQueueable(Integer iteration) {
        this.iteration = iteration;
    }
    
    public void execute(QueueableContext context) {
        System.debug('Iteration ' + iteration);
        
        // Do work
        List<Account> accounts = [SELECT Id FROM Account LIMIT 100];
        update accounts;
        
        // Chain to next iteration (max 5)
        if (iteration < 5) {
            System.enqueueJob(new ChainedQueueable(iteration + 1));
        }
    }
}

// Start chain:
System.enqueueJob(new ChainedQueueable(0));
// This will run 5 iterations in sequence, each in fresh transaction
```

### Advantages

✅ Chainable (guaranteed order)
✅ Returns job ID (trackable)
✅ Can implement Finalizer
✅ Fresh governor limits per execution

## Batch Apex — Large Datasets

Process up to 5 million records in chunks.

### 3-Method Pattern

```apex
global class AccountProcessingBatch implements Database.Batchable<SObject> {
    
    /**
     * START: Define the query scope
     * Returns Database.QueryLocator to iterate over
     */
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Name FROM Account
            WHERE CreatedDate = LAST_N_DAYS:30
        ]);
    }
    
    /**
     * EXECUTE: Process chunk of up to 200 records (default)
     * Fresh transaction for each batch
     */
    global void execute(Database.BatchableContext bc, List<Account> accounts) {
        for (Account a : accounts) {
            a.Batch_Processed__c = true;
        }
        update accounts;
    }
    
    /**
     * FINISH: Called once after all batches
     * Send summary email, chain to another batch, etc
     */
    global void finish(Database.BatchableContext bc) {
        System.debug('Batch complete');
        
        AsyncApexJob job = [
            SELECT Id, Status, NumberOfErrors
            FROM AsyncApexJob
            WHERE Id = :bc.getJobId()
        ];
        
        System.debug('Job Status: ' + job.Status);
        System.debug('Errors: ' + job.NumberOfErrors);
    }
}

// Execute:
Database.executeBatch(new AccountProcessingBatch(), 200);
// 200 = scope size per execute() call
```

### Chunking Large Data

```apex
global class LargeDataBatch implements Database.Batchable<SObject> {
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Query returns potentially millions of records
        return Database.getQueryLocator([
            SELECT Id, Name FROM Account
        ]);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        // Salesforce automatically chunks results
        // ~2000 records per execute() call maximum
        List<Account> subset = scope.sublist(0, Math.min(1000, scope.size()));
        
        // Safe processing
        process(subset);
    }

    global void finish(Database.BatchableContext bc) {}
    
    private void process(List<Account> accounts) {
        // Business logic
        update accounts;
    }
}
```

### Chaining Batches

```apex
global void finish(Database.BatchableContext bc) {
    // Chain to next batch
    Database.executeBatch(new NextProcessingBatch(), 100);
}
```

## Stateful Batch — Maintain State Across Executions

```apex
global class StatefulBatch implements Database.Batchable<SObject>, Database.Stateful {
    
    public Integer totalProcessed = 0;
    public Integer totalErrors = 0;
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id FROM Account]);
    }

    global void execute(Database.BatchableContext bc, List<Account> scope) {
        try {
            update scope;
            totalProcessed += scope.size(); // Accumulates across all executions
        } catch (Exception e) {
            totalErrors++;
        }
    }

    global void finish(Database.BatchableContext bc) {
        System.debug('Processed: ' + totalProcessed);
        System.debug('Errors: ' + totalErrors);
        
        // Send summary email with cumulative counts
    }
}
```

## Scheduled Apex — Recurring Jobs

Run code on a schedule (hours, days, weeks, months).

### Basic Pattern

```apex
global class DailyAccountProcessing implements Schedulable {
    
    global void execute(SchedulableContext sc) {
        // Run batch job
        Database.executeBatch(new AccountProcessingBatch(), 200);
    }
}

// Schedule from execute anonymous:
String cronExpr = '0 0 2 * * ?'; // 2 AM daily
String jobId = System.schedule('Daily Account Processing', cronExpr, new DailyAccountProcessing());
System.debug('Scheduled job: ' + jobId);

// Unschedule:
System.abortJob(jobId);
```

### Cron Expressions

```
    0 2 * * *  → 2:00 AM every day
    0 0 * * 0  → Midnight every Sunday
    0 9 * * MON-FRI  → 9 AM weekdays
    */5 * * * *  → Every 5 minutes
    0 1 1 * *  → 1 AM on 1st of month
```

## Platform Events — Pub/Sub Async

Fire and forget events that trigger flows/processes asynchronously.

```apex
// Define event (can be created via UI)
public class OrderProcessor {
    
    public static void publishOrderEvent(String orderId) {
        Order_Event__e event = new Order_Event__e(
            Order_Id__c = orderId,
            Status__c = 'Submitted'
        );
        
        Database.SaveResult sr = EventBus.publish(event);
        if (sr.isSuccess()) {
            System.debug('Event published');
        }
    }
}

// Subscribe in a separate Apex trigger
trigger OrderEventTrigger on Order_Event__e (after insert) {
    for (Order_Event__e event : Trigger.new) {
        System.debug('Event received: ' + event.Order_Id__c);
        // Trigger flows, processes, or additional processing
    }
}
```

## Decision Tree

```
Need async?
├─ Simple, < 5s work?
│  └─ Use @future (fire and forget)
├─ Need to track, chain, < 1 min?
│  └─ Use Queueable
├─ Large dataset (1M+ records)?
│  └─ Use Batch
├─ Recurring schedule?
│  └─ Use Scheduled Apex
└─ Fire event for other systems?
   └─ Use Platform Events
```

## Best Practices

✅ Always implement error handling in async code
✅ Use Stateful batch only if state needed
✅ Limit batch scope size to 100-200 for reliability
✅ Chain jobs (don't fire 1000 jobs at once)
✅ Add job tracking (query AsyncApexJob)
✅ Test async code in test context with Test.startTest()
✅ Monitor governor limits even in async

## Key Takeaway

**Choose async pattern based on requirements:** Future for simple fire-and-forget, Queueable for complex chainable work, Batch for large datasets, Scheduled for recurring. Always consider governor limits and error handling.
