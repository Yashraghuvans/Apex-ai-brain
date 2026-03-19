# Apex Bulkification — The #1 Anti-Pattern

## What is Bulkification?

Bulkification means writing code that processes collections of records efficiently, not one record at a time.

## The #1 Anti-Pattern: Loop-Based SOQL/DML

### ❌ WRONG: Query/DML inside loop

```apex
// For each lead, query related accounts (100 Leads = 100 queries!)
public static void processLeads(List<Lead> leads) {
    for (Lead lead : leads) {
        // This SOQL query runs 100 times
        List<Account> accounts = [
            SELECT Id, Name FROM Account WHERE Id = :lead.CompanyId
        ];
        
        // This DML runs 100 times
        lead.AccountCount__c = accounts.size();
        update lead; // 1 DML per lead = 100 DML statements!
    }
}

// Result when trigger fires with 100 leads:
// SOQL queries: 100 (limit is 100) ❌
// DML statements: 100 (limit is 150, but terrible design) ❌
```

### ✅ CORRECT: Bulk all queries, bulk all DML

```apex
public static void processLeads(List<Lead> leads) {
    // STEP 1: Collect all Ids
    Set<Id> leadIds = new Set<Id>();
    for (Lead lead : leads) {
        leadIds.add(lead.CompanyId);
    }

    // STEP 2: Query ALL at once
    Map<Id, Account> accountsById = new Map<Id, Account>([
        SELECT Id, Name FROM Account WHERE Id IN :leadIds
    ]);

    // STEP 3: Process with map lookup (fast)
    for (Lead lead : leads) {
        Account account = accountsById.get(lead.CompanyId);
        lead.AccountCount__c = account.Name;
    }

    // STEP 4: Update all at once
    update leads;
}

// Result when trigger fires with 100 leads:
// SOQL queries: 1 (excellent!) ✅
// DML statements: 1 (excellent!) ✅
```

## Common Bulkification Patterns

### Pattern 1: Map for Parent-Child Lookup

```apex
// Get parent data by creating a map
Map<Id, Account> accountsById = new Map<Id, Account>([
    SELECT Id, Name, BillingCity FROM Account WHERE Id IN :accountIds
]);

// Use map for O(1) lookup instead of nested query
for (Contact contact : contacts) {
    Account account = accountsById.get(contact.AccountId);
    if (account != null) {
        contact.Account_City__c = account.BillingCity;
    }
}
```

### Pattern 2: Multi-Map for One-to-Many

```apex
// Goal: For each account, get all its contacts
Map<Id, List<Contact>> contactsByAccountId = new Map<Id, List<Contact>>();

for (Contact contact : [
    SELECT Id, Name, AccountId FROM Contact WHERE AccountId IN :accountIds
]) {
    if (!contactsByAccountId.containsKey(contact.AccountId)) {
        contactsByAccountId.put(contact.AccountId, new List<Contact>());
    }
    contactsByAccountId.get(contact.AccountId).add(contact);
}

// Use the multi-map
for (Account account : accounts) {
    List<Contact> contacts = contactsByAccountId.get(account.Id) ?? new List<Contact>();
    System.debug(account.Name + ' has ' + contacts.size() + ' contacts');
}
```

### Pattern 3: Aggregation Map for Counts

```apex
// Goal: Count opportunities per account
Map<Id, Integer> opportunityCountByAccountId = new Map<Id, Integer>();

for (Opportunity opp : [
    SELECT Id, AccountId FROM Opportunity WHERE AccountId IN :accountIds
]) {
    opportunityCountByAccountId.put(
        opp.AccountId,
        (opportunityCountByAccountId.get(opp.AccountId) ?? 0) + 1
    );
}

// Use the aggregation map
for (Account account : accounts) {
    account.Opportunity_Count__c = opportunityCountByAccountId.get(account.Id) ?? 0;
}
```

### Pattern 4: Conditional Collection Building

```apex
// Goal: Separate records into categories for different processing
List<Lead> hotLeads = new List<Lead>();
List<Lead> coldLeads = new List<Lead>();

for (Lead lead : leads) {
    if (lead.LeadSource == 'Web') {
        hotLeads.add(lead);
    } else {
        coldLeads.add(lead);
    }
}

// Now bulk update each category differently
update hotLeads;
update coldLeads;
// Still = 2 DML statements (optimal)
```

## Bulkification Before & After

### Example: Lead Scoring

#### ❌ BEFORE (Non-Bulkified)

```apex
public static void scoreLead(Lead lead) {
    // Query 1: Get company info
    Account account = [
        SELECT Id, Annual_Revenue__c FROM Account WHERE Id = :lead.CompanyId
    ];
    
    // Query 2: Count contacts
    Integer contactCount = [
        SELECT COUNT() FROM Contact WHERE AccountId = :lead.CompanyId
    ];
    
    // Query 3: Get latest activity
    Task latestTask = [
        SELECT Id, CreatedDate FROM Task WHERE WhoId = :lead.Id ORDER BY CreatedDate DESC LIMIT 1
    ];
    
    // Calculate score
    Integer score = 0;
    if (account.Annual_Revenue__c > 1000000) score += 50;
    if (contactCount > 5) score += 30;
    if (latestTask != null && latestTask.CreatedDate > System.now().addDays(-30)) score += 20;
    
    lead.Score__c = score;
    update lead;
}

// Called with 100 leads:
// SOQL queries: 300 (3 per lead!) ❌
// DML statements: 100 (1 per lead!) ❌
```

#### ✅ AFTER (Bulkified)

```apex
public static void scoreLeads(List<Lead> leads) {
    // Extract all Ids needed
    Set<Id> leadIds = new Set<Id>();
    Set<Id> accountIds = new Set<Id>();
    for (Lead lead : leads) {
        leadIds.add(lead.Id);
        accountIds.add(lead.CompanyId);
    }
    
    // Query 1: Get all company info at once
    Map<Id, Account> accountsById = new Map<Id, Account>([
        SELECT Id, Annual_Revenue__c FROM Account WHERE Id IN :accountIds
    ]);
    
    // Query 2: Count contacts per account
    Map<Id, Integer> contactCountByAccountId = new Map<Id, Integer>();
    for (AggregateResult ar : [
        SELECT AccountId, COUNT(Id) cnt FROM Contact WHERE AccountId IN :accountIds GROUP BY AccountId
    ]) {
        contactCountByAccountId.put((Id)ar.get('AccountId'), (Integer)ar.get('cnt'));
    }
    
    // Query 3: Get latest activities all at once
    Map<Id, Task> latestTaskByWhoId = new Map<Id, Task>();
    for (Task t : [
        SELECT Id, CreatedDate, WhoId FROM Task WHERE WhoId IN :leadIds ORDER BY CreatedDate DESC
    ]) {
        if (!latestTaskByWhoId.containsKey(t.WhoId)) {
            latestTaskByWhoId.put(t.WhoId, t);
        }
    }
    
    // Process all leads using maps (no queries!)
    for (Lead lead : leads) {
        Integer score = 0;
        
        Account account = accountsById.get(lead.CompanyId);
        if (account != null && account.Annual_Revenue__c > 1000000) score += 50;
        
        Integer contactCount = contactCountByAccountId.get(lead.CompanyId) ?? 0;
        if (contactCount > 5) score += 30;
        
        Task latestTask = latestTaskByWhoId.get(lead.Id);
        if (latestTask != null && latestTask.CreatedDate > System.now().addDays(-30)) score += 20;
        
        lead.Score__c = score;
    }
    
    // Update all at once
    update leads;
}

// Called with 100 leads:
// SOQL queries: 3 (amazing!) ✅✅✅
// DML statements: 1 (excellent!) ✅
// Improvement: 97% fewer queries!
```

## Batch Apex for Large Datasets

When data is > 10,000 records, even bulkified code needs chunking:

```apex
global class LeadScoringBatch implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Query returns all leads
        return Database.getQueryLocator('SELECT Id, CompanyId FROM Lead');
    }

    global void execute(Database.BatchableContext bc, List<Lead> leads) {
        // Framework chunks results automatically (~2000 per batch)
        scoreLeads(leads); // Our bulkified method
        
        // Now in a fresh transaction:
        // SOQL: 100 (fresh limit per batch)
        // DML: 150 (fresh limit per batch)
    }

    global void finish(Database.BatchableContext bc) {
        // Called once after all batches complete
    }

    private static void scoreLeads(List<Lead> leads) {
        // Same bulkified logic as before
    }
}

// Launch it:
Database.executeBatch(new LeadScoringBatch(), 2000);
```

## Bulkification Checklist

✅ Do I query the same data multiple times → fetch once, use map
✅ Do I have a query in a loop → move outside loop
✅ Do I have DML in a loop → collect records, DML once
✅ Do I have callouts in a loop → batch or Queueable
✅ Do I work with 10k+ records → use Batch Apex
✅ Do I need to process in chunks → use Database.Batchable

## Key Takeaway

**The fundamental rule of bulkification: Write code to process 100 records as easily as 1 record.** Use collections, maps for lookups, and bulk DML. This is the difference between good Apex and bad Apex.
