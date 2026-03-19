---
sidebar_position: 6
---

# Token Tracking & Cost Management

Manage and optimize your AI token usage and costs.

## Token Basics

A **token** is the unit of text that AI models process.

```
1 token ≈ 4 characters ≈ 0.75 words

Example:
"The quick brown fox" = ~6 tokens
```

### Pricing Models

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| Claude Haiku | $0.80/M | $4/M | Budget-conscious |
| Gemini Pro | $0.50/M | $1.50/M | Cost-effective |
| Claude Sonnet | $3/M | $15/M | Balanced |
| Claude Opus | $15/M | $75/M | Best quality |
| GPT-4 Turbo | $10/M | $30/M | Advanced reasoning |

## Real-time Tracking

### Check Current Usage

```bash
sfai /tokens
```

Output:
```
Token Usage Report
==================
Current Session

Input Tokens:    23,456
Output Tokens:   8,904
Total Tokens:    32,360

Cost Breakdown:
  Claude (70%):   $0.42
  Gemini (30%):   $0.18
  ─────────────────────
  Total Cost:     $0.60

Projected Monthly: $18.00
```

### Detailed Analysis

```bash
# By agent
sfai /tokens --by-agent

# By model  
sfai /tokens --by-model

# By time
sfai /tokens --hourly
sfai /tokens --daily

# Export
sfai /tokens --export tokens.json
```

## Budget Management

### Set Monthly Budget

In `.env`:
```env
SFAI_TOKEN_BUDGET=100
```

Or in config:
```json
{
  "budgeting": {
    "monthlyBudget": 100,
    "alertThreshold": 80,
    "hardLimit": true
  }
}
```

### Alert Thresholds

- **80%:** Warning alert
- **90%:** Critical alert
- **100%:** Stop execution (if hardLimit enabled)

### View Budget Status

```bash
sfai /tokens --budget
```

Output:
```
Monthly Budget Tracking
=======================
Month:    March 2024
Budget:   $100.00
Spent:    $72.45
Remaining: $27.55
Status:    On track (73% used)

Daily Average: $2.41
Days Left:     9
Projected:     $93.12 (under budget!)
```

## Cost Optimization Strategies

### Strategy 1: Model Selection

```
Task                Model Selected   Cost / Query
─────────────────────────────────────────────────
SOQL Optimization   Gemini Pro       $0.005
Simple Review       Gemini Pro       $0.010
Code Generation     Sonnet           $0.025
Architecture        Opus             $0.060
```

**Savings example:**
```
Use Gemini for simple tasks: -60% cost
Use Sonnet for medium:       baseline
Use Opus for complex only:   +200% cost

Mix: 60% Gemini + 30% Sonnet + 10% Opus
Avg cost per query: $0.015 (vs $0.025 if all Sonnet)
→ 40% overall savings!
```

### Strategy 2: Prompt Optimization

**Verbose prompt:** 12,000 tokens input
```
"Can you please review this Apex code 
for security vulnerabilities? Make sure 
to check for SQL injection, XSS, 
authentication issues, and any other 
potential security concerns..."
```

**Optimized prompt:** 2,000 tokens input
```
"Review Apex code for security issues: 
SQL injection, XSS, auth, CSRF, data exposure."
```

**Result:** 83% savings on input tokens!

### Strategy 3: Parallel Execution

```
Sequential:
Agent 1: 30 tokens  (10s)  → Cost $0.001
Agent 2: 25 tokens  (10s)  → Cost $0.001
Agent 3: 20 tokens  (10s)  → Cost $0.001
Total: 75 tokens, 30s, $0.003

Parallel:
All 3 together: (10s)
Total: 75 tokens, 10s, $0.003 (same cost, 3x faster!)
```

### Strategy 4: Caching Results

```
First run:   30,000 tokens  (full analysis)
Cached:      2,000 tokens   (reference lookup)

Example:
Run planner once → store plan
All agents read cached plan
Savings: 28,000 tokens per agent!

5 agents = 140,000 tokens saved
```

## Cost Tracking by Agent

### View Agent Costs

```bash
sfai /cost --by-agent
```

Output:
```
Cost Breakdown by Agent
=======================

apex-architect      $18.50  (26%)
ljc-builder         $14.25  (20%)
test-writer         $12.50  (17%)
apex-reviewer       $11.75  (16%)
schema-analyst      $7.50   (11%)
─────────────────────────────────
Total               $70.00
```

### Agent-Specific Budgets

```json
{
  "agentBudgets": {
    "apex-architect": 20,
    "lwc-builder": 15,
    "test-writer": 12,
    "apex-reviewer": 12,
    "schema-analyst": 10
  }
}
```

## Token Estimation

### Before Running

Estimate tokens for a task:

```bash
sfai /tokens --estimate "Your task description"
```

Output:
```
Token Estimate for Task
=======================
Agent:       apex-architect
Description: "Design service layer for lead management"

Estimated Input:     3,500 tokens
Estimated Output:    1,500 tokens
Total Estimate:      5,000 tokens

Cost Estimate:       $0.015 (using Claude Sonnet)
Time Estimate:       15-30 seconds
```

### Use Estimates Before Spawning

```bash
# Check cost first
sfai /tokens --estimate "Your task"

# If cost acceptable, spawn
sfai /spawn architect "Your task"
```

## Usage Patterns

### Analyze Your Usage

```bash
# Pattern analysis
sfai /cost --pattern
```

Output:
```
Usage Patterns
==============

Peak Hours:     9-11 AM (40% of daily usage)
Peak Days:      Monday-Wednesday
Most Used Agent: apex-architect (26%)
Most Used Model: Claude Sonnet (60%)

Trends:
  Week 1:    $15.00
  Week 2:    $18.50 (↑23%)
  Week 3:    $16.75 (↓9%)
  Week 4:    $14.20 (↓15%)

Recommendation: Steady decrease - good optimization!
```

## Cost Reports

### Daily Report

```bash
sfai /cost --report daily
```

### Weekly Report

```bash
sfai /cost --report weekly
```

### Monthly Analysis

```bash
sfai /cost --report monthly --export report.pdf
```

Report includes:
- Total spend by category
- Cost trends
- Usage patterns
- Optimization recommendations
- Budget vs actual

## Saving Money

### Quick Wins

| Action | Saving | Effort |
|--------|--------|--------|
| Use Gemini for simple tasks | 50% | ⭐ Easy |
| Optimize prompts | 30% | ⭐⭐ Medium |
| Cache results | 40% | ⭐⭐ Medium |
| Parallel execution | 3x speed | ⭐⭐⭐ Hard |
| Reduce context | 20% | ⭐⭐ Medium |

### Calculate ROI

```
Time saved per week: 8 hours
Hourly rate: $75
Weekly savings: $600

AI cost per week: $20
Net savings: $580/week = $30,160/year!
```

## Advanced Cost Management

### Cost Alerts

Configure alerts in `.env`:

```env
# Alert at 70% of budget
SFAI_COST_ALERT_PERCENT=70

# Daily spending limit
SFAI_DAILY_LIMIT=10
```

### Cost Gates

Prevent expensive operations:

```bash
# This would cost $0.50
sfai /spawn --max-cost 0.30 optimizer "..."
# Result: ❌ Rejected (exceeds max)

sfai /spawn --max-cost 0.60 optimizer "..."
# Result:  Allowed
```

## Integration with Billing

### Export for Accounting

```bash
sfai /cost --export accounting.csv --period 2024-03
```

CSV format:
```csv
Date,Agent,Model,Tokens,Cost,Project
2024-03-01,architect,opus,5000,0.075,portal-feature
2024-03-01,builder,sonnet,3000,0.012,portal-feature
```

### Connect to Finance Systems

```javascript
// Webhook for billing system
POST /webhook/costs
{
  "timestamp": "2024-03-19T10:00:00Z",
  "tokens": 5000,
  "cost": 0.075,
  "model": "claude-opus",
  "agent": "apex-architect"
}
```

---

## Best Practices

 **Do This:**
- Check estimates before spawning complex agents
- Use appropriate models for task complexity
- Monitor token usage regularly
- Set budget alerts
- Export reports for analysis

❌ **Don't Do This:**
- Spawn expensive agents for simple tasks
- Ignore budget warnings
- Forget to cache results
- Run unnecessary parallel agents
- Use max-capability models for basic work

