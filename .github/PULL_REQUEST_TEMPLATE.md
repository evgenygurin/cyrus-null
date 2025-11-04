# Pull Request

## 📋 Summary

<!-- 
Provide a clear, concise summary of your changes in 2-3 sentences.
This should describe WHAT you changed and WHY from the end-user perspective.

Example: "This PR adds support for custom OAuth providers by implementing a new configuration option in the EdgeWorker. This allows users to connect to self-hosted Linear instances."
-->

### Related Issue(s)

<!-- 
Link to related Linear issues, GitHub issues, or discussions.
Use the format: Fixes #123, Relates to #456
-->

- Fixes #
- Relates to #

### Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🎨 Style update (formatting, naming, etc.)
- [ ] 🧪 Test update
- [ ] 📦 Dependency update
- [ ] 🚀 Performance improvement

---

## 📝 Description & Motivation

<!-- 
Explain your changes in detail. Consider:
- What problem does this solve?
- Why is this change necessary?
- What is the impact on users?
- What alternative approaches did you consider?

Remember: You know more about this PR right now than you will in a few months.
Be generous with details!
-->

### Technical Details

<!-- 
For complex changes, explain the technical approach:
- Architecture decisions
- Implementation details
- Key files or components modified
-->

### User Impact

<!-- 
Describe how this affects users of the Cyrus CLI:
- New behavior they will experience
- Changes to existing workflows
- Migration steps (if any)
-->

---

## 🧪 Testing & Validation

<!-- 
Describe how you verified your changes work correctly.
-->

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Test coverage increased or maintained

### Test Results

<!-- 
Paste relevant test output or screenshots:
```bash
pnpm test:packages:run
✓ All tests passed
```
-->

<details>
<summary>Test Output</summary>

```
# Paste test results here
```

</details>

### Manual Testing Steps

<!-- 
Provide step-by-step instructions for reviewers to test your changes:
1. Set up environment with...
2. Run `cyrus` command with...
3. Verify that...
4. Expected result: ...
-->

---

## 📦 Package Impact

<!-- 
For monorepo changes: Which packages are affected?
Mark all that apply with an 'x'
-->

### Affected Packages

- [ ] `apps/cli` - Main CLI application
- [ ] `apps/electron` - Electron GUI (in development)
- [ ] `apps/proxy` - Edge proxy server
- [ ] `apps/web-panel` - Web monitoring panel
- [ ] `packages/core` - Shared types and session management
- [ ] `packages/claude-parser` - Claude stdout parsing
- [ ] `packages/claude-runner` - Claude CLI execution wrapper
- [ ] `packages/edge-worker` - Edge worker client
- [ ] `packages/ndjson-client` - NDJSON streaming client
- [ ] `packages/simple-agent-runner` - Simple agent runner
- [ ] Other: _______________

### Package Publishing

<!-- 
If this PR requires publishing new package versions, check the boxes:
-->

- [ ] This PR requires package publishing
- [ ] Publishing order has been documented (see CLAUDE.md#publishing)
- [ ] Package version numbers have been updated
- [ ] Breaking changes are clearly marked in package.json

---

## 📸 Screenshots / Demo

<!-- 
For UI changes, configuration updates, or new features:
- Add screenshots of before/after
- Include CLI output examples
- Show Linear integration behavior
- Include DAG visualizations (if dbt-related)
-->

### Before

<!-- Screenshot or description of current behavior -->

### After

<!-- Screenshot or description of new behavior -->

### Example Usage

<!-- 
Provide code examples or CLI commands demonstrating the new functionality:
```bash
cyrus --config custom-config.json
```
-->

---

## 📜 CHANGELOG Update

<!-- 
REQUIRED: Have you updated CHANGELOG.md?
This is mandatory for all PRs that affect end users.
-->

### Changelog Status

- [ ] **I have updated CHANGELOG.md under `## [Unreleased]` section**
- [ ] Changes are written from end-user perspective (CLI users)
- [ ] Changes are categorized under appropriate headers:
  - `### Added` - New features or capabilities
  - `### Changed` - Changes to existing functionality
  - `### Fixed` - Bug fixes
  - `### Removed` - Removed features or deprecations
  - `### Security` - Security fixes or improvements
- [ ] Changes avoid technical implementation details
- [ ] Changes are concise but descriptive

### Changelog Entry Preview

<!-- 
Copy your CHANGELOG.md entry here for easy review:

```markdown
### Added
- **Custom OAuth provider support**: Users can now configure custom OAuth providers for self-hosted Linear instances using the `oauthProvider` config option
```
-->

---

## 🔄 Changes to Existing Functionality

<!-- 
IMPORTANT: If you modified existing models, configurations, or behavior:
- Describe what changed
- List any migration steps required
- Note if full-refresh or re-deployment is needed
- Link any related BI tool PRs or configuration updates
-->

### Migration Steps

<!-- 
List steps users need to take after this PR is merged:
1. Run `pnpm install` to update dependencies
2. Update config.json to use new field names
3. Restart Cyrus daemon
-->

- [ ] No migration steps required
- [ ] Migration steps documented above
- [ ] Breaking changes communicated to team

### Deployment Notes

<!-- 
Post-merge instructions:
- Configuration updates needed
- Service restarts required
- Database migrations
- Environment variable changes
-->

---

## ✅ Pre-Merge Checklist

<!-- 
Go through this checklist before requesting review.
Put an 'x' in all boxes that apply.
This ensures you haven't missed critical steps!
-->

### Code Quality

- [ ] My code follows the project's style guidelines (Biome)
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] All existing tests pass locally (`pnpm test`)

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have run `pnpm test:packages:run` successfully
- [ ] I have manually tested the changes in a realistic scenario

### Documentation

- [ ] I have updated CHANGELOG.md (REQUIRED for user-facing changes)
- [ ] I have updated relevant documentation (README, CLAUDE.md, etc.)
- [ ] I have updated JSDoc comments for new functions/classes
- [ ] Type definitions are accurate and complete (`pnpm typecheck` passes)

### Dependencies

- [ ] Any dependent changes have been merged and published
- [ ] I have updated package.json version if required
- [ ] I have run `pnpm install` and `pnpm build` successfully

### Monorepo-Specific

- [ ] I have built all packages (`pnpm build`)
- [ ] I have run TypeScript type checking (`pnpm typecheck`)
- [ ] I have run linting (`pnpm lint`)
- [ ] If publishing, I understand the package dependency order

### Repository-Specific

- [ ] My commits are logically organized and have clear messages
- [ ] I have rebased on the latest main branch
- [ ] I have resolved all merge conflicts
- [ ] This PR addresses a single logical concern (not multiple unrelated changes)

---

## 🚀 Deployment Considerations

<!-- 
Consider the deployment implications:
-->

### Environment Impact

- [ ] Development environment tested
- [ ] Staging environment considerations documented
- [ ] Production rollout plan considered (if applicable)

### Rollback Plan

<!-- 
If this is a significant change, describe how to roll back:
1. Revert to previous package versions: X.X.X
2. Restore previous configuration: ...
3. Clear cached data: ...
-->

### Monitoring

<!-- 
How will we know if this works in production?
- Metrics to watch
- Logs to monitor
- User feedback to collect
-->

---

## 🔗 Additional Context

<!-- 
Add any other context about the pull request here:
- Links to design docs, RFCs, or Linear issues
- Performance benchmarks
- Security considerations
- Known limitations or future improvements
- Dependencies on other PRs
-->

### Related PRs

<!-- 
List any related PRs in other repositories or branches:
- #123 - Related infrastructure update
- org/other-repo#456 - Corresponding backend changes
-->

### Screenshots of DAG (if applicable)

<!-- 
For dbt or workflow changes, include relevant DAG screenshots
-->

### References

<!-- 
Links to:
- Documentation
- API specifications
- Design documents
- Discussion threads
- External resources
-->

---

## 👥 Reviewer Notes

<!-- 
Specific things you want reviewers to focus on:
- Areas you're unsure about
- Trade-offs you made
- Performance implications
- Security concerns
-->

### Review Focus Areas

<!-- 
Help your reviewers by highlighting:
1. Critical sections that need careful review
2. New patterns or approaches used
3. Potential edge cases
4. Performance-sensitive code
-->

### Questions for Reviewers

<!-- 
List any open questions or areas where you want specific feedback:
1. Is the error handling approach correct for this use case?
2. Should we add more tests for edge case X?
3. Is the configuration API intuitive?
-->

---

## 🔐 Security Considerations

<!-- 
If this PR has security implications:
-->

- [ ] This PR does not introduce security vulnerabilities
- [ ] I have considered authentication/authorization implications
- [ ] I have reviewed for injection vulnerabilities
- [ ] Sensitive data is properly handled (encrypted, not logged, etc.)
- [ ] I have considered rate limiting and abuse scenarios

---

<!-- 
Thank you for contributing to Cyrus! 🎉
Your PR will be reviewed within 5 business days.

Remember:
- Be patient during code review
- Be responsive to feedback
- Ask questions if anything is unclear

For more information, see:
- CONTRIBUTING.md
- CLAUDE.md
- docs/README.md
-->
