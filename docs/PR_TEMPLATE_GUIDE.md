# Pull Request Template Guide

## 📚 Table of Contents

- [Overview](#overview)
- [Why We Use PR Templates](#why-we-use-pr-templates)
- [Template Structure](#template-structure)
- [How to Use the Template](#how-to-use-the-template)
- [Section-by-Section Guide](#section-by-section-guide)
- [Best Practices](#best-practices)
- [Common Mistakes to Avoid](#common-mistakes-to-avoid)
- [Examples](#examples)
- [Enforcement and Automation](#enforcement-and-automation)

---

## Overview

The Cyrus project uses a comprehensive Pull Request (PR) template to ensure consistency, quality, and clear communication across all contributions. This guide explains how to use the template effectively.

### What is a PR Template?

A PR template is a pre-defined structure that automatically populates when you create a new pull request. It serves as a checklist and guideline to ensure all necessary information is provided.

### Where is it Located?

The PR template is located at `.github/PULL_REQUEST_TEMPLATE.md` in the repository root. GitHub automatically loads this template for all new pull requests.

---

## Why We Use PR Templates

### For Contributors

1. **Clarity**: Know exactly what information to provide
2. **Completeness**: Don't forget important details like tests or CHANGELOG updates
3. **Efficiency**: Spend less time wondering "what should I include?"
4. **Quality**: Built-in checklist ensures high-quality submissions

### For Reviewers

1. **Context**: Understand changes before diving into code
2. **Consistency**: All PRs follow the same format
3. **Speed**: Find information quickly without asking questions
4. **Confidence**: Checklist confirms all requirements are met

### For the Project

1. **Documentation**: PR descriptions become part of project history
2. **Standards**: Maintains consistent code quality
3. **Onboarding**: New contributors know what's expected
4. **Traceability**: Easy to reference past decisions and changes

---

## Template Structure

Our PR template consists of 11 main sections:

```
1. 📋 Summary (REQUIRED)
   - Quick overview
   - Related issues
   - Type of change

2. 📝 Description & Motivation (REQUIRED)
   - Detailed explanation
   - Technical details
   - User impact

3. 🧪 Testing & Validation (REQUIRED)
   - Test coverage
   - Test results
   - Manual testing steps

4. 📦 Package Impact (Monorepo-specific)
   - Affected packages
   - Publishing requirements

5. 📸 Screenshots / Demo (If applicable)
   - Before/after comparisons
   - Example usage

6. 📜 CHANGELOG Update (REQUIRED)
   - Changelog status
   - Entry preview

7. 🔄 Changes to Existing Functionality (If applicable)
   - Migration steps
   - Deployment notes

8. ✅ Pre-Merge Checklist (REQUIRED)
   - Code quality
   - Testing
   - Documentation
   - Dependencies
   - Monorepo-specific

9. 🚀 Deployment Considerations (If applicable)
   - Environment impact
   - Rollback plan
   - Monitoring

10. 🔗 Additional Context (Optional)
    - Related PRs
    - References
    - Design docs

11. 👥 Reviewer Notes (Optional)
    - Review focus areas
    - Questions for reviewers

12. 🔐 Security Considerations (If applicable)
    - Security implications
    - Vulnerability assessment
```

---

## How to Use the Template

### Step 1: Create Your Branch

```bash
# Feature branch
git checkout -b feature/add-oauth-support main

# Bug fix branch
git checkout -b fix/memory-leak main
```

### Step 2: Make Your Changes

Develop your feature or fix following the project's coding standards.

### Step 3: Test Your Changes

```bash
# Run all tests
pnpm test

# Run package tests only
pnpm test:packages:run

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

### Step 4: Update CHANGELOG.md

**This is mandatory for all user-facing changes!**

```markdown
## [Unreleased]

### Added
- **OAuth provider support**: Users can now configure custom OAuth providers for self-hosted Linear instances
```

See the [Changelog Guidelines](#changelog-guidelines) section for more details.

### Step 5: Push and Create PR

```bash
git push origin feature/add-oauth-support

# Create PR using GitHub CLI
gh pr create --base main --title "feat: Add custom OAuth provider support"
```

### Step 6: Fill Out the Template

GitHub will automatically populate your PR description with the template. Fill it out completely!

### Step 7: Request Review

Once all checklist items are complete, request review from maintainers.

---

## Section-by-Section Guide

### 1. Summary Section

**Purpose**: Provide a quick, scannable overview of your PR.

**What to Include**:
- 2-3 sentence summary of changes
- Links to related issues (use `Fixes #123`, `Relates to #456`)
- Type of change checkbox (mark with `x`)

**Example**:

```markdown
## 📋 Summary

This PR adds support for custom OAuth providers by implementing a new `oauthProvider` 
configuration option in the EdgeWorker. This allows users to connect to self-hosted 
Linear instances or use custom OAuth applications.

### Related Issue(s)
- Fixes #234
- Relates to #189

### Type of Change
- [x] ✨ New feature (non-breaking change which adds functionality)
```

**Tips**:
- Use present tense ("adds" not "added")
- Focus on user-visible changes
- Be specific but concise

---

### 2. Description & Motivation Section

**Purpose**: Explain the "what" and "why" in detail.

**What to Include**:

**Technical Details**:
- Architecture decisions made
- Implementation approach
- Key files or components modified
- Alternative approaches considered

**User Impact**:
- How this affects CLI users
- Changes to existing workflows
- New capabilities available

**Example**:

```markdown
## 📝 Description & Motivation

### The Problem
Currently, Cyrus only supports the default Linear OAuth flow using our proxy server. 
Users who want to use self-hosted Linear instances or custom OAuth applications 
cannot authenticate properly.

### The Solution
This PR introduces a new `oauthProvider` configuration option that allows users to 
specify custom OAuth endpoints. The EdgeWorker now supports:

1. Custom authorization URLs
2. Custom token exchange endpoints
3. Custom client ID/secret pairs

### Technical Details
- Added new `OAuthProvider` interface in `packages/core/src/types`
- Modified `EdgeWorker` to accept optional OAuth configuration
- Updated `LinearIssueService` to use custom provider if configured
- Backwards compatible - defaults to existing proxy behavior

### User Impact
Users can now add this to their `~/.cyrus/config.json`:

\`\`\`json
{
  "oauthProvider": {
    "authorizationUrl": "https://my-linear.company.com/oauth/authorize",
    "tokenUrl": "https://my-linear.company.com/oauth/token",
    "clientId": "custom-client-id",
    "clientSecret": "custom-client-secret"
  }
}
\`\`\`
```

**Tips**:
- Explain context - assume reviewer has been away for 2 weeks
- Include "why" not just "what"
- Reference design docs or RFCs if applicable
- Think about future you reading this in 6 months

---

### 3. Testing & Validation Section

**Purpose**: Prove your changes work correctly.

**What to Include**:

**Test Coverage**:
- New tests added
- Updated tests
- Coverage maintained/improved

**Test Results**:
- Paste actual test output
- Show all tests passing
- Include relevant screenshots

**Manual Testing Steps**:
- Step-by-step reproduction
- Expected vs actual results
- Edge cases tested

**Example**:

```markdown
## 🧪 Testing & Validation

### Test Coverage
- [x] Unit tests added for OAuthProvider
- [x] Integration tests for custom OAuth flow
- [x] Manual testing completed with self-hosted Linear
- [x] Test coverage maintained at 85%

### Test Results

<details>
<summary>Test Output</summary>

\`\`\`bash
$ pnpm test:packages:run

 ✓ packages/core/src/oauth/OAuthProvider.test.ts (12)
   ✓ OAuthProvider
     ✓ initializes with default config
     ✓ accepts custom OAuth endpoints
     ✓ validates client credentials
     ✓ handles token exchange correctly
     
 ✓ packages/edge-worker/src/__tests__/oauth.test.ts (8)
   ✓ Custom OAuth integration
     ✓ authenticates with custom provider
     ✓ falls back to default on missing config
     
Test Files  24 passed (24)
     Tests  189 passed (189)
  Duration  12.34s
\`\`\`

</details>

### Manual Testing Steps

Tested with self-hosted Linear instance:

1. Set up test Linear instance at `https://test-linear.local`
2. Configure custom OAuth app in Linear settings
3. Updated `~/.cyrus/config.json`:
   \`\`\`json
   {
     "oauthProvider": {
       "authorizationUrl": "https://test-linear.local/oauth/authorize",
       "tokenUrl": "https://test-linear.local/oauth/token",
       "clientId": "test-client",
       "clientSecret": "test-secret"
     }
   }
   \`\`\`
4. Ran `cyrus` CLI
5. Verified OAuth flow redirects to custom URL
6. Successfully authenticated and connected to issues

**Expected**: OAuth completes and Cyrus starts monitoring issues
**Actual**: ✅ Works as expected

**Edge Cases Tested**:
- Invalid OAuth credentials → Shows clear error message
- Missing optional config → Falls back to default proxy
- Network timeout → Properly handles and retries
```

**Tips**:
- Show, don't just tell - paste actual output
- Test both happy path and error cases
- Document manual testing thoroughly
- Make it reproducible for reviewers

---

### 4. Package Impact Section

**Purpose**: Identify which parts of the monorepo are affected.

**What to Include**:
- Checkboxes for affected packages
- Publishing requirements
- Version bump notes

**Example**:

```markdown
## 📦 Package Impact

### Affected Packages
- [x] `packages/core` - Added OAuthProvider types
- [x] `packages/edge-worker` - Modified OAuth flow
- [ ] `packages/claude-runner` - No changes
- [x] `apps/cli` - Updated config schema

### Package Publishing
- [x] This PR requires package publishing
- [x] Publishing order documented:
  1. `packages/core` (0.0.20)
  2. `packages/edge-worker` (0.0.40)
  3. `apps/cli` (0.1.58)
- [ ] No breaking changes
```

**Tips**:
- Be thorough - check all potentially affected packages
- Note if this is a breaking change
- Document the publishing order
- Reference CLAUDE.md#publishing for full process

---

### 5. Screenshots / Demo Section

**Purpose**: Visual proof of changes, especially for UI or CLI output.

**What to Include**:
- Before/after comparisons
- CLI output examples
- Configuration examples
- Error message improvements

**Example**:

```markdown
## 📸 Screenshots / Demo

### Before
\`\`\`bash
$ cyrus
Error: Failed to connect to Linear
Authentication failed
\`\`\`

### After
\`\`\`bash
$ cyrus
✓ Configured custom OAuth provider: https://my-linear.local
✓ Starting OAuth flow...
✓ Authentication successful!
✓ Connected to Linear workspace: My Company
✓ Monitoring 3 repositories...
\`\`\`

### Example Configuration
\`\`\`json
{
  "repositories": [...],
  "oauthProvider": {
    "authorizationUrl": "https://my-linear.local/oauth/authorize",
    "tokenUrl": "https://my-linear.local/oauth/token",
    "clientId": "my-client-id",
    "clientSecret": "my-client-secret"
  }
}
\`\`\`
```

**Tips**:
- Use code blocks for CLI output
- Show real examples, not pseudocode
- Include error cases if you improved them
- Make it visual and easy to understand

---

### 6. CHANGELOG Update Section

**Purpose**: Ensure CHANGELOG.md is updated - **THIS IS MANDATORY**.

**What to Include**:
- Confirmation checkbox (must be checked!)
- Preview of your changelog entry
- Verification that it's user-focused

**Example**:

```markdown
## 📜 CHANGELOG Update

### Changelog Status
- [x] **I have updated CHANGELOG.md under `## [Unreleased]` section**
- [x] Changes are written from end-user perspective
- [x] Changes are categorized under `### Added`
- [x] Changes avoid technical implementation details
- [x] Changes are concise but descriptive

### Changelog Entry Preview

\`\`\`markdown
### Added
- **Custom OAuth provider support**: Users can now configure custom OAuth providers 
  for self-hosted Linear instances or custom OAuth applications using the `oauthProvider` 
  field in `~/.cyrus/config.json`. Supports custom authorization URLs, token endpoints, 
  and client credentials while maintaining backward compatibility with the default proxy.
\`\`\`
```

**Changelog Guidelines**:

1. **Write for end users** - Focus on CLI users, not developers
   - ✅ "Users can now configure custom OAuth providers"
   - ❌ "Implemented OAuthProvider interface in core package"

2. **Choose the right category**:
   - `### Added` - New features, capabilities, commands
   - `### Changed` - Modifications to existing behavior
   - `### Fixed` - Bug fixes
   - `### Removed` - Deprecated or removed features
   - `### Security` - Security improvements
   - `### Breaking` - Breaking changes (include migration steps!)

3. **Be specific but concise**:
   - ✅ "OAuth provider support with custom endpoints and credentials"
   - ❌ "OAuth stuff"
   - ❌ "Implemented a comprehensive OAuth provider abstraction layer..."

4. **Include configuration examples** when relevant:
   ```markdown
   ### Added
   - **New config option `oauthProvider`**: Configure custom OAuth providers...
   ```

5. **Explain impact**:
   - What can users now do?
   - How does this improve their workflow?
   - Are there any migration steps?

**Tips**:
- Update CHANGELOG.md BEFORE creating the PR
- Read existing entries for style guidance
- This is how we communicate changes to users
- Future you will thank present you for details

---

### 7. Changes to Existing Functionality Section

**Purpose**: Document migration steps and breaking changes.

**What to Include**:
- Migration steps for users
- Deployment instructions
- Breaking changes explained

**Example**:

```markdown
## 🔄 Changes to Existing Functionality

### Migration Steps

**For users of the default OAuth flow**: No action required. Everything works the same.

**For users who want custom OAuth**:
1. Update to Cyrus v0.1.58 or later
2. Add `oauthProvider` section to `~/.cyrus/config.json`:
   \`\`\`json
   {
     "oauthProvider": {
       "authorizationUrl": "https://your-linear/oauth/authorize",
       "tokenUrl": "https://your-linear/oauth/token",
       "clientId": "your-client-id",
       "clientSecret": "your-client-secret"
     }
   }
   \`\`\`
3. Restart Cyrus
4. Complete OAuth flow when prompted

- [x] No breaking changes
- [x] Fully backward compatible
- [x] Migration steps documented

### Deployment Notes
- No special deployment steps required
- Config validation added - invalid OAuth config will show clear error
- Old configurations continue to work without modification
```

**Tips**:
- Be explicit about what users need to do
- Test migration steps yourself
- Note if it's breaking or backward compatible
- Provide clear error messages for misconfigurations

---

### 8. Pre-Merge Checklist Section

**Purpose**: Ensure you haven't forgotten anything critical.

**What to Check**:

**Code Quality**:
- [ ] Follows style guidelines (Biome)
- [ ] Self-reviewed
- [ ] Comments added
- [ ] No new warnings/errors
- [ ] All existing tests pass

**Testing**:
- [ ] New tests added
- [ ] Tests pass locally
- [ ] `pnpm test:packages:run` succeeds
- [ ] Manual testing completed

**Documentation**:
- [ ] CHANGELOG.md updated (REQUIRED!)
- [ ] README/docs updated
- [ ] JSDoc comments added
- [ ] Type definitions correct

**Dependencies**:
- [ ] Dependent changes merged
- [ ] Package versions updated
- [ ] `pnpm install` and `pnpm build` work

**Monorepo-Specific**:
- [ ] All packages built
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Publishing order understood

**Repository-Specific**:
- [ ] Logical, clear commits
- [ ] Rebased on latest main
- [ ] Merge conflicts resolved
- [ ] Single logical concern

**Example**:

```markdown
## ✅ Pre-Merge Checklist

### Code Quality
- [x] My code follows the project's style guidelines (Biome)
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] My changes generate no new warnings or errors
- [x] All existing tests pass locally (`pnpm test`)

### Testing
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [x] I have run `pnpm test:packages:run` successfully
- [x] I have manually tested the changes in a realistic scenario

### Documentation
- [x] I have updated CHANGELOG.md (REQUIRED for user-facing changes)
- [x] I have updated relevant documentation (README, CLAUDE.md, etc.)
- [x] I have updated JSDoc comments for new functions/classes
- [x] Type definitions are accurate and complete (`pnpm typecheck` passes)

### Dependencies
- [x] Any dependent changes have been merged and published
- [x] I have updated package.json version if required
- [x] I have run `pnpm install` and `pnpm build` successfully

### Monorepo-Specific
- [x] I have built all packages (`pnpm build`)
- [x] I have run TypeScript type checking (`pnpm typecheck`)
- [x] I have run linting (`pnpm lint`)
- [x] If publishing, I understand the package dependency order

### Repository-Specific
- [x] My commits are logically organized and have clear messages
- [x] I have rebased on the latest main branch
- [x] I have resolved all merge conflicts
- [x] This PR addresses a single logical concern
```

**Tips**:
- Check these BEFORE requesting review
- Fix any failing items
- If an item doesn't apply, leave it unchecked and add a note
- This is your quality gate

---

### 9. Deployment Considerations Section

**Purpose**: Think through production implications.

**What to Include**:
- Environment testing status
- Rollback procedures
- Monitoring plan

**Example**:

```markdown
## 🚀 Deployment Considerations

### Environment Impact
- [x] Development environment tested locally
- [x] Staging environment considerations:
  - Config validation won't break existing deployments
  - OAuth flow tested with test Linear instance
- [x] Production rollout:
  - Feature is opt-in, no forced changes
  - Existing users unaffected

### Rollback Plan
If issues arise:
1. Users can remove `oauthProvider` config section
2. Falls back to default proxy behavior immediately
3. No data loss or corruption possible
4. Revert to previous CLI version if needed: `npm install -g cyrus-ai@0.1.57`

### Monitoring
**Success Metrics**:
- New OAuth flows complete successfully
- No increase in authentication errors
- Custom OAuth users successfully connect

**What to Watch**:
- Error logs for OAuth provider configuration issues
- Authentication failure rates
- User feedback on self-hosted Linear support
```

**Tips**:
- Think about production users
- Plan for the worst case
- Document monitoring approach
- Make rollback easy

---

### 10. Additional Context Section

**Purpose**: Provide extra information that doesn't fit elsewhere.

**What to Include**:
- Links to design docs
- Performance benchmarks
- Security considerations
- Related PRs
- Known limitations

**Example**:

```markdown
## 🔗 Additional Context

### Related PRs
- #234 - Original feature request issue
- #189 - Related discussion about OAuth customization
- ceedaragents/docs#12 - Documentation update for self-hosted Linear

### Design Documents
- [OAuth Provider RFC](https://github.com/ceedaragents/rfcs/blob/main/oauth-provider.md)
- [Linear API OAuth Documentation](https://developers.linear.app/docs/oauth)

### Performance Considerations
- No performance impact - OAuth flow only runs once at startup
- Config validation adds ~5ms to startup time
- Token refresh maintains same performance characteristics

### Known Limitations
- Custom OAuth only supports HTTP(S) protocols
- Certificate validation required (no self-signed certs)
- Refresh token rotation must be supported by OAuth provider

### Security Notes
- Client secrets stored in user's `~/.cyrus/config.json`
- Recommend file permissions: `chmod 600 ~/.cyrus/config.json`
- Tokens never logged or exposed in error messages
- OAuth state parameter prevents CSRF attacks

### Future Improvements
- Add support for OAuth device flow (#245)
- Support for multiple OAuth providers per repo (#246)
- OAuth provider templates for common setups (#247)
```

**Tips**:
- Link liberally - context is valuable
- Document known issues
- Note future improvement ideas
- Consider security implications

---

### 11. Reviewer Notes Section

**Purpose**: Help reviewers focus their attention.

**What to Include**:
- Specific areas needing careful review
- Questions for reviewers
- Trade-offs made
- Uncertainty areas

**Example**:

```markdown
## 👥 Reviewer Notes

### Review Focus Areas

1. **OAuth Provider Interface** (`packages/core/src/oauth/OAuthProvider.ts`)
   - Is the interface flexible enough for future OAuth providers?
   - Should we support PKCE (Proof Key for Code Exchange)?

2. **Config Validation** (`packages/edge-worker/src/config/validator.ts`)
   - Are the error messages clear enough for users?
   - Should we validate OAuth URLs more strictly?

3. **Backward Compatibility** (all files)
   - Confirmed existing users won't be affected?
   - Default behavior unchanged?

4. **Error Handling** (`packages/edge-worker/src/oauth/flow.ts`)
   - Edge cases properly handled?
   - User-friendly error messages?

### Questions for Reviewers

1. **Should we add OAuth provider templates?**
   Pre-configured templates for popular self-hosted Linear setups?

2. **Config location security**:
   Is storing client secrets in `config.json` acceptable, or should we 
   use OS keychain/credential manager?

3. **Documentation placement**:
   Should OAuth provider docs go in README.md or separate OAUTH.md file?

4. **Testing coverage**:
   Do we need integration tests against a mock OAuth server, or are 
   unit tests sufficient?

### Trade-offs Made

**Decision**: Store OAuth config in `config.json` rather than separate file
- **Pro**: Single config file, simpler for users
- **Con**: Client secret in plain text file
- **Rationale**: Consistency with existing config; users can use env vars 
  for secrets if needed

**Decision**: Synchronous config validation at startup
- **Pro**: Fail fast with clear errors
- **Con**: Adds ~5ms to startup
- **Rationale**: Better UX to catch config errors immediately
```

**Tips**:
- Be specific about what needs review
- Ask questions if uncertain
- Explain trade-offs transparently
- Make reviewers' job easier

---

### 12. Security Considerations Section

**Purpose**: Identify and address security implications.

**What to Check**:
- Authentication/authorization
- Input validation
- Sensitive data handling
- Injection vulnerabilities
- Rate limiting

**Example**:

```markdown
## 🔐 Security Considerations

- [x] This PR does not introduce security vulnerabilities
- [x] I have considered authentication/authorization implications:
  - OAuth flow follows RFC 6749 specification
  - State parameter prevents CSRF attacks
  - Tokens are validated before use
- [x] I have reviewed for injection vulnerabilities:
  - OAuth URLs are validated and sanitized
  - No direct SQL/command injection possible
- [x] Sensitive data is properly handled:
  - Client secrets only stored in config file
  - Tokens never logged or exposed in errors
  - Recommend file permissions documented
- [x] I have considered rate limiting:
  - OAuth flow inherits Linear's rate limits
  - Token refresh uses exponential backoff

### Security Improvements
- Added validation for OAuth URLs (prevents malicious redirects)
- Client secrets marked as sensitive in logs
- OAuth state parameter prevents CSRF attacks

### Security Documentation
- Documented recommended file permissions: `chmod 600 ~/.cyrus/config.json`
- Added warning about storing secrets in plain text
- Recommended using environment variables for CI/CD
```

**Tips**:
- Think like an attacker
- Review OWASP Top 10
- Document security considerations
- Ask for security review if unsure

---

## Best Practices

### Writing Great PR Descriptions

#### 1. **Be Clear and Specific**

❌ Bad:
```markdown
## Summary
Fixed bug
```

✅ Good:
```markdown
## Summary
Fixed memory leak in EdgeWorker that caused Cyrus to crash after processing 
100+ Linear issues. The issue was caused by unclosed database connections in 
the session manager.
```

#### 2. **Provide Context**

Always explain WHY, not just WHAT:

❌ Bad:
```markdown
Changed timeout from 30s to 60s
```

✅ Good:
```markdown
Increased Claude Code session timeout from 30s to 60s because users with 
large repositories were experiencing timeout errors during initial model loading. 
Analyzed 50+ user reports and found 60s covers 95% of cases.
```

#### 3. **Link to Related Issues**

Use GitHub's linking syntax:

```markdown
### Related Issues
- Fixes #234 (closes the issue when PR merges)
- Relates to #189 (references without closing)
- Closes #456, #457 (closes multiple issues)
```

#### 4. **Show Your Work**

Include test output, benchmarks, before/after comparisons:

```markdown
### Performance Impact

Before: 45s to process 10 issues
After: 12s to process 10 issues

\`\`\`bash
$ time cyrus --process-batch
real    0m12.340s
user    0m8.123s
sys     0m1.234s
\`\`\`
```

#### 5. **Think About Future You**

Write for someone reading this 6 months from now:
- Why did we make this change?
- What alternatives did we consider?
- What was the context/situation?
- What trade-offs did we accept?

#### 6. **Use Visuals**

Screenshots, diagrams, and code examples are worth 1000 words:

```markdown
### Architecture Change

Before:
\`\`\`
EdgeWorker → Claude → Linear
     ↑                    ↓
     └────────────────────┘
\`\`\`

After:
\`\`\`
EdgeWorker → Session Manager → Claude → Linear
     ↑             ↓                      ↓
     └─────────────┴──────────────────────┘
\`\`\`
```

---

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples**:

```
feat(oauth): add custom OAuth provider support

Implements configurable OAuth providers to support self-hosted Linear 
instances. Users can specify custom authorization URLs, token endpoints, 
and client credentials in config.json.

Fixes #234
```

```
fix(edge-worker): resolve memory leak in session manager

Closes database connections properly after each session to prevent 
memory leak that caused crashes after processing 100+ issues.

Fixes #267
```

---

### Responding to Review Feedback

#### 1. **Be Responsive**

- Respond within 24-48 hours
- Acknowledge all comments, even if just "will fix"
- Ask for clarification if needed

#### 2. **Address All Feedback**

- Fix requested changes
- Reply to each comment when done
- Mark conversations as resolved

#### 3. **Re-request Review**

After making changes:
1. Reply to comments: "Fixed in commit abc123"
2. Click "Re-request review" button
3. Add comment summarizing changes made

#### 4. **Be Open to Discussion**

- Don't take feedback personally
- Explain your reasoning
- Be willing to compromise
- Learn from every review

#### 5. **Say Thank You**

Code review takes time and effort:

```markdown
Thanks for the thorough review @reviewer! I've addressed all the feedback:

- Fixed the memory leak by closing connections
- Added tests for edge cases
- Updated documentation as suggested
- Refactored the OAuth flow for clarity

Ready for another look when you have time!
```

---

### Common Patterns

#### Feature Addition PR

```markdown
## 📋 Summary
Adds support for [feature] to enable [user benefit].

### Related Issues
- Fixes #123

### Type of Change
- [x] ✨ New feature

## 📝 Description & Motivation
[Detailed explanation of feature and why it's needed]

## 🧪 Testing & Validation
- [x] Unit tests added
- [x] Integration tests added
- [x] Manual testing completed

[Test output]

## 📜 CHANGELOG Update
- [x] Updated CHANGELOG.md

\`\`\`markdown
### Added
- **[Feature name]**: [User-facing description]
\`\`\`
```

#### Bug Fix PR

```markdown
## 📋 Summary
Fixes [bug] that caused [problem].

### Related Issues
- Fixes #456

### Type of Change
- [x] 🐛 Bug fix

## 📝 Description & Motivation
**The Bug**: [What was wrong]
**Root Cause**: [Why it happened]
**The Fix**: [How we fixed it]

## 🧪 Testing & Validation
- [x] Regression test added
- [x] Bug no longer reproduces

[Test output showing fix works]

## 📜 CHANGELOG Update
- [x] Updated CHANGELOG.md

\`\`\`markdown
### Fixed
- **[Bug description]**: [What we fixed]
\`\`\`
```

#### Documentation PR

```markdown
## 📋 Summary
Updates documentation for [topic].

### Type of Change
- [x] 📚 Documentation update

## 📝 Description & Motivation
Improves documentation to:
- Clarify [X]
- Add examples for [Y]
- Fix outdated information about [Z]

## ✅ Pre-Merge Checklist
- [x] Spelling and grammar checked
- [x] Links verified
- [x] Code examples tested
- [x] Screenshots updated
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Incomplete PR Descriptions

```markdown
## Summary
Fixed bug

## Description
See title
```

**Why it's bad**: No context, no details, reviewer has to guess

**How to fix**: Explain what bug, how you fixed it, why, and how you tested it

---

### ❌ Mistake 2: Forgetting CHANGELOG.md

```markdown
## CHANGELOG Update
- [ ] I have updated CHANGELOG.md
```

**Why it's bad**: Changes won't be communicated to users, required for all user-facing changes

**How to fix**: Update CHANGELOG.md under `## [Unreleased]` section BEFORE creating PR

---

### ❌ Mistake 3: Multiple Unrelated Changes

```markdown
## Summary
- Added OAuth support
- Fixed memory leak
- Updated dependencies
- Refactored session manager
- Added new CLI commands
```

**Why it's bad**: Hard to review, hard to revert if needed, mixes concerns

**How to fix**: Create separate PRs for each logical change

---

### ❌ Mistake 4: No Tests

```markdown
## Testing
- [x] Manual testing completed
- [ ] Unit tests added
```

**Why it's bad**: No automated verification, regression risk

**How to fix**: Add unit tests for new code, integration tests for features

---

### ❌ Mistake 5: Vague Commit Messages

```bash
git commit -m "updates"
git commit -m "fix"
git commit -m "wip"
```

**Why it's bad**: No context in git history, hard to understand changes later

**How to fix**: Use conventional commits with clear descriptions

---

### ❌ Mistake 6: Not Testing the PR Template

```markdown
## Summary
[Brief description]

## Description
<!-- Explain your changes -->
```

**Why it's bad**: You left the template placeholders in!

**How to fix**: Remove template comments and fill in actual content

---

### ❌ Mistake 7: Too Technical in CHANGELOG

```markdown
### Changed
- Refactored OAuthProvider interface to use dependency injection pattern
- Implemented Strategy pattern for OAuth flow
- Updated EdgeWorker to use factory pattern for session creation
```

**Why it's bad**: End users don't care about implementation details

**How to fix**: Write from user perspective:
```markdown
### Changed
- **OAuth configuration**: OAuth providers can now be customized using the 
  `oauthProvider` field in config.json, enabling support for self-hosted Linear
```

---

### ❌ Mistake 8: No Error Handling Discussion

```markdown
## Description
Added new feature that calls external API

[No mention of error handling]
```

**Why it's bad**: External calls can fail - what happens?

**How to fix**: Document error handling:
```markdown
### Error Handling
- Network failures: Exponential backoff with 3 retries
- Invalid responses: Clear error message with troubleshooting steps
- Timeout: Fails gracefully, logs error, continues with next item
```

---

### ❌ Mistake 9: Breaking Changes Without Migration Guide

```markdown
### Type of Change
- [x] 💥 Breaking change

## Description
Changed config format

[No migration instructions]
```

**Why it's bad**: Users' configs will break, no way to fix

**How to fix**: Provide migration steps:
```markdown
## Migration Steps
Old format:
\`\`\`json
{
  "oauth": "proxy"
}
\`\`\`

New format:
\`\`\`json
{
  "oauthProvider": {
    "type": "proxy"
  }
}
\`\`\`

Users should update their config.json before upgrading to v0.2.0
```

---

### ❌ Mistake 10: No Reviewer Guidance

```markdown
## Reviewer Notes
[Empty]
```

**Why it's bad**: Reviewer doesn't know what you need feedback on

**How to fix**: Guide the review:
```markdown
## Reviewer Notes
### Focus Areas
1. OAuth flow logic in `OAuthProvider.ts` - is the error handling robust?
2. Config validation in `validator.ts` - are error messages clear?
3. Backward compatibility - did I miss any edge cases?

### Questions
- Should we add rate limiting to the OAuth flow?
- Is the config structure intuitive enough?
```

---

## Examples

### Example 1: Feature Addition PR

```markdown
# Pull Request

## 📋 Summary

This PR adds support for multiple Linear workspaces per repository. Users can 
now configure Cyrus to monitor issues across different Linear workspaces and 
route them to the same git repository based on team or label filters.

### Related Issue(s)
- Fixes #189
- Relates to #234

### Type of Change
- [x] ✨ New feature (non-breaking change which adds functionality)

---

## 📝 Description & Motivation

### The Problem
Currently, Cyrus only supports one Linear workspace per repository. Many teams 
use multiple workspaces (e.g., separate workspaces for different clients or 
product lines) but want all work to flow into a single codebase.

### The Solution
This PR allows users to configure multiple `repositories` entries with different 
`linearToken` values but the same `repositoryPath`. Each workspace connection 
runs independently and can have its own routing rules (teams, labels, projects).

### Technical Details
**Architecture Changes**:
- Modified `EdgeWorker` to support multiple Linear clients per repository
- Added workspace ID tracking to session manager
- Updated issue routing to consider workspace context
- Maintained backward compatibility with single-workspace configs

**Key Files**:
- `packages/edge-worker/src/EdgeWorker.ts`: Multi-workspace management
- `packages/core/src/session/SessionManager.ts`: Workspace-aware sessions
- `apps/cli/services/LinearIssueService.mjs`: Workspace routing

### User Impact
Users can now configure multiple workspaces like this:

\`\`\`json
{
  "repositories": [
    {
      "id": "workspace-1",
      "name": "Client A",
      "linearToken": "lin_api_xxx",
      "repositoryPath": "/path/to/repo",
      "teamKeys": ["CLIENT-A"]
    },
    {
      "id": "workspace-2",
      "name": "Client B",
      "linearToken": "lin_api_yyy",
      "repositoryPath": "/path/to/repo",
      "teamKeys": ["CLIENT-B"]
    }
  ]
}
\`\`\`

---

## 🧪 Testing & Validation

### Test Coverage
- [x] Unit tests for multi-workspace routing
- [x] Integration tests with multiple Linear clients
- [x] Manual testing with 2 real workspaces
- [x] Test coverage maintained at 86%

### Test Results

<details>
<summary>Test Output</summary>

\`\`\`bash
$ pnpm test:packages:run

 ✓ packages/edge-worker/src/__tests__/multi-workspace.test.ts (15)
   ✓ Multi-workspace support
     ✓ initializes multiple Linear clients
     ✓ routes issues to correct workspace
     ✓ handles workspace disconnection
     ✓ maintains separate session contexts
     
 ✓ packages/core/src/session/__tests__/SessionManager.test.ts (8)
   ✓ Workspace-aware session management
     ✓ creates sessions with workspace context
     ✓ isolates sessions between workspaces
     
Test Files  26 passed (26)
     Tests  198 passed (198)
  Duration  14.52s
\`\`\`

</details>

### Manual Testing Steps

Tested with two real Linear workspaces:

1. Created two separate Linear workspaces:
   - Workspace A: "Test Company A"
   - Workspace B: "Test Company B"

2. Generated API tokens for each workspace

3. Configured `~/.cyrus/config.json`:
   \`\`\`json
   {
     "repositories": [
       {
         "id": "workspace-a-123",
         "name": "Company A",
         "linearToken": "lin_api_...",
         "repositoryPath": "/Users/test/shared-repo",
         "teamKeys": ["TEAM-A"]
       },
       {
         "id": "workspace-b-456",
         "name": "Company B",
         "linearToken": "lin_api_...",
         "repositoryPath": "/Users/test/shared-repo",
         "teamKeys": ["TEAM-B"]
       }
     ]
   }
   \`\`\`

4. Started Cyrus: `cyrus`

5. Created test issues:
   - Workspace A, Team TEAM-A: Issue A-1
   - Workspace B, Team TEAM-B: Issue B-1

6. Verified both issues were picked up and processed correctly

7. Confirmed git worktrees were created with workspace-specific naming:
   - `cyrus-A-1-workspace-a-123`
   - `cyrus-B-1-workspace-b-456`

**Expected**: Both issues processed, sessions isolated, no conflicts
**Actual**: ✅ Works perfectly

**Edge Cases Tested**:
- ✅ One workspace offline → Other continues working
- ✅ Same issue number in different workspaces → Properly isolated
- ✅ Rapid switching between workspaces → No race conditions
- ✅ Invalid token in one workspace → Clear error, others unaffected

---

## 📦 Package Impact

### Affected Packages
- [x] `packages/core` - Added workspace context to types
- [x] `packages/edge-worker` - Multi-workspace management
- [x] `packages/ndjson-client` - Workspace-specific webhook routing
- [x] `apps/cli` - Updated config schema and routing

### Package Publishing
- [x] This PR requires package publishing
- [x] Publishing order documented (CLAUDE.md#publishing):
  1. `packages/core` (0.0.21)
  2. `packages/ndjson-client` (0.0.25)
  3. `packages/edge-worker` (0.0.41)
  4. `apps/cli` (0.1.59)
- [ ] No breaking changes to existing configs

---

## 📸 Screenshots / Demo

### CLI Output - Multiple Workspaces

\`\`\`bash
$ cyrus
✓ Loading configuration from /Users/user/.cyrus/config.json
✓ Detected 2 workspace configurations for repository: /path/to/repo

Workspace 1: Company A
  - Linear workspace: Test Company A
  - Repository: /path/to/repo
  - Teams: TEAM-A
  - Status: ✓ Connected

Workspace 2: Company B
  - Linear workspace: Test Company B  
  - Repository: /path/to/repo
  - Teams: TEAM-B
  - Status: ✓ Connected

✓ Monitoring 2 workspaces, 5 repositories total
✓ Watching for issues assigned to Cyrus...
\`\`\`

### Git Worktree Structure

\`\`\`bash
$ git worktree list
/path/to/repo/cyrus-A-123-workspace-a     [cyrus-A-123]
/path/to/repo/cyrus-B-456-workspace-b     [cyrus-B-456]
\`\`\`

---

## 📜 CHANGELOG Update

### Changelog Status
- [x] **I have updated CHANGELOG.md under `## [Unreleased]` section**
- [x] Changes are written from end-user perspective
- [x] Changes are categorized under `### Added`
- [x] Changes avoid technical implementation details
- [x] Changes are concise but descriptive

### Changelog Entry Preview

\`\`\`markdown
### Added
- **Multiple Linear workspaces per repository**: You can now configure Cyrus to 
  monitor issues from multiple Linear workspaces and route them to the same git 
  repository. Each workspace can have its own team, label, and project routing 
  rules. Configure multiple `repositories` entries with different `linearToken` 
  values but the same `repositoryPath` in your `~/.cyrus/config.json`. This is 
  useful for teams managing multiple clients or product lines in a single codebase.
\`\`\`

---

## 🔄 Changes to Existing Functionality

### Migration Steps

**For single-workspace users**: No changes required. Your existing configuration 
works exactly as before.

**For multi-workspace users**:
1. Update to Cyrus v0.1.59 or later
2. Add additional repository entries to config.json with different `linearToken` values:
   \`\`\`json
   {
     "repositories": [
       {
         "id": "workspace-1",
         "linearToken": "lin_api_first_workspace",
         "repositoryPath": "/path/to/repo"
       },
       {
         "id": "workspace-2",
         "linearToken": "lin_api_second_workspace",
         "repositoryPath": "/path/to/repo"
       }
     ]
   }
   \`\`\`
3. Restart Cyrus
4. Verify both workspaces connect successfully

- [x] Fully backward compatible
- [x] No migration steps for existing users
- [x] New feature is opt-in

### Deployment Notes
- No special deployment steps required
- Existing single-workspace configs continue to work unchanged
- New multi-workspace configs are validated at startup
- Clear error messages if workspace tokens are invalid

---

## ✅ Pre-Merge Checklist

### Code Quality
- [x] My code follows the project's style guidelines (Biome)
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] My changes generate no new warnings or errors
- [x] All existing tests pass locally (`pnpm test`)

### Testing
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [x] I have run `pnpm test:packages:run` successfully
- [x] I have manually tested the changes in a realistic scenario

### Documentation
- [x] I have updated CHANGELOG.md (REQUIRED for user-facing changes)
- [x] I have updated relevant documentation (README.md updated with multi-workspace example)
- [x] I have updated JSDoc comments for new functions/classes
- [x] Type definitions are accurate and complete (`pnpm typecheck` passes)

### Dependencies
- [x] Any dependent changes have been merged and published
- [x] I have updated package.json versions
- [x] I have run `pnpm install` and `pnpm build` successfully

### Monorepo-Specific
- [x] I have built all packages (`pnpm build`)
- [x] I have run TypeScript type checking (`pnpm typecheck`)
- [x] I have run linting (`pnpm lint`)
- [x] If publishing, I understand the package dependency order

### Repository-Specific
- [x] My commits are logically organized and have clear messages
- [x] I have rebased on the latest main branch
- [x] I have resolved all merge conflicts
- [x] This PR addresses a single logical concern

---

## 🚀 Deployment Considerations

### Environment Impact
- [x] Development environment tested with real workspaces
- [x] Staging environment: Tested with 3 different workspace combinations
- [x] Production: Feature is opt-in, existing users unaffected

### Rollback Plan
If issues arise:
1. Users can remove additional workspace entries from config.json
2. Falls back to single-workspace behavior immediately
3. No data loss possible (workspaces are isolated)
4. Revert to previous version: `npm install -g cyrus-ai@0.1.58`

### Monitoring

**Success Metrics**:
- Multiple workspaces connect successfully
- Issues routed to correct workspaces
- No cross-workspace session conflicts

**What to Watch**:
- Workspace connection failures
- Session isolation issues
- Performance with >2 workspaces
- Git worktree conflicts

---

## 🔗 Additional Context

### Related PRs
- #189 - Original feature request
- #234 - Discussion on multi-tenant support

### Design Documents
- [Multi-Workspace Design Doc](https://github.com/ceedaragents/rfcs/blob/main/multi-workspace.md)
- [Session Isolation Strategy](https://github.com/ceedaragents/rfcs/blob/main/session-isolation.md)

### Performance Considerations
- Tested with 5 workspaces: No performance degradation
- Each workspace connection uses ~10MB memory
- Webhook handling scales linearly with workspace count
- Recommended limit: 10 workspaces per Cyrus instance

### Known Limitations
- All workspaces for a repository must use the same base branch
- Workspace connections are independent (no shared state)
- Each workspace counts toward Linear API rate limits separately

### Future Improvements
- [ ] Workspace templates for easier configuration (#267)
- [ ] Dashboard showing all workspace statuses (#268)
- [ ] Automatic workspace discovery from org (#269)

---

## 👥 Reviewer Notes

### Review Focus Areas

1. **Multi-workspace routing** (`packages/edge-worker/src/routing/workspace.ts`)
   - Is the routing logic clear and maintainable?
   - Are edge cases properly handled?

2. **Session isolation** (`packages/core/src/session/SessionManager.ts`)
   - Do sessions properly isolate between workspaces?
   - Can sessions from different workspaces share state accidentally?

3. **Configuration schema** (`apps/cli/config/schema.json`)
   - Is the config structure intuitive?
   - Are validation error messages helpful?

4. **Backward compatibility** (all files)
   - Existing single-workspace configs still work?
   - Did I break anything?

### Questions for Reviewers

1. **Should we limit the number of workspaces?**
   Currently unlimited, but might want to add a soft limit (10?) with warning.

2. **Workspace naming convention**:
   Currently using `workspace-{id}` in git worktree names. Better approach?

3. **Documentation placement**:
   Should multi-workspace docs go in README or separate MULTI_WORKSPACE.md?

4. **Performance testing**:
   Tested with 5 workspaces. Should we test with 20+ for stress testing?

### Trade-offs Made

**Decision**: Store all workspace configs in single config.json
- **Pro**: Single source of truth, easier to manage
- **Con**: Large config file for many workspaces
- **Rationale**: Simplicity for 90% of users (2-5 workspaces)

**Decision**: Independent workspace connections (no shared state)
- **Pro**: Isolation prevents bugs, easy to understand
- **Con**: More memory usage, can't share webhooks
- **Rationale**: Reliability > efficiency for this feature

---

## 🔐 Security Considerations

- [x] This PR does not introduce security vulnerabilities
- [x] I have considered authentication/authorization implications:
  - Each workspace uses separate API tokens
  - Tokens are validated independently
  - Workspace isolation prevents token leakage
- [x] I have reviewed for injection vulnerabilities:
  - Workspace IDs are validated and sanitized
  - No SQL injection possible (no DB access)
- [x] Sensitive data is properly handled:
  - Each token stored separately in config
  - Tokens never logged or exposed in errors
  - Recommend `chmod 600 ~/.cyrus/config.json`
- [x] I have considered rate limiting:
  - Each workspace counts toward Linear API limits separately
  - Documented recommended workspace limit

### Security Notes
- Workspace tokens are isolated - leak in one doesn't affect others
- Config file should have restricted permissions
- Each workspace validates its own token independently
- Clear error messages don't expose token values

---

<!-- 
Thank you for contributing to Cyrus! 🎉

Remember to:
- Update CHANGELOG.md before requesting review
- Test with realistic scenarios
- Be responsive to review feedback
- Ask questions if anything is unclear
-->
```

---

### Example 2: Bug Fix PR

```markdown
# Pull Request

## 📋 Summary

Fixes memory leak in EdgeWorker that caused Cyrus to crash after processing 
100+ issues. The leak was caused by unclosed database connections in the 
SessionManager that accumulated over time.

### Related Issue(s)
- Fixes #267
- Relates to #234 (performance investigation)

### Type of Change
- [x] 🐛 Bug fix (non-breaking change which fixes an issue)

---

## 📝 Description & Motivation

### The Bug
Users reported Cyrus crashing with OOM (Out Of Memory) errors after processing 
approximately 100 Linear issues. Memory usage would steadily increase from 
~50MB to >2GB over several hours of operation.

### Root Cause Analysis

**Investigation Steps**:
1. Profiled memory usage with heap snapshots
2. Identified SessionManager holding references to closed sessions
3. Found database connections weren't being released
4. Traced to missing cleanup in session completion handler

**Root Cause**:
The `SessionManager.completeSession()` method was:
1. Closing the Claude Code session ✓
2. Removing session from active sessions map ✓
3. **NOT** closing the database connection ✗

After 100+ sessions, we had 100+ orphaned database connections consuming memory.

### The Fix

**Changes Made**:
1. Added `cleanup()` method to `Session` class
2. Modified `SessionManager.completeSession()` to call `session.cleanup()`
3. Added database connection tracking and cleanup
4. Implemented connection pooling with max connection limit

**Files Modified**:
- `packages/core/src/session/Session.ts`: Added cleanup method
- `packages/core/src/session/SessionManager.ts`: Call cleanup on completion
- `packages/core/src/db/ConnectionPool.ts`: Add connection limit

---

## 🧪 Testing & Validation

### Test Coverage
- [x] Regression test added to reproduce leak
- [x] Unit tests for cleanup logic
- [x] Load test with 200+ sessions
- [x] Memory profiling confirmed fix

### Test Results

<details>
<summary>Test Output</summary>

\`\`\`bash
$ pnpm test:packages:run

 ✓ packages/core/src/session/__tests__/Session.test.ts (12)
   ✓ Session cleanup
     ✓ calls cleanup on completion
     ✓ closes database connection
     ✓ releases resources
     
 ✓ packages/core/src/session/__tests__/memory-leak.test.ts (5)
   ✓ Memory leak regression
     ✓ processes 200 sessions without leak
     ✓ memory usage stays under 100MB
     ✓ connections are properly closed
     
Test Files  28 passed (28)
     Tests  205 passed (205)
  Duration  18.73s
\`\`\`

</details>

### Memory Profiling

**Before Fix**:
\`\`\`
Sessions processed: 100
Memory usage: 2.1GB
Active DB connections: 103
Status: ❌ CRASH (OOM)
\`\`\`

**After Fix**:
\`\`\`
Sessions processed: 250
Memory usage: 78MB
Active DB connections: 5 (pooled)
Status: ✅ Stable
\`\`\`

### Manual Testing Steps

Long-running test:
1. Started Cyrus with memory profiling: `node --inspect cyrus`
2. Connected Chrome DevTools memory profiler
3. Created 200 test issues in Linear
4. Monitored memory usage for 3 hours
5. Took heap snapshots every 30 minutes

**Results**:
- Memory usage: Stable at ~70MB
- No increase over time
- All connections properly closed
- No crashes

---

## 📦 Package Impact

### Affected Packages
- [x] `packages/core` - Session cleanup logic
- [ ] `packages/edge-worker` - No changes
- [ ] `apps/cli` - No changes

### Package Publishing
- [x] This PR requires package publishing
- [x] Publishing order:
  1. `packages/core` (0.0.22)
  2. `apps/cli` (0.1.60) - to pick up fixed core
- [ ] No breaking changes

---

## 📜 CHANGELOG Update

### Changelog Status
- [x] **I have updated CHANGELOG.md under `## [Unreleased]` section**
- [x] Changes are written from end-user perspective
- [x] Changes are categorized under `### Fixed`
- [x] Changes avoid technical implementation details
- [x] Changes are concise but descriptive

### Changelog Entry Preview

\`\`\`markdown
### Fixed
- **Memory leak causing crashes**: Fixed critical memory leak in session management 
  that caused Cyrus to crash with out-of-memory errors after processing 100+ Linear 
  issues. Cyrus now properly releases resources after each session, maintaining 
  stable memory usage even with hundreds of processed issues.
\`\`\`

---

## ✅ Pre-Merge Checklist

### Code Quality
- [x] My code follows the project's style guidelines (Biome)
- [x] I have performed a self-review of my code
- [x] I have commented cleanup logic clearly
- [x] My changes generate no new warnings or errors
- [x] All existing tests pass locally (`pnpm test`)

### Testing
- [x] I have added regression test to prevent future leaks
- [x] Memory profiling confirms fix works
- [x] Load tested with 250+ sessions
- [x] Long-running test (3 hours) shows stable memory

### Documentation
- [x] I have updated CHANGELOG.md
- [x] Added JSDoc comments to cleanup methods
- [x] Type definitions updated (`pnpm typecheck` passes)

### Dependencies
- [x] No dependency changes
- [x] `pnpm install` and `pnpm build` successful

### Monorepo-Specific
- [x] All packages built successfully
- [x] Type checking passes
- [x] Linting passes

### Repository-Specific
- [x] Clear commit messages
- [x] Rebased on latest main
- [x] No merge conflicts
- [x] Single concern: Fix memory leak

---

## 🚀 Deployment Considerations

### Environment Impact
- [x] Fix is backward compatible
- [x] No configuration changes needed
- [x] Users should see immediate stability improvement

### Rollback Plan
Unlikely to need rollback (bug fix), but if issues:
1. Revert to previous version: `npm install -g cyrus-ai@0.1.59`
2. No data loss possible
3. Memory leak will return but no other side effects

### Monitoring

**Success Metrics**:
- No more OOM crashes
- Memory usage stays under 100MB
- Stable operation for 24+ hours

**What to Watch**:
- Memory usage over time
- Number of active database connections
- Crash reports (should be zero)
- User feedback on stability

---

## 🔗 Additional Context

### Related Issues
- #267 - Original crash report
- #234 - Performance investigation that led to discovery
- #156 - Similar issue from 3 months ago (different cause)

### Performance Benchmarks

**Stress Test Results**:
| Sessions | Before (MB) | After (MB) | Improvement |
|----------|-------------|------------|-------------|
| 10       | 120         | 65         | 46% |
| 50       | 580         | 70         | 88% |
| 100      | 1400        | 75         | 95% |
| 200      | CRASH       | 78         | ✅ |

### References
- [Node.js Memory Profiling Guide](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Database Connection Pooling Best Practices](https://www.postgresql.org/docs/current/connection-pooling.html)

---

## 👥 Reviewer Notes

### Review Focus Areas

1. **Session cleanup logic** (`packages/core/src/session/Session.ts`)
   - Is cleanup comprehensive?
   - Are there other resources we're not releasing?

2. **Connection pooling** (`packages/core/src/db/ConnectionPool.ts`)
   - Is max connection limit appropriate (currently 10)?
   - Should we make it configurable?

3. **Error handling** (all cleanup paths)
   - What if cleanup() throws an error?
   - Are we catching and logging properly?

### Questions for Reviewers

1. **Should we add telemetry for connection pool usage?**
   Might help catch similar issues in the future.

2. **Max connection limit**:
   Currently set to 10. Is this too conservative?

3. **Cleanup timeout**:
   Should we add a timeout for cleanup operations?

---

## 🔐 Security Considerations

- [x] This PR does not introduce security vulnerabilities
- [x] Connection cleanup doesn't expose sensitive data
- [x] No new external dependencies
- [x] Follows Node.js best practices for resource management

---

<!-- Bug fix PRs are highest priority - thank you for making Cyrus more stable! -->
```

---

## Enforcement and Automation

### Automated Validation

You can use GitHub Actions to enforce PR template requirements. Create `.github/workflows/pr-validation.yml`:

```yaml
name: PR Template Validation

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR Template Compliance
        uses: actions/github-script@v6
        with:
          script: |
            const prBody = context.payload.pull_request.body || '';
            
            // Check for required sections
            const requiredSections = [
              '## 📋 Summary',
              '## 📝 Description & Motivation',
              '## 🧪 Testing & Validation',
              '## 📜 CHANGELOG Update',
              '## ✅ Pre-Merge Checklist'
            ];
            
            const missingSections = requiredSections.filter(
              section => !prBody.includes(section)
            );
            
            if (missingSections.length > 0) {
              core.setFailed(
                `PR is missing required sections: ${missingSections.join(', ')}`
              );
              return;
            }
            
            // Check CHANGELOG checkbox
            if (!prBody.includes('[x] **I have updated CHANGELOG.md')) {
              core.setFailed(
                'CHANGELOG.md must be updated for all user-facing changes!'
              );
              return;
            }
            
            // Check for template placeholders
            const placeholders = [
              '<!-- ',
              '[Brief description]',
              '[Describe your changes]'
            ];
            
            const hasPlaceholders = placeholders.some(p => prBody.includes(p));
            if (hasPlaceholders) {
              core.setFailed(
                'PR description contains unfilled template placeholders'
              );
              return;
            }
            
            core.info('✅ PR template validation passed!');

      - name: Check CHANGELOG.md
        uses: actions/github-script@v6
        with:
          script: |
            const { data: files } = await github.rest.pulls.listFiles({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.payload.pull_request.number
            });
            
            const changelogModified = files.some(
              file => file.filename === 'CHANGELOG.md'
            );
            
            // Skip check for docs-only changes
            const onlyDocs = files.every(
              file => file.filename.endsWith('.md') || 
                      file.filename.startsWith('docs/')
            );
            
            if (!changelogModified && !onlyDocs) {
              core.setFailed(
                '⚠️  CHANGELOG.md was not updated! This is required for all user-facing changes.'
              );
            }
```

### PR Size Checks

Add to the same workflow:

```yaml
      - name: Check PR Size
        uses: actions/github-script@v6
        with:
          script: |
            const { data: pr } = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.payload.pull_request.number
            });
            
            const additions = pr.additions;
            const deletions = pr.deletions;
            const totalChanges = additions + deletions;
            
            if (totalChanges > 1000) {
              core.warning(
                `⚠️  This PR is quite large (${totalChanges} lines changed). ` +
                `Consider breaking it into smaller PRs for easier review.`
              );
            }
```

### Labeling Based on PR Content

```yaml
      - name: Auto-label PR
        uses: actions/github-script@v6
        with:
          script: |
            const prBody = context.payload.pull_request.body || '';
            const labels = [];
            
            // Detect PR type from checkboxes
            if (prBody.includes('[x] 🐛 Bug fix')) {
              labels.push('bug');
            }
            if (prBody.includes('[x] ✨ New feature')) {
              labels.push('enhancement');
            }
            if (prBody.includes('[x] 📚 Documentation')) {
              labels.push('documentation');
            }
            if (prBody.includes('[x] 💥 Breaking change')) {
              labels.push('breaking-change');
            }
            
            // Detect affected packages
            if (prBody.includes('[x] `apps/cli`')) {
              labels.push('cli');
            }
            if (prBody.includes('[x] `packages/core`')) {
              labels.push('core');
            }
            
            if (labels.length > 0) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.pull_request.number,
                labels: labels
              });
            }
```

---

## Additional Resources

### Internal Documentation
- [CLAUDE.md](../CLAUDE.md) - Project development guidelines
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](../CHANGELOG.md) - Project change history
- [BRANCHING_STRATEGY.md](../BRANCHING_STRATEGY.md) - Git workflow

### External Resources
- [GitHub PR Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)

### Tools
- [Biome](https://biomejs.dev/) - Code formatter and linter
- [Vitest](https://vitest.dev/) - Testing framework
- [pnpm](https://pnpm.io/) - Package manager
- [TypeScript](https://www.typescriptlang.org/) - Type checking

---

## Getting Help

If you have questions about the PR template or process:

1. **Check this guide** - Most questions are answered here
2. **Review example PRs** - Look at recent merged PRs for inspiration
3. **Ask in discussion** - Open a GitHub discussion with your question
4. **Reach out to maintainers** - Tag @maintainers in your PR

Remember: We're here to help! Don't hesitate to ask questions. 🤝

---

**Last Updated**: 2025-01-13  
**Maintained By**: Cyrus Core Team
