---
sidebar_position: 1
---

# Installation Guide

Get Apex AI Brain up and running in minutes.

## Prerequisites

Before installing, make sure you have:

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Salesforce CLI (sfdx)** - Optional but recommended
- **API Keys** - Claude and/or Google Gemini API keys

## Step 1: Clone the Repository

```bash
git clone https://github.com/Yashraghuvans/Apex-ai-brain.git
cd Apex-ai-brain
```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 3: Configure API Keys

Create a `.env` file in the **Apex AI Brain directory**:

```env
# Google Gemini API Key (Required for default)
GEMINI_API_KEY=AIza...

# Claude API Key (Optional)
ANTHROPIC_API_KEY=sk-ant-...

# Configuration
DEFAULT_PROVIDER=gemini
DEFAULT_MODEL=gemini-1.5-pro
```

## Step 4: Global Installation

To use the `sfai` command from anywhere (especially inside your Salesforce project folders), run:

```bash
npm link
```

Now you can open any Salesforce project in your terminal and simply type `sfai` to start the agentic loop.

## Step 5: Initialize Your Project

Navigate to your Salesforce DX project folder and run:

```bash
cd /path/to/my-sfdx-project
sfai

# Inside SFAI REPL:
sfai ❯ /init
```

This will scan your Salesforce project (classes, LWCs, triggers) and set up the context for the agents.

This will scan your Salesforce project and set up the context.

## Installation Troubleshooting

### Issue: "command not found: sfai"

**Solution:** Install globally:
```bash
npm install -g .
# or link the binary
npm link
```

### Issue: "Cannot find module '@anthropic-ai/sdk'"

**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Invalid API Key"

**Solution:** Verify your `.env` file:
- Check that API keys are correct
- Remove any quotes around keys
- Verify no extra spaces

### Issue: Port already in use (if running server)

**Solution:** Use a different port:
```bash
PORT=3001 npm start
```

## Next Steps

After installation:

1. **Quick Start** - See the [Quick Start Guide](./quick-start.md)
2. **Initialize Project** - Run `/init` command
3. **Explore CLI** - Type `/help` to see available commands
4. **Review Agents** - Check out the [Agents Overview](../agents/overview.md)

## Getting Help

- 📖 Check the [CLI Usage Guide](../guides/cli-usage.md)
- Report issues on [GitHub Issues](https://github.com/Yashraghuvans/Apex-ai-brain/issues)
- 📧 Email: support@apexai.dev

