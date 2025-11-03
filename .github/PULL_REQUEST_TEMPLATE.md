## Description

<!-- 
Provide a clear, concise description of what changes this PR introduces.
Focus on WHAT changed and WHY, not HOW it was implemented.
Write from the perspective of users running the `cyrus` CLI binary.
-->

### Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test coverage improvement

## User Impact

<!-- 
Describe what users will experience differently after this change.
Examples:
- "Users can now configure custom MCP servers per repository"
- "Cyrus will automatically retry failed webhook connections"
- "Linear comments now appear faster in Claude sessions"

Avoid technical implementation details like:
- "Implemented AsyncIterable<SDKUserMessage> for ClaudeRunner"
- "Refactored SessionManager to use factory pattern"
-->

**What changes for users:**


**Why this matters:**


## Changelog Entry

<!-- 
Add your changes under the appropriate section(s) below.
These entries will be moved to CHANGELOG.md under the [Unreleased] section.
Follow the Keep a Changelog format: https://keepachangelog.com/

Guidelines:
- Write from the end-user perspective (users running `cyrus` CLI)
- Be concise but descriptive
- Group related changes together
- Avoid technical implementation details
- Focus on observable behavior changes
-->

### Added
<!-- New features or capabilities -->

- 

### Changed
<!-- Changes in existing functionality -->

- 

### Fixed
<!-- Bug fixes -->

- 

### Removed
<!-- Removed features or capabilities -->

- 

### Deprecated
<!-- Soon-to-be removed features -->

- 

### Security
<!-- Security improvements or fixes -->

- 

## Affected Packages

<!-- 
Check all packages that have changes in this PR.
Update version numbers if this is a release PR.
-->

- [ ] `apps/cli` - Main CLI application (cyrus-ai)
  - Version: 
- [ ] `apps/proxy` - Edge proxy server
  - Version: 
- [ ] `apps/electron` - Electron GUI (in development)
  - Version: 
- [ ] `packages/core` - Shared types and session management (cyrus-core)
  - Version: 
- [ ] `packages/claude-runner` - Claude CLI execution wrapper (cyrus-claude-runner)
  - Version: 
- [ ] `packages/edge-worker` - Edge worker client (cyrus-edge-worker)
  - Version: 
- [ ] `packages/ndjson-client` - NDJSON streaming client (cyrus-ndjson-client)
  - Version: 
- [ ] `packages/simple-agent-runner` - Simple agent runner (cyrus-simple-agent-runner)
  - Version: 
- [ ] Other: 

## Pre-Submission Checklist

<!-- 
All items must be checked before the PR can be merged.
If an item is not applicable, check it and add "N/A" explanation.
-->

### Code Quality

- [ ] All tests pass (`pnpm test:packages:run`)
- [ ] TypeScript compilation succeeds (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Code follows project style guidelines (`pnpm lint`)
- [ ] No new warnings or errors introduced
- [ ] Added tests for new functionality (if applicable)

### Documentation

- [ ] Updated `CHANGELOG.md` under `## [Unreleased]` section
- [ ] Updated `CLAUDE.md` if development workflow changed
- [ ] Updated `README.md` if user-facing features changed
- [ ] Added JSDoc comments for new functions/classes (if applicable)
- [ ] Updated relevant documentation files (if applicable)

### Configuration & Dependencies

- [ ] No new dependencies added, OR new dependencies are justified and documented
- [ ] Environment variables documented (if new ones added)
- [ ] Configuration schema updated (if config format changed)
- [ ] Breaking changes clearly documented and migration path provided

### Testing

- [ ] Tested locally in development environment
- [ ] Tested with actual Linear integration (if Linear-related changes)
- [ ] Tested edge cases and error scenarios
- [ ] Tested backward compatibility (if applicable)
- [ ] Verified no regression in existing functionality

## Testing Instructions

<!-- 
Provide step-by-step instructions for reviewers to test your changes.
Include setup requirements, test data, and expected outcomes.
-->

### Prerequisites


### Test Steps

1. 
2. 
3. 

### Expected Results


## Screenshots/Recordings

<!-- 
If your change affects the UI, CLI output, or behavior, include:
- Screenshots of before/after
- Terminal recordings (asciinema, etc.)
- Screen recordings for complex workflows
-->

## Related Issues

<!-- 
Link to related issues, Linear tickets, or discussions.
Use GitHub keywords to auto-close issues: Closes #123, Fixes #456
-->

- Closes #
- Related to #
- Linear: 

## Deployment Notes

<!-- 
Information needed for deployment, if applicable.
Check the items that apply to this PR.
-->

### Target Branch

- [ ] `main` (Development environment)
- [ ] `stage` (Staging environment) 
- [ ] `prod` (Production environment)
- [ ] `hotfix/*` (Emergency hotfix)

### Deployment Considerations

- [ ] No special deployment steps required
- [ ] Requires environment variable updates
- [ ] Requires database migration
- [ ] Requires configuration file updates
- [ ] Requires service restart
- [ ] Other (specify below)

**Special instructions:**


### Rollback Plan

<!-- Describe how to rollback if issues are discovered after deployment -->


## Breaking Changes

<!-- 
If this PR includes breaking changes, provide:
1. What breaks and why
2. Who is affected
3. Migration path for users
4. Deprecation timeline (if applicable)
-->

**Breaking change details:**


**Migration guide:**


## Additional Context

<!-- 
Any additional information that reviewers should know:
- Design decisions and trade-offs
- Alternative approaches considered
- Known limitations or future work needed
- Dependencies on other PRs
- Performance considerations
-->

## Reviewer Notes

<!-- 
Specific areas you want reviewers to focus on:
- Complex logic that needs careful review
- Security-sensitive changes
- Performance-critical sections
- Architecture decisions
-->

**Focus areas for review:**


---

<!-- 
For reviewers: After approving, ensure all checklist items are completed.
For maintainers: Follow the publishing workflow in CLAUDE.md if this is a release PR.
-->
