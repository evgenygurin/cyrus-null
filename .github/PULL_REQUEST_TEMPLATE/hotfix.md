# 🔥 HOTFIX PR

<!-- 
This template is for CRITICAL production issues requiring immediate fixes.
For regular bug fixes, use the standard PR template.
-->

## ⚠️ Critical Issue

**Severity:** 
<!-- Check one -->
- [ ] 🔴 Critical - Service down or data loss
- [ ] 🟠 High - Major functionality broken
- [ ] 🟡 Medium - Significant degradation

**Impact:**
<!-- Who/what is affected? -->


**Downtime/Outage:**
<!-- Is there active downtime? How long? -->


## Problem Description

**What's broken:**


**Root cause:**


**When it started:**


**Affected users:**


## Solution

**What this hotfix does:**


**Why this approach:**
<!-- Explain why this is the right fix vs alternatives -->


**Testing performed:**
<!-- What testing was done to verify the fix? -->


## Changelog Entry

### Fixed
<!-- Focus on user-visible fix -->

- 

## Risk Assessment

**Risk level of this fix:**
- [ ] 🟢 Low - Targeted fix, well-tested
- [ ] 🟡 Medium - Some risk but necessary  
- [ ] 🔴 High - Significant changes required

**What could go wrong:**


**Mitigation:**


## Rollback Plan

**If this hotfix causes issues:**

1. 
2. 
3. 

**Time to rollback:** <!-- Estimated minutes -->

**Rollback tested:** <!-- Yes/No -->

## Deployment Plan

### Immediate Actions

1. [ ] Merge to `stage` branch first (for validation)
2. [ ] Deploy to staging
3. [ ] Quick smoke test on staging
4. [ ] Merge to `prod` branch
5. [ ] Deploy to production
6. [ ] Monitor for 15 minutes
7. [ ] Merge back to `main` (sync)

### Post-Deployment Monitoring

**Metrics to watch:**
- 
- 

**Monitoring duration:** <!-- e.g., "1 hour" -->

**Success criteria:**
- 
- 

## Communication

**Incident ticket:**
<!-- Link to incident tracking -->

**Stakeholders notified:**
- [ ] Product team
- [ ] Support team
- [ ] Affected customers
- [ ] Engineering team

**Status page updated:**
- [ ] Yes
- [ ] No
- [ ] N/A

## Pre-Deployment Checklist

### Code Quality
- [ ] Fix is minimal and focused
- [ ] No unrelated changes included
- [ ] Code reviewed by at least one other engineer
- [ ] TypeScript compiles (`pnpm typecheck`)
- [ ] Tests pass (`pnpm test:packages:run`)

### Testing
- [ ] Tested in development environment
- [ ] Reproduced original issue
- [ ] Verified fix resolves issue
- [ ] Tested edge cases
- [ ] No new errors introduced
- [ ] Rollback tested

### Documentation
- [ ] CHANGELOG.md updated under `[Unreleased]`
- [ ] Incident notes documented
- [ ] Customer communications prepared (if needed)

### Deployment
- [ ] Deployment steps documented above
- [ ] Rollback plan tested
- [ ] Monitoring plan in place
- [ ] On-call engineer ready

## Affected Packages

<!-- Check all packages with changes -->

- [ ] `apps/cli` - cyrus-ai @ 
- [ ] `apps/proxy` @ 
- [ ] `packages/core` - cyrus-core @ 
- [ ] `packages/claude-runner` - cyrus-claude-runner @ 
- [ ] `packages/edge-worker` - cyrus-edge-worker @ 
- [ ] `packages/ndjson-client` - cyrus-ndjson-client @ 
- [ ] Other: 

## Testing Evidence

<!-- Include screenshots, logs, or test results proving the fix works -->

### Before Fix


### After Fix


### Test Results


## Related Issues

- Incident: 
- Root cause analysis: 
- Related bugs: 

## Approval Requirements

<!-- Hotfixes require expedited but careful review -->

- [ ] Code reviewed by senior engineer
- [ ] Deployment plan approved
- [ ] Product/stakeholders notified (if customer-impacting)
- [ ] Ready for immediate deployment

## Post-Deployment

<!-- Fill out after deployment -->

**Deployed at:** <!-- timestamp -->

**Deployed by:** <!-- @username -->

**Monitoring results:**


**Follow-up actions:**
- [ ] Create post-mortem issue
- [ ] Update runbooks/documentation  
- [ ] Add tests to prevent regression
- [ ] Technical debt cleanup needed

---

<!-- 
IMPORTANT: After deploying hotfix to prod:
1. Merge hotfix branch back to stage and main
2. Create follow-up issues for proper fixes/improvements
3. Document lessons learned in post-mortem
-->
