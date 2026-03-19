# Test Data Factory — Building Reusable Test Data

## The Pattern

Centralized factory creates consistent, reusable test data.

```apex
/**
 * TestDataFactory
 * Centralized test data creation
 * Benefits:
 * - Reusable across all test classes
 * - Consistent structure
 * - Easy maintenance (change once, affects all tests)
 * - Complex object graphs simplified
 */
@isTest
public class TestDataFactory {
    
    /**
     * Create single test account
     */
    public static Account createTestAccount(String name) {
        return new Account(
            Name = name,
            BillingCountry = 'USA',
            Type = 'Prospect',
            Industry = 'Technology',
            AnnualRevenue = 1000000
        );
    }
    
    /**
     * Create multiple accounts efficiently
     */
    public static List<Account> createTestAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(new Account(
                Name = 'Test Account ' + i,
                BillingCountry = 'USA'
            ));
        }
        return accounts;
    }
    
    /**
     * Create contact for account
     */
    public static Contact createTestContact(Id accountId, String email) {
        return new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            AccountId = accountId,
            Email = email
        );
    }
    
    /**
     * Create multiple contacts for account
     */
    public static List<Contact> createTestContactsForAccount(Id accountId, Integer count) {
        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < count; i++) {
            contacts.add(new Contact(
                FirstName = 'Contact',
                LastName = 'Test ' + i,
                AccountId = accountId,
                Email = 'contact' + i + '@test.com'
            ));
        }
        return contacts;
    }
}
```

## Complex Object Graphs

Building related objects efficiently:

```apex
public class TestDataFactory {
    
    /**
     * Create complete object graph:
     * Account → Contacts → Opportunities
     */
    public static Map<String, Object> createCompleteStructure() {
        Map<String, Object> data = new Map<String, Object>();
        
        // Create account
        Account account = new Account(Name = 'Test Corp', BillingCountry = 'USA');
        insert account;
        data.put('account', account);
        
        // Create contacts under account
        List<Contact> contacts = createTestContactsForAccount(account.Id, 3);
        insert contacts;
        data.put('contacts', contacts);
        
        // Create opportunities under account
        List<Opportunity> opportunities = new List<Opportunity>();
        for (Integer i = 0; i < 2; i++) {
            opportunities.add(new Opportunity(
                Name = 'Opp ' + i,
                AccountId = account.Id,
                Amount = 50000,
                StageName = 'Prospecting',
                CloseDate = System.today().addDays(30)
            ));
        }
        insert opportunities;
        data.put('opportunities', opportunities);
        
        return data;
    }
    
    /**
     * Create related records for a specific test scenario
     */
    public static Map<String, Id> createLeadScoringTestData() {
        Map<String, Id> ids = new Map<String, Id>();
        
        // Create account
        Account acc = createTestAccount('Scoring Test');
        insert acc;
        ids.put('accountId', acc.Id);
        
        // Create contacts
        List<Contact> contacts = createTestContactsForAccount(acc.Id, 2);
        insert contacts;
        ids.put('contact1Id', contacts[0].Id);
        ids.put('contact2Id', contacts[1].Id);
        
        // Create opportunities
        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = acc.Id,
            Amount = 100000,
            StageName = 'Negotiation/Review',
            CloseDate = System.today()
        );
        insert opp;
        ids.put('opportunityId', opp.Id);
        
        return ids;
    }
}
```

## Using TestDataFactory in Tests

### Simple Usage

```apex
@isTest
private class AccountServiceTest {
    
    @isTest
    static void testUpdateAccountName() {
        // Create test data using factory
        Account testAccount = TestDataFactory.createTestAccount('Original Name');
        insert testAccount;
        
        // Execute test
        testAccount.Name = 'Updated Name';
        update testAccount;
        
        // Assert
        Account result = [SELECT Name FROM Account WHERE Id = :testAccount.Id];
        Assert.areEqual('Updated Name', result.Name);
    }
}
```

### Complex Structure Usage

```apex
@isTest
private class LeadScoringTest {
    
    @isTest
    static void testScoringWithMultipleRecords() {
        // Get complete test data
        Map<String, Id> testData = TestDataFactory.createLeadScoringTestData();
        Id accountId = testData.get('accountId');
        
        // Create lead
        Lead testLead = new Lead(
            FirstName = 'Test',
            LastName = 'Lead',
            Company = 'Test Corp',
            Email = 'lead@test.com'
        );
        insert testLead;
        
        // Execute scoring service
        Test.startTest();
        LeadScoringService.scoreLead(testLead.Id);
        Test.stopTest();
        
        // Assert
        Lead result = [SELECT Score__c FROM Lead WHERE Id = :testLead.Id];
        Assert.isNotNull(result.Score__c);
        Assert.isTrue(result.Score__c > 0);
    }
}
```

## Avoiding Hardcoded Data

### ❌ BAD: Hardcoded values scattered in tests

```apex
@isTest
static void testAccountProcessing() {
    // Hardcoded values everywhere
    Account account = new Account(
        Name = 'Test Account',
        BillingCity = 'San Francisco',
        BillingCountry = 'USA',
        Industry = 'Technology',
        Type = 'Prospect'
    );
    insert account;
    
    // If this data needs to change, must update every test
}
```

### ✅ GOOD: Factory handles all data

```apex
@isTest
static void testAccountProcessing() {
    // Single factory call
    Account account = TestDataFactory.createTestAccount('Test Account');
    insert account;
    
    // If data needs to change, update factory once
}
```

## Building Complex Object Graphs

```apex
public class ComplexTestDataFactory {
    
    /**
     * Create invoice with line items
     */
    public static Invoice__c createInvoiceWithLineItems(Integer itemCount) {
        // Create parent invoice
        Invoice__c invoice = new Invoice__c(
            Invoice_Date__c = System.today(),
            Amount__c = 0
        );
        insert invoice;
        
        // Create line items
        List<Invoice_Line_Item__c> lineItems = new List<Invoice_Line_Item__c>();
        for (Integer i = 0; i < itemCount; i++) {
            lineItems.add(new Invoice_Line_Item__c(
                Invoice__c = invoice.Id,
                Description__c = 'Line ' + i,
                Unit_Price__c = 100,
                Quantity__c = i + 1
            ));
        }
        insert lineItems;
        
        // Update invoice total
        Decimal total = 0;
        for (Invoice_Line_Item__c item : lineItems) {
            total += item.Unit_Price__c * item.Quantity__c;
        }
        invoice.Amount__c = total;
        update invoice;
        
        return invoice;
    }
    
    /**
     * Create account with full hierarchy
     */
    public static Account createAccountHierarchy() {
        // Parent account
        Account parent = new Account(
            Name = 'Parent Account',
            BillingCountry = 'USA'
        );
        insert parent;
        
        // Child accounts
        List<Account> children = new List<Account>();
        for (Integer i = 0; i < 3; i++) {
            children.add(new Account(
                Name = 'Child Account ' + i,
                ParentId = parent.Id,
                BillingCountry = 'USA'
            ));
        }
        insert children;
        
        // If you need to return this for further use:
        parent = [
            SELECT Id, Name,
                   (SELECT Id, Name FROM ChildAccounts)
            FROM Account
            WHERE Id = :parent.Id
        ];
        
        return parent;
    }
}
```

## Test Setup Strategy

Use @TestSetup for shared data, factory helpers for specific needs:

```apex
@isTest
private class OrderProcessingTest {
    
    // Shared test data (runs once)
    @TestSetup
    static void setupOrderData() {
        // Create 10 test orders
        List<Order__c> orders = new List<Order__c>();
        for (Integer i = 0; i < 10; i++) {
            orders.add(new Order__c(
                Order_Number__c = 'ORD-' + i,
                Status__c = 'Pending'
            ));
        }
        insert orders;
    }
    
    // Individual test method needs special data
    @isTest
    static void testOrderApproval() {
        // Get shared data
        List<Order__c> orders = [SELECT Id FROM Order__c];
        
        // Plus create special order just for this test
        Order__c specialOrder = new Order__c(
            Order_Number__c = 'SPECIAL-1',
            Status__c = 'Pending',
            Amount__c = 1000000 // Large amount for special test
        );
        insert specialOrder;
        
        // Test logic
        OrderService.approveOrder(specialOrder.Id);
        
        // Assert
        Order__c result = [SELECT Status__c FROM Order__c WHERE Id = :specialOrder.Id];
        Assert.areEqual('Approved', result.Status__c);
    }
}
```

## Factory Best Practices

✅ **Create factory methods for each object type**
✅ **Use descriptive method names** (createTestAccountWithContacts)
✅ **Provide default values** in factory
✅ **Allow parameter overrides** when needed
✅ **Don't insert in factory** — let tests control when records are created
✅ **Keep factory focused** — don't add business logic
✅ **Reuse across test classes** — centralize in one factory

## Key Takeaway

**TestDataFactory eliminates hardcoded test data and makes tests maintainable.** Create once, use everywhere. When business requirements change, update factory once and all tests adapt automatically.
