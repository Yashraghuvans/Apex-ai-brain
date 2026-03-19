# Apex TDD — Test-Driven Development

## TDD Cycle

### Red → Green → Refactor

```
1. RED: Write failing test first
   - Test describes desired behavior
   - Code doesn't exist yet — test fails

2. GREEN: Write minimal code to pass test
   - Just enough code to make test pass
   - Don't worry about elegance

3. REFACTOR: Improve code while keeping tests passing
   - Refactor for clarity, performance, maintainability
   - Tests ensure nothing breaks
```

## Test First Workflow

### Example: Lead Scoring Service

#### 1. RED — Write Failing Test

```apex
@isTest
private class LeadScoringServiceTest {
    
    @isTest
    static void testScoreLead() {
        // ARRANGE
        Lead testLead = new Lead(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'john@example.com',
            Company = 'Acme Corp'
        );
        insert testLead;
        
        // ACT
        LeadScoringService.scoreLead(testLead.Id);
        
        // ASSERT
        Lead scoredLead = [SELECT Score__c FROM Lead WHERE Id = :testLead.Id];
        Assert.isNotNull(scoredLead.Score__c, 'Score should be set');
        Assert.isTrue(scoredLead.Score__c > 0, 'Score should be positive');
    }
}

// Test fails because LeadScoringService doesn't exist yet ❌
```

#### 2. GREEN — Write Minimal Code

```apex
// Minimal implementation to make test pass
public class LeadScoringService {
    
    public static void scoreLead(Id leadId) {
        Lead lead = [SELECT Id FROM Lead WHERE Id = :leadId];
        lead.Score__c = 50; // Just enough to pass test
        update lead;
    }
}

// Test passes ✅
```

#### 3. REFACTOR — Build Real Implementation

```apex
// Now add the real logic
public class LeadScoringService {
    
    public static void scoreLead(Id leadId) {
        Lead lead = [SELECT Id, Email, Company FROM Lead WHERE Id = :leadId];
        
        Integer score = 0;
        
        // Score based on email domain
        if (lead.Email != null && lead.Email.endsWith('@company.com')) {
            score += 50;
        }
        
        // Score based on company
        if (lead.Company != null && lead.Company.length() > 10) {
            score += 25;
        }
        
        lead.Score__c = score;
        update lead;
    }
}

// Test still passes ✅
```

## What to Test

### ✅ TEST These

- **Business logic** — Rules, calculations, validations
- **Happy path** — Normal operation
- **Negative cases** — Error conditions, invalid input
- **Boundaries** — Empty, null, max size
- **Edge cases** — Unusual but valid scenarios

### ❌ DON'T Test These

- Salesforce framework (SF already tests this)
- Getters/setters (trivial)
- 100% code coverage (test what matters)
- Unrelated code (focus on your class)

## Test Structure: Arrange, Act, Assert

```apex
@isTest
static void testValidateAccount() {
    // ARRANGE: Set up test data
    Account testAccount = new Account(
        Name = 'Test Company',
        BillingCountry = 'USA'
    );
    insert testAccount;
    
    // ACT: Execute the code being tested
    AccountDomain domain = new AccountDomain(new List<Account>{testAccount});
    domain.validate();
    
    // ASSERT: Check results
    List<Account> result = domain.getRecords();
    Assert.areEqual(1, result.size(), 'Should contain 1 account');
    Assert.areEqual('Test Company', result[0].Name, 'Name should match');
}
```

## Test Isolation — @TestSetup vs Helpers

### @TestSetup — Shared Data

```apex
@TestSetup
static void setupTestData() {
    // Runs once, data available to all test methods
    List<Account> accounts = new List<Account>();
    for (Integer i = 0; i < 5; i++) {
        accounts.add(new Account(Name = 'Test Account ' + i));
    }
    insert accounts;
}

@isTest
static void testFirstScenario() {
    // All 5 accounts available
    List<Account> accounts = [SELECT Id FROM Account];
    Assert.areEqual(5, accounts.size());
}

@isTest
static void testSecondScenario() {
    // Same 5 accounts available
    List<Account> accounts = [SELECT Id FROM Account];
    Assert.areEqual(5, accounts.size());
}
```

### Helper Methods — Individual Setup

```apex
@isTest
static void testSpecificScenario() {
    // Only data for this test
    Account account = createTestAccount('Special Name');
    insert account;
    
    // Test logic
    service.processAccount(account);
    
    // Assert
    Assert.isTrue(account.Processed__c);
}

// Helper creates test data
private static Account createTestAccount(String name) {
    return new Account(
        Name = name,
        BillingCountry = 'USA'
    );
}
```

## Mocking — Isolate Code Being Tested

### Mocking Callouts

```apex
@isTest
static void testExternalApiCall() {
    // Mock HTTP response
    Test.setMock(HttpCalloutMock.class, new MockApiResponse());
    
    Test.startTest();
    HttpResponse response = ExternalServiceClient.callApi();
    Test.stopTest();
    
    Assert.areEqual(200, response.getStatusCode());
}

private class MockApiResponse implements HttpCalloutMock {
    public HttpResponse respond(HttpRequest request) {
        HttpResponse response = new HttpResponse();
        response.setStatusCode(200);
        response.setBody('{"status":"success"}');
        return response;
    }
}
```

### Mocking Service Layer

```apex
// Interface allows easy mocking
public interface IAccountService {
    List<Account> getAccounts();
}

// Real implementation
public class AccountServiceImpl implements IAccountService {
    public List<Account> getAccounts() {
        return [SELECT Id FROM Account];
    }
}

// Mock for testing
public class MockAccountService implements IAccountService {
    public List<Account> getAccounts() {
        return new List<Account>{new Account(Name = 'Mock')};
    }
}

// Test with mock
@isTest
static void testWithMock() {
    IAccountService service = new MockAccountService();
    List<Account> results = service.getAccounts();
    Assert.areEqual(1, results.size());
}
```

## Test.startTest() & Test.stopTest()

These isolate governor limits for accurate testing:

```apex
@isTest
static void testGovernorLimits() {
    // Before startTest:
    Integer queriesBefore = Limits.getQueries();
    
    Test.startTest(); // Fresh limits
    
    // Execute code — testing limit is monitored
    List<Account> accounts = [SELECT Id FROM Account];
    
    Test.stopTest(); // Reset limits
    
    // Check how many queries executed inside startTest/stopTest
    Integer queriesDuring = Limits.getQueries(); // Only counts queries inside
    Assert.isTrue(queriesDuring < 100, 'Should not exceed SOQL limit');
}
```

## Coverage vs Meaningful Tests

### ❌ BAD: High Coverage, Low Quality

```apex
// This passes but doesn't test anything meaningful
@isTest
static void testAccountExists() {
    Account a = new Account(Name = 'Test');
    insert a;
    Assert.isNotNull(a.Id); // Pointless —SF inserted it
}
```

### ✅ GOOD: Test Real Behavior

```apex
// Tests actual business logic
@isTest
static void testAccountNameValidation() {
    Account a = new Account(); // No name
    
    try {
        insert a;
        Assert.fail('Should not allow empty name');
    } catch (DmlException e) {
        Assert.isTrue(e.getMessage().contains('Name is required'));
    }
}
```

## Test Data Factory Pattern

```apex
// Factory class creates consistent test data
public class TestDataFactory {
    
    public static Account createTestAccount(String name) {
        return new Account(
            Name = name,
            BillingCountry = 'USA',
            Type = 'Prospect'
        );
    }
    
    public static List<Account> createTestAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(createTestAccount('Test Account ' + i));
        }
        return accounts;
    }
    
    public static Contact createTestContact(Id accountId) {
        return new Contact(
            LastName = 'TestContact',
            AccountId = accountId,
            Email = 'test@example.com'
        );
    }
}

// Use in tests:
@isTest
static void testBulkProcessing() {
    List<Account> accounts = TestDataFactory.createTestAccounts(100);
    insert accounts;
    
    service.processAccounts(accounts);
    
    Assert.areEqual(100, [SELECT COUNT() FROM Account WHERE Processed__c = true]);
}
```

## System.assertEquals with Meaningful Messages

```apex
// ❌ BAD: No context
Assert.areEqual(expected, actual);

// ✅ GOOD: Explain what went wrong
Assert.areEqual(
    'Active', 
    account.Status__c,
    'Account status should be Active after processing'
);

// ✅ BETTER: Test multiple assertions
Lead lead = [SELECT Score__c, Status FROM Lead WHERE Id = :leadId];
Assert.areEqual(100, lead.Score__c, 'Score calculation failed');
Assert.areEqual('Hot', lead.Status, 'Status assignment failed');
```

## Test Exception Handling

```apex
@isTest
static void testExceptionHandling() {
    try {
        service.processWithInvalidData(null);
        Assert.fail('Should throw exception for null data');
    } catch (ServiceException e) {
        Assert.isTrue(
            e.getMessage().contains('data cannot be null'),
            'Exception message should mention null data'
        );
    }
}
```

## Key Takeaway

**TDD creates better code by forcing you to think about behavior first.** Red → Green → Refactor cycle ensures tests drive design. Test meaningful business logic, use mocks to isolate code, and structure tests clearly with Arrange-Act-Assert.
