# 📦 Release PR

<!-- 
This template is for releases being promoted between environments.
Releases follow: main → stage → prod
-->

## Release Information

**Release Type:**
- [ ] 🎉 Feature Release (minor version)
- [ ] 🐛 Bugfix Release (patch version)
- [ ] 💥 Breaking Release (major version)
- [ ] 🔧 Maintenance Release (dependencies, refactoring)

**Version:** `v0.1.XX`

**Target Environment:**
- [ ] Staging (`main` → `stage`)
- [ ] Production (`stage` → `prod`)

**Release Date:** <!-- YYYY-MM-DD -->

## Release Summary

<!-- 
High-level summary of what's in this release.
Write as if announcing to users/customers.
-->

**Key Highlights:**

1. 
2. 
3. 

**User Benefits:**


## Changelog

<!-- 
Copy final changelog entries from CHANGELOG.md.
Should match the versioned section you're releasing.
-->

### Added


### Changed


### Fixed


### Removed


### Deprecated


### Security


## Package Versions

<!-- List all packages being published in this release -->

### Applications

- [ ] `apps/cli` - cyrus-ai
  - Current: `0.1.XX`
  - New: `0.1.YY`

- [ ] `apps/proxy`
  - Current: `0.0.XX`
  - New: `0.0.YY`

### Packages

- [ ] `packages/core` - cyrus-core
  - Current: `0.0.XX`
  - New: `0.0.YY`

- [ ] `packages/claude-runner` - cyrus-claude-runner
  - Current: `0.0.XX`
  - New: `0.0.YY`

- [ ] `packages/edge-worker` - cyrus-edge-worker
  - Current: `0.0.XX`
  - New: `0.0.YY`

- [ ] `packages/ndjson-client` - cyrus-ndjson-client
  - Current: `0.0.XX`
  - New: `0.0.YY`

- [ ] `packages/simple-agent-runner` - cyrus-simple-agent-runner
  - Current: `0.0.XX`
  - New: `0.0.YY`

## Breaking Changes

<!-- If any breaking changes, document migration path -->

**Breaking changes included:**
- [ ] Yes (see migration guide below)
- [ ] No

### Migration Guide

<!-- If breaking changes exist -->

**What breaks:**


**Who's affected:**


**Migration steps:**

1. 
2. 
3. 

**Deprecation timeline:**


## Pre-Release Checklist

### Code Quality

- [ ] All CI checks passing on source branch
- [ ] All tests pass (`pnpm test:packages:run`)
- [ ] TypeScript compiles (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No linting errors (`pnpm lint`)
- [ ] All PRs in release reviewed and approved

### Documentation

- [ ] CHANGELOG.md updated with version and date
  - [ ] Moved entries from `[Unreleased]` to `[0.1.XX] - YYYY-MM-DD`
  - [ ] Included package versions in changelog
  - [ ] Added links to package changelogs (if applicable)
- [ ] README.md updated (if needed)
- [ ] CLAUDE.md updated (if workflow changed)
- [ ] Migration guides written (if breaking changes)
- [ ] API documentation updated (if applicable)

### Testing

- [ ] All features tested in development environment
- [ ] Integration tests pass
- [ ] Smoke tests prepared for staging/production
- [ ] Performance testing done (if significant changes)
- [ ] Security review completed (if applicable)
- [ ] Backward compatibility verified

### Dependencies

- [ ] All dependency updates documented
- [ ] No critical security vulnerabilities
- [ ] License compliance verified
- [ ] Peer dependencies updated in README (if changed)

### Release Artifacts

- [ ] Version numbers updated in all package.json files
- [ ] Git tag prepared: `v0.1.XX`
- [ ] Release notes drafted
- [ ] Screenshots/demos prepared (if user-facing changes)

## Testing in Staging

<!-- For main → stage releases -->

### Smoke Test Plan

1. **Installation test**
   ```bash
   npm install -g cyrus-ai@0.1.XX
   cyrus --version
   ```

2. **Core functionality**
   - [ ] Linear OAuth connection works
   - [ ] Repository setup completes
   - [ ] Issue assignment triggers processing
   - [ ] Claude sessions execute successfully
   - [ ] Comments post back to Linear

3. **New features** (if any)
   - [ ] Feature 1: 
   - [ ] Feature 2: 
   - [ ] Feature 3: 

### Staging Environment

**Staging deployment:**
- URL/Environment: 
- Deployed at: <!-- timestamp -->
- Deployed by: <!-- @username -->

**Smoke test results:**
- [ ] All smoke tests passed
- [ ] Issues found (document below)

**Issues found:**


## Production Deployment Plan

<!-- For stage → prod releases -->

### Pre-Deployment

- [ ] All staging tests passed
- [ ] Customer communication prepared (if needed)
- [ ] Rollback plan tested
- [ ] Support team briefed on changes
- [ ] Monitoring dashboards ready

### Deployment Steps

1. [ ] Merge PR to `prod` branch
2. [ ] Tag release: `git tag v0.1.XX`
3. [ ] Push tag: `git push origin v0.1.XX`
4. [ ] Publish packages (follow CLAUDE.md publishing order)
5. [ ] Verify npm packages published successfully
6. [ ] Update production environments (if applicable)
7. [ ] Run production smoke tests
8. [ ] Monitor for 30 minutes

### Publishing Order

<!-- Follow exact order from CLAUDE.md -->

```bash
# 1. Build all packages first
pnpm install && pnpm build

# 2. Publish packages in dependency order
# ndjson-client → claude-runner → core → simple-agent-runner → edge-worker → cli

cd packages/ndjson-client && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

cd packages/claude-runner && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

cd packages/core && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

cd packages/simple-agent-runner && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

cd packages/edge-worker && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

cd apps/cli && pnpm publish --access public --no-git-checks
cd ../..

# 3. Create and push tag
git tag v0.1.XX
git push origin main
git push origin v0.1.XX
```

### Post-Deployment

- [ ] npm packages verified
- [ ] Production smoke tests passed
- [ ] Monitoring shows healthy metrics
- [ ] No error spike in logs
- [ ] Customer-facing features working
- [ ] Support team notified of completion

### Rollback Plan

**If issues are discovered:**

1. Unpublish problematic packages (if within 72h):
   ```bash
   npm unpublish cyrus-ai@0.1.XX
   ```

2. Revert git tag:
   ```bash
   git tag -d v0.1.XX
   git push origin :refs/tags/v0.1.XX
   ```

3. Notify users via:
   - [ ] GitHub release notes
   - [ ] npm deprecation notice
   - [ ] Social media/Discord (if applicable)

**Estimated rollback time:** <!-- minutes -->

## Communication Plan

### Internal

- [ ] Engineering team notified of release schedule
- [ ] QA team coordinated for testing
- [ ] Support team briefed on new features
- [ ] Product team updated on timeline

### External

<!-- If customer-impacting changes -->

- [ ] Release notes published on GitHub
- [ ] Tweet/social media announcement prepared
- [ ] Documentation site updated
- [ ] Email to subscribers (if breaking changes)
- [ ] Discord/community announcement

**Release announcement:**

<!-- Draft announcement text -->

```markdown
🎉 Cyrus v0.1.XX Released!

New in this release:
- Feature 1
- Feature 2  
- Bug fix 1

Upgrade: npm install -g cyrus-ai@latest

Full changelog: https://github.com/ceedaragents/cyrus/blob/main/CHANGELOG.md#01xx
```

## Monitoring & Metrics

### Success Metrics

**Measure after deployment:**

- [ ] Installation success rate
- [ ] Session completion rate  
- [ ] Error rate (target: <1%)
- [ ] Performance metrics (response time)
- [ ] User adoption (downloads)

### Monitoring Duration

- **First hour:** Active monitoring (5-minute intervals)
- **First day:** Regular checks (hourly)
- **First week:** Daily metrics review

### Alerts

**Configured alerts for:**
- [ ] Error rate spike
- [ ] Performance degradation  
- [ ] Failed installations
- [ ] Security issues

## Post-Release Actions

### Immediate (within 24h)

- [ ] Sync prod changes back to main
- [ ] Close all released issues
- [ ] Update project board
- [ ] Archive release branch (if applicable)

### Follow-up (within 1 week)

- [ ] Collect user feedback
- [ ] Review metrics
- [ ] Document lessons learned
- [ ] Plan next release
- [ ] Update roadmap

### Technical Debt

<!-- Items to address in future releases -->

- 
- 

## Related Issues

<!-- Link all issues/PRs included in this release -->

**Included in this release:**

- Closes #
- Closes #
- Closes #

**Release tracking:**

- Milestone: 
- Release issue: 
- Project board: 

## Approval Requirements

### For Staging Release (main → stage)

- [ ] All tests passing
- [ ] 2 approvals from maintainers
- [ ] CHANGELOG.md updated
- [ ] Documentation complete

### For Production Release (stage → prod)

- [ ] Staging tests passed
- [ ] 2 approvals including code owner
- [ ] Customer communication ready (if needed)
- [ ] Monitoring plan in place
- [ ] Rollback tested

## Release Notes

<!-- Final release notes for GitHub release -->

```markdown
## What's New in v0.1.XX

### ✨ New Features


### 🐛 Bug Fixes


### 📚 Documentation


### 🔧 Maintenance


## Installation

```bash
npm install -g cyrus-ai@0.1.XX
```

## Upgrade Notes


## Full Changelog

See [CHANGELOG.md](https://github.com/ceedaragents/cyrus/blob/main/CHANGELOG.md#01xx)
```

---

<!-- 
After successful release:
1. Create GitHub release with notes above
2. Announce in community channels
3. Update internal documentation
4. Plan next release
-->
