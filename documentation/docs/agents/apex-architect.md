---
sidebar_position: 2
---

# Apex Architect

The master designer of Apex code structures and enterprise patterns.

## Role

Senior Salesforce architect specializing in Apex code design, FSD adoption, and enterprise architecture patterns.

## Responsibilities

- 🏗 Design Apex class structures
- 📐 Apply design patterns (Selector, Service, Domain, Unit of Work)
-  Enforce Feature-Sliced Design (FSD)
-  Ensure separation of concerns
- 📋 Create architecture specifications
- 🔄 Propose refactoring strategies

## When to Use

Use the Apex Architect when you need to:

- **Design a new service** - "Design a bulkified lead scoring service"
- **Structure a module** - "Design the contact management domain layer"
- **Define patterns** - "Create the Account service with Selector/Service/Domain"
- **Architect large features** - "Design a multi-module customer portal"
- **Refactor existing code** - "Restructure the opportunity handler"

## Example Prompts

### Example 1: Simple Service Design

```bash
sfai /spawn apex-architect "Design a LeadService that scores leads based on engagement"
```

**Output includes:**
- Class design with methods
- Private methods for bulkification
- Error handling strategy
- Selector/Service pattern structure

### Example 2: Complex Module Design

```bash
sfai /spawn apex-architect "Design the complete portfolio module with portfolio, position, and performance classes"
```

**Output includes:**
- Full module architecture
- Class relationships
- Data flow diagrams
- Dependency analysis

### Example 3: FSD Refactoring

```bash
sfai /spawn apex-architect "Refactor the existing Lead handler code to follow FSD with Selector->Service->Domain pattern"
```

**Output includes:**
- New folder structure
- Refactored classes
- Migration path
- Validation strategy

## What It Generates

### 1. Class Diagrams

```
     LeadService
     ↓         ↓
LeadSelector  LeadDomain
     ↓         ↓
  [SOQL]    [Logic]
```

### 2. Method Signatures

```apex
public class LeadService {
  public static List<Lead> scoreLeads(List<Id> leadIds)
  private static Map<Id, Account> getRelatedAccounts(Set<Id> accountIds)
  private static void applyScoring(List<Lead> leads, Map<Id, Account> accounts)
}
```

### 3. Error Handling

```apex
try {
  // Business logic
} catch (DmlException e) {
  // Handle governor limits, validation errors
}
```

## Architecture Patterns Enforced

### Selector Pattern

```apex
// Query layer - single responsibility
public class LeadSelector extends fflib_SObjectSelector {
  public List<Lead> selectById(Set<Id> ids) {
    return selectSObjectsById(ids);
  }
}
```

### Service Pattern

```apex
// Business logic - public API
public class LeadService {
  public static List<Lead> scoreLeads(List<Lead> leads) {
    // Process leads
  }
}
```

### Domain Pattern

```apex
// Object-oriented business logic
public class LeadDomain extends fflib_SObjectDomain {
  public LeadDomain(List<Lead> records) {
    super(records, Lead.SObjectType);
  }
}
```

### Unit of Work Pattern

```apex
// Transaction management
fflib_ISObjectUnitOfWork uow = Application.UnitOfWork.newInstance();
uow.registerNew(newLead);
uow.commitWork();
```

## FSD Structure Output

When designing with Apex Architect, the output follows FSD:

```
force-app/main/default/classes/
├── leads/
│   ├── domain/
│   │   └── LeadDomain.cls
│   ├── service/
│   │   └── LeadService.cls
│   ├── selector/
│   │   └── LeadSelector.cls
│   ├── handler/
│   │   └── LeadTriggerHandler.cls
│   └── test/
│       ├── LeadDomainTest.cls
│       ├── LeadServiceTest.cls
│       └── LeadHandlerTest.cls
├── accounts/
│   ├── domain/
│   ├── service/
│   ├── selector/
│   └── handler/
```

## Guardrails Applied

The Apex Architect automatically enforces:

 **Bulkification Rules**
- No queries in loops
- Batch DML operations
- Map-based lookups

 **Governor Limits**
- SOQL depth restrictions
- DML statement limits
- Heap size awareness

 **Security**
- Input validation
- Query string escaping
- Permission checks

 **Performance**
- Efficient queries
- Indexed lookups
- Lazy loading

## Workflow Integration

### Step 1: Receive Request

```bash
sfai /spawn apex-architect "Design lead scoring"
```

### Step 2: Analyze Context

- Reads project structure
- Identifies existing patterns
- Understands dependencies
- Checks guardrails

### Step 3: Design

- Creates class structure
- Defines methods
- Plans data flow
- Considers edge cases

### Step 4: Output

- Generates code structure
- Provides rationale
- Suggests testing strategy
- Stores in memory

### Step 5: Next Steps

- LWC Builder can build components
- Test Writer can create tests
- Other agents can implement

## Tips for Best Results

###  Be Specific

Good:
```
"Design a LeadService with bulkified scoring logic, 
following FSD pattern, with 90% test coverage"
```

Bad:
```
"Design something for leads"
```

###  Reference Existing Code

Good:
```
"Design AccountService similar to LeadService 
in force-app/main/default/classes/leads/"
```

###  Include Requirements

Good:
```
"Design the portfolio service that:
- Handles thousands of records
- Supports batch processing
- Enforces data security
- Works with existing system"
```

###  Ask for Iteration

Good:
```
"Design LeadService. If it's too complex, 
break into smaller classes."
```

## Common Use Cases

### 1. New Feature Design

```bash
sfai /spawn apex-architect "Design the customer portal backend with data layer, business logic, and API layer"
```

### 2. Legacy Refactoring

```bash
sfai /spawn apex-architect "Refactor the existing trigger-based lead handling into FSD-compliant service"
```

### 3. Performance Optimization

```bash
sfai /spawn apex-architect "Redesign the account batch job to handle 100k+ records efficiently"
```

### 4. Integration Architecture

```bash
sfai /spawn apex-architect "Design the Salesforce-to-ERP integration layer with queue handling"
```

## Output Examples

### Service Design Output

```apex
/**
 * LeadScoringService
 * Handles lead scoring based on engagement metrics
 * Follows FSD: Selector → Service → Domain pattern
 */
public class LeadScoringService {
  
  public static List<Lead> scoreLeads(List<Id> leadIds) {
    // Load leads with relationships
    List<Lead> leads = LeadSelector.getInstance()
      .selectWithTasksByIds(new Set<Id>(leadIds));
    
    // Apply scoring logic
    new LeadDomain(leads).score();
    
    return leads;
  }
  
  // Private methods for bulkification...
}
```

## Next Steps

After Apex Architect design:

1. **Build implementation** - Use regular development
2. **Create components** - Let LWC Builder create UI
3. **Write tests** - Let Test Writer auto-generate
4. **Review code** - Let Apex Reviewer validate
5. **Optimize queries** - Let SOQL Optimizer refine

Or review the design with:
- [Apex Reviewer](./apex-reviewer.md) - Code review
- [Security Agent](./security-agent.md) - Security audit

