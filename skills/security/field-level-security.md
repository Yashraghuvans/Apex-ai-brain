# Field-Level Security — Protecting Sensitive Data

## Three Approaches to FLS

### Approach 1: WITH SECURITY_ENFORCED (Recommended)

Add to SOQL to enforce FLS at query time:

```apex
// ✅ BEST: Query-time enforcement
List<Account> accounts = [
    SELECT Id, Name, BillingCity, Sensitive_Field__c
    FROM Account
    WHERE Id IN :accountIds
    WITH SECURITY_ENFORCED
];

// If user can't read ANY of these fields → throws QueryException
// If user can't read Account object → throws QueryException
```

### Approach 2: stripInaccessible() (When fields vary)

Remove inaccessible fields from results:

```apex
// For read access
List<Account> accounts = [SELECT * FROM Account];
accounts = (List<Account>) Security.stripInaccessible(
    AccessType.READABLE,
    accounts
);

// For update access
accounts = (List<Account>) Security.stripInaccessible(
    AccessType.UPDATABLE,
    accounts
);
```

### Approach 3: Manual Field Checks

Check individual fields when needed:

```apex
public static Boolean canReadField(SObjectType objType, String fieldName) {
    SObjectField field = objType.getDescribe()
        .fields.getMap()
        .get(fieldName);
    
    if (field == null) return false;
    
    return field.getDescribe().isAccessible();
}

public static Boolean canUpdateField(SObjectType objType, String fieldName) {
    SObjectField field = objType.getDescribe()
        .fields.getMap()
        .get(fieldName);
    
    if (field == null) return false;
    
    return field.getDescribe().isUpdateable();
}
```

## FLS Enforcement Patterns

### Pattern 1: Query with WITH SECURITY_ENFORCED

```apex
public inherited sharing class AccountSelector {
    
    public static List<Account> selectById(Set<Id> accountIds) {
        try {
            return [
                SELECT Id, Name, BillingCity, Phone
                FROM Account
                WHERE Id IN :accountIds
                WITH SECURITY_ENFORCED
            ];
        } catch (QueryException e) {
            if (e.getMessage().contains('INVALID_FIELD')) {
                throw new SelectorException('User cannot access one or more fields', e);
            }
            throw new SelectorException('Query failed: ' + e.getMessage(), e);
        }
    }
}
```

### Pattern 2: Update with stripInaccessible

```apex
public inherited sharing class AccountService {
    
    public static void updateAccounts(List<Account> accounts) {
        try {
            // Strip out fields user can't update
            accounts = (List<Account>) Security.stripInaccessible(
                AccessType.UPDATABLE,
                accounts
            );
            
            if (accounts.isEmpty()) {
                throw new ServiceException('No accessible fields to update');
            }
            
            update accounts;
            
        } catch (DmlException e) {
            throw new ServiceException('Update failed: ' + e.getMessage(), e);
        }
    }
}
```

### Pattern 3: Create with FLS Check

```apex
public inherited sharing class LeadService {
    
    public static void createLeads(List<Lead> leads) {
        // Check CREATE permission
        if (!Lead.sObjectType.getDescribe().isCreateable()) {
            throw new ServiceException('Cannot create Lead');
        }
        
        // Strip inaccessible fields
        leads = (List<Lead>) Security.stripInaccessible(
            AccessType.CREATABLE,
            leads
        );
        
        insert leads;
    }
}
```

## Complete FLS Implementation

```apex
public inherited sharing class SecureAccountService {
    
    public class SecureAccountException extends Exception {}
    
    /**
     * Safely query accounts with full FLS enforcement
     */
    public static List<Account> getAccounts(List<String> fieldNames) {
        // Build dynamic query with only FLS-allowed fields
        String queryStr = buildSecureQuery(fieldNames);
        
        return Database.query(queryStr, AccessLevel.USER_MODE);
        // USER_MODE enforces user's FLS and sharing
    }
    
    /**
     * Update accounts with FLS enforcement
     */
    public static void updateAccounts(List<Account> accounts, List<String> fieldNames) {
        // Verify user can update needed fields
        for (String fieldName : fieldNames) {
            if (!canUpdateField(fieldName)) {
                throw new SecureAccountException('Cannot update field: ' + fieldName);
            }
        }
        
        // Keep only specified fields
        for (Account a : accounts) {
            SObjectType accountType = Account.sObjectType;
            Map<String, Object> fieldsToUpdate = new Map<String, Object>();
            
            for (String fieldName : fieldNames) {
                Object value = a.get(fieldName);
                if (value != null) {
                    fieldsToUpdate.put(fieldName, value);
                }
            }
        }
        
        // Update with stripInaccessible
        accounts = (List<Account>) Security.stripInaccessible(
            AccessType.UPDATABLE,
            accounts
        );
        
        update accounts;
    }
    
    /**
     * Check if user can read a field
     */
    private static Boolean canReadField(String fieldName) {
        SObjectField field = Account.sObjectType.getDescribe()
            .fields.getMap()
            .get(fieldName);
        
        return field != null && field.getDescribe().isAccessible();
    }
    
    /**
     * Check if user can update a field
     */
    private static Boolean canUpdateField(String fieldName) {
        SObjectField field = Account.sObjectType.getDescribe()
            .fields.getMap()
            .get(fieldName);
        
        return field != null && field.getDescribe().isUpdateable();
    }
    
    /**
     * Build query string checking every field's FLS
     */
    private static String buildSecureQuery(List<String> fieldNames) {
        String query = 'SELECT ';
        List<String> allowedFields = new List<String>();
        
        for (String fieldName : fieldNames) {
            if (canReadField(fieldName)) {
                allowedFields.add(fieldName);
            }
        }
        
        if (allowedFields.isEmpty()) {
            throw new SecureAccountException('No readable fields available');
        }
        
        query += String.join(allowedFields, ',');
        query += ' FROM Account WITH SECURITY_ENFORCED';
        
        return query;
    }
}
```

## FLS in Tests

```apex
@isTest
private class FLSEnforcementTest {
    
    @isTest
    static void testCannotReadRestrictedField() {
        // Create user with restricted FLS
        User restrictedUser = new User(
            Username = 'restricted@test.com',
            Email = 'test@test.com',
            LastName = 'Test',
            Alias = 'test',
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1].Id
        );
        insert restrictedUser;
        
        System.runAs(restrictedUser) {
            try {
                // This assumes Sensitive__c field is hidden from this user
                List<Account> accounts = [
                    SELECT Id, Name, Sensitive__c
                    FROM Account
                    WITH SECURITY_ENFORCED
                ];
                Assert.fail('Should have thrown exception');
            } catch (QueryException e) {
                Assert.isTrue(e.getMessage().contains('INVALID_FIELD'));
            }
        }
    }
}
```

## Common FLS Mistakes

| ❌ Mistake | ✅ Fix |
|-----------|--------|
| Reading field without FLS check | Use `WITH SECURITY_ENFORCED` or `stripInaccessible` |
| Assuming all users see all fields | Every user has different FLS |
| Querying sensitive data | Add to FLS restrictions in Setup |
| Exposing restricted field in API | Use `stripInaccessible` before returning |
| Not checking create permission | Always check before insert |
| Not validating field exists | Use `stripInaccessible` |

## Performance: FLS at Query Time

```apex
// ❌ SLOW: Fetch all, strip after
List<Account> allAccounts = [SELECT * FROM Account];
allAccounts = (List<Account>) Security.stripInaccessible(AccessType.READABLE, allAccounts);

// ✅ FAST: Restrict at query
List<Account> accounts = [
    SELECT Id, Name FROM Account
    WITH SECURITY_ENFORCED
];
```

## Key Takeaway

**Always enforce FLS when handling sensitive data.** Use `WITH SECURITY_ENFORCED` in queries when all fields are known and critical. Use `stripInaccessible()` when fields vary by user. Every Salesforce deployment handles sensitive data — make FLS enforcement automatic in every service method.
