# Sharing Model — Record-Level Security

## OWD — Organization-Wide Defaults

Sets default access level for each object:

| Setting | What User Sees |
|---------|---|
| Public Read/Write | All records, can edit |
| Public Read Only | All records, read-only |
| Private | Only own + shared records |
| Controlled by Parent | Depends on parent record access |

```
Setup → Sharing Settings → Click to Edit
```

## Role Hierarchy

Determines who can see whose records.

```
CEO
├── VP Sales
│   ├── Sales Manager 1
│   │   └── Sales Rep 1
│   │   └── Sales Rep 2
│   └── Sales Manager 2
├── VP Operations
```

**Rule: Manager always sees reports' records regardless of OWD**

## Sharing Rules — Extend Access Beyond Hierarchy

```apex
// Setup → Sharing Rules
// Rule 1: Sales team sees all opportunities
// Rule 2: Executives see all accounts

// Criteria-based sharing:
// Share all opportunities with Stage = 'Closed Won' 
// with Finance team
```

## Manual Sharing — Record-by-record

```apex
// Share a specific record with a user
AccountShare share = new AccountShare();
share.AccountId = accountId;
share.UserOrGroupId = userId;
share.AccountAccessLevel = 'Edit';
share.OpportunityAccessLevel = 'Read';
insert share;

// Later, revoke access
delete share;
```

## Apex Sharing — Programmatic Access Control

```apex
public class ShareAccountAccess {
    
    public static void shareAccountWithUser(Id accountId, Id userId) {
        try {
            AccountShare share = new AccountShare();
            share.AccountId = accountId;
            share.UserOrGroupId = userId;
            share.AccountAccessLevel = 'Edit'; // Edit or Read
            share.OpportunityAccessLevel = 'Read';
            
            insert share;
            System.debug('Shared account ' + accountId + ' with user ' + userId);
            
        } catch (DmlException e) {
            System.debug('Error sharing: ' + e.getMessage());
        }
    }
    
    public static void revokeAccess(Id accountId, Id userId) {
        // Find and delete the share record
        List<AccountShare> shares = [
            SELECT Id FROM AccountShare
            WHERE AccountId = :accountId AND UserOrGroupId = :userId
        ];
        delete shares;
    }
}
```

## with sharing vs without sharing vs inherited sharing

### with sharing — Enforce User's Sharing

```apex
public with sharing class AccountService {
    
    public static List<Account> getMyAccounts() {
        // Query respects user's sharing rules
        return [
            SELECT Id, Name FROM Account
            // User only sees records they have access to
        ];
    }
}

// If user can't access an account → not returned
```

### without sharing — System Admin Access

```apex
public without sharing class BatchMigrationService {
    
    public static void migrateAllData() {
        // Query returns ALL records regardless of sharing
        List<Account> allAccounts = [
            SELECT Id, Name FROM Account
            // Returns even accounts user can't see
        ];
        
        // Use carefully! Can expose data to wrong users
    }
}

// ⚠️ Use only for: Batch jobs, system operations
```

### inherited sharing — Follow Caller's Context

```apex
public inherited sharing class GeneralService {
    
    public static List<Account> getAccounts() {
        // If called from with sharing → enforces sharing
        // If called from without sharing → no enforcement
        // Adapts to caller's context
        
        return [SELECT Id FROM Account];
    }
}

// ✅ BEST PRACTICE: Use inherited sharing for utility classes
```

## Sharing in Triggers

```apex
public class AccountTriggerHandler {
    
    private void afterInsert(List<Account> newAccounts) {
        // Share new accounts with team
        List<AccountShare> shares = new List<AccountShare>();
        
        for (Account a : newAccounts) {
            // Share with account owner's manager
            User owner = [SELECT ManagerId FROM User WHERE Id = :a.OwnerId];
            
            if (owner.ManagerId != null) {
                AccountShare share = new AccountShare();
                share.AccountId = a.Id;
                share.UserOrGroupId = owner.ManagerId;
                share.AccountAccessLevel = 'Read';
                shares.add(share);
            }
        }
        
        insert shares;
    }
}
```

## Complete Sharing Pattern

```apex
public inherited sharing class SharingService {
    
    /**
     * Grant user access to account
     */
    public static void grantAccess(Id accountId, Id userId, String accessLevel) {
        // Validate access level
        if (!isValidAccessLevel(accessLevel)) {
            throw new SharingException('Invalid access level: ' + accessLevel);
        }
        
        try {
            AccountShare share = new AccountShare();
            share.AccountId = accountId;
            share.UserOrGroupId = userId;
            share.AccountAccessLevel = accessLevel;
            insert share;
            
        } catch (DmlException e) {
            // Account might already be shared with this user
            if (e.getMessage().contains('INVALID_CROSS_REFERENCE_KEY')) {
                System.debug('User already has access');
            } else {
                throw new SharingException('Failed to grant access: ' + e.getMessage());
            }
        }
    }
    
    /**
     * Revoke user access from account
     */
    public static void revokeAccess(Id accountId, Id userId) {
        List<AccountShare> shares = [
            SELECT Id FROM AccountShare
            WHERE AccountId = :accountId AND UserOrGroupId = :userId
            LIMIT 1
        ];
        
        if (!shares.isEmpty()) {
            delete shares[0];
        }
    }
    
    /**
     * Check if user has access to account
     */
    public static Boolean hasAccess(Id accountId, Id userId) {
        List<AccountShare> shares = [
            SELECT Id FROM AccountShare
            WHERE AccountId = :accountId AND UserOrGroupId = :userId
            LIMIT 1
        ];
        
        return !shares.isEmpty();
    }
    
    private static Boolean isValidAccessLevel(String level) {
        Set<String> validLevels = new Set<String>{'Read', 'Edit'};
        return validLevels.contains(level);
    }
    
    public class SharingException extends Exception {}
}
```

## Public Groups for Bulk Sharing

```apex
// Share with a public group (multiple users at once)
public class BulkShare {
    
    public static void shareWithTeam(Id accountId, String groupName) {
        // Find the public group
        List<Group> groups = [
            SELECT Id FROM Group
            WHERE Name = :groupName AND Type = 'Regular'
        ];
        
        if (!groups.isEmpty()) {
            AccountShare share = new AccountShare();
            share.AccountId = accountId;
            share.UserOrGroupId = groups[0].Id; // Can be group ID
            share.AccountAccessLevel = 'Read';
            insert share;
        }
    }
}
```

## Key Sharing Concepts

| Concept | Purpose |
|---------|---------|
| OWD | Default access level |
| Role Hierarchy | Managers see reports |
| Sharing Rules | Grant access based on criteria |
| Manual Sharing | Share specific record with user |
| Apex Sharing | Programmatic access control |
| with sharing | Enforce user's sharing |
| without sharing | System admin access |
| inherited sharing | Follow caller's context |

## Key Takeaway

**Sharing is multi-layered:** OWD sets baseline, role hierarchy provides hierarchy access, sharing rules extend access based on criteria, manual sharing is per-record, and Apex enforces it programmatically. Use inherited sharing in utilities, with sharing in queries, without sharing only for batch jobs.
