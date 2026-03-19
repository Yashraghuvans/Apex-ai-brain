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

Create a `.env` file in the project root:

```env
# Claude API Key (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini API Key
GOOGLE_API_KEY=AIza...

# Optional: Default Model
DEFAULT_MODEL=claude

# Optional: Project workspace
PROJECT_WORKSPACE=/path/to/your/salesforce-project
```

### Obtaining API Keys

#### Claude (Anthropic)
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Create an account (if you don't have one)
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env`

#### Google Gemini
1. Visit [aistudio.google.com](https://aistudio.google.com/)
2. Click on "Get API Key"
3. Create a new API key
4. Copy and paste into `.env`

## Step 4: Verify Installation

Test that everything is installed correctly:

```bash
npm start
# or directly
node bin/sfai.js
```

You should see the Apex AI Brain banner and a welcome message.

## Step 5: Initialize Your First Project

```bash
sfai /init
```

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
- Ask questions in [GitHub Discussions](https://github.com/Yashraghuvans/Apex-ai-brain/discussions)
- 📧 Email: support@apexai.dev

