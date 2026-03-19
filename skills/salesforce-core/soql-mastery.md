# SOQL Mastery — Query Optimization & Patterns

## Selective Queries — The Foundation

A selective query uses indexed fields in the WHERE clause to reduce the full table scan risk.

### Indexed Fields in Salesforce

By default, these fields are indexed:

- **Id** — Record ID (always indexed)
- **Name** — Standard name field (text indexed)
- **Email** — Contact/Lead email
- **Phone** — Contact/Lead phone
- **RecordType** — Record type
- **OwnerId** — Record owner
- **CreatedDate**, **LastModifiedDate** — System dates
- **Custom fields** marked as "External ID" or "Unique"

### ✅ SELECTIVE Query (Good)

```apex
// Id is indexed → selective
List<Account> accounts1 = [
    SELECT Id, Name FROM Account WHERE Id = :recordId
];

// Email is indexed → selective
List<Contact> contacts = [
    SELECT Id, Email FROM Contact WHERE Email = :email LIMIT 100
];

// CreatedDate is indexed → selective
List<Account> newAccounts = [
    SELECT Id, Name FROM Account WHERE CreatedDate = LAST_N_DAYS:30
];

// OwnerId (indexed) + Name (indexed) → selective
List<Lead> myLeads = [
    SELECT Id, Name FROM Lead WHERE OwnerId = :userId AND Status = 'Open'
];
```

### ❌ NOT Selective (Risk of Full Table Scan)

```apex
// Custom_Field__c not indexed → full table scan on large orgs
List<Account> accounts = [
    SELECT Id, Name FROM Account WHERE Custom_Field__c = 'Value'
];

// Using LIKE without starting with indexed field → full scan
List<Contact> contacts = [
    SELECT Id FROM Contact WHERE Phone LIKE '%555%'
];

// Using > on non-indexed field → risk on large datasets
List<Opportunity> opps = [
    SELECT Id FROM Opportunity WHERE Amount > 100000
];
```

### Query Plan Tool

Use Salesforce Query Plan Tool to verify selectivity:

```
Method:
1. Go to Setup → Developer Console
2. Query → Query Plan
3. Paste query
4. Click Execute
5. Check "cardinality" (number of records scanned)
```

## Relationship Queries — Navigating Objects

### Parent Relationships (Using Foreign Key)

```apex
// Get contacts with account info
List<Contact> contacts = [
    SELECT Id, Name, 
           Account.Id, Account.Name, Account.BillingCity
    FROM Contact
    WHERE Account.BillingCountry = 'USA'
];

// Access parent: contact.Account.Name
for (Contact c : contacts) {
    System.debug(c.Account.Name);
}
```

### Child Relationships (Using sub-queries)

```apex
// Get accounts with their contacts
List<Account> accounts = [
    SELECT Id, Name,
           (SELECT Id, Name, Email FROM Contacts LIMIT 100)
    FROM Account
    WHERE BillingCountry = 'USA'
];

// Access children: account.Contacts
for (Account a : accounts) {
    System.debug(a.Name + ' has ' + a.Contacts.size() + ' contacts');
}
```

### Traversal Depth Limit

⚠️ SOQL relationships are limited to **5 levels**:

```apex
// Level 1 → 2 → 3 → 4 → 5 (OK)
List<Opportunity> opps = [
    SELECT Id,
           Account.Parent.Owner.Name, // Max 4 levels
    FROM Opportunity
];

// Level 1 → 2 → 3 → 4 → 5 → 6 (ERROR)
// SELECT Account.Parent.Owner.Manager.Manager FROM...
// Can't go beyond 5 levels
```

## Aggregate Functions — COUNT, SUM, GROUP BY

### COUNT Aggregation

```apex
// Count all accounts
Integer total = [SELECT COUNT() FROM Account];

// Count by record type
AggregateResult[] results = [
    SELECT RecordType.Name, COUNT(Id) cnt
    FROM Account
    GROUP BY RecordType.Name
];

for (AggregateResult ar : results) {
    String recordType = (String)ar.get('RecordType.Name');
    Integer count = (Integer)ar.get('cnt');
    System.debug(recordType + ': ' + count);
}
```

### SUM Aggregation

```apex
// Sum all opportunity amounts
AggregateResult ar = [
    SELECT SUM(Amount) total FROM Opportunity
];
Decimal totalAmount = (Decimal)ar.get('total');

// Sum grouped by account
AggregateResult[] results = [
    SELECT AccountId, SUM(Amount) total
    FROM Opportunity
    GROUP BY AccountId
];
```

### GROUP BY with HAVING

```apex
// Find accounts with more than 10 opportunities
AggregateResult[] results = [
    SELECT AccountId, COUNT(Id) cnt
    FROM Opportunity
    GROUP BY AccountId
    HAVING COUNT(Id) > 10
];
```

## Semi-Joins and Anti-Joins

### Semi-Join (WHERE IN with sub-query)

```apex
// Get opportunities where account has contacts
List<Opportunity> opps = [
    SELECT Id, Amount
    FROM Opportunity
    WHERE AccountId IN (
        SELECT AccountId FROM Contact WHERE Email != null
    )
];

// More efficient than:
// 1. Query all contacts
// 2. Extract account IDs
// 3. Query opportunities
```

### Anti-Join (WHERE NOT IN with sub-query)

```apex
// Get accounts with NO contacts
List<Account> accounts = [
    SELECT Id, Name
    FROM Account
    WHERE Id NOT IN (
        SELECT AccountId FROM Contact WHERE AccountId != null
    )
];
```

## SOQL for Loops — Large Datasets

When querying potentially 50k+ records, use SOQL for loop:

```apex
// ❌ BAD: Might hit heap memory limit
List<Account> allAccounts = [SELECT Id, Name FROM Account];
for (Account a : allAccounts) {
    processAccount(a); // Could be millions of records
}

// ✅ GOOD: Process in chunks, garbage collected
for (Account account : [SELECT Id, Name FROM Account]) {
    processAccount(account); // Safe even for 50M records
}

// ✅ GOOD: Use Database.QueryLocator for Batch
global Database.QueryLocator start(Database.BatchableContext bc) {
    return Database.getQueryLocator([
        SELECT Id, Name FROM Account
    ]);
}
```

## WITH SECURITY_ENFORCED — Mandatory Pattern

```apex
// Always use WITH SECURITY_ENFORCED (best practice)
List<Account> accounts = [
    SELECT Id, Name, Phone
    FROM Account
    WITH SECURITY_ENFORCED
    LIMIT 10000
];

// If user can't read any selected field → throws QueryException
// If user can't read Account object → throws QueryException
```

## Query Performance Patterns

### Pattern 1: Reduce Data Returned

```apex
// ❌ Query all fields
List<Account> accounts = [SELECT * FROM Account];

// ✅ Query only needed fields
List<Account> accounts = [
    SELECT Id, Name, BillingCity FROM Account
];
```

### Pattern 2: Add WHERE to Reduce Rows

```apex
// ❌ Query everything, filter in code
List<Account> allAccounts = [SELECT Id, Name, BillingCountry FROM Account];
List<Account> usAccounts = new List<Account>();
for (Account a : allAccounts) {
    if (a.BillingCountry == 'USA') {
        usAccounts.add(a);
    }
}

// ✅ Filter in SOQL
List<Account> usAccounts = [
    SELECT Id, Name FROM Account WHERE BillingCountry = 'USA'
];
```

### Pattern 3: Use LIMIT to Prevent Large Returns

```apex
List<Contact> contacts = [
    SELECT Id, Name FROM Contact LIMIT 10000
];
// Stops after 10,000 even if more exist
```

### Pattern 4: Batch Large Operations

```apex
Integer offset = 0;
Integer pageSize = 2000;

while (true) {
    List<Account> accounts = [
        SELECT Id, Name FROM Account
        ORDER BY CreatedDate DESC
        LIMIT :pageSize
        OFFSET :offset
    ];
    
    if (accounts.isEmpty()) break;
    
    // Process batch
    processBatch(accounts);
    
    offset += pageSize;
}
```

## Common SOQL Mistakes

| ❌ Mistake | ✅ Fix |
|-----------|--------|
| SOQL in loop | Move query outside loop |
| Non-indexed WHERE field | Add index or refactor |
| No LIMIT clause | Add `LIMIT 10000` |
| No `WITH SECURITY_ENFORCED` | Always add for security |
| Querying all fields with `*` | Select only needed fields |
| SOQL in for-loop in heap query | Use SOQL for loop instead |
| Using !=  with shared fields | Avoid null comparisons |

## Query Limits Reference

| Context | SOQL Limit | Additional |
|---------|-----------|------------|
| Synchronous | 100 queries | 10s CPU time |
| Asynchronous | 200 queries | 60s CPU time |
| Batch execute() | 200 queries | Fresh per batch |
| SOQL for loop | 1 query | Streams 50M records |

## Key Takeaway

**Write selective queries using indexed fields in WHERE clauses.** Use relationship queries to fetch related data in one call. Always use `LIMIT` and `WITH SECURITY_ENFORCED`. When in doubt, use the Query Plan Tool to verify selectivity.
