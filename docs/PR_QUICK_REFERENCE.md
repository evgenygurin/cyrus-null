# PR Template Quick Reference

## 📋 Pre-Submit Checklist

Before creating your pull request, make sure you've completed these steps:

### 1. Code Quality ✅
```bash
# Run all tests
pnpm test

# Run package tests only
pnpm test:packages:run

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build all packages
pnpm build
```

### 2. Update CHANGELOG.md ✅

**This is MANDATORY for all user-facing changes!**

```markdown
## [Unreleased]

### Added
- **Feature description**: User-focused explanation of what changed
```

### 3. Commit Your Changes ✅
```bash
# Use conventional commits format
git commit -m "feat(oauth): add custom OAuth provider support"
```

### 4. Create PR ✅
```bash
# Push your branch
git push origin feature/your-feature

# Create PR
gh pr create --base main --title "feat: Your feature title"
```

---

## 📝 Required Sections

Fill out these sections in your PR description:

| Section | Required? | Purpose |
|---------|-----------|---------|
| **📋 Summary** | ✅ Yes | Quick overview, linked issues, type of change |
| **📝 Description** | ✅ Yes | Detailed explanation of what and why |
| **🧪 Testing** | ✅ Yes | Test results, coverage, manual testing |
| **📦 Package Impact** | ⚠️ If monorepo | Which packages are affected |
| **📸 Screenshots** | 💡 If UI/CLI | Before/after, examples |
| **📜 CHANGELOG** | ✅ Yes | Confirmation you updated it |
| **🔄 Migration** | ⚠️ If breaking | Steps for users to upgrade |
| **✅ Checklist** | ✅ Yes | All items checked off |
| **🚀 Deployment** | 💡 Recommended | Rollout considerations |
| **🔗 Context** | 💡 Optional | Links, references, design docs |
| **👥 Reviewer Notes** | 💡 Optional | Guide reviewer attention |
| **🔐 Security** | ⚠️ If security | Security implications |

**Legend**: ✅ Required | ⚠️ Conditional | 💡 Recommended

---

## 🚨 Common Mistakes

### ❌ Don't Do This

```markdown
## Summary
Fixed bug

## Description
See title
```

### ✅ Do This Instead

```markdown
## Summary
Fixed memory leak in EdgeWorker that caused crashes after processing 100+ issues.
The leak was caused by unclosed database connections that accumulated over time.

### Related Issues
- Fixes #267

### Type of Change
- [x] 🐛 Bug fix
```

---

## 📜 CHANGELOG Guidelines

### ✅ Good Examples

```markdown
### Added
- **Custom OAuth provider support**: Users can now configure custom OAuth 
  providers for self-hosted Linear instances using the `oauthProvider` 
  config option

### Fixed
- **Memory leak causing crashes**: Fixed critical memory leak that caused 
  Cyrus to crash after processing 100+ issues

### Changed
- **Default model changed to sonnet**: The default Claude model is now 
  `sonnet` instead of `opus` for better performance
```

### ❌ Bad Examples

```markdown
### Added
- OAuth stuff

### Fixed
- Implemented OAuthProvider interface in core package

### Changed
- Updated dependencies
```

---

## 🏷️ PR Type Selection

Mark **one** checkbox with `[x]`:

- `🐛 Bug fix` - Fixes a problem
- `✨ New feature` - Adds new functionality
- `💥 Breaking change` - Changes existing behavior
- `📚 Documentation` - Docs only
- `🔧 Configuration` - Config changes
- `♻️ Refactoring` - Code improvement, no behavior change
- `🎨 Style` - Formatting, naming
- `🧪 Test` - Test additions/changes
- `📦 Dependency` - Dependency updates
- `🚀 Performance` - Performance improvements

---

## 🧪 Testing Requirements

### Minimum Requirements
- [ ] Existing tests pass: `pnpm test`
- [ ] New tests added for your changes
- [ ] Manual testing completed

### Show Your Work
```markdown
## 🧪 Testing & Validation

### Test Results
<details>
<summary>Test Output</summary>

\`\`\`bash
$ pnpm test:packages:run
 ✓ All tests passed (198 passed in 14.52s)
\`\`\`
</details>

### Manual Testing
1. Started Cyrus with new config
2. Created test issue in Linear
3. Verified feature works as expected
4. Tested edge case: Invalid config → Clear error message
```

---

## 📦 Monorepo Publishing Order

If your PR requires publishing (check `[x] This PR requires package publishing`):

### Publishing Sequence
```bash
# 1. Base packages (no internal deps)
packages/ndjson-client

# 2. Runner packages
packages/claude-runner

# 3. Core package (depends on runner)
packages/core

# 4. Simple agent (depends on runner)
packages/simple-agent-runner

# 5. Edge worker (depends on core, runner, ndjson, simple-agent)
packages/edge-worker

# 6. Finally, CLI (depends on everything)
apps/cli
```

**Important**: Run `pnpm install` after each publish to update lockfile!

See [CLAUDE.md#publishing](../CLAUDE.md#publishing) for full details.

---

## 💬 Commit Message Format

### Structure
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `perf` - Performance
- `test` - Tests
- `chore` - Maintenance
- `ci` - CI/CD changes

### Examples
```bash
feat(oauth): add custom OAuth provider support

Implements configurable OAuth providers to support self-hosted Linear
instances. Users can specify custom endpoints in config.json.

Fixes #234
```

```bash
fix(edge-worker): resolve memory leak in session manager

Closes database connections properly after each session to prevent
memory leak that caused crashes.

Fixes #267
```

---

## 🎯 Review Process

### Timeline
- **Initial review**: Within 5 business days
- **Follow-up reviews**: Within 2-3 business days
- **Emergency fixes**: Within 1 business day

### Your Responsibilities
1. **Respond promptly** to review feedback (24-48 hours)
2. **Address all comments** - reply or make changes
3. **Re-request review** after making changes
4. **Be open** to discussion and suggestions

### After Making Changes
1. Fix the requested changes
2. Reply to each comment: "Fixed in commit abc123"
3. Click **"Re-request review"** button
4. Add summary comment of changes made

---

## 🔍 Self-Review Checklist

Before requesting review, ask yourself:

### Code Quality
- [ ] Would I approve this code if I were reviewing it?
- [ ] Is my code well-commented and clear?
- [ ] Did I follow the project's style guide?
- [ ] Are there any obvious bugs or issues?

### Testing
- [ ] Did I test all edge cases?
- [ ] Do all tests actually test the right things?
- [ ] Would I feel confident deploying this to production?

### Documentation
- [ ] Is CHANGELOG.md updated?
- [ ] Are README examples accurate?
- [ ] Did I update relevant docs?
- [ ] Are type definitions correct?

### User Impact
- [ ] Does this solve the actual user problem?
- [ ] Are error messages clear and helpful?
- [ ] Is the migration path clear (if breaking)?
- [ ] Did I consider backward compatibility?

---

## 📞 Getting Help

### Before Requesting Review
1. **Read this guide** - Most questions answered here
2. **Check [PR_TEMPLATE_GUIDE.md](./PR_TEMPLATE_GUIDE.md)** - Detailed examples
3. **Review recent PRs** - See what good PRs look like

### During Review
1. **Ask clarifying questions** in PR comments
2. **Tag specific reviewers** for domain expertise
3. **Request help** in #engineering Slack channel (if applicable)

### Resources
- [CLAUDE.md](../CLAUDE.md) - Development guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guide
- [BRANCHING_STRATEGY.md](../BRANCHING_STRATEGY.md) - Git workflow
- [PR_TEMPLATE_GUIDE.md](./PR_TEMPLATE_GUIDE.md) - Full PR guide

---

## ⚡ Quick Commands

```bash
# Setup and build
pnpm install
pnpm build

# Testing
pnpm test                    # All tests (watch mode)
pnpm test:packages:run       # Package tests (run once)
pnpm typecheck              # Type checking
pnpm lint                   # Linting

# Git workflow
git checkout -b feature/my-feature main
git add -A
git commit -m "feat: add my feature"
git push origin feature/my-feature

# Create PR
gh pr create --base main --title "feat: My feature"

# Publishing (if needed)
cd packages/core && pnpm publish --access public --no-git-checks
cd ../..
pnpm install  # Update lockfile
```

---

## 📋 PR Description Template (Copy-Paste)

```markdown
# Pull Request

## 📋 Summary
<!-- 2-3 sentence summary of your changes -->

### Related Issue(s)
- Fixes #
- Relates to #

### Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📚 Documentation

---

## 📝 Description & Motivation
<!-- Explain what and why in detail -->

---

## 🧪 Testing & Validation
<!-- Show test results and manual testing steps -->

---

## 📜 CHANGELOG Update
- [ ] **I have updated CHANGELOG.md under `## [Unreleased]` section**

---

## ✅ Pre-Merge Checklist
- [ ] Tests pass (`pnpm test`)
- [ ] Types are correct (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
```

---

## 🎉 Final Tips

1. **Start small** - First PR? Keep it simple!
2. **Ask questions** - We're here to help
3. **Be patient** - Reviews take time
4. **Learn from feedback** - Every review is a learning opportunity
5. **Have fun** - You're making Cyrus better! 🚀

---

**Need more details?** See [PR_TEMPLATE_GUIDE.md](./PR_TEMPLATE_GUIDE.md) for comprehensive examples and explanations.

**Last Updated**: 2025-01-13
