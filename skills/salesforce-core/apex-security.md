# Apex Security — CRUD, FLS, Sharing

## Overview

Salesforce enforces security at the platform level, but Apex runs as "system admin" by default. Every Apex method must enforce security for the user executing it.

## The Three Security Pillars

### Pillar 1: CRUD — Object-Level Security

CRUD = Create, Read, Update, Delete permissions on objects.

#### ❌ WRONG: No CRUD check

```apex
public class AccountService {
    public static void updateAccounts(List<Account> accounts) {
        // What if user can't update accounts?
        // This silently fails or throws uncaught exception
        update accounts;
    }
}
```

#### ✅ CORRECT: Check CRUD upfront

```apex
public class AccountService {
    public static void updateAccounts(List<Account> accounts) {
        // Check if user has update permission
        if (!Account.sObjectType.getDescribe().isUpdateable()) {
            throw new SecurityException('Cannot update Account');
        }
        update accounts;
    }
    
    // Reusable CRUD check
    private static Boolean hasCRUDAccess(SObjectType objType) {
        DescribeSObjectResult describe = objType.getDescribe();
        return describe.isCreateable() && 
               describe.isUpdateable() && 
               describe.isDeletable() &&
               describe.isReadable();
    }
}
```

#### CRUD Check Patterns

```apex
// Check create permission
if (!Account.sObjectType.getDescribe().isCreateable()) {
    throw new SecurityException('Cannot create Account');
}

// Check read permission
if (!Opportunity.sObjectType.getDescribe().isReadable()) {
    throw new SecurityException('Cannot read Opportunity');
}

// Check delete permission
if (!Contact.sObjectType.getDescribe().isDeletable()) {
    throw new SecurityException('Cannot delete Contact');
}

// Check all at once
SObjectType objType = Lead.sObjectType;
DescribeSObjectResult describe = objType.getDescribe();
if (!describe.isReadable() || !describe.isCreateable() || !describe.isUpdateable()) {
    throw new SecurityException('Insufficient permissions');
}
```

### Pillar 2: FLS — Field-Level Security

FLS = Field-level permissions on specific fields, even if you have object access.

#### ❌ WRONG: No FLS check

```apex
public class AccountService {
    public static List<Account> getAccounts() {
        return [
            SELECT Id, Name, Sensitive_Field__c  // User might not see this field!
            FROM Account
        ];
    }
}
```

#### ✅ CORRECT: Use stripInaccessible()

```apex
public class AccountService {
    public static List<Account> getAccounts() {
        List<Account> accounts = [
            SELECT Id, Name, Sensitive_Field__c, Phone, Website
            FROM Account
        ];
        
        // Remove inaccessible fields
        return (List<Account>) Security.stripInaccessible(
            AccessType.READABLE,
            accounts
        );
    }
}

// For updates: use AccessType.UPDATABLE
public static void updateAccounts(List<Account> accounts) {
    accounts = (List<Account>) Security.stripInaccessible(
        AccessType.UPDATABLE,
        accounts
    );
    update accounts;
}
```

#### FLS: Query Time Alternative

```apex
public static List<Account> getAccounts() {
    // WITH SECURITY_ENFORCED added to SOQL
    return [
        SELECT Id, Name, BillingCity
        FROM Account
        WITH SECURITY_ENFORCED
    ];
}

// Now if user can't read any of these fields, query throws exception
// If user can't read the object, query throws exception
```

#### FLS: Manual Field Check

```apex
public static void checkFieldAccess(SObjectType objType, String fieldName) {
    SObjectField field = objType.getDescribe()
        .fields.getMap()
        .get(fieldName);
    
    if (field == null) {
        throw new FieldAccessException('Field does not exist: ' + fieldName);
    }
    
    DescribeFieldResult fieldDescribe = field.getDescribe();
    if (!fieldDescribe.isAccessible()) {
        throw new FieldAccessException('Cannot read field: ' + fieldName);
    }
    if (!fieldDescribe.isUpdateable()) {
        throw new FieldAccessException('Cannot update field: ' + fieldName);
    }
}
```

### Pillar 3: Sharing — Record-Level Security

Sharing = User can see/modify specific records based on role hierarchy, sharing rules, OWD.

#### Sharing Models

```apex
public class AccountService {
    // Method runs with user's sharing (can only access accessible records)
    public with sharing static List<Account> getMyAccounts() {
        return [SELECT Id, Name FROM Account];
        // Only returns records user has access to
    }
    
    // Method runs as system admin (ignores sharing rules)
    public without sharing static List<Account> getAllAccounts() {
        return [SELECT Id, Name FROM Account];
        // Returns ALL accounts, even those user shouldn't see
    }
    
    // Inherited from caller (best practice)
    public inherited sharing static List<Account> getManagedAccounts() {
        return [SELECT Id, Name FROM Account];
        // Respects caller's sharing context
    }
}
```

#### When to Use Each

| Keyword | Use Case | Example |
|---------|----------|---------|
| `with sharing` | Normal user context | Service called from UI |
| `without sharing` | System operations | Batch job creating records |
| `inherited sharing` | Most flexible | Any service/utility class |

## Complete Security Implementation

```apex
public inherited sharing class AccountService {
    
    public class AccountServiceException extends Exception {}
    
    /**
     * Safely query accounts with all security checks
     */
    public static List<Account> getAccounts() {
        // Check object access
        if (!Account.sObjectType.getDescribe().isReadable()) {
            throw new AccountServiceException('Cannot read Account');
        }
        
        // Query with security enforcement
        List<Account> accounts = [
            SELECT Id, Name, BillingCity, Phone
            FROM Account
            WITH SECURITY_ENFORCED
            LIMIT 10000
        ];
        
        // Strip any fields user doesn't have access to
        accounts = (List<Account>) Security.stripInaccessible(
            AccessType.READABLE,
            accounts
        );
        
        return accounts;
    }
    
    /**
     * Safely update accounts with all security checks
     */
    public static void updateAccounts(List<Account> accounts) {
        // Check object access
        if (!Account.sObjectType.getDescribe().isUpdateable()) {
            throw new AccountServiceException('Cannot update Account');
        }
        
        // Strip inaccessible fields before update
        accounts = (List<Account>) Security.stripInaccessible(
            AccessType.UPDATABLE,
            accounts
        );
        
        if (accounts.isEmpty()) {
            throw new AccountServiceException('No accessible fields to update');
        }
        
        update accounts;
    }
}
```

## SOQL Injection Prevention

SOQL injection is when user input flows directly into SOQL:

#### ❌ VULNERABLE: String concatenation

```apex
String userInput = getUserInput(); // "'; DROP TABLE Account; --"

// VULNERABLE: User input directly in query
List<Account> accounts = Database.query(
    'SELECT Id FROM Account WHERE Name = ' + userInput
);
// User could inject SOQL code!
```

#### ✅ SAFE: Bind variables

```apex
String userInput = getUserInput();

// SAFE: Bind variables prevent injection
List<Account> accounts = [
    SELECT Id FROM Account WHERE Name = :userInput
];
// User input is treated as value only, not code
```

#### ✅ SAFE: Escape if dynamic SOQL required

```apex
String fieldName = getUserInput(); // Could be anything
String userValue = getUserInput2();

// If you MUST build dynamic SOQL:
String query = 'SELECT Id FROM Account WHERE ' +
    String.escapeSingleQuotes(fieldName) + ' = :userValue';

List<Account> accounts = Database.query(query);
```

## Hard-Coded IDs Anti-Pattern

#### ❌ WRONG: Hard-coded IDs

```apex
public class CriticalService {
    private static final String ADMIN_USER_ID = '005xx000001SZ9AAM';
    private static final String SYSTEM_ACCOUNT_ID = '001xx000003DHP1AAM';
    
    public static void runCriticalProcess() {
        User admin = [SELECT Id FROM User WHERE Id = :ADMIN_USER_ID];
        Account systemAccount = [SELECT Id FROM Account WHERE Id = :SYSTEM_ACCOUNT_ID];
        
        // This breaks in every sandbox, every org, every deployment!
    }
}
```

#### ✅ CORRECT: Query by characteristics

```apex
public class CriticalService {
    public static void runCriticalProcess() {
        // Query admin user by name/email
        User admin = [
            SELECT Id FROM User 
            WHERE Email = 'admin@company.com' 
            AND IsActive = true
            LIMIT 1
        ];
        
        // Query system account by name
        Account systemAccount = [
            SELECT Id FROM Account
            WHERE Name = 'System Account'
            WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }
}
```

## Security Checklist for Every Service Method

- [ ] Check CRUD: `if (!SObject.sObjectType.getDescribe().isReadable())`
- [ ] Use `WITH SECURITY_ENFORCED` in SOQL
- [ ] Use `stripInaccessible()` before returning/updating data
- [ ] Use `inherited sharing` on class
- [ ] Use bind variables `:variable` in SOQL
- [ ] Never hard-code IDs
- [ ] Never trust user input — always escape or bind
- [ ] Log security violations for audit

## Key Takeaway

**Security in Apex is not optional. Every method must assume the user executing it has restricted permissions.** Always check CRUD, enforce FLS, and use `inherited sharing`. The three pillars — CRUD, FLS, Sharing — protect your users and org data.
