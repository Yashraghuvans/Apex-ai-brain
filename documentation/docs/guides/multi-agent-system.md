---
sidebar_position: 3
---

# Multi-Agent System

Deep dive into how the multi-agent system orchestrates Salesforce development.

## System Overview

The Multi-Agent System is the heart of Apex AI Brain. It coordinates 16 specialized AI agents to break down complex Salesforce development tasks into focused, manageable subtasks.

```
Feature Request
    ↓
Planner Agent breaks into tasks
    ↓
Task Routing to Specialized Agents:
├─ Architect Agent → Design
├─ Builder Agent → Implementation
├─ Reviewer Agent → Quality
├─ Optimizer Agent → Performance
└─ Tester Agent → Validation
    ↓
Results aggregated in Memory
    ↓
Complete Feature Ready
```

## Agent Categories

### 🏗 Architect Agents

These agents design solutions following enterprise patterns.

#### Apex Architect
- **Role:** Senior Salesforce architect
- **Focuses on:** Class structure, design patterns, FSD compliance
- **Output:** Class designs, method signatures, architecture diagrams
- **Example Task:** `"Design a lead scoring service with Domain/Service/Selector pattern"`

#### LWC Builder
- **Role:** Component expert
- **Focuses on:** LWC development, performance, best practices
- **Output:** Component code, templates, styling
- **Example Task:** `"Create a filterable data table with aura data service"`

#### Schema Analyst
- **Role:** Data model expert
- **Focuses on:** Custom objects, fields, relationships
- **Output:** Object definitions, field specifications, relationships
- **Example Task:** `"Design portal objects for customer self-service"`

#### Flow Advisor
- **Role:** Automation expert
- **Focuses on:** Process automation, Flow best practices
- **Output:** Flow definitions, decision trees, recommendations
- **Example Task:** `"Design a multi-step approval flow for contracts"`

### 🔍 Reviewer & Quality Agents

These agents ensure code quality and compliance.

#### Apex Reviewer
- **Role:** Chief code reviewer
- **Focuses on:** Code quality, maintainability, patterns
- **Output:** Review comments, refactoring suggestions
- **Example Task:** `"Review AccountService for bulkification"`

#### Security Agent
- **Role:** Security specialist
- **Focuses on:** Security vulnerabilities, compliance
- **Output:** Security audit, recommendations, fixes
- **Example Task:** `"Check authentication handler for CSRF vulnerabilities"`

#### Test Writer
- **Role:** QA automation specialist
- **Focuses on:** Test coverage, test scenarios
- **Output:** Test classes, test methods, coverage metrics
- **Example Task:** `"Write comprehensive tests for LeadTriggerHandler"`

#### Diff Reviewer
- **Role:** Git workflow specialist
- **Focuses on:** Code changes, PR preparation
- **Output:** Change analysis, commit messages
- **Example Task:** `"Analyze changes between main and feature branch"`

###  Operations Agents

These agents optimize and manage deployments.

#### SOQL Optimizer
- **Role:** Query performance expert
- **Focuses on:** Query optimization, SOQL best practices
- **Output:** Optimized queries, performance analysis
- **Example Task:** `"Optimize account queries in dashboard controller"`

#### Metadata Manager
- **Role:** Metadata configuration expert
- **Focuses on:** Metadata setup, org configuration
- **Output:** Metadata specifications, deployment guides
- **Example Task:** `"Configure custom settings for feature flags"`

#### Git Agent
- **Role:** Version control specialist
- **Focuses on:** Git operations, branch management
- **Output:** Commit messages, PR descriptions
- **Example Task:** `"Create meaningful commit message for lead scoring"`

#### Deployment Agent
- **Role:** Release management expert
- **Focuses on:** Deployment strategies, rollback plans
- **Output:** Deployment plans, validation steps
- **Example Task:** `"Plan deployment for large org with 1000+ users"`

#### Kanban Agent
- **Role:** Project management specialist
- **Focuses on:** Task tracking, agile workflows
- **Output:** Task breakdowns, sprint planning
- **Example Task:** `"Create sprint backlog for Q1 initiatives"`

### 🧠 Utility Agents

These agents provide cross-cutting capabilities.

#### Planner
- **Role:** Project architect and task planner
- **Focuses on:** Feature decomposition, task sequencing
- **Output:** Structured plans, dependency graphs
- **Example Task:** `"Plan customer portal feature"`

#### Debug Agent
- **Role:** Troubleshooting specialist
- **Focuses on:** Problem diagnosis, root cause analysis
- **Output:** Debugging guidance, solutions
- **Example Task:** `"Why is my LWC component throwing JavaScript error?"`

#### Memory Agent
- **Role:** Context management specialist
- **Focuses on:** Shared memory operations, knowledge base
- **Output:** Memory queries, context summaries
- **Example Task:** `"Retrieve all previous Decision Tree designs"`

---

## Agent Communication Flow

### Direct Communication (Agent-to-Memory)

```
Agent A → Memory System → Agent B
   ↓           ↓            ↓
Result     Storage        Reads
shared     managed        context
```

**Example:**
1. Architect designs schema → stores in memory
2. LWC Builder reads schema → uses in component design
3. Test Writer reads both → writes tests for both

### Coordinated Execution (Orchestrated)

```
Orchestrator
    ├─→ Agent 1 (Task 1)
    ├─→ Agent 2 (Task 2)
    ├─→ Agent 3 (Task 3)
    └─ Waits for completion
        ↓
    Coordinates Agent 4 (depends on 1,2,3)
        ↓
    Aggregates results
```

---

## Multi-Agent Patterns

### Pattern 1: Sequential Design Pattern

Used when tasks depend on each other.

```
Planner → Architect → Builder → Reviewer → Tester → Deployed
   1    →    2      →    3     →    4     →   5    →    6
```

**Example: Building Lead Scoring**
1. 📋 Planner breaks down feature
2. 🏗 Architect designs service layer
3. 🔨 Developer builds implementation
4. 🔍 Reviewer checks quality
5.  Tester writes tests
6.  Deployed to org

### Pattern 2: Parallel Architecture Pattern

Used for independent components.

```
             ┌─→ Apex Service (Architect)
             ├─→ LWC Component (Builder)
Feature Plan ├─→ SOQL Queries (Optimizer)
             └─→ Test Cases (Tester)
                 ↓
             Integrated Result
```

### Pattern 3: Review & Revise Pattern

Used for quality gates.

```
Agent Output
    ↓
Reviewer Assessment
    ├─  Approved → Deploy
    ├─ 🔄 Revise → Agent refines
    └─ ❌ Reject → Agent redesigns
```

---

## Memory-Based Coordination

### Memory Structure

```json
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Design schema",
      "agent": "schema-analyst",
      "status": "complete",
      "output": {...},
      "timestamp": "2024-03-19T10:00:00Z"
    }
  ],
  "dependencies": [
    { "task": "task_2", "dependsOn": ["task_1"] }
  ],
  "shared_context": {
    "project": "portal-app",
    "schema": {...}
  }
}
```

### Inter-Agent Knowledge Sharing

**Pattern A: Feed-Forward**
```
Agent 1 Output (in Memory)
    ↓
Agent 2 reads Memory
    ↓
Uses Agent 1 output as input
    ↓
Produces new output
    ↓
Stores in Memory
```

**Pattern B: Reference Sharing**
```
Architect stores: "Portal_Account__c schema"
    ↓
LWC Builder reads reference
    ↓
Implements component based on schema
    ↓
Reviewer cross-checks both
```

---

## Execution Strategies

### Strategy 1: Waterfall (Sequential)

Best for well-defined features with clear dependencies.

```bash
sfai /plan "Add customer portal"
# Returns: Sequential task list

sfai /spawn planner "Plan..."
sfai /spawn schema-analyst "Analyze..."
sfai /spawn apex-architect "Architect..."
sfai /spawn lwc-builder "Build..."
sfai /spawn test-writer "Test..."
```

**Pros:** Clear dependencies, easier to understand
**Cons:** Slower, errors require restart

### Strategy 2: Agile (Parallel + Feedback)

Best for exploratory features with iterations.

```bash
# Parallel architect phase
sfai /spawn apex-architect "Design service"
sfai /spawn schema-analyst "Design schema"
sfai /spawn flow-advisor "Design automation"

# Wait for results
sfai /memory list

# Then build phase
sfai /spawn lwc-builder "Build component (uses architect output)"
```

**Pros:** Faster, discovers issues early
**Cons:** Requires coordination

### Strategy 3: DevOps (Continuous)

Best for incremental improvements.

```bash
sfai /spawn soql-optimizer "Optimize queries"
sfai /spawn security-agent "Check security"
sfai /spawn apex-reviewer "Review code"
```

**Pros:** Continuous improvement
**Cons:** Needs monitoring

---

## Agent State Management

### Agent States

```
┌─────────────┐
│    IDLE     │ Waiting for task
└──────┬──────┘
       │ /spawn command
       ↓
┌─────────────┐
│  THINKING   │ Analyzing task
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   WORKING   │ Generating response
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    DONE     │ Storing result
└──────┬──────┘
       │
       ↓ (or error)
┌─────────────┐
│   ERROR     │ Exception occurred
└─────────────┘
```

### Status Monitoring

```bash
# Check agent status
sfai /agents

# Watch specific agent
sfai /agent-logs architect --watch

# Get timing info
sfai /agent-logs --timing
```

---

## Error Handling & Recovery

### Multi-Level Error Handling

```
Level 1: Prompt Validation
    ↓
Level 2: Task Execution
    ↓
Level 3: Output Validation
    ↓
Level 4: Memory Storage
```

### Recovery Strategies

| Error | Recovery |
|-------|----------|
| Task too complex | Split into subtasks |
| Agent timeout | Retry with simpler prompt |
| Invalid output | Regenerate with correction |
| Memory conflict | Merge or override |

---

## Performance Optimization

### Parallel Execution Benefits

For independent agents:
- **Waterfall (sequential):** 4 agents × 30s each = 120s
- **Parallel:** max(30s) = 30s (4x faster!)

### Token Optimization

```
One large prompt:     200k tokens
Four focused prompts: 50k tokens each (80% savings)
```

### Caching Strategies

- Reuse schema definitions
- Share query optimizations
- Store common patterns

---

## Advanced Topics

### Custom Agent Integration

Add a new agent:

```javascript
// new-agent.md
---
name: custom-agent
description: "My custom agent"
model: medium
tools: [read, memory]
---

Your instructions here...
```

### Agent Chaining

```bash
# Create a chain
sfai /spawn planner "Plan feature"
sfai /spawn apex-architect "@refer planner_output: Design from plan"
sfai /spawn lwc-builder "@refer architect_output: Build from design"
```

### Conditional Routing

```
if complexity > threshold:
    use opus model
else:
    use sonnet model
```

---

## Best Practices

 **Plan before executing** - Use /plan command first
 **Check memory** - Review previous outputs
 **Use specific agents** - Choose the right tool
 **Monitor costs** - Track token usage
 **Review outputs** - Check /agent-logs
 **Store results** - Use /memory to save valuable outputs

❌ **Don't spawn too many agents** - Can cause confusion
❌ **Don't ignore dependencies** - Follow task order
❌ **Don't exceed budget** - Monitor token costs
❌ **Don't skip reviews** - Quality is critical

