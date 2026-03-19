# RULE: VALIDATE BEFORE DEPLOY

## Rule Statement
**Always run Validation first before production deployment. Never deploy untested code directly.**

Violation Level: **HIGH** — Prevents production incidents

## Validation Deployment Process

```bash
# ✅ CORRECT: Always validate first
sf project validate deploy --target-org prod --wait 30

# ❌ FORBIDDEN: Deploy without validation
sf project deploy start --target-org prod
# Risk: Failure in production = system down
```

## Validation Results Check

```bash
# ✅ CORRECT: Check results
sf project deploy report --use-most-recent

# Output should show:
# Deploy ID: 0Afxx00000xxxxx
# Done: true
# Success: true
# Failed: 0
# Errors: 0
# Status: Success
```

## When to Validate

### Before Every Deployment
```bash
# ✅ REQUIRED: Dev → QA
sf project validate deploy --target-org qa --wait 30

# ✅ REQUIRED: QA → UAT
sf project validate deploy --target-org uat --wait 30

# ✅ REQUIRED: UAT → Production
sf project validate deploy --target-org prod --wait 30

# ❌ FORBIDDEN: Skip validation on "small" changes
# All deployments must validate
```

### When Code Changes
```bash
# ✅ REQUIRED: After any code change, validate
# - Modified trigger
# - New apex class
# - Permission set update
# - Custom field addition

# ❌ FORBIDDEN: Assume it's fine
# - "Just fixing a typo" → Validate anyway
# - "Minor metadata change" → Validate anyway
# - "Only changing comments" → Validate anyway
```

## Pre-Deployment Validation Checklist

### Code Review
- [ ] Code follows FSD architecture
- [ ] 75%+ test coverage
- [ ] No SeeAllData=true in tests
- [ ] All custom exceptions used
- [ ] Security (CRUD/FLS) enforced
- [ ] No hardcoded IDs
- [ ] No SOQL injection risks

### Metadata Review
- [ ] Custom objects defined correctly
- [ ] Permission sets assigned properly
- [ ] Profiles updated for new fields
- [ ] Validation rules reviewed
- [ ] Workflows/Process Builder checked

### Testing Verification
- [ ] All tests pass locally
- [ ] Coverage report generated
- [ ] No test data in production
- [ ] No org-specific IDs in code

## Validation in CI/CD Pipeline

```yaml
# ✅ CORRECT: GitFlow with validation gates
on: [push]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: salesforcecli/setup-salesforcecli@v1
      
      - name: Validate Against Sandbox
        run: |
          sf project validate deploy --target-org sandbox --wait 30
      
      - name: Check Results
        run: |
          STATUS=$(sf project deploy report --use-most-recent --json | jq -r '.result.status')
          if [ "$STATUS" != "Success" ]; then
            exit 1
          fi
      
      - name: Deploy to Production (Only on main)
        if: github.ref == 'refs/heads/main'
        run: |
          sf project validate deploy --target-org prod --wait 30
          sf project deploy start --target-org prod --wait 30

# ❌ FORBIDDEN: Skip validation in pipeline
- name: Deploy
  run: sf project deploy start --target-org prod
  # No validation!
```

## Validation with Recent Deploy

```bash
# ✅ CORRECT: Validate using most recent deploy
sf project validate deploy --use-most-recent --wait 30

# Check if validation succeeded
sf project deploy report --use-most-recent

# If validation passes:
sf project deploy start --target-org prod --use-most-recent
```

## Handling Validation Failures

### Common Failures

```bash
# ❌ Test failures
ERROR: 1 test failure
Error Message: LeadServiceTest.testProcessLeads failed
Fix: Debug test, check data setup, verify assertions

# ❌ Code coverage
ERROR: Code coverage is 62%, minimum is 75%
Fix: Add tests for uncovered code paths

# ❌ Security violations
ERROR: Potential SOQL injection in class LeadService
Fix: Use bind variables, never concatenate SOQL strings

# ❌ Metadata issues
ERROR: Missing custom field reference in page layout
Fix: Ensure field exists in target org
```

### Resolution Steps
1. Identify error from validation report
2. Fix issue in source code
3. Run validation again locally
4. Validate deployment again
5. If validation passes → Deploy

## Failure Response

When code bypasses validation:

```
❌ VIOLATION DETECTED: Deployment attempted without validation

Your action:
sf project deploy start --target-org prod --wait 30

Issues:
1. No validation run first
2. Tests not checked
3. Code coverage not verified
4. Metadata conflicts unknown

⚠️  This is a deployment emergency risk!

✅ Corrected Process:
1. sf project validate deploy --target-org prod --wait 30
2. sf project deploy report --use-most-recent
   - Check status: Must be "Success"
   - Check coverage: Must be ≥75%
   - Check failures: Must be 0
3. If validation successful:
   sf project deploy start --target-org prod --use-most-recent
```

## Best Practices

✅ Always validate first
✅ Check validation report BEFORE deploying
✅ Never skip validation for "small" changes
✅ Run validation in all environments (dev, qa, uat, prod)
✅ Integrate validation in CI/CD pipeline
✅ Keep validation reports for audit trail
✅ Alert on validation failure

## Key Takeaway
**Validation is your safety net.** Always validate before deploy. It catches errors before production, prevents system downtime, and ensures code quality.
