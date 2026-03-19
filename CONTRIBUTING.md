# Contributing to Apex AI Brain

Thank you for your interest in contributing to Apex AI Brain! We welcome contributions from the community to help improve this Salesforce AI framework.

## Ways to Contribute

### Report Bugs
- Found a bug? Create an issue on [GitHub Issues](https://github.com/Yashraghuvans/Apex-ai-brain/issues)
- Include: Steps to reproduce, expected behavior, actual behavior, and environment details
- Use the bug report template provided

### Suggest Enhancements
- Have an idea? Open an issue with the label `enhancement`
- Describe the problem it solves and why it's needed
- Provide examples if possible

### Improve Documentation
- Fix typos or unclear explanations
- Add examples to existing docs
- Create new guides for common use cases
- Submit a PR with your changes

### Contribute Code
- Pick an issue labeled `good first issue` or `help wanted`
- Fork the repository
- Create a feature branch: `git checkout -b feature/your-feature`
- Make your changes
- Write tests if applicable
- Submit a pull request with a clear description

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Yashraghuvans/Apex-ai-brain.git
cd Apex-ai-brain

# Install dependencies
npm install

# Create a .env file with your API keys
cp .env.example .env
```

### Running Locally

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Documentation

```bash
# Navigate to documentation folder
cd documentation

# Install dependencies
npm install

# Start documentation server
npm start

# Build static documentation
npm run build
```

## Pull Request Process

1. **Before you start:** Comment on an issue to let others know you're working on it
2. **Create a branch:** Use descriptive branch names (`feature/agent-xyz`, `fix/token-bug`)
3. **Make commits:** Write clear, atomic commits with good messages
4. **Update documentation:** If adding features, update relevant docs
5. **Test your changes:** Ensure tests pass and code runs locally
6. **Submit PR:** Include:
   - Clear title and description
   - Reference to related issue(s)
   - Screenshots/videos if UI changes
   - Checklist of testing performed

## Code Standards

### JavaScript/Node.js
- Use ES6+ syntax
- Follow ESLint rules (run `npm run lint`)
- Add JSDoc comments for functions
- Use meaningful variable names

### Markdown/Documentation
- Use clear, concise language
- Include code examples where relevant
- Use proper markdown formatting
- Check spelling and grammar

### Commit Messages
Follow conventional commits format:
```
type(scope): subject

body explaining the change and why

footer with issue reference
```

Examples:
- `feat(agent): Add apex-architect agent`
- `fix(cli): Fix token tracking calculation`
- `docs: Update installation guide`
- `chore: Update dependencies`

## Reporting Security Issues

**Do not create public issues for security vulnerabilities.**

Email security concerns to the maintainer instead. Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

See [SECURITY.md](../../SECURITY.md) for details.

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report inappropriate behavior to maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for their contributions
- GitHub contributors page

## Questions or Need Help?

- Check existing issues and documentation
- Create a new issue with questions or clarifications
- Request help on GitHub Issues

Thank you for contributing to Apex AI Brain! 

---

**Last Updated:** March 19, 2026
**Version:** 1.0.0
