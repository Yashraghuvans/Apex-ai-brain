# RULE: COVERAGE MINIMUM 75%

## Rule Statement
**All production classes MUST achieve minimum 75% code coverage. Quality over quantity count.**

Violation Level: **HIGH** — Deployment blocker

## Coverage Requirements by Class Type

| Class Type | Minimum | Focus |
|-----------|---------|-------|
| Service | 75%+ | Happy paths, error cases, bulkification |
| Selector | 75%+ | Query variations, null handling |
| Domain | 75%+ | Business logic, edge cases |
| Trigger Handler | 75%+ | All contexts (insert, update, delete) |
| Utility | 75%+ | Helper methods, edge cases |

## Quality Coverage (Not Just Count)

```apex
// ❌ BAD: 100% line coverage but no assertions
@isTest
private class LeadServiceTest {
    @isTest
    static void testProcessLeads() {
        List<Lead> leads = new List<Lead>{ new Lead(Name = 'Test') };
        LeadService.processLeads(leads); // Executes all lines
        // COVERAGE=100% but TEST=NONE (no assertions)
    }
}

// ✅ GOOD: 75% coverage with meaningful assertions
@isTest
private class LeadServiceTest {
    @isTest
    static void testProcessLeads_ValidLead() {
        List<Lead> leads = new List<Lead>{ 
            new Lead(Name = 'Test', Email = 'test@example.com')
        };
        LeadService.processLeads(leads);
        
        Lead result = [SELECT Id, Status FROM Lead WHERE Id = :leads[0].Id];
        System.assertEquals('Qualified', result.Status, 'Status should be Qualified');
    }
    
    @isTest
    static void testProcessLeads_NullInput_ThrowsException() {
        try {
            LeadService.processLeads(null);
            System.fail('Should have thrown exception for null input');
        } catch (Exceptions.InvalidLeadException e) {
            System.assertEquals('Leads list cannot be empty', e.getMessage());
        }
    }
}
```

## Required Test Scenarios

### Positive Path (Happy Case)
```apex
// ✅ REQUIRED: Test successful execution
@isTest
static void testProcessLeads_Success() {
    // Setup: Valid data
    List<Lead> leads = TestDataFactory.createLeads(5);
    insert leads;
    
    // Execute
    Test.startTest();
    LeadService.processLeads(leads);
    Test.stopTest();
    
    // Assert
    List<Lead> results = [SELECT Id, Status FROM Lead WHERE Id IN :leads];
    System.assertEquals(5, results.size(), 'All leads should be processed');
    for (Lead l : results) {
        System.assertNotEquals(null, l.Status, 'Status should be set');
    }
}
```

### Boundary Cases
```apex
// ✅ REQUIRED: Test limits and edge cases
@isTest
static void testProcessLeads_BoundaryConditions() {
    // Empty list
    LeadService.processLeads(new List<Lead>());
    System.assertEquals(0, [SELECT COUNT() FROM Lead], 'No leads should be created');
    
    // Single record
    List<Lead> single = TestDataFactory.createLeads(1);
    insert single;
    LeadService.processLeads(single);
    System.assertEquals(1, [SELECT COUNT() FROM Lead], 'Should handle single record');
    
    // Large bulk (within governor limit)
    List<Lead> bulk = TestDataFactory.createLeads(200);
    insert bulk;
    LeadService.processLeads(bulk);
    System.assertEquals(201, [SELECT COUNT() FROM Lead], 'Should handle bulk');
}
```

### Negative Path (Error Cases)
```apex
// ✅ REQUIRED: Test error handling
@isTest
static void testProcessLeads_InvalidData_ThrowsException() {
    // Null input
    try {
        LeadService.processLeads(null);
        System.fail('Should throw exception for null');
    } catch (Exceptions.InvalidLeadException e) {
        System.assertEquals('Leads list cannot be empty', e.getMessage());
    }
    
    // Missing required field
    List<Lead> leads = new List<Lead>{ new Lead() };
    try {
        LeadService.processLeads(leads);
        System.fail('Should throw exception for missing email');
    } catch (Exceptions.InvalidLeadException e) {
        System.assertNotEquals(null, e.getMessage());
    }
}
```

### Data Integrity
```apex
// ✅ REQUIRED: Test that data is preserved
@isTest
static void testProcessLeads_PreservesData() {
    // Create leads with existing data
    List<Lead> leads = TestDataFactory.createLeads(10);
    leads[0].Phone = '555-1234';
    leads[0].Company = 'Acme Corp';
    insert leads;
    
    // Process
    LeadService.processLeads(leads);
    
    // Verify data integrity
    Lead updated = [SELECT Id, Phone, Company FROM Lead WHERE Id = :leads[0].Id];
    System.assertEquals('555-1234', updated.Phone, 'Phone should be preserved');
    System.assertEquals('Acme Corp', updated.Company, 'Company should be preserved');
}
```

### Security (CRUD/FLS)
```apex
// ✅ REQUIRED: Test security enforcement
@isTest
static void testProcessLeads_EnforcesSecurity() {
    // Create leads
    List<Lead> leads = TestDataFactory.createLeads(5);
    insert leads;
    
    // Test FLS enforcement (if selector uses stripInaccessible)
    LeadService.processLeads(leads);
    
    // Verify sensitive fields respected
    List<Lead> results = [SELECT Id, Email FROM Lead WHERE Id IN :leads];
    for (Lead l : results) {
        System.assertNotEquals(null, l.Email, 'Email should be accessible');
    }
}
```

## Coverage Measurement

```apex
// Check coverage in test execution
@isTest
static void testCoverageMeasure() {
    List<Lead> leads = TestDataFactory.createLeads(10);
    insert leads;
    
    Test.startTest();
    LeadService.processLeads(leads);
    Test.stopTest();
    
    // Coverage metrics (available in Test Results)
    // - Lines executed: X
    // - Total lines: Y
    // - Coverage %: X/Y
}
```

## Violation Response

When code coverage is below 75%:

```
❌ DEPLOYMENT BLOCKED: Insufficient code coverage

Class: LeadService
Current Coverage: 62%
Required: 75%
Gap: 13 lines

Uncovered Code Paths:
1. validateInput() - null check (line 12)
2. processLeads() - error handling (line 25)
3. processLeads() - bulk operation (line 40)

Required Tests:
✅ Add test for null input
✅ Add test for validation error
✅ Add test for bulk processing
✅ Add test for security exception

Recommendation:
1. Create new test method: testProcessLeads_NullInput_ThrowsException()
2. Create new test method: testProcessLeads_BulkProcessing()
3. Create new test method: testProcessLeads_SecurityCheck()
4. Run coverage again → Should reach 75%+
```

## Summary Checklist

- [ ] All production classes 75%+ coverage
- [ ] Happy path test (success case)
- [ ] Boundary cases (empty, single, bulk)
- [ ] Error cases (null, invalid, exception)
- [ ] Data integrity checks
- [ ] Security/CRUD/FLS tests
- [ ] All assertions have meaningful messages

## Key Takeaway
**75% meaningful coverage beats 100% meaningless coverage.** Test real scenarios, edge cases, and error paths. This ensures code is bulletproof in production.
