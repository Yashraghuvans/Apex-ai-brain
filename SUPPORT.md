# Support

## Getting Help

### Documentation
- Check the [official documentation](https://apex-ai-brain.vercel.app)
- Review [Installation Guide](./documentation/docs/getting-started/installation.md)
- Read [CLI Usage Guide](./documentation/docs/guides/cli-usage.md)
- Explore [Agent Reference](./documentation/docs/agents/overview.md)

### Common Issues

#### "command not found: sfai"
```bash
npm install -g .
npm link
```

#### "Invalid API Key"
- Verify `.env` file has correct keys
- Check keys don't have extra quotes or spaces
- Test key validity on provider website

#### "Port already in use"
```bash
PORT=3001 npm start
```

#### Token Limit Issues
```bash
# Check token usage
sfai /tokens

# Use fewer agents
sfai /plan --agents 2
```

### Create an Issue

Can't find the answer? [Create a GitHub Issue](https://github.com/Yashraghuvans/Apex-ai-brain/issues)

Include:
1. Your environment (OS, Node version, npm version)
2. Steps to reproduce
3. Error message and logs
4. What you expected to happen

### Report Security Issues

**Do not create public issues for security vulnerabilities.**

See [SECURITY.md](./SECURITY.md) for responsible disclosure process.

---

**Last Updated:** March 19, 2026
