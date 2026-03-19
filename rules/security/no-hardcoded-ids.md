# RULE: NO HARDCODED IDS

## Rule Statement
**Code MUST NEVER hardcode IDs (Accounts, Objects, Users, etc.). Use queries, metadata references, or org constants.**

Violation Level: **CRITICAL** — Breaks in different orgs

## Forbidden Patterns

### ❌ FORBIDDEN: Hardcoded Account ID
```apex
// VIOLATES RULE: ID hardcoded
public class LeadService {
    private static final String COMPANY_ACCOUNT_ID = '001D000000IRFmaIAH'; // Hard-coded!
    
    public static void linkedLeadToAccount(Lead lead) {
        lead.CompanyAccountId__c = COMPANY_ACCOUNT_ID; // WRONG
        update lead;
    }
}

// Problem:
// - Dev org: ID='001D000000IRFmaIAH' (may not exist)
// - QA org: ID='001D000000IRFmaIAH' (doesn't exist)
// - Prod: ID='001D000000IRFmaIAH' (doesn't exist)
// - Code fails or creates wrong relationships
```

### ❌ FORBIDDEN: Hardcoded User ID
```apex
public class TaskService {
    private static final String ADMIN_USER_ID = '005D0000000IqeJIAS'; // Hard-coded!
    
    public static void reassignTasks(List<Task> tasks) {
        for (Task t : tasks) {
            t.OwnerId = ADMIN_USER_ID; // WRONG - different org = different admin
        }
        update tasks;
    }
}
```

### ❌ FORBIDDEN: Hardcoded RecordType ID
```apex
public class OpportunityService {
    private static final String ENTERPRISE_RT_ID = '012D0000000IZ3aIAW'; // Hard-coded!
    
    public static void createEnterprise(Opportunity opp) {
        opp.RecordTypeId = ENTERPRISE_RT_ID; // WRONG - changes per org
        insert opp;
    }
}
```

### ❌ FORBIDDEN: Hardcoded Org-Specific ID
```apex
public class ConfigurationService {
    // All these are org-specific and will break in different orgs
    private static final String SANDBOX_ACCOUNT_ID = '001XX000001ABC';
    private static final String PROD_ACCOUNT_ID = '001YY000001DEF';
    private static final String PARTNER_RECORD_TYPE_ID = '012ZZ000001GHI';
}
```

## Correct Patterns

### Pattern 1: Query by Name
```apex
// ✅ CORRECT: Query by name (same in all orgs)
public class AccountSelector {
    public static Account selectByName(String name) {
        return [
            SELECT Id FROM Account 
            WHERE Name = :name 
            LIMIT 1
        ];
    }
}

// Usage
Account company = AccountSelector.selectByName('Acme Corp');
lead.CompanyAccountId__c = company.Id;
update lead;

// Benefits:
// - Works in all orgs (if account exists)
// - No hardcoded IDs
// - Self-documenting (clear intent)
// - Maintainable (no ID lookups needed)
```

### Pattern 2: Query by Unique Field
```apex
// ✅ CORRECT: Query by unique identifier
public class UserSelector {
    public static User selectByUsername(String username) {
        return [
            SELECT Id FROM User 
            WHERE Username = :username 
            LIMIT 1
        ];
    }
}

// Usage
User admin = UserSelector.selectByUsername('admin@acme.com');
task.OwnerId = admin.Id;
update task;

// ✅ ALSO CORRECT: Query by first/last name combination
User manager = [
    SELECT Id FROM User 
    WHERE FirstName = :firstName AND LastName = :lastName 
    LIMIT 1
];
```

### Pattern 3: RecordType Query
```apex
// ✅ CORRECT: Query RecordType by name
public class RecordTypeSelector {
    public static Id getRecordTypeId(String objectName, String recordTypeName) {
        return Schema.SObjectType.Opportunity
            .getRecordTypeInfosByName()
            .get(recordTypeName)
            .getRecordTypeId();
    }
}

// Usage (no SOQL needed, uses metadata!)
Id enterpriseRtId = RecordTypeSelector.getRecordTypeId('Opportunity', 'Enterprise');
opp.RecordTypeId = enterpriseRtId;
insert opp;

// Benefits:
// - No database query
// - Works in all orgs (org-level metadata)
// - Faster (no SOQL)
// - Safest approach for RecordTypes
```

### Pattern 4: org Constant / Custom Metadata
```apex
// ✅ CORRECT: Custom Metadata Type
// In Salesforce Setup: Create MDT "CompanyAccountMapping"
public class CompanyAccount {
    public static String COMPANY_NAME { get; set; }
    public static String COMPANY_INDUSTRY { get; set; }
    
    static {
        // Query metadata once
        List<Company_Account__mdt> metadata = [
            SELECT Company_Name__c, Industry__c FROM Company_Account__mdt LIMIT 1
        ];
        if (!metadata.isEmpty()) {
            COMPANY_NAME = metadata[0].Company_Name__c;
            COMPANY_INDUSTRY = metadata[0].Industry__c;
        }
    }
}

// Usage
Account company = [
    SELECT Id FROM Account 
    WHERE Name = :CompanyAccount.COMPANY_NAME 
    LIMIT 1
];
lead.CompanyAccountId__c = company.Id;
update lead;

// Benefits:
// - Configured in org (no code change)
// - Works across environments
// - Easy to update
// - No hardcoded IDs
```

### Pattern 5: Configuration Map
```apex
// ✅ CORRECT: Environment-aware configuration
public class Configuration {
    private static Map<String, String> ACCOUNTS_BY_NAME = new Map<String, String>();
    
    static {
        // Query once at class load
        for (Account acc : [SELECT Id, Name FROM Account WHERE Type = 'Company']) {
            ACCOUNTS_BY_NAME.put(acc.Name, acc.Id);
        }
    }
    
    public static String getAccountId(String accountName) {
        return ACCOUNTS_BY_NAME.get(accountName);
    }
}

// Usage
String companyId = Configuration.getAccountId('Acme Corp');
lead.CompanyAccountId__c = companyId;
update lead;

// Benefits:
// - No hardcoded IDs
// - Cached for performance
// - Works in any environment
// - Easy to lookup IDs
```

## Testing Pattern (Never Hardcode IDs in Tests)

```apex
// ❌ FORBIDDEN: Hardcoded IDs in test
@isTest
private class LeadServiceTest {
    @isTest
    static void testLinkedLeadToAccount() {
        Lead lead = new Lead(Name = 'Test', CompanyAccountId__c = '001D000000IRFmaIAH');
        LeadService.linkedLeadToAccount(lead);
        // ❌ ID hardcoded, may not exist in test org
    }
}

// ✅ CORRECT: Create data in test
@isTest
private class LeadServiceTest {
    @TestSetup
    static void setupTestData() {
        Account company = new Account(Name = 'Acme Corp');
        insert company;
    }
    
    @isTest
    static void testLinkedLeadToAccount() {
        Account company = [SELECT Id FROM Account WHERE Name = 'Acme Corp' LIMIT 1];
        Lead lead = new Lead(Name = 'Test', CompanyAccountId__c = company.Id);
        LeadService.linkedLeadToAccount(lead);
        
        System.assertNotEquals(null, lead.CompanyAccountId__c);
    }
}

// Benefits:
// - Test creates and uses real data
// - No hardcoded IDs
// - Self-contained (no org dependencies)
// - Repeatable in any org
```

## Violation Response

When code hardcodes IDs:

```
❌ VIOLATION DETECTED: Hardcoded ID

Your code:
public class LeadService {
    private static final String COMPANY_ACCOUNT_ID = '001D000000IRFmaIAH';
    
    public static void linkedLeadToAccount(Lead lead) {
        lead.CompanyAccountId__c = COMPANY_ACCOUNT_ID;
    }
}

Issues:
1. ID hardcoded (001D000000IRFmaIAH)
2. Dev org: ID might not exist
3. QA org: ID will break
4. Production: ID will break or link wrong data
5. Not reusable across orgs

Rewriting...

✅ Corrected:
// Option 1: Query by name
public class LeadService {
    public static void linkedLeadToAccount(Lead lead) {
        Account company = [
            SELECT Id FROM Account 
            WHERE Name = 'Acme Corp' 
            LIMIT 1
        ];
        lead.CompanyAccountId__c = company.Id;
    }
}

// Option 2: Custom Metadata (config-driven)
public class LeadService {
    public static void linkedLeadToAccount(Lead lead) {
        Lead_Company_Config__mdt config = [
            SELECT Company_Account_Name__c FROM Lead_Company_Config__mdt LIMIT 1
        ];
        Account company = [
            SELECT Id FROM Account 
            WHERE Name = :config.Company_Account_Name__c 
            LIMIT 1
        ];
        lead.CompanyAccountId__c = company.Id;
    }
}

Benefits:
✅ Works in all orgs
✅ No ID lookup needed
✅ Maintainable
✅ Self-documenting
```

## Audit Trail for Hardcoded IDs

```bash
# Find hardcoded IDs in codebase
grep -r "[0-9aA-zA-Z]\{15,18\}" --include="*.cls" --include="*.js"

# Look for patterns:
# '00D' - Org ID prefix
# '001' - Account ID prefix
# '003' - Contact ID prefix
# '006' - Opportunity ID prefix
# '005' - User ID prefix
# '012' - RecordType ID prefix

# All IDs found = Potential violations
```

## Key Takeaway
**Never hardcode IDs.** Query by name/identifier, use RecordType metadata API, or query custom metadata. This ensures code works in every org and environment.
