---
sidebar_position: 4
---

# Environment Setup

Configure your system environment for optimal Apex AI Brain performance.

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Node.js** | 16.x | 18.x or later |
| **npm** | 8.x | 9.x or later |
| **Memory** | 2GB | 4GB or more |
| **Disk Space** | 500MB | 1GB or more |
| **Internet** | Required | Required |

## 1. Install Node.js

### macOS
```bash
# Using Homebrew (recommended)
brew install node@18

# Or download from nodejs.org
```

### Ubuntu / Debian
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Windows
Download from https://nodejs.org/ and run the installer.

### Verify Installation
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
```

## 2. Configure API Keys

### Option A: Using `.env` File (Recommended for Local Development)

Create `.env` in project root:

```env
# AI Provider Keys
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
GOOGLE_API_KEY=AIzaxxxxxxxxxxxxxx

# Default Configuration
DEFAULT_MODEL=claude
PROJECT_WORKSPACE=/path/to/your/project

# Optional: Debug Mode
DEBUG=true
VERBOSE=true

# Optional: Custom Ports
REPL_PORT=3000
```

### Option B: Using Environment Variables (Production)

```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
export GOOGLE_API_KEY=AIzaxxxxxxxxxxxxxx
export DEFAULT_MODEL=claude
```

### Option C: Using `.env.local` (For Team Development)

```bash
# Create both files
.env              # Committed to git (template)
.env.local        # NOT committed (actual secrets)
```

## 3. Salesforce CLI Setup

### Install Salesforce CLI

```bash
# macOS
brew install sfdx-cli

# Or download from
# https://developer.salesforce.com/tools/sfdxcli
```

### Authenticate to Salesforce Org

```bash
# Connect to dev org
sfdx auth:web:login -a dev-org

# Or use SFDX hub org
sfdx auth:web:login -a HubOrg

# List authenticated orgs
sfdx auth:list
```

### Set Default Org

```bash
sfdx config:set defaultusername=dev-org
sfdx config:set defaultdevhubusername=HubOrg
```

## 4. Project Configuration File

Create `sfai.config.json` in your project root:

```json
{
  "projectName": "MyCompany Salesforce",
  "projectPath": "/path/to/force-app",
  "orgAlias": "dev-org",
  "apiModels": {
    "primary": "claude",
    "fallback": "gemini",
    "experimental": "gpt4"
  },
  "memorySettings": {
    "maxMemorySize": "100MB",
    "enablePersistence": true,
    "storePath": ".sfai/memory"
  },
  "guardrails": {
    "enforceFSD": true,
    "enforceBulkification": true,
    "enforceGovernorLimits": true,
    "minTestCoverage": 85
  },
  "tokenTracking": {
    "enableTracking": true,
    "monthlyBudget": 100,
    "alertThreshold": 0.8
  }
}
```

## 5. Git Configuration

### Add `.gitignore` Entries

Add to your `.gitignore`:

```bash
# API Keys & Secrets
.env
.env.local
.env.*.local

# SFAI Generated Files
.sfai/
sfai-logs/
*.log

# Node & Package Manager
node_modules/
package-lock.json
yarn.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary
tmp/
temp/
*.tmp
```

### Create `.env.example`

Commit this to git (without secrets):

```env
# Template - Copy to .env and fill in your values
ANTHROPIC_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
DEFAULT_MODEL=claude
PROJECT_WORKSPACE=/path/to/project
DEBUG=false
```

## 6. IDE Configuration

### VS Code Setup

Install these extensions:

- **Salesforce Extension Pack** - salesforce.salesforcedx-vscode
- **Apex Debugger** - salesforce.salesforcedx-vscode-apex-debugger
- **Prettier** - esbenp.prettier-vscode
- **ESLint** - dbaeumer.vscode-eslint
- **Thunder Client** - rangav.vscode-thunder-client

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "[apex]": {
    "editor.defaultFormatter": "salesforce.salesforcedx-vscode-apex"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "search.exclude": {
    "**/node_modules": true,
    ".sfai": true
  }
}
```

### IntelliJ IDEA Setup

1. Install **Apex Code** plugin
2. Install **Salesforce CLI Integration** plugin
3. Configure SDK:
   - File → Project Structure → SDKs
   - Add Java SDK (for Apex tooling)

## 7. Terminal Setup

### OSX / Linux

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# Apex AI Brain
export SFAI_HOME="/path/to/apex-ai-brain"
export PATH="$SFAI_HOME/bin:$PATH"

# Aliases
alias sfai="node $SFAI_HOME/bin/sfai.js"
alias sfai-plan="sfai /plan"
alias sfai-spawn="sfai /spawn"
```

Then reload:
```bash
source ~/.zshrc  # or ~/.bashrc
```

### Windows (PowerShell)

Create `$PROFILE`:

```powershell
$env:SFAI_HOME = "C:\path\to\apex-ai-brain"
Set-Alias sfai "node $env:SFAI_HOME\bin\sfai.js"
```

## 8. Verify Complete Setup

Run this verification script:

```bash
npm run verify
# or manually:
node -v && npm -v && sfdx --version
```

Should output:
```
v18.x.x
9.x.x
sfdx-cli/2.x.x
```

## 9. Troubleshooting

### npm command not found

```bash
# On macOS
brew install node
export PATH="/usr/local/opt/node/bin:$PATH"

# On Linux
sudo apt-get install nodejs npm
```

### Salesforce CLI not found

```bash
# Full path to SFDX
/usr/local/bin/sfdx auth:web:login

# Or install globally
npm install -g @salesforce/cli
```

### Permission denied errors

```bash
# Fix permissions
chmod +x bin/sfai.js

# Or run with node
node bin/sfai.js
```

### API key errors

```bash
# Verify keys are loaded
node -e "console.log(process.env.ANTHROPIC_API_KEY)"

# If blank, check .env file is in root directory
ls -la .env
```

---

## Next Steps

- ✅ Complete environment setup
- 📖 Run [Installation Guide](./installation.md) next
- 🚀 Start with [Quick Start](./quick-start.md)

