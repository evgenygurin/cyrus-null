# Quick PR Checklist

> **New to contributing?** See [PR_GUIDELINES.md](./PR_GUIDELINES.md) for detailed instructions.

## Before Creating PR

```bash
# Run all checks
pnpm build && pnpm lint && pnpm typecheck && pnpm test:packages:run
```

- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] Code follows style guidelines
- [ ] CHANGELOG.md updated under `[Unreleased]`

## PR Template

### Required Sections

**Description**
- What changed and why (user perspective)
- No implementation details

**Changelog Entry**
- Write for end-users, not developers
- Use categories: Added, Changed, Fixed, Removed, Deprecated, Security
- Example: "Users can now..." not "Implemented..."

**Affected Packages**
- Check all modified packages
- Include version numbers for releases

**Pre-Submission Checklist**
- All items checked (or marked N/A)
- Tests, docs, and code quality verified

### Common Mistakes to Avoid

❌ **Bad Changelog**:
```markdown
- Implemented ISessionManager interface
- Added new factory method
- Refactored EdgeWorker class
```

✅ **Good Changelog**:
```markdown
- Cyrus now supports multiple concurrent sessions per Linear issue
- Each comment thread maintains independent Claude context
```

## Quick Commands

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Update from main
git checkout main && git pull && git checkout - && git rebase main

# Push changes
git push origin feature/your-feature-name

# Create PR (if gh CLI installed)
gh pr create --base main --fill

# Run specific package tests
pnpm --filter '@cyrus/core' test:run

# Run CI checks locally
pnpm biome ci && pnpm build && pnpm test:packages:run
```

## Review Checklist

### For Authors
- [ ] Responded to all comments
- [ ] Updated based on feedback
- [ ] Re-requested review
- [ ] Kept PR up-to-date with base branch

### For Reviewers
- [ ] Changelog is user-focused
- [ ] Tests cover changes
- [ ] Docs updated
- [ ] No undocumented breaking changes
- [ ] Code follows conventions

## Branching Strategy

```
feature/* → main → stage → prod
```

- **feature/\***: Your work here
- **main**: Development (1 approval)
- **stage**: Staging (2 approvals)
- **prod**: Production (2 approvals + code owner)
- **hotfix/\***: Emergency fixes (expedited review)

## Release PRs

If publishing packages:

1. Update CHANGELOG.md (move [Unreleased] to versioned section)
2. Follow publishing order in CLAUDE.md
3. Increment version numbers in affected packages
4. Tag release after merge: `git tag v0.1.XX`

## Need Help?

- [PR Guidelines](./PR_GUIDELINES.md) - Detailed instructions
- [CLAUDE.md](../CLAUDE.md) - Development workflow
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guide
- Recent PRs - See examples
