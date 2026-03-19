# FSD Architecture — Feature Sliced Design in Salesforce

## What is FSD?

Feature Sliced Design (FSD) organizes Salesforce code into **5 layers**, each with a single responsibility:

```
Trigger
  ↓
Handler (context routing)
  ↓
Service (orchestration)
  ↓
Selector ← Query  |  Domain → Logic
```

## The 5 Layers Explained

### Layer 1: Trigger — Event Router
- **Input**: Trigger context (before/after, insert/update/delete)
- **Output**: None
- **Responsibility**: Route to handler only
- **Rules**:
  - Zero business logic
  - Zero SOQL queries
  - Zero DML
  - Single handler instantiation

```apex
trigger AccountTrigger on Account (
    before insert, after insert,
    before update, after update,
    before delete, after delete,
    after undelete
) {
    new AccountTriggerHandler().handle();
}
```

### Layer 2: Handler — Context Mapper
- **Input**: Trigger context
- **Output**: Call to service with extracted data
- **Responsibility**: Map trigger contexts, prepare data
- **Rules**:
  - No business logic
  - Extract what service needs
  - Call service with collections

```apex
public class AccountTriggerHandler {
    private static Boolean isExecuting = false;

    public void handle() {
        if (isExecuting) return;
        try {
            isExecuting = true;
            if (Trigger.isBefore) {
                if (Trigger.isInsert) beforeInsert(Trigger.new);
                else if (Trigger.isUpdate) beforeUpdate(Trigger.new, Trigger.oldMap);
                else if (Trigger.isDelete) beforeDelete(Trigger.old);
            } else if (Trigger.isAfter) {
                if (Trigger.isInsert) afterInsert(Trigger.new);
                else if (Trigger.isUpdate) afterUpdate(Trigger.new, Trigger.oldMap);
                else if (Trigger.isDelete) afterDelete(Trigger.old);
                else if (Trigger.isUndelete) afterUndelete(Trigger.new);
            }
        } finally {
            isExecuting = false;
        }
    }

    private void beforeInsert(List<Account> newRecords) {
        AccountService.handleBeforeInsert(newRecords);
    }

    private void afterInsert(List<Account> newRecords) {
        AccountService.handleAfterInsert(newRecords);
    }

    // ... other context methods
}
```

### Layer 3: Service — Orchestrator
- **Input**: Collections of records, old map if needed
- **Output**: Persistence (update/insert/delete handled here)
- **Responsibility**: Orchestrate business processes
- **Rules**:
  - Call selector to get data
  - Call domain to apply logic
  - Handle transactions and exceptions
  - Reusable from trigger, API, batch, scheduled

```apex
public inherited sharing class AccountService {

    public static void handleBeforeInsert(List<Account> accounts) {
        try {
            // Validate
            new AccountDomain(accounts).validate();
            
            // Apply business logic
            new AccountDomain(accounts).applyBusinessRules();
            
        } catch (Exception e) {
            throw new AccountServiceException('Insert failed: ' + e.getMessage(), e);
        }
    }

    public static void handleAfterInsert(List<Account> accounts) {
        try {
            Set<Id> accountIds = getIds(accounts);
            Map<Id, Opportunity> opportunities = OpportunitySelector.selectByAccountIds(accountIds);
            
            new AccountDomain(accounts)
                .updateRelatedOpportunities(opportunities);
            
            // Update related records
            update opportunities.values();
            
        } catch (Exception e) {
            throw new AccountServiceException('After insert failed: ' + e.getMessage(), e);
        }
    }

    private static Set<Id> getIds(List<Account> accounts) {
        Set<Id> ids = new Set<Id>();
        for (Account a : accounts) {
            ids.add(a.Id);
        }
        return ids;
    }
}
```

### Layer 4: Selector — Data Access
- **Input**: Query parameters (IDs, filters)
- **Output**: List<SObject> with queried data
- **Responsibility**: ALL SOQL queries live here
- **Rules**:
  - Always `WITH SECURITY_ENFORCED`
  - Never raw dynamic SOQL
  - Named methods: selectById, selectByField, selectWithRelated
  - Return List<SObject>, never null

```apex
public inherited sharing class AccountSelector {

    public static List<Account> selectById(Set<Id> accountIds) {
        return [
            SELECT Id, Name, BillingCity, BillingCountry,
                   ParentId, OwnerId, Owner.Name,
                   (SELECT Id FROM Opportunities LIMIT 100)
            FROM Account
            WHERE Id IN :accountIds
            WITH SECURITY_ENFORCED
            ORDER BY Name ASC
        ];
    }

    public static List<Account> selectByRecordType(String recordTypeId) {
        return [
            SELECT Id, Name, RecordType.Name
            FROM Account
            WHERE RecordTypeId = :recordTypeId
            WITH SECURITY_ENFORCED
            LIMIT 10000
        ];
    }

    public static List<Account> selectByBillingCountry(String country) {
        return [
            SELECT Id, Name, BillingCountry
            FROM Account
            WHERE BillingCountry = :country
            WITH SECURITY_ENFORCED
            ORDER BY Name ASC
        ];
    }
}
```

### Layer 5: Domain — Business Logic
- **Input**: Records (List<SObject>) and old map if needed
- **Output**: List<SObject> with logic applied (modification in-place)
- **Responsibility**: Apply business rules
- **Rules**:
  - Works with collections only
  - Stateless (no persistent state)
  - Validates records
  - Transforms records
  - Never calls DML

```apex
public inherited sharing class AccountDomain {
    private List<Account> records;
    private Map<Id, Account> oldMap;

    public AccountDomain(List<Account> records) {
        this.records = records;
        this.oldMap = new Map<Id, Account>();
    }

    public AccountDomain(List<Account> records, Map<Id, Account> oldMap) {
        this.records = records;
        this.oldMap = oldMap != null ? oldMap : new Map<Id, Account>();
    }

    public AccountDomain validate() {
        for (Account a : records) {
            if (String.isBlank(a.Name)) {
                throw new AccountDomainException('Account name is required');
            }
            if (a.BillingCountry == null) {
                throw new AccountDomainException('Billing country required');
            }
        }
        return this;
    }

    public AccountDomain applyBusinessRules() {
        for (Account a : records) {
            // Rule 1: If annual revenue > $1M, mark as enterprise
            if (a.AnnualRevenue >= 1000000) {
                a.Account_Type__c = 'Enterprise';
            }
            // Rule 2: Set owner if null
            if (a.OwnerId == null) {
                a.OwnerId = UserInfo.getUserId();
            }
        }
        return this;
    }

    public AccountDomain updateRelatedOpportunities(Map<Id, Opportunity> opportunities) {
        for (Account a : records) {
            Opportunity opp = opportunities.get(a.Id);
            if (opp != null) {
                opp.AccountId = a.Id;
            }
        }
        return this;
    }

    public List<Account> getRecords() {
        return records;
    }

    /**
     * Custom exception for domain violations
     */
    public class AccountDomainException extends Exception {}
}
```

## Data Flow Example

**Requirement**: When Account is updated, if billing country changed, update all related contacts.

### Step-by-Step Flow

```
1. TRIGGER fires
   trigger AccountTrigger on Account (before update, after update)

2. HANDLER maps context
   new AccountTriggerHandler().handle();
   → afterUpdate(Trigger.new, Trigger.oldMap);

3. SERVICE orchestrates
   AccountService.handleAfterUpdate(newAccounts, oldMap);
   ├─ Extract changed account IDs
   └─ Compare old vs new BillingCountry

4. SELECTOR fetches related data
   Map<Id, List<Contact>> contactsByAccountId = 
       ContactSelector.selectByAccountIds(changedAccountIds);

5. DOMAIN applies logic
   new AccountDomain(newAccounts, oldMap)
       .updateContactsByCountry(contactsByAccountId);
   ├─ For each account with changed country
   │  └─ Update corresponding contacts
   └─ Return modified contacts

6. SERVICE persists
   update modifiedContacts;
```

## Folder Structure Convention

```
force-app/main/default/classes/

Triggers:
├── AccountTrigger.trigger
├── ContactTrigger.trigger
├── OpportunityTrigger.trigger

Handlers:
├── AccountTriggerHandler.cls
├── ContactTriggerHandler.cls
├── OpportunityTriggerHandler.cls

Services:
├── AccountService.cls
├── ContactService.cls
├── OpportunityService.cls

Selectors:
├── AccountSelector.cls
├── ContactSelector.cls
├── OpportunitySelector.cls

Domains:
├── AccountDomain.cls
├── ContactDomain.cls
├── OpportunityDomain.cls

Tests:
├── AccountTriggerHandlerTest.cls
├── AccountServiceTest.cls
├── AccountSelectorTest.cls
├── AccountDomainTest.cls
```

## Naming Conventions (STRICT)

| Layer | Naming Pattern | Example |
|-------|----------------|---------|
| Trigger | `ObjectNameTrigger` | `AccountTrigger` |
| Handler | `ObjectNameTriggerHandler` | `AccountTriggerHandler` |
| Service | `ObjectNameService` or `FeatureNameService` | `AccountService`, `LeadScoringService` |
| Selector | `ObjectNameSelector` | `AccountSelector` |
| Domain | `ObjectNameDomain` or `FeatureDomain` | `AccountDomain`, `LeadScoringDomain` |
| Test | `ClassName + Test` | `AccountServiceTest` |

## FSD Benefits

1. **Testability** — Each layer independently tested
   ```apex
   // Test selector in isolation
   List<Account> results = AccountSelector.selectById(new Set<Id>{accId});
   Assert.areEqual(1, results.size());
   ```

2. **Reusability** — Service called from many places
   ```apex
   // From trigger
   AccountService.updateAccounts(newAccounts);
   
   // From batch
   Database.executeBatch(new UpdateAccountsBatch());
   
   // From API
   public class AccountRestResource {
       AccountService.updateAccounts(parseIds(body));
   }
   ```

3. **Maintainability** — Clear ownership and responsibility
   - Bug in validator? → Check Domain
   - SOQL too slow? → Check Selector
   - Business logic flows wrong? → Check Service

4. **Scalability** — Can handle 1 record or 1 million
   ```apex
   // Same service handles trigger (100 records) and batch (5M records)
   AccountService.processAccounts(records);
   ```

## When to Use FSD

✅ **Use FSD when:**
- Complex business logic
- Multiple entry points (trigger, API, batch)
- CRUD/FLS security requirements
- Changes happen frequently
- Team needs to work independently

❌ **Don't need FSD when:**
- Simple org with 5 classes
- No business logic needed
- Never reused across contexts

## Key Takeaway

**FSD is the production-grade Salesforce architecture.** Each layer has one job: Trigger routes, Handler maps, Service orchestrates, Selector queries, Domain rules. This scales from startup to enterprise.
