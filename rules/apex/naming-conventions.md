# RULE: APEX NAMING CONVENTIONS

## Rule Statement
**Naming MUST follow strict conventions. PascalCase for classes, camelCase for methods and variables.**

Violation Level: **HIGH** — Standardization required

## Class Naming

### Triggers
```
{ObjectName}Trigger
LeadTrigger ✅
Lead_Trigger ❌
LeadTrigg ❌
trigger_lead ❌
```

### Handlers
```
{ObjectName}TriggerHandler
LeadTriggerHandler ✅
Handler_Lead ❌
LeadHandler ❌
ProcessLeadHandler ❌
```

### Services
```
{ObjectName}Service
LeadService ✅
Lead_Service ❌
LeadProcessor ❌
LeadProcessor_Service ❌
```

### Selectors
```
{ObjectName}Selector
LeadSelector ✅
Lead_Selector ❌
LeadQuery ❌
LeadDataAccess ❌
```

### Domains
```
{ObjectName}Domain
LeadDomain ✅
Lead_Domain ❌
LeadBusinessLogic ❌
LeadRules ❌
```

### Tests
```
{TestableClass}Test
LeadServiceTest ✅
Test_LeadService ❌
LeadServiceTests ❌ (no plural)
LeadTest ❌ (vague)
```

### Enums & Custom Exceptions
```
public class Exceptions {
    public class InvalidLeadException extends Exception {} ✅
    public class InvalidLead_Exception extends Exception {} ❌
}

public enum LeadStatus { OPEN, QUALIFIED, CLOSED } ✅
public enum Lead_Status { OPEN, QUALIFIED } ❌
```

## Method Naming (camelCase)

```apex
// ✅ CORRECT
public void validateRecords() {}
private void applyBusinessRules() {}
public List<Account> selectById(Set<Id> ids) {}
public void handleBeforeInsert() {}
private Boolean isModified(Lead oldRec, Lead newRec) {}

// ❌ FORBIDDEN
public void ValidateRecords() {} // PascalCase
public void validate_records() {} // snake_case
public void validaterecords() {} // no case
public void vRecs() {} // cryptic abbreviation
```

## Variable Naming (camelCase)

```apex
// ✅ CORRECT
Set<Id> accountIds = new Set<Id>();
List<Account> accounts = new List<Account>();
Map<Id, Account> accountsById = new Map<Id, Account>();
Boolean isExecuting = false;
Integer recordCount = 0;

// ❌ FORBIDDEN
Set<Id> AccountIDS = new Set<Id>(); // PascalCase + screaming
List<Account> accountList = new List<Account>(); // 'List' in name redundant
Map<Id, Account> map_accounts = new Map<Id, Account>(); // snake_case
Boolean b = false; // single letter
Integer cnt = 0; // abbreviation
```

## Constants (UPPER_SNAKE_CASE)

```apex
// ✅ CORRECT
public static final String OBJECT_NAME = 'Lead';
public static final Integer DEFAULT_BATCH_SIZE = 200;
public static final String SECURITY_ERROR_MESSAGE = 'Insufficient permissions';

// ❌ FORBIDDEN
public static final String ObjectName = 'Lead'; // PascalCase
public static final Integer defaultBatchSize = 200; // camelCase
public static final String securityError = 'message'; // camelCase
```

## Property & Inner Class Naming

```apex
// ✅ CORRECT
private List<Lead> records { get; set; }
public class InvalidLeadException extends Exception {}

// ❌ FORBIDDEN
private List<Lead> Records { get; set; } // PascalCase
private List<Lead> m_records { get; set; } // prefixed
public class InvalidLead_Exception extends Exception {} // underscore
```

## Violation Response

When code violates naming:

```
❌ VIOLATION DETECTED: Non-standard naming

Your code:
public class Lead_Service {
    public void ProcessLeads(List<Lead> leads) {
        for (Lead l : leads) {
            if (l.status == 'Open') {
                l.score = CalculateScore(l);
            }
        }
    }
}

Issues:
1. Class name: Lead_Service (use LeadService)
2. Method name: ProcessLeads (use processLeads)
3. Variable: l (use full name: lead)
4. Method: CalculateScore (use calculateScore)
5. Property access: l.status (inconsistent)

✅ Corrected:
public class LeadService {
    public void processLeads(List<Lead> leads) {
        for (Lead lead : leads) {
            if (lead.Status == 'Open') {
                lead.Score__c = calculateScore(lead);
            }
        }
    }
    
    private Decimal calculateScore(Lead lead) {
        // implementation
        return 0;
    }
}
```

## Summary Table

| Type | Format | Example |
|------|--------|---------|
| Class (Trigger) | {Object}Trigger | LeadTrigger |
| Class (Handler) | {Object}TriggerHandler | LeadTriggerHandler |
| Class (Service) | {Object}Service | LeadService |
| Class (Selector) | {Object}Selector | LeadSelector |
| Class (Domain) | {Object}Domain | LeadDomain |
| Class (Test) | {Testable}Test | LeadServiceTest |
| Method | camelCase | processLeads() |
| Variable | camelCase | leadScore |
| Constant | UPPER_SNAKE_CASE | DEFAULT_BATCH_SIZE |
| Property | camelCase | records |

## Key Takeaway
**Naming conventions make code readable and professional.** Instant class purpose recognition, consistent patterns, team collaboration enabled.
