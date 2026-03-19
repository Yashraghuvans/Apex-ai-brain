---
sidebar_position: 5
---

# Guardrails & Security

Understand how Apex AI Brain enforces security and best practices.

## Guardrails System

Guardrails are injected rules that constrain AI reasoning to enterprise standards.

```
User Request
    ↓
┌─────────────────────────────────┐
│  Guardrail Injection Layer      │
├─────────────────────────────────┤
│ ✓ Governor limit checks         │
│ ✓ Bulkification requirements    │
│ ✓ FSD structure rules           │
│ ✓ Security best practices       │
│ ✓ Salesforce patterns           │
│ ✓ Naming conventions            │
│ ✓ Test coverage requirements    │
└────────────┬────────────────────┘
             ↓
AI generates constrained response
             ↓
✅ Guaranteed compliance output
```

## Governor Limits Enforcement

### Apex Governor Limits

Automatically enforced in all Apex agent outputs:

```javascript
// ✅ Correct - Uses SOQL limits
public class LeadService {
  // Bulkified - handles 10k leads
  public static void updateLeads(List<Lead> leads) {
    List<Account> accounts = [
      SELECT Id FROM Account 
      WHERE Id IN :getAccountIds(leads)
      LIMIT 10000
    ];
  }
}

// ❌ Incorrect - Violation caught
for (Lead l : leads) {
  // FOR-LOOP INSIDE SOQL = Governor violation
  [SELECT Id FROM Account WHERE Id = :l.AccountId];
}
```

### Enforced Limits

| Limit | Value | Rule |
|-------|-------|------|
| **SOQL Queries** | 100/txn | Batch queries, no queries in loops |
| **DML Statements** | 150/txn | Batch updates, careful ordering |
| **Heap Size** | 6MB | Don't store large data structures |
| **CPU Time** | 10s | Optimize loops, avoid complex logic |
| **List Size** | 40k items | Paginate large queries |
| **Callout Timeout** | 120s/call | Set reasonable timeouts |

## Bulkification Requirements

### Rule: Never Query in Loops

```javascript
// ❌ WRONG - 10,000 queries!
for (Lead l : leads) {
  Account acc = [SELECT Id FROM Account LIMIT 1];
  l.AccountId = acc.Id;
}

// ✅ CORRECT - 1 query!
List<Account> accs = [SELECT Id FROM Account LIMIT 1];
for (Lead l : leads) {
  l.AccountId = accs[0].Id;
}
```

### Rule: Batch DML Operations

```javascript
// ❌ WRONG - 10,000 updates!
for (Lead l : leads) {
  update l;  // Individual DML
}

// ✅ CORRECT - 1 update!
update leads;  // Batch DML
```

### Rule: Use Collections Efficiently

```javascript
// ❌ WRONG - Multiple queries
List<Account> accounts = [SELECT Id FROM Account];
List<Contact> contacts = [SELECT Id FROM Contact];
List<Opportunity> opportunities = [SELECT Id FROM Opportunity];

// ✅ CORRECT - Single query with relationship
Map<Id, Account> accMap = new Map<Id, Account>(
  [SELECT Id, (SELECT Id FROM Contacts), (SELECT Id FROM Opportunities)
   FROM Account]
);
```

## Feature-Sliced Design (FSD) Enforcement

### Required Folder Structure

All generated code follows FSD:

```
force-app/main/default/
├── classes/
│   ├── [feature]/
│   │   ├── domain/        # Business logic
│   │   ├── service/       # Public API
│   │   ├── selector/      # Query layer
│   │   ├── handler/       # Event handlers
│   │   └── test/          # Tests
│   └── shared/            # Shared utilities
├── lwc/
│   ├── [feature]/         # Feature-specific components
│   └── shared/            # Shared components
└── metadata/
    └── [feature]/         # Feature configuration
```

### Enforced Dependencies

```
Selector  → can call → nothing (query only)
Domain    → can call → Selector
Service   → can call → Domain, Selector
Handler   → can call → Service, Domain
Test      → can call → all (test only)
```

**Violation Detected:**
```javascript
// ❌ Handler calling Selector directly
// Instead of through Service
public class LeadTriggerHandler {
  void handle() {
    // VIOLATION: Should go through LeadService
    List<Lead> leads = LeadSelector.getInstance().getByIds(ids);
  }
}

// ✅ Correct: Via Service
public class LeadTriggerHandler {
  void handle() {
    List<Lead> leads = LeadService.getLeadsByIds(ids);
  }
}
```

## Security Best Practices

### 1. No Hardcoded Secrets

```javascript
// ❌ BLOCKED - Hardcoded credential
public class ApiClient {
  private static final String API_KEY = 'sk-abc123xyz';
}

// ✅ CORRECT - Uses Custom Setting
public class ApiClient {
  private static final String API_KEY = 
    Api_Config__c.getInstance().API_Key__c;
}
```

### 2. User Mode Enforcement

```apex
// ❌ WRONG - Bypasses security
public class AccountService {
  public static List<Account> getAccounts() {
    // No WITH USER_MODE = System Mode (admin access)
    return [SELECT Id, Name FROM Account];
  }
}

// ✅ CORRECT - Respects sharing
public class AccountService {
  public static List<Account> getAccounts() {
    // WITH USER_MODE = Respects sharing rules
    return [SELECT Id, Name FROM Account WITH USER_MODE];
  }
}
```

### 3. Input Validation

```javascript
// ❌ MISSING VALIDATION
public static void process(String id) {
  Account acc = [SELECT Id FROM Account WHERE Id = :id];
}

// ✅ VALIDATED INPUT
public static void process(String id) {
  if (String.isEmpty(id)) {
    throw new IllegalArgumentException('ID cannot be empty');
  }
  Account acc = [SELECT Id FROM Account WHERE Id = :id];
}
```

### 4. SOQL Injection Prevention

```javascript
// ❌ VULNERABLE to injection
String name = 'Smith';
List<Lead> leads = [
  SELECT Id FROM Lead WHERE Name = name
];

// ✅ SAFE - Uses bind variables
String name = 'Smith';
List<Lead> leads = [
  SELECT Id FROM Lead WHERE Name = :name
];
```

### 5. Cross-Site Scripting (XSS) Prevention

```javascript
// ❌ VULNERABLE to XSS
<p>{userInput}</p>

// ✅ ESCAPED safely
<p>{userInput!e}</p>

// ✅ ESCAPED for URL
<a href="?id={recordId!u}">{recordId!u}</a>
```

## Testing Requirements

### Minimum Test Coverage

- ✅ **85% code coverage** enforced
- ✅ **Positive & negative** test scenarios
- ✅ **Edge cases** covered
- ✅ **All paths** tested

### Test Structure Validation

```apex
// ✅ Valid test structure
@IsTest
private class LeadHandlerTest {
  static testMethod void testPositiveScenario() {
    // Setup
    List<Lead> leads = createTestLeads();
    
    // Execute
    Test.startTest();
    LeadHandler.process(leads);
    Test.stopTest();
    
    // Assert
    System.assertEquals(expected, actual);
  }
  
  static testMethod void testNegativeScenario() {
    // Similarly structured
  }
}
```

## Naming Conventions

### Apex Classes

```
Pattern:        [Feature][Entity][Type]
Examples:
  ✅ LeadSelector          (Query class)
  ✅ LeadService           (Business logic)
  ✅ LeadDomain            (Domain model)
  ✅ LeadTriggerHandler    (Trigger handler)
  ✅ LeadServiceTest       (Test class)

❌ Wrong:       LDS, Service1, TestStuff, Handler
```

### LWC Components

```
Folder:         kebab-case
JavaScript:     camelCase
Template:       {camelCase}
CSS:            kebab-case

Examples:
  ✅ lead-form/
       └─ leadForm.js
       └─ leadForm.html
       └─ lead-form.css

❌ Wrong:       LeadForm/, leadform.js, lead_form.css
```

## Output Validation

### All AI Outputs Validated for:

1. **Syntax Correctness**
   - Valid Apex/JavaScript
   - No incomplete statements
   - Proper brackets/quotes

2. **Pattern Compliance**
   - Uses correct design patterns
   - Follows FSD structure
   - Adheres to naming conventions

3. **Security Checks**
   - No hardcoded credentials
   - Input validation present
   - SOQL injection safe
   - XSS prevention applied

4. **Performance Checks**
   - No governor limit violations
   - Bulkified DML operations
   - Efficient queries
   - No unnecessary loops

5. **Test Coverage**
   - Minimum coverage met
   - Test scenarios adequate
   - Assertions present

## Guardrail Configuration

### Enable/Disable Specific Rules

In `sfai.config.json`:

```json
{
  "guardrails": {
    "enforceFSD": true,
    "enforceBulkification": true,
    "enforceGovernorLimits": true,
    "enforceXSS": true,
    "enforceUserMode": true,
    "enforceInputValidation": true,
    "minTestCoverage": 85,
    "requireCommentsFor": ["complex", "security"],
    "forbiddenPatterns": [
      "hardcoded_credentials",
      "queries_in_loops",
      "system_mode_soql"
    ]
  }
}
```

### Custom Guardrails

Add organization-specific rules:

```javascript
// custom-guardrails.js
export const customGuardrails = {
  rules: [
    {
      name: "require_approval_framework",
      pattern: "Approval.process",
      message: "Must use company approval framework"
    },
    {
      name: "no_deprecated_apis",
      pattern: "Database.insert|Database.update",
      message: "Use insert/update statements directly"
    }
  ]
};
```

## Monitoring & Reporting

### Guardrail Violations Report

```bash
sfai /guardrails --report
```

Output:
```
Guardrail Compliance Report
=============================
Analysis Period: Last 30 days

Violations by Category:
  Bulkification:      2 (↓ from 5)
  Governor Limits:    1
  Naming Convention:  3
  Test Coverage:      0 ✅

Warnings:
  ⚠️  LeadService: Pattern mismatch (minor)
  ⚠️  AccountHandler: 82% coverage (target: 85%)

Trends:
  ✅ Compliance up 15% this month
```

---

## Best Practices

✅ **Do This:**
- Review guardrail violations
- Fix naming conventions early
- Maintain test coverage
- Use WITH USER_MODE
- Validate all inputs

❌ **Don't Do This:**
- Ignore guardrail warnings
- Hardcode secrets
- Skip test requirements
- Query in loops
- Use system mode unnecessarily

