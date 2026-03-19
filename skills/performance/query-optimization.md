# Query Optimization — Making SOQL Fast

## What Makes a Query Selective?

A selective query uses indexed fields to minimize records scanned.

### Indexed Fields

By default indexed:
- Id (primary key)
- Name (text indexed)
- Email, Phone
- RecordTypeId
- OwnerId
- CreatedDate, LastModifiedDate
- Custom fields marked: External ID, Unique

### Using Query Plan Tool

```
Setup → Developer Console → Query → Query Plan
```

Red "cardinality" = full table scan (slow on large data)
Green "cardinality" = selective (fast)

## Pattern 1: Use Indexed Field in WHERE

```apex
// ✅ SELECTIVE: Id is indexed
List<Account> accounts = [
    SELECT Id, Name FROM Account WHERE Id = :recordId
];

// ✅ SELECTIVE: CreatedDate is indexed
List<Account> newAccounts = [
    SELECT Id, Name FROM Account WHERE CreatedDate = LAST_N_DAYS:30
];

// ✅ SELECTIVE: OwnerId is indexed
List<Account> myAccounts = [
    SELECT Id, Name FROM Account WHERE OwnerId = :userId
];

// ❌ NOT SELECTIVE: Custom__c not indexed
List<Account> accounts = [
    SELECT Id, Name FROM Account WHERE Custom__c = 'Value'
    // This scans ALL records on large orgs!
];
```

## Pattern 2: Force Index Using Selective Field

```apex
// ❌ SLOW: LIKE without starting character
List<Contact> contacts = [
    SELECT Id FROM Contact WHERE Phone LIKE '%555%'
    // Scans all contacts
];

// ✅ FAST: Start with indexed field
List<Contact> contacts = [
    SELECT Id FROM Contact 
    WHERE Name LIKE 'Smith%' AND Phone LIKE '%555%'
    // Uses Name index, then filters by Phone
];
```

## Pattern 3: Add LIMIT to Prevent Large Returns

```apex
// ❌ Could return millions
List<Account> accounts = [SELECT Id FROM Account];

// ✅ Controlled size
List<Account> accounts = [
    SELECT Id FROM Account LIMIT 10000
];

// ✅ Pagination with OFFSET
List<Account> page1 = [
    SELECT Id FROM Account ORDER BY CreatedDate DESC LIMIT 1000 OFFSET 0
];
List<Account> page2 = [
    SELECT Id FROM Account ORDER BY CreatedDate DESC LIMIT 1000 OFFSET 1000
];
```

## Pattern 4: Use Aggregate Queries

```apex
// ❌ INEFFICIENT: Count in code
List<Account> allAccounts = [SELECT Id FROM Account];
Integer count = allAccounts.size();
// Fetches ALL records just to count

// ✅ EFFICIENT: COUNT() in SOQL
Integer count = [SELECT COUNT() FROM Account];
// Just returns the count
```

## Pattern 5: Pre-Fetch Data to Avoid Nested Queries

```apex
// ❌ SLOW: SOQL in loop (N+1 problem)
List<Account> accounts = [SELECT Id FROM Account];
for (Account a : accounts) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :a.Id];
    // 100 accounts = 100 SOQL queries!
}

// ✅ FAST: Single query with relationships
List<Account> accounts = [
    SELECT Id,
           (SELECT Id FROM Contacts LIMIT 100)
    FROM Account
];
for (Account a : accounts) {
    System.debug(a.Contacts.size());
    // Data already fetched
}
```

## Pattern 6: Use Maps for Lookups

```apex
// ❌ INEFFICIENT: Multiple queries
for (Opportunity opp : opportunities) {
    Account account = [SELECT Name FROM Account WHERE Id = :opp.AccountId];
    opp.Account_Name__c = account.Name;
}

// ✅ EFFICIENT: Single query, map lookup
Map<Id, Account> accountsById = new Map<Id, Account>([
    SELECT Id, Name FROM Account WHERE Id IN :getAccountIds(opportunities)
]);

for (Opportunity opp : opportunities) {
    Account account = accountsById.get(opp.AccountId);
    opp.Account_Name__c = account.Name;
}

private static Set<Id> getAccountIds(List<Opportunity> opportunities) {
    Set<Id> ids = new Set<Id>();
    for (Opportunity opp : opportunities) {
        ids.add(opp.AccountId);
    }
    return ids;
}
```

## Pattern 7: Reduce Fields Returned

```apex
// ❌ INEFFICIENT: All fields
List<Account> accounts = [SELECT * FROM Account];

// ✅ EFFICIENT: Only fields needed
List<Account> accounts = [
    SELECT Id, Name, BillingCity FROM Account
];
```

## Pattern 8: Use SOQL for Loops for Large Datasets

```apex
// ❌ INEFFICIENT: Could hit heap memory
List<Account> allAccounts = [
    SELECT Id, Name, Website FROM Account
];
for (Account a : allAccounts) {
    process(a);
}

// ✅ EFFICIENT: Streams records
for (Account account : [
    SELECT Id, Name, Website FROM Account
]) {
    process(account);
    // Memory freed after each iteration
}

// ✅ FOR BATCH: Use Database.QueryLocator
global Database.QueryLocator start(Database.BatchableContext bc) {
    return Database.getQueryLocator([
        SELECT Id, Name FROM Account
    ]);
}
```

## Performance Optimization Checklist

| Issue | Fix |
|-------|-----|
| Query too slow | Check with Query Plan Tool |
| SOQL query in loop | Move query outside loop |
| N+1 problem | Use relationship query + subquery |
| Large data returned | Add WHERE or LIMIT |
| All fields fetched | Select only needed fields |
| Count takes forever | Use aggregation COUNT() |
| Heap memory exceeded | Use SOQL for loop |
| Query execution time slow | Add indexed field to WHERE |

## Real-World Optimization Example

### Before Optimization (N+1 Problem)

```apex
// Slow for large datasets
public static void processOpportunities(List<Opportunity> opps) {
    for (Opportunity opp : opps) {
        // Query 1: Get account
        Account account = [
            SELECT Industry, AnnualRevenue FROM Account WHERE Id = :opp.AccountId
        ];
        
        // Query 2: Get contacts
        List<Contact> contacts = [
            SELECT Email FROM Contact WHERE AccountId = :opp.AccountId
        ];
        
        // 100 opps = 200 queries = GOVERNOR LIMIT!
    }
}
```

### After Optimization

```apex
// Fast: Bulk queries
public static void processOpportunities(List<Opportunity> opps) {
    // Extract account IDs
    Set<Id> accountIds = new Set<Id>();
    for (Opportunity opp : opps) {
        accountIds.add(opp.AccountId);
    }
    
    // Query 1: Get all accounts with contacts
    Map<Id, Account> accountsById = new Map<Id, Account>([
        SELECT Id, Industry, AnnualRevenue,
               (SELECT Email FROM Contacts LIMIT 100)
        FROM Account
        WHERE Id IN :accountIds
    ]);
    
    // Process using maps (no additional queries)
    for (Opportunity opp : opps) {
        Account account = accountsById.get(opp.AccountId);
        List<Contact> contacts = account.Contacts;
        
        processOpp(opp, account, contacts);
    }
}

// 2 queries total vs 200 queries before = 100x faster!
```

## Key Takeaway

**Write queries that use indexed fields. Pre-fetch related data. Use maps instead of nested queries. The difference between good query design and bad query design is often 100x in performance.**
