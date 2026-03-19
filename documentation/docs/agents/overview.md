---
sidebar_position: 1
---

# Agents Overview

Meet the 16 specialized agents that power Apex AI Brain.

## What Are Agents?

Agents are specialized AI-powered assistants, each focused on a specific domain of Salesforce development. They work together through shared memory to break down complex tasks into manageable, quality-assured work.

## Agent Directory

### 🏗 Architects (4 Agents)

Agents responsible for design and architecture decisions.

#### Apex Architect
**Specialization:** Apex code structure and design patterns
- Designs class hierarchies
- Enforces FSD (Feature-Sliced Design)
- Creates domain models
- Ensures separation of concerns
- **Use when:** Designing service layers, defining architecture

#### LWC Builder
**Specialization:** Lightning Web Component development
- Creates component templates
- Handles data binding
- Optimizes performance
- Follows LWC best practices
- **Use when:** Building interactive UI components

#### Schema Analyst
**Specialization:** Data model design
- Designs custom objects
- Creates relationships
- Defines fields and validations
- Optimizes data structure
- **Use when:** Planning data architecture

#### Flow Advisor
**Specialization:** Salesforce Flow automation
- Designs flow structures
- Recommends automation patterns
- Optimizes flow logic
- Handles complex decision trees
- **Use when:** Building process automation

### 🔍 Reviewers (4 Agents)

Agents responsible for code review and quality assurance.

#### Apex Reviewer
**Specialization:** Apex code quality and patterns
- Reviews code for maintainability
- Checks pattern usage
- Suggests refactoring
- Validates best practices
- **Use when:** Need code review

#### Security Agent
**Specialization:** Security & compliance
- Checks for vulnerabilities
- Verifies security patterns
- Audits compliance
- Recommends hardening
- **Use when:** Auditing security

#### Test Writer
**Specialization:** Test automation
- Generates test classes
- Creates test scenarios
- Calculates coverage
- Optimizes test performance
- **Use when:** Need comprehensive tests

#### Diff Reviewer
**Specialization:** Git diff analysis
- Analyzes code changes
- Reviews commits
- Generates PR descriptions
- Suggests improvements
- **Use when:** Reviewing changes

###  Operations (5 Agents)

Agents responsible for optimization and deployment.

#### SOQL Optimizer
**Specialization:** Query optimization
- Optimizes SOQL queries
- Suggests indexing strategies
- Analyzes performance
- Reduces execution time
- **Use when:** Optimizing queries

#### Metadata Manager
**Specialization:** Metadata management
- Configures metadata
- Manages settings
- Handles org configuration
- Optimizes deployment
- **Use when:** Configuring org

#### Git Agent
**Specialization:** Version control
- Creates meaningful commits
- Generates PR descriptions
- Manages branches
- Handles release notes
- **Use when:** Managing git workflows

#### Deployment Agent
**Specialization:** Deployment & release
- Plans deployments
- Validates changes
- Suggests rollback strategies
- Manages environments
- **Use when:** Planning deployments

#### Kanban Agent
**Specialization:** Project management
- Breaks down features
- Creates backlogs
- Manages sprint planning
- Tracks progress
- **Use when:** Planning sprints

### 🧠 Utilities (3 Agents)

Agents providing cross-cutting capabilities.

#### Planner
**Specialization:** Feature planning
- Decomposes feature requests
- Maps dependencies
- Assigns agents
- Sequences tasks
- **Use when:** Planning complex features

#### Debug Agent
**Specialization:** Troubleshooting
- Diagnoses issues
- Suggests fixes
- Explains errors
- Provides debugging guidance
- **Use when:** Troubleshooting problems

#### Memory Agent
**Specialization:** Memory management
- Manages shared memory
- Retrieves context
- Organizes knowledge base
- Optimizes storage
- **Use when:** Managing project knowledge

---

## Agent Interaction Matrix

### Who Talks to Whom?

```
Planner
  ↙   ↘
Architect  Kanban
  ↙   ↘
Service   LWC
  ↓   ↓
Review  Security
  ↾ ↾
Deploy  Test
```

### Typical Collaboration Flow

```
User Request
    ↓
Planner breaks down
    ↓
Architect + Schema Analyst design
    ↓
LWC Builder + Apex team build
    ↓
Test Writer validates
    ↓
Reviewers + Security audit
    ↓
SOQL Optimizer + Deployment plan
    ↓
Ready for deployment
```

---

## Agent Selection Guide

### By Salesforce Feature

| Feature | Recommended Agents |
|---------|-------------------|
| **Custom Object** | Schema Analyst, Apex Architect |
| **Apex Class** | Apex Architect, Test Writer, Reviewer |
| **LWC Component** | LWC Builder, Security Agent |
| **Flow** | Flow Advisor, Test Writer |
| **SOQL Query** | SOQL Optimizer, Apex Architect |
| **Test Suite** | Test Writer, Apex Reviewer |
| **Data Migration** | Schema Analyst, SOQL Optimizer |

### By Task Type

| Task | Agent |
|------|-------|
| **Planning** | Planner |
| **Architecture** | Apex Architect, Schema Analyst |
| **Implementation** | LWC Builder, (Apex indirectly) |
| **Testing** | Test Writer |
| **Code Review** | Apex Reviewer, Security Agent |
| **Optimization** | SOQL Optimizer |
| **Deployment** | Deployment Agent |
| **Debugging** | Debug Agent |

---

## Agent Capabilities

### What Each Agent Can Do

| Agent | Read | Write | Analyze | Generate |
|-------|:----:|:-----:|:-------:|:--------:|
| Apex Architect | X | X | X | Code |
| LWC Builder | X | X | - | Components |
| Apex Reviewer | X | - | X | Reviews |
| Test Writer | X | X | X | Tests |
| SOQL Optimizer | X | - | X | Queries |
| Security Agent | X | - | X | Fixes |
| Schema Analyst | X | X | X | Design |
| Flow Advisor | X | X | X | Flows |
| Planner | X | - | X | Plans |
| Git Agent | X | - | X | Commits |
| Diff Reviewer | X | - | X | Reports |
| Memory Agent | X | X | X | Snapshots |
| Kanban Agent | X | X | X | Sprints |
| Deployment Agent | X | X | - | Deployments |
| Metadata Manager | X | X | X | Configs |
| Debug Agent | X | - | X | Fixes |

---

## Agent Performance Metrics

### Speed

Speed of response (typical):

```
Fast (&lt;10s):        Gemini agents, optimization
Medium (10-20s):    LWC Builder, SOQL Optimizer
Slow (20-60s):      Apex Architect, Security Agent, Test Writer
```

### Accuracy

Output quality rating:

```
Excellent (95%+):   Apex Architect, Apex Reviewer, Schema Analyst
Very Good (85%+):   LWC Builder, Test Writer, Security Agent
Good (75%+):        SOQL Optimizer, Planner
```

### Cost Efficiency

Tokens per task (relative to Sonnet baseline):

```
Efficient (0.5x):   SOQL Optimizer, Deployment Agent
Normal (1.0x):      LWC Builder, Test Writer, Flow Advisor
Expensive (1.5x):   Apex Architect, Security Agent
```

---

## Working with Agents

### Basic Command

```bash
sfai /spawn <agent-name> "<task description>"
```

### Examples

```bash
# Architecture
sfai /spawn apex-architect "Design the lead scoring service"

# Components
sfai /spawn lwc-builder "Create a data table component"

# Testing
sfai /spawn test-writer "Write tests for LeadService"

# Review
sfai /spawn apex-reviewer "Review AccountHandler for security"

# Optimization
sfai /spawn soql-optimizer "Optimize account dashboard queries"
```

---

## Agent Workflow Example

### Building a Complete Feature

```
Step 1: PLAN
  sfai /plan "Create customer portal"
  
  ↓ Planner agent creates structured plan

Step 2: DESIGN
  sfai /spawn schema-analyst "Design portal objects"
  sfai /spawn apex-architect "Design portal service layer"
  
  ↓ Architecture stored in memory

Step 3: BUILD
  sfai /spawn lwc-builder "Create portal components"
  
  ↓ Uses architecture from memory

Step 4: TEST
  sfai /spawn test-writer "Write comprehensive tests"
  
  ↓ Tests both components and services

Step 5: REVIEW
  sfai /spawn apex-reviewer "Review generated code"
  sfai /spawn security-agent "Audit for security"
  
  ↓ Quality gates passed

Step 6: OPTIMIZE
  sfai /spawn soql-optimizer "Optimize dashboard queries"
  
  ↓ Performance optimized

Step 7: DEPLOY
  sfai /spawn deployment-agent "Plan deployment"
  
  ↓ Ready for production
```

---

## Advanced Agent Features

### Agent Chaining

Use output from one agent as input to another:

```bash
# First agent
sfai /spawn planner "Plan lead scoring"

# Access plan in memory
PLAN=$(sfai /memory get "planner_output")

# Second agent uses plan
sfai /spawn apex-architect "Design per this plan: $PLAN"
```

### Parallel Execution

Run multiple agents simultaneously:

```bash
sfai /spawn schema-analyst "Analyze existing schema" &
sfai /spawn planner "Break down requirements" &
sfai /spawn apex-architect "Design service layer" &
wait
```

### Conditional Routing

Use agent based on complexity:

```bash
READ complexity
if complexity > High:
  sfai /spawn apex-architect "Complex design"
else:
  sfai /spawn lwc-builder "Simple component"
```

---

## Features Across Agents

### Shared Capabilities

All agents can:
-  Read project context
-  Access shared memory
-  Generate documentation
-  Store results
-  Provide explanations

### How Agents Share Knowledge

```
Agent A → Stores result in memory
           ↓
Agent B → Reads result from memory
           ↓
Agent B → Uses Agent A's result as context
           ↓
Agent B → Generates enhanced result
```

---

## Next Steps

Ready to meet each agent?

- [Apex Architect](./apex-architect.md) - Master architect agent
- [LWC Builder](./lwc-builder.md) - Component creation specialist
- [Test Writer](./test-writer.md) - Quality assurance expert

Or jump to:
- [CLI Usage](../guides/cli-usage.md) - How to use agents
- [Multi-Agent System](../guides/multi-agent-system.md) - How they work together

