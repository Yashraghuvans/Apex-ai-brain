---
sidebar_position: 4
---

# Token Management

Understanding AI token economics and optimization.

## What Are Tokens?

Tokens are atomic units of text that AI models process.

```
"Hello world" ≈ 2-3 tokens
Typical word ≈ 1.3 tokens
```

## Token Pricing

Different models charge different rates:

```
Model           Input   Output  Best For
─────────────────────────────────────────
Claude Haiku    $0.80   $4      Budget
Gemini Pro      $0.50   $1.50   Speed
Claude Sonnet   $3      $15     Balanced
Claude Opus     $15     $75     Power
GPT-4 Turbo     $10     $30     Advanced
```

## Optimization Strategies

### 1. Right-Size the Model

```
Simple task: Use Gemini ($0.50/M)
Complex task: Use Opus ($15/M)
```

### 2. Optimize Prompts

```
Verbose prompt:  12,000 tokens  Cost: $0.03
Concise prompt:  2,000 tokens   Cost: $0.005
Savings: 83%!
```

### 3. Cache Results

```
First run with 30k tokens
Second time with cached result: 2k tokens
Savings across team: massive
```

---

**Full Details:**
See [Token Tracking Guide](../guides/token-tracking.md)

