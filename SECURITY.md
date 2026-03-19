# Security Policy

## Reporting a Security Vulnerability

If you discover a security vulnerability in Apex AI Brain, please report it responsibly and do not create a public GitHub issue.

### How to Report

1. **Email:** Send details to the maintainer (check GitHub profile for contact)
2. **Include in your report:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact (low, medium, high, critical)
   - Any suggested fixes or mitigations
   - Your name and contact information (if you want to be credited)

### What to Expect

- Acknowledgment of your report within 48 hours
- Assessment of the vulnerability within 1 week
- Regular updates on the fix progress
- Credit for discovery (if desired)
- Responsible disclosure timeline

## Supported Versions

Security updates are provided for:

| Version | Supported |
|---------|:---------:|
| 1.0.x   | X         |
| < 1.0   | -         |

## Known Security Considerations

### API Keys
- Store API keys in `.env` files (Never commit them)
- Use environment variables in production
- Rotate keys regularly

### Code Review
- All generated code should be reviewed by a human
- Security reviews are recommended for production changes
- Use the `--validation strict` flag for safety checks

### Permissions
- Ensure `sfai` binary has appropriate file permissions
- Use principle of least privilege with Salesforce credentials
- Restrict access to memory files containing project context

### Data Privacy
- Local memory files may contain sensitive code
- Back up memory safely
- Secure access to memory snapshots

## Best Practices

1. **Credential Management**
   - Never commit API keys or credentials
   - Use `.env` files with proper `.gitignore`
   - Rotate credentials regularly

2. **Code Generation**
   - Always review AI-generated code
   - Run security linters and tests
   - Validate against Salesforce security guidelines

3. **Deployments**
   - Test in sandbox first
   - Use changesets or validated deployments
   - Always have a rollback plan

4. **Monitoring**
   - Monitor token usage for unusual activity
   - Check logs for errors or suspicious patterns
   - Review generated artifacts regularly

## Security Audits

Security audits are welcomed. Please:
- Follow responsible disclosure practices
- Coordinate with maintainers before publishing findings
- Allow reasonable time for fixes before public disclosure

## Security Updates

Security patches will be released promptly when vulnerabilities are confirmed. Updates are provided via:
- GitHub releases
- Module updates in npm
- Security advisories

## Third-Party Dependencies

This project uses several third-party dependencies:
- **@anthropic-ai/sdk** - Claude API
- **@google/generative-ai** - Gemini API
- **Docusaurus** - Documentation site
- See `package.json` for full list

Stay updated on security advisories for these dependencies.

## Compliance & Standards

Apex AI Brain follows security best practices from:
- OWASP guidelines
- Salesforce security standards
- Node.js security best practices
- Industry security benchmarks

---

**Last Updated:** March 19, 2026
**Version:** 1.0.0
