---
sidebar_position: 3
---

# First Project Setup

Set up and execute your first Salesforce project with Apex AI Brain.

## Project Structure

Organize your Salesforce project for optimal context scanning:

```
my-salesforce-project/
├── force-app/
│   └── main/
│       └── default/
│           ├── classes/
│           │   ├── LeadService.cls
│           │   └── LeadServiceTest.cls
│           ├── lwc/
│           │   └── leadForm/
│           ├── metadata/
│           │   └── objects/
│           └── aura/
├── README.md
├── .sfdx/
└── sfdx-project.json
```

## Step 1: Project Initialization

Navigate to your Salesforce project:

```bash
cd my-salesforce-project
sfai /init
```

The system will scan and categorize:
- **Apex Classes** - Controllers, services, handlers
- **LWC Components** - Lightning Web Components
- **Aura Components** - Legacy components
- **Custom Objects** - Data model
- **Metadata** - Field definitions, validation rules
- **Tests** - Existing test coverage

### What Happens During Init

```
✓ Scanning project structure
✓ Found 42 Apex classes
✓ Found 8 LWC components
✓ Found 15 custom objects
✓ Analyzing dependencies
✓ Building context graph
✓ Project context ready!
```

## Step 2: Review Initial Status

```bash
sfai /status
```

Output example:
```
Project Status
==============
Type:        Salesforce DX Project
Project:     My Org
Complexity:  medium
Agents:      16/16 active
Context:     Loaded
Files:       2,847
Classes:     42
Components:  8
Objects:     15
```

## Step 3: Plan Your First Feature

Let's build a customer portal feature:

```bash
sfai /plan "Create customer self-service portal with LWC"
```

The Planner will output:

```json
{
  "feature": "Create customer self-service portal with LWC",
  "tasks": [
    {
      "id": "task_1",
      "title": "Design data model",
      "assignedAgent": "schema-analyst",
      "estimatedComplexity": "low"
    },
    {
      "id": "task_2",
      "title": "Create Apex service layer",
      "assignedAgent": "apex-architect",
      "estimatedComplexity": "medium"
    },
    {
      "id": "task_3",
      "title": "Build LWC components",
      "assignedAgent": "lwc-builder",
      "estimatedComplexity": "medium"
    },
    {
      "id": "task_4",
      "title": "Write comprehensive tests",
      "assignedAgent": "test-writer",
      "estimatedComplexity": "low"
    }
  ],
  "suggestedOrder": ["task_1", "task_2", "task_3", "task_4"]
}
```

## Step 4: Execute the Plan

Now execute each task in order:

### Task 1: Design the Data Model

```bash
sfai /spawn schema-analyst "Analyze current data model and design portal objects"
```

The agent will:
- Review existing custom objects
- Propose new fields
- Suggest relationships
- Output: Portal_Object__c structure

### Task 2: Create Apex Service Layer

```bash
sfai /spawn apex-architect "Design the Portal service class with bulkified queries"
```

Output includes:
- Service class design
- Method signatures
- Error handling
- Bulkification strategy

### Task 3: Build LWC Components

```bash
sfai /spawn lwc-builder "Create the portal dashboard LWC component"
```

Output includes:
- Component structure
- JavaScript logic
- HTML template
- CSS styling

### Task 4: Write Tests

```bash
sfai /spawn test-writer "Write comprehensive tests for Portal service and LWC"
```

Output includes:
- Apex test class
- Test data setup
- Coverage scenarios

## Step 5: Review Generated Code

View what agents created:

```bash
sfai /agent-logs
```

Or check specific agent:

```bash
sfai /agent-logs architect
```

## Step 6: Check Token Usage

See how many tokens were consumed:

```bash
sfai /tokens
```

Example output:
```
Token Usage Report
==================
Session Tokens:    45,234
Total Cost:        $0.68

Breakdown by Model:
- Claude 3 Opus:   30,000 tokens ($0.45)
- Gemini Pro:      15,234 tokens ($0.23)

Current Budget:    $10.00
Remaining:         $9.32
```

## Step 7: Generate Production Code

Now that planning and design are done, you can:

1. **Export code** - Download generated files
2. **Review output** - Check memory storage
3. **Deploy to Salesforce** - Push code to org

```bash
# View what's in memory
sfai /memory list

# Get specific output
sfai /memory get "portal_apex_service"
```

## Best Practices

###  Do This

- Initialize before starting work
- Run `/plan` before `/spawn`
- Use `/status` to monitor context
- Save outputs regularly
- Review agent logs for quality

### ❌ Don't Do This

- Don't skip `/init` step
- Don't spawn agents without a plan
- Don't ignore error messages
- Don't exceed token budget
- Don't mix incompatible agents

---

## File Organization Tips

Keep your project organized for best scanning:

```
force-app/main/default/
├── classes/                 # Apex classes
│   ├── services/           # Service layer
│   ├── selectors/          # Query layer
│   ├── controllers/        # API controllers
│   └── tests/             # Test classes
├── lwc/                     # LWC components
│   ├── common/            # Shared components
│   ├── pages/             # Page components
│   └── utilities/         # Utility components
├── metadata/
│   ├── workflows/
│   ├── validationRules/
│   └── objects/
└── pages/                   # Visualforce (legacy)
```

---

## Next Steps

- 📖 Read [CLI Usage Guide](../guides/cli-usage.md)
-  Explore all [Agents](../agents/overview.md)
- 📚 Learn about [FSD Architecture](../concepts/fsd-architecture.md)
- 🔍 Understand [Context Awareness](../concepts/context-awareness.md)

