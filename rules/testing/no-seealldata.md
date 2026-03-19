# RULE: NO SEEALLDATA=TRUE

## Rule Statement
**Tests MUST NOT use SeeAllData=true. Create test data via TestDataFactory. This enables data isolation.**

Violation Level: **HIGH** — Data isolation required for reliable tests

## Forbidden Pattern

```apex
// ❌ FORBIDDEN: SeeAllData=true
@isTest
private class LeadServiceTest {
    @isTest(SeeAllData=true)
    static void testProcessLeads() {
        // Can see all org data - VIOLATES RULE
        List<Lead> leads = [SELECT Id FROM Lead]; // Org's actual leads!
        LeadService.processLeads(leads);
        
        // Test depends on org state
        // If org has no leads → Test passes but doesn't test logic
        // If org leads are stale → Test fails unpredictably
        // If org data changes → Test breaks
    }
}

// ❌ FORBIDDEN: Any SeeAllData usage
@isTest(SeeAllData=true)
public class AccountServiceTest {
    // All tests can see org data - DANGEROUS
}
```

## Required TestDataFactory Pattern

```apex
// ✅ CORRECT: Centralized factory
@isTest
private class TestDataFactory {
    public static Lead createLead(String name, String email) {
        return new Lead(
            FirstName = 'Test',
            LastName = name,
            Email = email,
            Status = 'Open',
            Company = 'Test Company'
        );
    }
    
    public static List<Lead> createLeads(Integer count) {
        List<Lead> leads = new List<Lead>();
        for (Integer i = 0; i < count; i++) {
            leads.add(createLead('Lead' + i, 'lead' + i + '@test.com'));
        }
        return leads;
    }
    
    public static Account createAccount(String name, String industry) {
        return new Account(
            Name = name,
            Industry = industry,
            AnnualRevenue = 1000000
        );
    }
}

// ✅ CORRECT: Using factory
@isTest
private class LeadServiceTest {
    @isTest
    static void testProcessLeads() {
        // Only test data (no SeeAllData needed)
        List<Lead> leads = TestDataFactory.createLeads(10);
        insert leads; // Insert into test context only
        
        Test.startTest();
        LeadService.processLeads(leads);
        Test.stopTest();
        
        // Assert on test data
        List<Lead> updated = [SELECT Id, Status FROM Lead WHERE Id IN :leads];
        System.assertEquals(10, updated.size());
    }
}
```

## TestSetup Pattern

```apex
// ✅ CORRECT: @TestSetup for shared data
@isTest
private class LeadServiceTest {
    @TestSetup
    static void setupTestData() {
        // Runs once, shared by all test methods
        List<Lead> leads = TestDataFactory.createLeads(100);
        insert leads;
    }
    
    @isTest
    static void testProcessLeads() {
        // All 100 leads available without insertion
        List<Lead> leads = [SELECT Id FROM Lead];
        LeadService.processLeads(leads);
        
        // Assert
        System.assertEquals(100, [SELECT COUNT() FROM Lead]);
    }
    
    @isTest
    static void testProcessLeadsWithValidation() {
        // Different test, same setup data (fresh copy)
        List<Lead> leads = [SELECT Id FROM Lead LIMIT 50];
        LeadService.validateLeads(leads);
        
        // Assert
        System.assertEquals(50, leads.size());
    }
}
```

## Complex Object Graph

```apex
// ✅ CORRECT: Nested object creation
@isTest
private class AccountServiceTest {
    @TestSetup
    static void setupTestData() {
        // Create accounts with related contacts
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 5; i++) {
            accounts.add(new Account(Name = 'Account' + i));
        }
        insert accounts;
        
        // Create related contacts
        List<Contact> contacts = new List<Contact>();
        for (Account acc : accounts) {
            for (Integer j = 0; j < 3; j++) {
                contacts.add(new Contact(
                    AccountId = acc.Id,
                    FirstName = 'Contact',
                    LastName = acc.Name + j,
                    Email = 'contact' + j + '@' + acc.Name + '.com'
                ));
            }
        }
        insert contacts;
    }
    
    @isTest
    static void testAccountWithContacts() {
        Map<Id, List<Contact>> contactsByAccountId = new Map<Id, List<Contact>>();
        for (Contact c : [SELECT Id, AccountId FROM Contact]) {
            if (!contactsByAccountId.containsKey(c.AccountId)) {
                contactsByAccountId.put(c.AccountId, new List<Contact>());
            }
            contactsByAccountId.get(c.AccountId).add(c);
        }
        
        AccountService.processAccounts(contactsByAccountId);
        System.assertEquals(5, contactsByAccountId.size());
    }
}
```

## Violation Response

When code uses SeeAllData=true:

```
❌ VIOLATION DETECTED: SeeAllData=true usage

Your code:
@isTest(SeeAllData=true)
private class LeadServiceTest {
    @isTest
    static void testProcessLeads() {
        List<Lead> leads = [SELECT Id FROM Lead]; // Org's real leads!
        LeadService.processLeads(leads);
    }
}

Issues:
1. Test depends on org state (fragile)
2. Test may pass in dev org, fail in production
3. Data isolation violated
4. Cannot run concurrently with other tests
5. Non-deterministic

Correcting...

✅ Corrected:
@isTest
private class LeadServiceTest {
    @TestSetup
    static void setupTestData() {
        List<Lead> leads = TestDataFactory.createLeads(10);
        insert leads;
    }
    
    @isTest
    static void testProcessLeads() {
        List<Lead> leads = [SELECT Id FROM Lead];
        LeadService.processLeads(leads);
        
        List<Lead> updated = [SELECT Id, Status FROM Lead];
        System.assertEquals(10, updated.size());
    }
}

Benefits:
✅ Data isolated to test
✅ Deterministic (always 10 leads)
✅ Can run with other tests
✅ Same behavior in all orgs
```

## Best Practices

✅ Always use @TestSetup for shared data
✅ Use TestDataFactory for all object creation
✅ Never reference org data directly
✅ All data created in test → cleaned up after @isTest method
✅ Tests run in isolated context (no SeeAllData needed)
✅ Predictable, repeatable, concurrent-safe

## Key Takeaway
**SeeAllData=true breaks test isolation.** Use @TestSetup + TestDataFactory instead. Tests become deterministic, repeatable, and production-safe.
