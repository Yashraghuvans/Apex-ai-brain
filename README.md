
# Apex AI Brain

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Salesforce](https://img.shields.io/badge/Salesforce-00A1E0?style=flat&logo=salesforce&logoColor=white)
![Powered by Claude & Gemini](https://img.shields.io/badge/Powered_by-Claude_&_Gemini-8E75B2?style=flat)
![Architecture: FSD](https://img.shields.io/badge/Architecture-FSD-FF6B6B.svg)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)

**Enterprise-Grade Salesforce AI Architecture System**

Apex AI Brain is an agentic framework and prompt architecture designed to enforce Salesforce best practices through AI. Instead of relying on generic AI knowledge (which often hallucinates standard web patterns that violate Salesforce governor limits), this system injects strict rules directly into the AI's reasoning.

## What Is This?

Apex AI Brain is like **architectural ESLint rules for AI**. It combines:
- 16 specialized Salesforce agents
- Multi-model AI support (Claude, Gemini, GPT-4)
- Real-time token tracking and cost management
- Governor limit validation
- Feature-Sliced Design (FSD) architecture enforcement

## Quick Start

```bash
# Install
npm install

# Set up environment
cp .env.example .env
# Add your API keys to .env

# Run
npm start
```

For complete setup instructions, see [Installation Guide](./documentation/docs/getting-started/installation.md)

## Features

- **16 Agents** - Apex Architect, LWC Builder, Test Writer, SOQL Optimizer, and more
- **Multi-Model AI** - Claude, Gemini, GPT-4 with automatic fallback
- **Governor Limits** - Validates code against Salesforce constraints
- **FSD Architecture** - Enforces Feature-Sliced Design patterns
- **Token Tracking** - Real-time cost monitoring across models
- **Context Aware** - Deep project understanding and pattern recognition
- **CLI-First** - Powerful terminal interface for developers
- **Memory System** - Persistent shared memory between agents

## Documentation

Full documentation is available at: https://apex-ai-brain.vercel.app

- [Getting Started](./documentation/docs/getting-started/installation.md)
- [CLI Usage Guide](./documentation/docs/guides/cli-usage.md)
- [Architecture Overview](./documentation/docs/guides/architecture-overview.md)
- [Agent Reference](./documentation/docs/agents/overview.md)
- [Concepts & Guides](./documentation/docs/concepts/)

## Requirements

- Node.js 18+
- npm 9+
- API keys for Claude and/or Gemini

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Community Standards

- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community expectations
- [SECURITY.md](./SECURITY.md) - Security and vulnerability reporting

## Support

- Report bugs and request features on [GitHub Issues](https://github.com/Yashraghuvans/Apex-ai-brain/issues)
- Check the [SUPPORT.md](./SUPPORT.md) file for common solutions

## License

MIT License - See [LICENSE](./LICENSE) file for details

## Author

Built by [Yash Raghuvanshi](https://github.com/Yashraghuvans)
