# Pull Request Templates

This directory contains specialized PR templates for different types of pull requests in the Cyrus project.

## Quick Start

When creating a pull request on GitHub, you can select a template using the `template` query parameter:

```
https://github.com/ceedaragents/cyrus/compare/main...your-branch?template=TEMPLATE_NAME.md
```

Or use the GitHub CLI:

```bash
# Standard PR
gh pr create

# Hotfix PR
gh pr create --template hotfix.md

# Release PR
gh pr create --template release.md
```

## Available Templates

### 🔨 Default Template

**File:** `PULL_REQUEST_TEMPLATE.md` (in parent directory)

**Use for:**
- Feature development
- Bug fixes
- Documentation updates
- Refactoring
- Most pull requests

**Example:**
```bash
gh pr create --base main
```

**Contents:**
- Description and user impact
- Changelog entries
- Affected packages
- Pre-submission checklist
- Testing instructions
- Deployment notes

**Best practices:**
- Focus on user-visible changes
- Write changelog from end-user perspective
- Include thorough testing instructions
- Check all pre-submission items

---

### 🔥 Hotfix Template

**File:** `hotfix.md`

**Use for:**
- Critical production issues
- Service outages
- Data loss risks
- Security vulnerabilities
- Urgent bug fixes

**When to use:**
- Production is broken or degraded
- Users are significantly impacted
- Fix needs immediate deployment
- Can't wait for normal release cycle

**Example:**
```bash
gh pr create --base prod --template hotfix.md --title "🔥 HOTFIX: Fix critical webhook verification failure"
```

**Contents:**
- Critical issue severity assessment
- Root cause analysis
- Solution and testing
- Risk assessment
- Rollback plan
- Deployment plan
- Communication checklist

**Workflow:**
```
hotfix/* → stage (validate) → prod (deploy) → main (sync)
```

**Important:**
- Requires expedited review
- Must include rollback plan
- Test rollback procedure
- Monitor closely after deployment
- Create follow-up tasks for proper fix

---

### 📦 Release Template

**File:** `release.md`

**Use for:**
- Promoting main to stage
- Promoting stage to prod
- Publishing new versions
- Environment promotions

**When to use:**
- Ready to move code to next environment
- Publishing packages to npm
- Creating new release version
- Tagging release

**Example:**
```bash
# Promote to staging
gh pr create --base stage --head main --template release.md --title "📦 Release v0.1.56 to staging"

# Promote to production
gh pr create --base prod --head stage --template release.md --title "📦 Release v0.1.56 to production"
```

**Contents:**
- Release version and type
- Complete changelog for release
- Package version bumps
- Breaking changes and migration guide
- Testing checklist
- Staging smoke test plan
- Production deployment plan
- Communication plan
- Post-release monitoring

**Workflow:**
```
main → stage (staging release)
stage → prod (production release)
```

**Publishing order:**
1. Merge to target branch
2. Tag release: `git tag v0.1.XX`
3. Publish packages (follow CLAUDE.md order)
4. Monitor deployment
5. Sync back to earlier branches

---

## Template Selection Guide

### Decision Tree

```
Is production broken or severely degraded?
├─ YES → Use hotfix.md template
│         Target: hotfix/* → stage + prod
│         Review: Expedited, careful
│         Deploy: Immediate
│
└─ NO → Is this a release/promotion?
    ├─ YES → Use release.md template
    │         Target: main→stage or stage→prod
    │         Review: Thorough, 2+ approvals
    │         Deploy: Staged (staging first, then prod)
    │
    └─ NO → Use default template
              Target: feature/* → main
              Review: Standard, 1+ approval
              Deploy: Auto to development
```

### By Change Type

| Change Type | Template | Target Branch | Urgency |
|------------|----------|---------------|---------|
| Feature development | Default | `main` | Normal |
| Bug fix | Default | `main` | Normal |
| Documentation | Default | `main` | Low |
| Refactoring | Default | `main` | Low |
| Critical production bug | Hotfix | `prod` + `stage` | Critical |
| Security vulnerability | Hotfix | `prod` + `stage` | Critical |
| Promote to staging | Release | `stage` | Scheduled |
| Promote to production | Release | `prod` | Scheduled |

### By Target Branch

| Target Branch | Template | Purpose | Approvals Required |
|--------------|----------|---------|-------------------|
| `main` | Default | Development work | 1 |
| `stage` | Release | Staging promotion | 2 |
| `prod` | Release | Production release | 2 + code owner |
| `hotfix/*` → `prod` | Hotfix | Emergency fix | 1 (expedited) |

## Guidelines by Template

### Default Template Guidelines

**Focus on:**
- ✅ User-visible changes
- ✅ Clear changelog entries
- ✅ Complete testing coverage
- ✅ Thorough documentation

**Avoid:**
- ❌ Implementation details in changelog
- ❌ Missing tests
- ❌ Incomplete documentation
- ❌ Unchecked checklist items

**Changelog example:**
```markdown
✅ Good:
- Cyrus now automatically detects `.mcp.json` files in repository root

❌ Bad:
- Implemented MCP config loader
```

### Hotfix Template Guidelines

**Focus on:**
- ✅ Speed and accuracy
- ✅ Minimal, targeted fix
- ✅ Tested rollback plan
- ✅ Clear communication

**Avoid:**
- ❌ Scope creep (unrelated changes)
- ❌ Untested fixes
- ❌ Missing rollback plan
- ❌ Poor communication

**Risk assessment:**
- Document what could go wrong
- Include mitigation strategies
- Test rollback procedure
- Plan monitoring

### Release Template Guidelines

**Focus on:**
- ✅ Complete changelog
- ✅ Version management
- ✅ Migration guides (if breaking)
- ✅ Communication plan

**Avoid:**
- ❌ Missing package versions
- ❌ Undocumented breaking changes
- ❌ Skipped testing phases
- ❌ No rollback plan

**Publishing checklist:**
- Follow CLAUDE.md publishing order
- Update all package versions
- Create git tag
- Publish to npm
- Monitor after deployment

## Template Customization

### Creating Custom Templates

If you need a specialized template:

1. Create new `.md` file in this directory
2. Follow the structure of existing templates
3. Use descriptive filename (e.g., `security-fix.md`)
4. Document in this README

### Template Sections

All templates should include:

**Required sections:**
- Description
- Type/severity/scope
- Changelog entries
- Testing instructions
- Pre-merge checklist

**Optional sections:**
- Risk assessment (for risky changes)
- Migration guide (for breaking changes)
- Deployment plan (for releases)
- Communication plan (for customer-facing changes)

## Examples

### Standard Feature PR

```bash
# Create feature branch
git checkout -b feature/add-mcp-detection
git push origin feature/add-mcp-detection

# Create PR with default template
gh pr create --base main --fill

# Or manually on GitHub
# Go to: https://github.com/ceedaragents/cyrus/compare/main...feature/add-mcp-detection
```

### Critical Hotfix PR

```bash
# Create hotfix branch from prod
git checkout prod
git checkout -b hotfix/fix-webhook-verification

# Make fix and push
git push origin hotfix/fix-webhook-verification

# Create hotfix PR
gh pr create --base prod --template hotfix.md \
  --title "🔥 HOTFIX: Fix webhook signature verification" \
  --label "hotfix,priority:critical"

# Also create PR to stage
gh pr create --base stage --template hotfix.md \
  --title "🔥 HOTFIX: Fix webhook signature verification" \
  --label "hotfix,priority:critical"
```

### Release PR

```bash
# Update changelog first
# Edit CHANGELOG.md: move [Unreleased] to [0.1.56] - 2025-01-15

git add CHANGELOG.md
git commit -m "chore: Prepare release v0.1.56"
git push origin main

# Create staging release PR
gh pr create --base stage --head main --template release.md \
  --title "📦 Release v0.1.56 to staging" \
  --label "release"

# After staging validation, create production release PR
gh pr create --base prod --head stage --template release.md \
  --title "📦 Release v0.1.56 to production" \
  --label "release"
```

## Common Questions

### When should I use the hotfix template?

Use hotfix template when:
- Production is broken or severely degraded
- Users are significantly impacted
- Fix is needed within hours, not days
- Can't wait for normal release cycle

**Don't use** for:
- Minor bugs that can wait
- Features (even if urgent)
- Documentation fixes
- Non-critical issues

### Can I modify templates?

Yes! Templates are guidelines, not strict requirements. However:

- ✅ Keep all required sections
- ✅ Add context specific to your change
- ✅ Remove N/A sections (with note)
- ❌ Don't remove checklists
- ❌ Don't skip documentation

### What if my PR doesn't fit any template?

Use the default template and:
1. Explain your situation in description
2. Complete all applicable sections
3. Note which sections are N/A and why
4. Ask reviewers for guidance

### How do I know which branch to target?

```
Feature work → main
Main → stage (for staging testing)
Stage → prod (for production release)
Hotfix → stage + prod (then sync to main)
```

See [branching strategy](../../CLAUDE.md#branching-strategy) for details.

## Resources

- [PR Guidelines](../PR_GUIDELINES.md) - Detailed instructions
- [PR Checklist](../PR_CHECKLIST.md) - Quick reference
- [CLAUDE.md](../../CLAUDE.md) - Development workflow
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guide
- [CHANGELOG.md](../../CHANGELOG.md) - Changelog format examples

## Need Help?

If you're unsure which template to use:

1. Check the decision tree above
2. Look at similar recent PRs
3. Ask in PR description: "Should I use a different template?"
4. Tag maintainers for guidance

Remember: Using the wrong template is better than not using any template. Reviewers will guide you!
