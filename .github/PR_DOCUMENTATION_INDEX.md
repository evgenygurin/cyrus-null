# Pull Request Documentation Index

Complete reference for the Cyrus project's PR process, templates, and guidelines.

## 📚 Documentation Structure

```
.github/
├── PULL_REQUEST_TEMPLATE.md           # Default PR template
├── PULL_REQUEST_TEMPLATE/
│   ├── README.md                      # Template selection guide
│   ├── hotfix.md                      # Critical production fixes
│   └── release.md                     # Release promotions
├── PR_GUIDELINES.md                   # Comprehensive PR guide (this file)
├── PR_CHECKLIST.md                    # Quick reference checklist
└── PR_DOCUMENTATION_INDEX.md          # This index
```

## 🎯 Quick Navigation

### I want to...

**Create a regular PR** (feature, bug fix, docs)
- Use: [Default Template](../PULL_REQUEST_TEMPLATE.md)
- Read: [PR Checklist](./PR_CHECKLIST.md) (quick reference)
- Deep dive: [PR Guidelines](./PR_GUIDELINES.md) (comprehensive)

**Fix a critical production issue**
- Use: [Hotfix Template](./PULL_REQUEST_TEMPLATE/hotfix.md)
- Read: [Template README](./PULL_REQUEST_TEMPLATE/README.md) (section on hotfixes)

**Promote a release to staging/production**
- Use: [Release Template](./PULL_REQUEST_TEMPLATE/release.md)
- Read: [Publishing workflow in CLAUDE.md](../CLAUDE.md#publishing)

**Understand the PR process**
- Read: [CONTRIBUTING.md](../CONTRIBUTING.md) (overview)
- Read: [PR Guidelines](./PR_GUIDELINES.md) (detailed instructions)

**Learn changelog conventions**
- Read: [PR Guidelines - Writing Changelog Entries](./PR_GUIDELINES.md#writing-changelog-entries)
- Examples: [CHANGELOG.md](../CHANGELOG.md)

**Choose the right template**
- Read: [Template Selection Guide](./PULL_REQUEST_TEMPLATE/README.md#template-selection-guide)

## 📖 Documentation Files

### Core Documents

#### [PULL_REQUEST_TEMPLATE.md](../PULL_REQUEST_TEMPLATE.md)
**Purpose:** Default template for most pull requests

**When to use:**
- Feature development
- Bug fixes
- Documentation updates
- Refactoring
- Performance improvements
- Test additions

**Key sections:**
- Description and user impact
- Type of change checkboxes
- Changelog entry guidelines
- Affected packages checklist
- Pre-submission checklist
- Testing instructions
- Deployment notes

**Target audience:** All contributors

---

#### [PR_GUIDELINES.md](./PR_GUIDELINES.md)
**Purpose:** Comprehensive guide to creating high-quality pull requests

**Contents:**
- Before creating a PR
- PR template sections explained
- Writing changelog entries (with examples)
- Testing requirements
- Branching strategy
- Review process
- Common pitfalls to avoid

**Length:** ~10 minute read

**Target audience:** 
- First-time contributors
- Anyone needing detailed guidance
- Reference for best practices

---

#### [PR_CHECKLIST.md](./PR_CHECKLIST.md)
**Purpose:** Quick reference for experienced contributors

**Contents:**
- Quick command reference
- Essential checklist items
- Common mistakes summary
- Useful git commands

**Length:** ~2 minute scan

**Target audience:**
- Regular contributors
- Quick verification before submitting
- CI/CD reference

---

### Template Documents

#### [PULL_REQUEST_TEMPLATE/README.md](./PULL_REQUEST_TEMPLATE/README.md)
**Purpose:** Guide to choosing and using PR templates

**Contents:**
- Template overview and selection
- Decision tree for choosing templates
- Usage examples for each template
- Guidelines by template type
- Common questions

**Length:** ~8 minute read

**Target audience:**
- Anyone unsure which template to use
- First-time contributors
- Reference documentation

---

#### [PULL_REQUEST_TEMPLATE/hotfix.md](./PULL_REQUEST_TEMPLATE/hotfix.md)
**Purpose:** Template for critical production issues

**When to use:**
- Production outages
- Critical bugs affecting users
- Security vulnerabilities
- Data loss risks

**Key sections:**
- Critical issue assessment
- Severity and impact
- Root cause analysis
- Risk assessment
- Rollback plan
- Deployment and monitoring plan

**Target audience:** Engineers handling production incidents

---

#### [PULL_REQUEST_TEMPLATE/release.md](./PULL_REQUEST_TEMPLATE/release.md)
**Purpose:** Template for release promotions and package publishing

**When to use:**
- Promoting main → stage
- Promoting stage → prod
- Publishing packages to npm
- Creating release versions

**Key sections:**
- Release information and summary
- Complete changelog
- Package version tracking
- Breaking changes documentation
- Pre-release checklist
- Staging test plan
- Production deployment plan
- Communication plan
- Post-release monitoring

**Target audience:** Maintainers and release managers

---

### Related Documents

#### [CONTRIBUTING.md](../CONTRIBUTING.md)
**Purpose:** General contribution guide

**Covers:**
- Development process overview
- Pull request basics
- Issue reporting
- Environment setup
- Testing approach
- Code style guidelines

**Relationship to PR docs:** Entry point that links to detailed PR documentation

---

#### [CLAUDE.md](../CLAUDE.md)
**Purpose:** Developer guide for working with this codebase

**Covers:**
- Project overview and architecture
- Common commands and workflows
- Development practices
- Publishing workflow
- Testing approach

**Relationship to PR docs:** Technical workflow reference, especially for publishing

---

#### [CHANGELOG.md](../CHANGELOG.md)
**Purpose:** History of changes in Keep a Changelog format

**Use as:**
- Example of good changelog entries
- Reference for versioning
- History of project evolution

**Relationship to PR docs:** Provides real-world examples of changelog entries

---

## 🔄 Workflows

### Standard Feature Development

```
1. Create feature branch from main
   git checkout -b feature/your-feature

2. Develop and test
   - Write code
   - Add tests
   - Update docs

3. Pre-submission checks
   pnpm build && pnpm typecheck && pnpm test:packages:run

4. Update CHANGELOG.md

5. Create PR
   gh pr create --base main --fill
   (uses default template automatically)

6. Address review feedback

7. Merge to main
   (auto-deploys to development)
```

### Hotfix Process

```
1. Create hotfix branch from prod
   git checkout prod
   git checkout -b hotfix/critical-issue

2. Minimal fix
   - Target the specific issue
   - No scope creep
   - Test thoroughly

3. Create PRs to stage AND prod
   gh pr create --base stage --template hotfix.md
   gh pr create --base prod --template hotfix.md

4. Expedited review

5. Deploy to staging (validation)

6. Deploy to production

7. Monitor closely

8. Sync back to main
   git checkout main
   git merge hotfix/critical-issue
```

### Release Process

```
1. Prepare release
   - Update CHANGELOG.md (Unreleased → versioned section)
   - Ensure all tests pass
   - Review included changes

2. Promote to staging
   gh pr create --base stage --head main --template release.md

3. Test in staging
   - Run smoke tests
   - Validate new features
   - Check for issues

4. Promote to production
   gh pr create --base prod --head stage --template release.md

5. Publish packages
   - Follow CLAUDE.md publishing order
   - Create git tag
   - Monitor deployment

6. Sync back to main
   git checkout main
   git merge prod
```

## 🎓 Learning Path

### For New Contributors

**Day 1:** Get oriented
1. Read [CONTRIBUTING.md](../CONTRIBUTING.md) - 5 minutes
2. Skim [PR_CHECKLIST.md](./PR_CHECKLIST.md) - 2 minutes
3. Browse [Default Template](../PULL_REQUEST_TEMPLATE.md) - 3 minutes

**Week 1:** Understand the process
1. Read [PR Guidelines - Before Creating a PR](./PR_GUIDELINES.md#before-creating-a-pr) - 10 minutes
2. Read [PR Guidelines - Writing Changelog Entries](./PR_GUIDELINES.md#writing-changelog-entries) - 15 minutes
3. Look at 3-5 recent merged PRs as examples

**Month 1:** Master the workflow
1. Read full [PR Guidelines](./PR_GUIDELINES.md) - 30 minutes
2. Understand [branching strategy](./PR_GUIDELINES.md#branching-strategy)
3. Review [CLAUDE.md](../CLAUDE.md) for technical workflow

### For Regular Contributors

**Quick reference:**
- [PR_CHECKLIST.md](./PR_CHECKLIST.md) before every PR
- [Template README](./PULL_REQUEST_TEMPLATE/README.md) when choosing templates
- [PR Guidelines - Common Pitfalls](./PR_GUIDELINES.md#common-pitfalls) for refreshers

**Deep dives when needed:**
- [PR Guidelines](./PR_GUIDELINES.md) for comprehensive reference
- [CLAUDE.md](../CLAUDE.md) for publishing workflow
- Recent PRs for current practices

### For Maintainers

**Essential reading:**
1. All documents in this index
2. [CLAUDE.md - Publishing](../CLAUDE.md#publishing) for release process
3. [Release Template](./PULL_REQUEST_TEMPLATE/release.md) for promotion checklist
4. [Hotfix Template](./PULL_REQUEST_TEMPLATE/hotfix.md) for incident response

**Quick access:**
- Keep [PR_CHECKLIST.md](./PR_CHECKLIST.md) bookmarked for reviews
- Reference [PR Guidelines - Review Process](./PR_GUIDELINES.md#review-process)
- Use [Release Template](./PULL_REQUEST_TEMPLATE/release.md) for every release

## 🔍 Finding Information

### Common Questions

**Q: How do I write a good changelog entry?**
- A: [PR Guidelines - Writing Changelog Entries](./PR_GUIDELINES.md#writing-changelog-entries)
- Examples: [CHANGELOG.md](../CHANGELOG.md)

**Q: Which PR template should I use?**
- A: [Template Selection Guide](./PULL_REQUEST_TEMPLATE/README.md#template-selection-guide)

**Q: What tests need to pass before merging?**
- A: [PR Guidelines - Testing Requirements](./PR_GUIDELINES.md#testing-requirements)
- A: [CONTRIBUTING.md - Testing](../CONTRIBUTING.md#testing)

**Q: How do I target the right branch?**
- A: [PR Guidelines - Branching Strategy](./PR_GUIDELINES.md#branching-strategy)

**Q: What's the release process?**
- A: [Release Template](./PULL_REQUEST_TEMPLATE/release.md)
- A: [CLAUDE.md - Publishing](../CLAUDE.md#publishing)

**Q: How do I handle a production emergency?**
- A: [Hotfix Template](./PULL_REQUEST_TEMPLATE/hotfix.md)
- A: [Template README - Hotfix Guidelines](./PULL_REQUEST_TEMPLATE/README.md#hotfix-template-guidelines)

**Q: What are the code style requirements?**
- A: [CONTRIBUTING.md - Code Style](../CONTRIBUTING.md#code-style)

**Q: How do I set up my development environment?**
- A: [CLAUDE.md - Common Commands](../CLAUDE.md#common-commands)
- A: [CONTRIBUTING.md - Environment Setup](../CONTRIBUTING.md#environment-setup)

### Search Tips

**Finding by topic:**
```bash
# Changelog guidelines
grep -r "changelog" .github/*.md

# Testing requirements
grep -r "test" .github/*.md

# Branching strategy
grep -r "branch" .github/*.md
```

**Finding examples:**
- Recent PRs: https://github.com/ceedaragents/cyrus/pulls?q=is%3Apr
- Changelog examples: [CHANGELOG.md](../CHANGELOG.md)
- Documentation examples: Recent commits to docs files

## 📊 Documentation Matrix

### By Contributor Type

| Contributor Type | Must Read | Should Read | Reference |
|-----------------|-----------|-------------|-----------|
| **First-time** | CONTRIBUTING.md<br>PR_CHECKLIST.md | PR_GUIDELINES.md<br>Default Template | CLAUDE.md |
| **Regular** | PR_CHECKLIST.md<br>Default Template | Template README | PR_GUIDELINES.md |
| **Maintainer** | All documents | Recent PRs<br>CLAUDE.md | CHANGELOG.md |

### By Task Type

| Task | Primary Doc | Supporting Docs | Examples |
|------|------------|-----------------|----------|
| **Feature PR** | Default Template | PR_GUIDELINES.md<br>PR_CHECKLIST.md | Recent feature PRs |
| **Bug Fix PR** | Default Template | PR_GUIDELINES.md | CHANGELOG.md - Fixed section |
| **Hotfix** | Hotfix Template | Template README | Past hotfix PRs |
| **Release** | Release Template | CLAUDE.md - Publishing | Past release PRs |
| **Review** | PR_GUIDELINES.md - Review | PR_CHECKLIST.md | N/A |

### By Information Need

| Need | Document | Section |
|------|----------|---------|
| **Quick commands** | PR_CHECKLIST.md | Quick Commands |
| **Changelog format** | PR_GUIDELINES.md | Writing Changelog Entries |
| **Template choice** | Template README | Template Selection Guide |
| **Testing** | CONTRIBUTING.md | Testing |
| **Publishing** | CLAUDE.md | Publishing |
| **Branching** | PR_GUIDELINES.md | Branching Strategy |
| **Examples** | CHANGELOG.md | All sections |

## 🔄 Keeping Current

### These docs are living documents

**When to update:**
- Process changes
- New tools or workflows
- Common questions arise
- Template improvements needed

**How to update:**
1. Create PR with documentation changes
2. Use default PR template
3. Mark as "documentation" type
4. Update this index if adding/removing files

**Who can update:**
Anyone! Documentation improvements are always welcome.

## ✅ Quick Start Checklist

Before your first PR:
- [ ] Read [CONTRIBUTING.md](../CONTRIBUTING.md) (5 min)
- [ ] Scan [PR_CHECKLIST.md](./PR_CHECKLIST.md) (2 min)
- [ ] Look at [Default Template](../PULL_REQUEST_TEMPLATE.md) (3 min)
- [ ] Review 2-3 recent merged PRs
- [ ] Set up development environment ([CLAUDE.md](../CLAUDE.md))
- [ ] Bookmark this index for future reference

## 📞 Getting Help

If you can't find what you need:

1. **Search this index** - Use Ctrl+F
2. **Check FAQ in docs** - Most have Q&A sections
3. **Look at recent PRs** - See what others have done
4. **Ask in your PR** - Note uncertainty, ask for guidance
5. **GitHub Discussions** - Ask the community
6. **Tag maintainers** - Last resort for urgent questions

## 📝 Feedback

Found something unclear? Documentation missing?

1. Create an issue describing the gap
2. Or submit a PR with improvements
3. Tag with "documentation" label

All feedback welcome! These docs exist to help you contribute effectively.

---

**Last Updated:** January 2025
**Maintained By:** Cyrus maintainers
**Questions?** Open an issue or discussion on GitHub
