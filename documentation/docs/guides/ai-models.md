---
sidebar_position: 4
---

# AI Models & Routing

Understand how Apex AI Brain selects and routes tasks between different AI models.

## Supported Models

### Claude (Anthropic) - Default Primary

**Best for:** Complex architecture, creative solutions

```
Models:
├─ Claude 3 Opus      (200k context) - Most capable
├─ Claude 3 Sonnet    (200k context) - Balanced  
└─ Claude 3 Haiku     (200k context) - Fast & cheap

Pricing:
├─ Opus:   $15 / 1M input,  $75 / 1M output
├─ Sonnet: $3  / 1M input,  $15 / 1M output
└─ Haiku:  $0.80 / 1M input, $4 / 1M output
```

**Strengths:**
- ✅ Excellent code generation
- ✅ Strong reasoning
- ✅ Good context understanding
- ✅ Architectural design

### Google Gemini - Fast & Efficient

**Best for:** Quick analysis, cost-effective solutions

```
Models:
├─ Gemini Pro       (30k context) - General purpose
└─ Gemini Pro Vision (30k context) - With image input

Pricing:
├─ Pro:      $0.50 / 1M input,  $1.50 / 1M output
└─ Pro Vision: $1 / 1M input,    $3 / 1M output
```

**Strengths:**
- ✅ Very fast responses
- ✅ Cost-effective
- ✅ Good for code review
- ✅ Parallel processing friendly

### GPT-4 / GPT-4 Turbo - Experimental

**Best for:** Advanced reasoning, specialized tasks

```
Models:
├─ GPT-4 Turbo   (128k context) - Latest & fastest
└─ GPT-4         (8k context)   - Legacy

Pricing:
├─ Turbo: $10 / 1M input, $30 / 1M output
└─ GPT-4: $30 / 1M input, $60 / 1M output
```

---

## Model Selection Strategy

### Automatic Routing

Apex AI Brain automatically selects the best model based on:

```
┌────────────────────┐
│  Task Analysis     │
├────────────────────┤
│ Complexity Level   │
│ Output Type        │
│ Context Size       │
│ Budget Constraint  │
└────────────┬───────┘
             ↓
┌────────────────────┐
│  Model Scoring     │
├────────────────────┤
│ Score each model   │
│ Weight by factors  │
│ Select best fit    │
└────────────┬───────┘
             ↓
┌────────────────────┐
│  Execute &Track    │
└────────────────────┘
```

### Model Assignment by Agent

| Agent | Default | Fallback | Reason |
|-------|---------|----------|--------|
| apex-architect | Opus | Sonnet | Complex architecture |
| lwc-builder | Sonnet | Gemini | Balanced performance |
| apex-reviewer | Opus | Sonnet | Deep analysis needed |
| soql-optimizer | Gemini | Haiku | Quick optimization |
| schema-analyst | Sonnet | Gemini | Structured design |
| security-agent | Opus | Sonnet | Thorough review |
| test-writer | Sonnet | Gemini | Good patterns |
| deployment-agent | Gemini | Sonnet | Fast planning |

---

## Manual Model Selection

### Set Default Model

```bash
# Global default
sfai /model set claude

# For specific command
sfai /spawn --model gemini soql-optimizer "Optimize queries"
```

### Model-Specific Options

```bash
# Use specific Claude model
sfai /spawn --model opus apex-architect "..."

# Use Gemini for speed
sfai /spawn --model gemini lwc-builder "..."

# Use GPT-4 for advanced reasoning
sfai /spawn --model gpt4 debug-agent "..."
```

---

## Context Window Management

### Context Sizes

```
Model              Context Size    Cost Factor
─────────────────────────────────────────────
Claude Opus        200k tokens     3.0x
Claude Sonnet      200k tokens     1.0x (baseline)
Claude Haiku       200k tokens     0.25x
Gemini Pro         30k tokens      0.25x
GPT-4 Turbo        128k tokens     2.0x
```

### Context Optimization

When context is too large:

```
1. Summarize code
2. Extract key patterns
3. Remove comments
4. Strip boilerplate
5. Keep core logic
```

**Example:**
```
Original: 50k tokens (too large)
    ↓
Summarized: 5k tokens (sends core concepts)
    ↓
Response size reduced by 90%
    ↓
Cost reduced by 90%
```

---

## Token Tracking & Cost Management

### Token Usage Report

```bash
sfai /tokens --breakdown
```

Sample output:
```
Token Usage This Session
========================

By Model:
  Claude Opus:    30,000  →  $0.45
  Claude Sonnet:  50,000  →  $0.15
  Gemini Pro:     15,000  →  $0.08
  ───────────────────────────────
  Total:          95,000  →  $0.68

By Agent:
  apex-architect:   40,000  →  $0.30
  lwc-builder:      30,000  →  $0.18
  test-writer:      25,000  →  $0.20

Projected Monthly:
  Current:  $20.40
  Budget:   $100.00
  Status:   ✅ On track
```

### Cost Optimization

#### Strategy 1: Use Cheaper Models for Simple Tasks

```
❌ WRONG:
apex-architect using Opus to optimize query
  Cost: $0.15 for quick task

✅ RIGHT:
soql-optimizer using Gemini to optimize query
  Cost: $0.02 for same task (7.5x cheaper!)
```

#### Strategy 2: Combine Fast + Complex

```bash
# 1. Fast agents first (Gemini)
sfai /spawn soql-optimizer --model gemini "Analyze queries"

# 2. Complex agents second (Claude Opus)
sfai /spawn apex-architect --model opus "Design architecture"

# 3. Final review (Claude Sonnet)
sfai /spawn apex-reviewer --model sonnet "Review code"

Total: More results, lower cost!
```

#### Strategy 3: Prompt Engineering

Shorter, focused prompts:
- Less context sent
- Faster processing
- Lower token usage
- Better responses

---

## Model Comparison

### Code Generation

```
Claude Opus:     95% quality, follows patterns perfectly
Claude Sonnet:   90% quality, good patterns
Gemini Pro:      85% quality, basic patterns
GPT-4 Turbo:     92% quality, creative solutions
```

### Speed

```
Gemini Pro:      ⚡⚡⚡ Fastest (2-5s)
Claude Haiku:    ⚡⚡ Fast (5-10s)
Claude Sonnet:   ⚡ Medium (8-15s)
Claude Opus:     🐌 Slower (10-20s)
GPT-4 Turbo:     🐌 Slowest (15-30s)
```

### Cost Efficiency

```
Claude Haiku:    💰 Cheapest (0.25x baseline)
Gemini Pro:      💰 Cheap (0.25x baseline)
Claude Sonnet:   💲 Baseline (1.0x)
Claude Opus:     💲💲 Expensive (3.0x)
GPT-4 Turbo:     💲💲 Most expensive (2.0x)
```

---

## Advanced Model Configuration

### Create Model Profile

In `sfai.config.json`:

```json
{
  "modelProfiles": {
    "fast": {
      "primary": "gemini",
      "timeout": 5000,
      "retries": 1
    },
    "quality": {
      "primary": "claude-opus",
      "timeout": 20000,
      "retries": 3
    },
    "balanced": {
      "primary": "claude-sonnet",
      "fallback": "gemini",
      "timeout": 10000,
      "retries": 2
    }
  }
}
```

### Use Profile

```bash
sfai /spawn --profile fast soql-optimizer "..."
sfai /spawn --profile quality apex-architect "..."
```

---

## Model Fallback Strategy

### Automatic Fallback Chain

```
Primary model fails
    ↓
Try fallback model 1
    ↓
Try fallback model 2
    ↓
Return best attempt or error
```

### Configure Fallback

```json
{
  "modelFallback": {
    "claude-opus": ["claude-sonnet", "gpt4"],
    "claude-sonnet": ["claude-haiku", "gemini"],
    "gemini": ["claude-haiku"],
    "gpt4": ["claude-opus"]
  }
}
```

---

## Model-Specific Parameters

### Claude-Specific

```bash
sfai /spawn --model claude \
  --temperature 0.7 \          # Creativity (0-1)
  --max-tokens 2000 \          # Output limit
  apex-architect "..."
```

### Gemini-Specific

```bash
sfai /spawn --model gemini \
  --temperature 0.5 \
  --top-k 40 \                 # Diversity
  --top-p 0.95 \
  lwc-builder "..."
```

---

## Cost Control

### Monthly Budget Configuration

```json
{
  "costControl": {
    "monthlyBudget": 100,
    "alertThreshold": 0.80,
    "hardLimit": true
  }
}
```

When budget exceeded:
- `alertThreshold: 0.80` → Warning at $80
- `hardLimit: true` → Stop after $100

### Per-Agent Budget

```json
{
  "agentBudget": {
    "apex-architect": 30,
    "lwc-builder": 20,
    "test-writer": 15
  }
}
```

---

## Performance & Cost Matrix

Use this to choose the best model:

| Task | Recommended | Reason |
|------|-------------|--------|
| Simple code review | Gemini | Fast & cheap |
| SOQL optimization | Gemini | Straightforward analysis |
| Architecture design | Claude Opus | Complex reasoning needed |
| Component building | Claude Sonnet | Balance quality & cost |
| Test generation | Claude Sonnet | Good test patterns |
| Security audit | Claude Opus | Thorough analysis |
| Debugging | Claude Sonnet | Good at finding issues |
| Deployment planning | Gemini | Quick planning |

---

## Monitoring

### Real-time Monitor

```bash
watch -n 5 'sfai /tokens --live'
```

### Daily Report

```bash
sfai /tokens --daily --export report.json
```

### Analysis

```bash
# Which agents cost the most?
sfai /cost --by-agent

# Trend analysis
sfai /cost --trend 30days

# Projection
sfai /cost --projection end-of-month
```

