---
id: limitations
title: Known Limitations
sidebar_position: 6
---

# Known Limitations

Apex AI Brain is a powerful tool, but it has some known constraints and out-of-scope features. Understanding these limitations will help you use the system effectively.

## Model-Specific Limitations

### Claude
- **Context Window:** 200k tokens max (sufficient for most Salesforce projects)
- **Best For:** Complex analysis, long-form code generation, detailed planning
- **Limitations:** May be slower on very large code reviews

### Gemini
- **Speed:** Faster response times, good for rapid iteration
- **Cost:** Lower token cost than Claude
- **Limitations:** May hallucinate on Salesforce-specific patterns more frequently than Claude

### GPT-4 (Experimental)
- **Status:** Not recommended for production use
- **Reason:** Lacks Salesforce-specific guardrails compared to Claude and Gemini

## Salesforce Feature Limitations

The following Salesforce features have limited or no support:

| Feature | Status | Reason |
|---------|--------|--------|
| Flows (Low-Code) | Partial | Can design but not generate working Flow XML |
| Metadata API | Read-only | Cannot deploy metadata directly (requires manual validation) |
| Streaming API | Not supported | Real-time event processing out of scope |
| Platform Events | Partial | Can design but limited deployment automation |
| Einstein AI | Not integrated | Requires separate Einstein API keys |
| FinanceCloud-specific | Limited | Not all industry cloud features documented |
| Gack Errors | Limited | Salesforce platform errors require human interpretation |

## Codebase Limitations

### Project Size
- **Max Codebase Size:** 500+ files (scanner may timeout on massive orgs)
- **Recommendation:** Use `/init --shallow` for large projects or split into modules

### Token Limits
- **Max tokens per command:** 200,000 (set by Claude's context window)
- **Recommendation:** Break large requests into smaller tasks using `/plan`

### Agent Coordination
- **Max concurrent agents:** 5 (to avoid rate limiting)
- **Recommendation:** Use `/spawn --sequential` for large batches

## Operational Limitations

### No Real-Time Feedback
- Agents operate in "request-response" mode
- Cannot monitor ongoing deployments or tests in real-time
- Recommendation: Use `--wait` flag for explicit polling

### No Persistent Session Memory Across Restarts
- Memory is stored locally per session
- Restarting the CLI clears in-memory context
- Workaround: Use `/memory snapshot` before shutdown

### Internet Required
- All AI model APIs require internet connectivity
- Offline mode not supported
- Recommendation: Handle connection failures gracefully in scripts

## Accuracy & Reliability

### Code Generation Success Rates

| Task | Success Rate | Notes |
|------|:-------------:|-------|
| Apex CRUD Operations | 95%+ | Basic patterns highly reliable |
| LWC Component Structure | 90%+ | Good for standard components |
| SOQL Optimization | 85%+ | May miss edge cases |
| Trigger Logic | 80%+ | Complex business logic needs review |
| Test Coverage | 75%+ | Generated tests need augmentation |
| Flow Design | 70%+ | Recommend manual refinement |

### Why These Rates?

1. **Salesforce API Complexity** - Governor limits and edge cases are hard to predict
2. **Org-Specific Variations** - Custom objects, fields, and workflows vary significantly
3. **Business Logic** - AI cannot know your specific business requirements
4. **Integration Patterns** - External system integrations require domain knowledge

## What You Must Do Manually

Apex AI Brain cannot automate these tasks:

1. **Security Review** - All generated code should go through security review
2. **Performance Testing** - Load testing and stress testing require manual validation
3. **Data Migration** - Moving data between environments requires careful planning
4. **User Acceptance Testing** - Business stakeholders must validate changes
5. **Governance & Compliance** - Industry-specific compliance (HIPAA, PCI, etc.) requires expert review
6. **Deployment Coordination** - Senior developers should manage production deployments

## Rate Limiting

### API Rate Limits

- **Claude:** 50 requests/min (standard tier)
- **Gemini:** 60 requests/min (standard tier)
- **OpenAI GPT-4:** 20 requests/min (default)

### Workarounds

```bash
# Stagger requests manually
sfai /plan --agents 2  # Use fewer agents simultaneously

# Use caching
sfai /context cache --enable

# Batch operations
sfai /spawn --sequential --agents 5
```

## Browser & UI Limitations

- **No Web Dashboard** - CLI-first tool only
- **No Visual Flow Builder** - Flows must be designed via YAML or JSON
- **Limited Terminal Output** - Large responses may be truncated (use `--output file.md`)
- **No IDE Integration** - Works with terminal only (VS Code extension planned)

## Deployment Limitations

- **No Rollback Automation** - Must manually rollback failed deployments
- **No Zero-Downtime Deploys** - Blue-green deployments not automated
- **Limited Approval Workflows** - Cannot enforce multi-level approvals
- **No Change Set Generation** - Uses direct API deployments only

## Support & Workarounds

For each limitation, we provide workarounds:

**Large Projects?** Use `--shallow` or split into modules
**Need Persistence?** Use `/memory snapshot` and restore manually
**Offline Work?** Generate code first, then work offline
**Complex Logic?** Use `/plan` to break into smaller tasks
**Need Guarantees?** Use `--validation strict` for safety checks

## Future Improvements

We're actively working on:

- Visual Flow builder integration
- Better metadata deployment support
- Persistent cross-session memory
- VS Code extension
- Real-time deployment monitoring
- Industry cloud support (FinanceCloud, HealthCloud, etc.)

## Report Limitations

If you find a limitation not listed here, please:

1. Check existing [GitHub Issues](https://github.com/Yashraghuvans/Apex-ai-brain/issues)
2. Create a new issue with: Limitation + Use Case + Workaround
3. Join [GitHub Discussions](https://github.com/Yashraghuvans/Apex-ai-brain/discussions) for community input

---

**Last Updated:** March 19, 2026
**Version:** 1.0.0
