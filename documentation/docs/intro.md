---
slug: /
id: intro
sidebar_position: 1
---

# Welcome to Apex AI Brain

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Salesforce](https://img.shields.io/badge/Salesforce-00A1E0?style=flat&logo=salesforce&logoColor=white)
![Powered by Claude & Gemini](https://img.shields.io/badge/Powered_by-Claude_&_Gemini-8E75B2?style=flat)
![Architecture: FSD](https://img.shields.io/badge/Architecture-FSD-FF6B6B.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)

**Tired of AI generating code that violates Salesforce governor limits? Apex AI Brain enforces best practices automatically.**

Apex AI Brain is an enterprise-grade, multi-agent AI framework that generates production-ready Salesforce code with built-in guardrails, not hallucinations.

## What Problem Does This Solve?

Generic AI coding assistants (Copilot, ChatGPT, Claude) were trained on web patterns that don't work in Salesforce. They generate:

- Non-bulkified code that hits governor limits
- Triggers instead of Flows
- Synchronous operations causing timeouts
- Hardcoded IDs and insecure queries
- Incorrect folder structures

**Apex AI Brain solves this by:**
- Injecting Salesforce rules directly into the AI's prompts
- Validating every generated line against 50+ governance rules
- Using multi-agent orchestration for complex tasks
- Tracking costs and tokens in real-time
- Enforcing Feature-Sliced Design (FSD) architecture

## Enterprise-Grade Salesforce AI Architecture System

Apex AI Brain is an **agentic framework and prompt architecture** designed to transform enterprise AI into a strict, best-practice-enforcing Salesforce architect.

Instead of relying on generic AI knowledge (which often hallucinates standard web patterns that violate Salesforce limits), this system injects strict governor limits, bulkification rules, and Feature-Sliced Design (FSD) folder structures directly into the AI's reasoning.

###  Core Purpose

Think of Apex AI Brain as **architectural ESLint rules for AI**. By utilizing this framework, you force the AI to:

-  Write bulkified, `WITH USER_MODE` compliant Apex
-  Choose Flows over Triggers where appropriate
-  Follow strict LWC data-binding patterns
-  Adhere to an enterprise folder structure
-  Enforce Salesforce governor limits
-  Generate production-ready code with guardrails

###  Key Features

| Feature | Description |
|---------|-------------|
| **16 Specialized Agents** | Each agent focuses on a specific Salesforce domain (Apex, LWC, Flows, SOQL, etc.) |
| **Multi-Model AI** | Seamless integration with Claude & Google Gemini for optimal performance |
| **Context Awareness** | Deep project scanning to understand existing architecture |
| **Token Tracking** | Real-time cost tracking across multiple AI models |
| **Guardrails & Security** | Enforced best practices and security patterns |
| **Feature-Sliced Design** | FSD folder structure enforcement for scalability |
| **CLI-First Interface** | Powerful terminal-based commands for rapid development |

### 📦 What's Included

```
├── 16 Specialized Agents     # Domain-specific AI assistants
├── CLI Tool (sfai)           # Terminal interface
├── Context Engine            # Project analysis & scanning
├── AI Client Layer           # Multi-model API integration
├── Token Tracker             # Cost & usage monitoring
└── Memory System             # Persistent context management
```

### 🏗 Architecture Overview

Apex AI Brain uses a **multi-agent orchestration** pattern where:

1. **Context Scanner** analyzes your Salesforce project
2. **Planner Agent** breaks down feature requests into atomic tasks
3. **Specialized Agents** (Architect, LWC Builder, SOQL Optimizer, etc.) execute focused tasks
4. **Reviewers & Validators** ensure output meets Salesforce best practices
5. **Memory System** maintains shared context across agent interactions

### 📚 Quick Links

- [**Installation Guide**](./getting-started/installation.md) - Get started in minutes
- [**CLI Usage**](./guides/cli-usage.md) - Learn all available commands
- [**Agents Overview**](./agents/overview.md) - Understand each specialized agent
- [**Architecture Concepts**](./concepts/multi-agent-orchestration.md) - Deep dive into the system design
- [**Deployment**](./deployment/github-pages.md) - Deploy to GitHub Pages

### 🔄 Typical Workflow

```bash
# 1. Initialize your project
sfai /init

# 2. Get project status
sfai /status

# 3. Plan a feature
sfai /plan "Add customer portal with LWC"

# 4. Let agents build it
sfai /spawn architect "Design the data model"
sfai /spawn lwc-builder "Create the portal component"

# 5. Review generated code
sfai /review

# 6. Check token costs
sfai /tokens
```

### 🏆 Who Should Use This?

- **Enterprise Salesforce Teams** - Need structured, scalable development
- **Architects** - Want AI that follows your standards
- **Development Leads** - Enforcing code quality and patterns
- **Freelancers** - Building professional Salesforce solutions at scale

### 🤝 Contributing

We welcome contributions! See [Contributing Guide](https://github.com/your-username/Apex-ai-brain/blob/main/CONTRIBUTING.md) for details.

### 📄 License

MIT License - See [LICENSE](https://github.com/your-username/Apex-ai-brain/blob/main/LICENSE) file.

---

## Next Steps

Ready to get started? Head to the [Installation Guide](./getting-started/installation.md)!

Have questions? Check out the [Frequently Asked Questions](./guides/cli-usage.md#faq) or browse the [full documentation](./guides/cli-usage.md).
