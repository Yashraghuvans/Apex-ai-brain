# RULE: APEX ERROR HANDLING

## Rule Statement
**Code MUST have error handling. Use custom exceptions. Never fail silently.**

Violation Level: **HIGH** — Makes code maintainable and debuggable

## Required Custom Exception Class

```apex
// ✅ CORRECT: Define in shared class
public class Exceptions {
    public class InvalidLeadException extends Exception {}
    public class LeadProcessingException extends Exception {}
    public class DataAccessException extends Exception {}
    public class SecurityException extends Exception {}
}

// Usage
throw new Exceptions.InvalidLeadException('Lead name is required');
```

## Required Error Handling Pattern

```apex
// ✅ CORRECT: Try-catch with logging
try {
    List<Lead> leads = LeadSelector.selectById(leadIds);
    new LeadDomain(leads).validate().processLeads();
    update leads;
} catch (Exceptions.InvalidLeadException e) {
    System.debug(LoggingLevel.ERROR, 'Validation failed: ' + e.getMessage());
    throw new Exceptions.LeadProcessingException('Failed to process leads: ' + e.getMessage());
} catch (DmlException e) {
    System.debug(LoggingLevel.ERROR, 'DML error: ' + e.getMessage());
    throw new Exceptions.LeadProcessingException('Database error: ' + e.getMessage());
} catch (Exception e) {
    System.debug(LoggingLevel.ERROR, 'Unexpected error: ' + e.getMessage() + ' ' + e.getStackTraceString());
    throw e;
}

// ❌ FORBIDDEN: Silent failures
List<Lead> leads = LeadSelector.selectById(leadIds);
new LeadDomain(leads).validate().processLeads();
update leads;
// If error occurs → Lost data, no insight
```

## Error Handling by Layer

### Trigger Handler
```apex
// ✅ CORRECT: Catch and log
public class LeadTriggerHandler {
    public void handle() {
        try {
            if (Trigger.isBefore && Trigger.isInsert) {
                LeadService.handleBeforeInsert(Trigger.new);
            }
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Trigger error: ' + e.getMessage());
            throw new Exceptions.LeadProcessingException('Lead trigger failed: ' + e.getMessage());
        }
    }
}

// ❌ FORBIDDEN: No error handling
public class LeadTriggerHandler {
    public void handle() {
        if (Trigger.isBefore && Trigger.isInsert) {
            LeadService.handleBeforeInsert(Trigger.new);
        }
    }
}
```

### Service Layer
```apex
// ✅ CORRECT: Validate BEFORE processing
public class LeadService {
    public static void handleBeforeInsert(List<Lead> leads) {
        validateInput(leads);
        try {
            new LeadDomain(leads).validate().applyBusinessRules();
        } catch (Exceptions.InvalidLeadException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            throw new Exceptions.LeadProcessingException('Failed to process leads', e);
        }
    }
    
    private static void validateInput(List<Lead> leads) {
        if (leads == null || leads.isEmpty()) {
            throw new Exceptions.InvalidLeadException('Leads list cannot be empty');
        }
    }
}

// ❌ FORBIDDEN: Processing without validation
public class LeadService {
    public static void handleBeforeInsert(List<Lead> leads) {
        new LeadDomain(leads).applyBusinessRules(); // leads could be null!
    }
}
```

### Domain Layer
```apex
// ✅ CORRECT: Throw specific exceptions
public class LeadDomain {
    public LeadDomain validate() {
        for (Lead lead : records) {
            if (String.isBlank(lead.Email)) {
                throw new Exceptions.InvalidLeadException('Email is required for lead: ' + lead.Name);
            }
            if (lead.AnnualRevenue < 0) {
                throw new Exceptions.InvalidLeadException('Annual revenue cannot be negative');
            }
        }
        return this;
    }
}

// ❌ FORBIDDEN: Generic errors
public class LeadDomain {
    public LeadDomain validate() {
        for (Lead lead : records) {
            if (String.isBlank(lead.Email)) {
                throw new Exception('Error'); // Too vague
            }
        }
        return this;
    }
}
```

### Selector Layer
```apex
// ✅ CORRECT: Handle query errors
public class LeadSelector {
    public static List<Lead> selectById(Set<Id> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new Exceptions.DataAccessException('Cannot query with empty ID set');
        }
        try {
            return [
                SELECT Id, Name, Email FROM Lead 
                WHERE Id IN :ids 
                WITH SECURITY_ENFORCED
            ];
        } catch (QueryException e) {
            throw new Exceptions.DataAccessException('Query failed: ' + e.getMessage(), e);
        }
    }
}

// ❌ FORBIDDEN: Unhandled query errors
public class LeadSelector {
    public static List<Lead> selectById(Set<Id> ids) {
        return [SELECT Id, Name, Email FROM Lead WHERE Id IN :ids];
        // If SECURITY_ENFORCED fails → Unhandled exception
    }
}
```

## Logging Best Practices

```apex
// ✅ CORRECT: Structured logging
System.debug(LoggingLevel.DEBUG, 'Processing ' + leads.size() + ' leads');
System.debug(LoggingLevel.INFO, 'Validation passed for lead: ' + lead.Name);
System.debug(LoggingLevel.WARN, 'Lead missing email: ' + lead.Name);
System.debug(LoggingLevel.ERROR, 'Failed to update lead ' + lead.Id + ': ' + e.getMessage());
System.debug(LoggingLevel.ERROR, 'Stack trace: ' + e.getStackTraceString());

// ❌ FORBIDDEN: Inadequate logging
System.debug('Error'); // No level, vague message
System.debug(e); // Exception object only, no context

// ❌ FORBIDDEN: Logging errors but not throwing
System.debug('Error: ' + e.getMessage()); // Lost in logs, caller unaware
```

## DML Error Handling

```apex
// ✅ CORRECT: Check save results
List<Database.SaveResult> results = Database.update(leads, false);
List<String> errors = new List<String>();

for (Database.SaveResult result : results) {
    if (!result.isSuccess()) {
        for (Database.Error error : result.getErrors()) {
            errors.add('Lead ' + result.getId() + ': ' + error.getMessage());
        }
    }
}

if (!errors.isEmpty()) {
    throw new Exceptions.LeadProcessingException(String.join(errors, '; '));
}

// ❌ FORBIDDEN: Ignoring partial failures
update leads; // If some records fail → Exception thrown, transaction rolls back, no partial success
Database.update(leads, false); // Some fail, no error handling → Silent partial update
```

## Violation Response

When code lacks error handling:

```
⚠️  ERROR HANDLING MISSING

Your code:
public class LeadService {
    public static void processLeads(List<Lead> leads) {
        List<Account> accounts = LeadSelector.selectById(getAccountIds(leads));
        for (Lead lead : leads) {
            lead.Status = determineStatus(lead, accounts);
        }
        update leads;
    }
}

Issues:
1. No try-catch for data access
2. No input validation
3. Update statement could fail (no result checking)
4. No exception specific to this context

✅ Corrected:
public class LeadService {
    public static void processLeads(List<Lead> leads) {
        validateInput(leads);
        try {
            Set<Id> accountIds = getAccountIds(leads);
            Map<Id, Account> accounts = LeadSelector.selectAccountsById(accountIds);
            
            new LeadDomain(leads)
                .applyStatuses(accounts);
            
            List<Database.SaveResult> results = Database.update(leads, false);
            checkResults(results);
            
        } catch (Exceptions.InvalidLeadException e) {
            throw e;
        } catch (Exception e) {
            throw new Exceptions.LeadProcessingException('Failed to process leads', e);
        }
    }
    
    private static void validateInput(List<Lead> leads) {
        if (leads == null || leads.isEmpty()) {
            throw new Exceptions.InvalidLeadException('Leads list cannot be empty');
        }
    }
}
```

## Key Takeaway
**Error handling is not optional.** Use custom exceptions specific to context, catch errors, log them with level/context, validate input, check results. This makes code debuggable and maintainable.
