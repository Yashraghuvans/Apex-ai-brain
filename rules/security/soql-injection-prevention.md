# RULE: SOQL INJECTION PREVENTION

## Rule Statement
**Code MUST use bind variables in SOQL. Never concatenate user input into SOQL strings.**

Violation Level: **CRITICAL** — Security vulnerability

## Forbidden Patterns

### ❌ FORBIDDEN: SOQL Concatenation
```apex
// VIOLATES RULE: String concatenation in SOQL
public class LeadSelector {
    public static List<Lead> selectByEmail(String email) {
        String query = 'SELECT Id FROM Lead WHERE Email = ' + email; // VULNERABLE!
        return Database.query(query);
    }
}

// Attack example:
// Input: test@example.com' OR '1'='1
// Query becomes: SELECT Id FROM Lead WHERE Email = test@example.com' OR '1'='1
// Result: Returns ALL leads (where 1=1 is always true)

// Attack example 2:
// Input: test@example.com' UNION SELECT Id FROM Account --
// Query becomes: SELECT Id FROM Lead WHERE Email = test@example.com' UNION SELECT Id FROM Account --
// Result: User can access other objects!
```

### ❌ FORBIDDEN: Dynamic Field Names in String
```apex
// VIOLATES RULE: Dynamic field names without escaping
public class AccountSelector {
    public static List<Account> selectByField(String fieldName, String value) {
        String query = 'SELECT Id FROM Account WHERE ' + fieldName + ' = \'' + value + '\'';
        return Database.query(query); // VULNERABLE!
    }
}

// Attack: Attacker controls fieldName
// Input fieldName: 'Name; DROP TABLE Account; --'
// Input value: 'anything'
// Query becomes: SELECT Id FROM Account WHERE Name; DROP TABLE Account; -- = 'anything'
// Result: Could delete table (if permissions allowed, but STILL WRONG)
```

### ❌ FORBIDDEN: User Input in WHERE Clause
```apex
// VIOLATES RULE: User-provided filter without binding
public String getLeadsByStatus(String status) {
    List<Lead> leads = [SELECT Id FROM Lead WHERE Status = + Status]; // VULNERABLE if status comes from user
}

// If user input: "Open' OR '1'='1"
// Query becomes: SELECT Id FROM Lead WHERE Status = "Open' OR '1'='1
// Result: Returns leads with ANY status
```

## Correct Patterns

### Pattern 1: Bind Variables (Most Common)
```apex
// ✅ CORRECT: Use bind variable (: prefix)
public class LeadSelector {
    public static List<Lead> selectByEmail(String email) {
        return [
            SELECT Id, Name FROM Lead 
            WHERE Email = :email // Bind variable - SAFE
        ];
    }
}

// How it works:
// :email is a PLACEHOLDER
// Email value passed separately to database
// Database never interprets email as code
// Result: Even "test' OR '1'='1" is treated as literal string

// Benefits:
// ✅ Safe from injection
// ✅ More efficient (query plan cached)
// ✅ Cleaner syntax
// ✅ No escape logic needed
```

### Pattern 2: Multiple Bind Variables
```apex
// ✅ CORRECT: Multiple bind variables
public class LeadSelector {
    public static List<Lead> selectByEmailAndStatus(String email, String status) {
        return [
            SELECT Id, Name FROM Lead 
            WHERE Email = :email AND Status = :status // Both safe
        ];
    }
}

// ✅ CORRECT: Bind in multiple clauses
public class OpportunitySelector {
    public static List<Opportunity> selectByNameAndAmount(String name, Decimal minAmount) {
        return [
            SELECT Id, Amount FROM Opportunity 
            WHERE Name = :name AND Amount >= :minAmount // Both safe
        ];
    }
}
```

### Pattern 3: Collections as Bind Variables
```apex
// ✅ CORRECT: Bind IN clause
public class ContactSelector {
    public static List<Contact> selectByIds(Set<Id> ids) {
        return [
            SELECT Id, Name FROM Contact 
            WHERE Id IN :ids // Bind collection - SAFE
        ];
    }
}

// ✅ CORRECT: Bind multiple values
public class LeadSelector {
    public static List<Lead> selectByStatusList(List<String> statuses) {
        return [
            SELECT Id FROM Lead 
            WHERE Status IN :statuses // Bind list - SAFE
        ];
    }
}

// Collection binding handles:
// - Single element
// - Multiple elements
// - Empty collection (returns empty result)
// - NOT subject to injection
```

### Pattern 4: Escape Single Quotes (If Dynamic Query Required)
```apex
// ✅ CORRECT: If MUST use dynamic query, escape input
public class DynamicSelector {
    public static List<SObject> selectByDynamicFilter(String fieldName, String filterValue) {
        // Escape single quotes
        String escapedValue = String.escapeSingleQuotes(filterValue);
        
        // Use escaped value in query
        String query = 'SELECT Id FROM Account WHERE ' + fieldName + ' = \'' + escapedValue + '\'';
        return Database.query(query);
    }
}

// Example:
// Input: O'Brien
// Escaped: O\'Brien (backslash added before quote)
// Query: SELECT Id FROM Account WHERE Name = 'O\'Brien'
// Result: Safe from injection (quote is escaped, not a delimiter)

// But NOTE: escapeSingleQuotes only escapes quotes, not field names
// Field name still vulnerable if not validated!
```

### Pattern 5: Field Name Validation (If Truly Dynamic)
```apex
// ✅ CORRECT: Validate field names against schema
public class ValidatedSelector {
    private static final Set<String> ALLOWED_FIELDS = new Set<String>{
        'Name', 'Email', 'Status', 'Score'
    };
    
    public static List<Lead> selectByField(String fieldName, String value) {
        // Validate field exists in whitelist
        if (!ALLOWED_FIELDS.contains(fieldName)) {
            throw new Exceptions.SecurityException('Invalid field: ' + fieldName);
        }
        
        // Safe to use field name now
        String query = 'SELECT Id FROM Lead WHERE ' + fieldName + ' = \'' + 
                       String.escapeSingleQuotes(value) + '\'';
        return Database.query(query);
    }
}

// Benefits:
// ✅ Field names validated
// ✅ User input escaped
// ✅ Only whitelisted fields allowed
// ✅ Audit trail (log attempts to use invalid fields)
```

## Comparison Table

| Pattern | Safe | Recommended | When to Use |
|---------|------|-------------|-----------|
| Bind Variable (:param) | ✅ | ✅✅✅ | Always (when possible) |
| Escaped Single Quotes | ⚠️ Partial | ❌ | Emergency only + dynamic |
| Field Validation | ✓ Acceptable | ✅ | If field names truly dynamic |
| String Concatenation | ❌ Never | ❌❌❌ | NEVER |

## Testing Pattern

```apex
// ✅ CORRECT: Test injection prevention
@isTest
private class LeadSelectorTest {
    @isTest
    static void testSelectByEmail_InjectionAttempt() {
        // Create test data
        Lead lead = new Lead(Email = 'test@example.com', Status = 'Open');
        insert lead;
        
        // Attempt injection
        String injectionAttempt = "test@example.com' OR '1'='1";
        
        // Call selector with injection attempt
        List<Lead> results = LeadSelector.selectByEmail(injectionAttempt);
        
        // Should return NO leads (injection was blocked)
        System.assertEquals(0, results.size(), 'Injection should be blocked');
    }
    
    @isTest
    static void testSelectByEmail_LegitimateData() {
        Lead lead = new Lead(Email = 'test@example.com', Status = 'Open');
        insert lead;
        
        List<Lead> results = LeadSelector.selectByEmail('test@example.com');
        System.assertEquals(1, results.size());
    }
}
```

## Violation Response

When code has injection vulnerability:

```
❌ VIOLATION DETECTED: SOQL Injection vulnerability

Your code:
public List<Lead> selectByEmail(String email) {
    String query = 'SELECT Id FROM Lead WHERE Email = \'' + email + '\'';
    return Database.query(query);
}

Vulnerability:
- User input concatenated directly into SOQL
- Attack vector: email = "' OR '1'='1"
- Impact: Returns all leads regardless of email

Security Risk: HIGH (Data breach)

Correcting...

✅ Corrected:
public List<Lead> selectByEmail(String email) {
    return [
        SELECT Id FROM Lead 
        WHERE Email = :email // Bind variable - SAFE
    ];
}

Result:
✅ Injection blocked
✅ Email treated as literal value
✅ Even special characters safe
✅ No escaping logic needed
```

## Audit for Injection Vulnerabilities

```bash
# Scan for common injection patterns
grep -r "Database.query\|Database.countQuery" --include="*.cls" | grep -v "bind\|:param"

# Look for concatenation in SOQL
grep -r "SELECT.*'" --include="*.cls" | grep -v "bind\|:\|test"

# Patterns to avoid:
# - 'SELECT + String + WHERE
# - Database.query(String + variable)
# - WITHOUT bind variables (:param)
```

## Key Takeaway
**Always use bind variables (:param) in SOQL.** This is the golden rule of injection prevention. Never concatenate user input, never escape and hope. Bind variables are the only bulletproof defense.
