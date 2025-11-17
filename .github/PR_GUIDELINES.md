# Pull Request Guidelines

This guide provides detailed instructions for creating high-quality pull requests in the Cyrus project.

## Table of Contents

- [Before Creating a PR](#before-creating-a-pr)
- [PR Template Sections](#pr-template-sections)
- [Writing Changelog Entries](#writing-changelog-entries)
- [Testing Requirements](#testing-requirements)
- [Branching Strategy](#branching-strategy)
- [Review Process](#review-process)
- [Common Pitfalls](#common-pitfalls)

## Before Creating a PR

### 1. Ensure Your Changes Are Ready

```bash
# Run all checks before creating PR
pnpm install              # Update dependencies
pnpm build               # Build all packages
pnpm lint                # Check code style
pnpm typecheck           # Verify TypeScript
pnpm test:packages:run   # Run all tests
```

### 2. Update Documentation

- **CHANGELOG.md**: Add entries under `## [Unreleased]`
- **CLAUDE.md**: Update if development workflow changed
- **README.md**: Update if user-facing features changed

### 3. Commit Your Changes

```bash
git add -A
git commit -m "feat: Add feature description"
git push origin feature/your-branch-name
```

## PR Template Sections

### Description

**Purpose**: Provide context for reviewers

**What to include**:
- Summary of what changed
- Why the change was needed
- Any relevant background

**What to avoid**:
- Implementation details that can be seen in code
- Copy-pasting commit messages
- Vague descriptions like "fixes stuff"

**Example**:
```markdown
## Description

This PR adds support for automatic Linear MCP server configuration. 
Previously, users had to manually configure MCP servers in their config.json.
Now, Cyrus automatically sets up the Linear MCP server using the repository's
Linear token, making it available to Claude sessions without additional setup.
```

### Type of Change

Check all boxes that apply. This helps reviewers understand the scope and risk level.

**Guidelines**:
- 🐛 **Bug fix**: Fixes incorrect behavior without changing APIs
- ✨ **New feature**: Adds new functionality
- 💥 **Breaking change**: Requires user action to migrate (avoid if possible)
- 📝 **Documentation**: Only documentation changes
- 🔧 **Configuration**: Changes to config format or defaults
- ♻️ **Refactoring**: Code restructuring without behavior changes
- ⚡ **Performance**: Makes things faster or use less resources
- 🧪 **Test coverage**: Improves test quality or coverage

### User Impact

**Purpose**: Help users understand what changes for them

**Good examples**:
```markdown
**What changes for users:**
- Cyrus now automatically retries failed webhook connections up to 3 times
- Users can configure custom retry intervals in their config.json
- Better error messages show which connection step failed

**Why this matters:**
Network hiccups no longer require restarting Cyrus. The agent will 
automatically recover from temporary connection failures, improving 
reliability for users on unstable networks.
```

**Bad examples**:
```markdown
**What changes for users:**
Implemented exponential backoff in NdjsonClient

**Why this matters:**
Better code architecture
```

### Changelog Entry

Follow the [Keep a Changelog](https://keepachangelog.com/) format.

**Categories**:
- **Added**: New features users can use
- **Changed**: Changes to existing features
- **Fixed**: Bug fixes
- **Removed**: Removed features
- **Deprecated**: Features marked for future removal
- **Security**: Security improvements

**Writing guidelines**:

✅ **Good changelog entries**:
```markdown
### Added
- Cyrus now automatically detects `.mcp.json` files in repository root
- New `cyrus check-tokens` command validates Linear OAuth tokens
- Support for multiple MCP config files with composition

### Changed  
- Default model changed from opus to sonnet 4.5
- Webhook connections now automatically reconnect when tokens are updated

### Fixed
- Fixed webhook signature verification failures after restarting Cyrus
- Resolved issue where sub-issues used wrong base branch
```

❌ **Bad changelog entries**:
```markdown
### Added
- Implemented IMcpConfigLoader interface
- Added new SessionManager factory method
- Created EdgeWorker.handleToolCall() method

### Changed
- Refactored LinearIssueService to use dependency injection
- Updated types in ClaudeRunner
```

**Key principle**: Write from the user's perspective, not the developer's perspective.

### Affected Packages

Check all packages modified in your PR. This helps with:
- Release planning
- Version bumping
- Testing scope

**Example**:
```markdown
- [x] `packages/core` - Shared types and session management (cyrus-core)
  - Version: 0.0.19
- [x] `packages/edge-worker` - Edge worker client (cyrus-edge-worker)
  - Version: 0.0.38
- [x] `apps/cli` - Main CLI application (cyrus-ai)
  - Version: 0.1.56
```

### Pre-Submission Checklist

**All items must be checked**. If an item doesn't apply, check it and note "N/A".

**Code Quality checklist**:
```bash
pnpm test:packages:run  # All tests pass
pnpm typecheck          # No TypeScript errors
pnpm build              # Build succeeds
pnpm lint               # No linting errors
```

**Documentation checklist**:
- Updated CHANGELOG.md? 
- Updated CLAUDE.md (if workflow changed)?
- Updated README.md (if user features changed)?
- Added JSDoc comments (if new APIs)?

**Testing checklist**:
- Tested locally?
- Tested with real Linear integration?
- Tested edge cases?
- Verified no regressions?

### Testing Instructions

Help reviewers test your changes.

**Good example**:
```markdown
## Testing Instructions

### Prerequisites
- Cyrus installed and configured with a Linear workspace
- Test repository with at least 2 Linear issues

### Test Steps
1. Create a new Linear issue and assign it to Cyrus
2. Add a comment with `@cyrus test the webhook retry logic`
3. Stop your network connection briefly
4. Observe Cyrus automatically retries and succeeds

### Expected Results
- Cyrus should show "Retrying connection (attempt 1/3)..." in logs
- After network recovers, connection succeeds without manual intervention
- Linear issue receives response from Claude
```

**Bad example**:
```markdown
## Testing Instructions

Test it and make sure it works.
```

### Screenshots/Recordings

Include visual evidence for:
- CLI output changes
- New error messages
- Behavioral changes
- UI updates (if applicable)

Use tools like:
- `asciinema` for terminal recordings
- Screenshots for error messages
- Screen recordings for complex workflows

### Related Issues

Link related items:
```markdown
- Closes #123 (auto-closes issue when PR merges)
- Fixes #456 (auto-closes issue when PR merges)
- Related to #789 (reference without closing)
- Linear: CEE-123 (reference Linear issue)
```

### Deployment Notes

**Target Branch selection**:
- `main`: Development features, non-breaking changes
- `stage`: Tested features ready for staging review
- `prod`: Production-ready releases
- `hotfix/*`: Critical bugs needing immediate production fix

**Deployment considerations** checklist:
- Environment variable changes?
- Database migrations needed?
- Config file format changes?
- Service restart required?

**Rollback plan**:
```markdown
### Rollback Plan

If issues occur:
1. Revert to previous version: `git revert <commit-sha>`
2. Redeploy previous release
3. Users can temporarily add `OLD_BEHAVIOR=true` env var
```

### Breaking Changes

**If you have breaking changes, you must**:

1. **Explain what breaks**:
```markdown
**Breaking change details:**
Renamed repository config fields:
- `soraApiKey` → `openaiApiKey`
- `soraOutputDirectory` → `openaiOutputDirectory`

Affects: Users who configured Sora in their ~/.cyrus/config.json
```

2. **Provide migration path**:
```markdown
**Migration guide:**

Update your `~/.cyrus/config.json`:

```json
{
  "repositories": [{
    // Old (will break)
    "soraApiKey": "sk-...",
    "soraOutputDirectory": "/path/to/sora"
    
    // New (correct)
    "openaiApiKey": "sk-...",
    "openaiOutputDirectory": "/path/to/openai"
  }]
}
```

Run `cyrus validate-config` to check your configuration.
```

3. **Set deprecation timeline** (if gradual migration):
```markdown
- v0.1.56: New fields introduced, old fields deprecated
- v0.2.0: Old fields will be removed (planned for Feb 2025)
```

## Writing Changelog Entries

### Principles

1. **User-centric**: Write from the user's perspective
2. **Observable**: Describe what users can see/experience
3. **Actionable**: Include context about why it matters
4. **Concise**: 1-2 sentences per entry

### Examples by Category

#### Added

Focus on new capabilities users gain:

✅ Good:
```markdown
- Cyrus now automatically detects and loads `.mcp.json` files in repository root
- New `cyrus billing` command opens Stripe portal for subscription management
- Support for environment variables in MCP configs using `${VAR}` syntax
```

❌ Bad:
```markdown
- Added MCP config detection feature
- Implemented billing command
- Created environment variable parser
```

#### Changed

Focus on behavior differences:

✅ Good:
```markdown
- Default Claude model changed from opus to sonnet 4.5
- Webhook connections now automatically reconnect when tokens are updated
- Linear MCP server upgraded to official HTTP-based server for better stability
```

❌ Bad:
```markdown
- Changed DEFAULT_MODEL constant
- Refactored webhook client
- Updated Linear MCP dependency
```

#### Fixed

Focus on problems that no longer occur:

✅ Good:
```markdown
- Fixed webhook signature verification failures after restarting Cyrus
- Resolved issue where duplicate messages appeared when Claude provided final responses
- Sub-issue branches now correctly use parent branch as base
```

❌ Bad:
```markdown
- Fixed bug in SignatureVerifier
- Corrected LAST_MESSAGE_MARKER handling
- Updated git branch logic
```

### Real-world Examples from Cyrus History

**Excellent changelog entries** from past releases:

```markdown
### Added
- **Intelligent procedure routing**: Cyrus now automatically selects the best 
  workflow for each task by analyzing the request content. Simple questions get 
  quick answers, documentation edits proceed directly to implementation, and 
  code changes get the full workflow with verifications and git operations.
  
- **Dynamic configuration updates**: Cyrus now automatically detects and applies 
  changes to `~/.cyrus/config.json` without requiring a restart. Add or remove 
  repositories on the fly while Cyrus continues running.

### Fixed  
- Fixed critical crash issue where subprocess failures would bring down the 
  entire application. Improved error isolation for individual Claude sessions - 
  failures no longer affect other running sessions.
```

**Why these are excellent**:
- Clear user benefit ("what" not "how")
- Complete context (why it matters)
- Observable behavior (users can verify)
- No implementation details

## Testing Requirements

### Unit Tests

Required for:
- New utility functions
- Business logic changes
- Bug fixes

Example:
```typescript
describe('ConfigService', () => {
  it('should merge multiple MCP configs', () => {
    const result = configService.composeMcpConfigs([
      { mcpServers: { linear: { type: 'stdio' } } },
      { mcpServers: { github: { type: 'http' } } }
    ]);
    
    expect(result.mcpServers).toHaveProperty('linear');
    expect(result.mcpServers).toHaveProperty('github');
  });
});
```

### Integration Tests

Required for:
- Cross-package interactions
- External service integrations
- End-to-end workflows

### Manual Testing Checklist

Before submitting PR:

- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases (empty input, null values, etc.)
- [ ] Test with real Linear workspace (if Linear changes)
- [ ] Test backward compatibility
- [ ] Test on different Node versions (if applicable)

## Branching Strategy

Cyrus uses a three-tier branching strategy:

```
feature/* → main → stage → prod
              ↓       ↓       ↓
            develop  staging  production
```

### Branch Purposes

**`main`** (Development):
- Active development
- Feature integration
- Unit & integration tests must pass
- Auto-deploys to development environment

**`stage`** (Staging):
- Release candidates
- User acceptance testing
- Full system testing
- Auto-deploys to staging environment

**`prod`** (Production):
- Stable releases
- Customer-facing
- Requires 2 approvals
- Auto-deploys to production

### Creating Feature PRs

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-mcp-config-detection

# Make changes and commit
git add -A
git commit -m "feat: Add automatic MCP config detection"

# Push and create PR to main
git push origin feature/add-mcp-config-detection
```

### Promoting to Staging

```bash
# After PR merged to main
gh pr create --base stage --head main \
  --title "chore: Promote main to stage" \
  --body "Promoting tested features from main to stage"
```

### Creating Hotfixes

```bash
# Hotfix from prod
git checkout prod
git pull origin prod
git checkout -b hotfix/critical-webhook-fix

# Fix and commit
git commit -m "fix: Critical webhook signature validation"

# Create PRs to both stage and prod
gh pr create --base stage --head hotfix/critical-webhook-fix
gh pr create --base prod --head hotfix/critical-webhook-fix
```

## Review Process

### For PR Authors

**Respond to feedback**:
- Address all comments
- Explain decisions when you disagree
- Update PR based on suggestions
- Re-request review after changes

**Keep PR updated**:
```bash
# Rebase on latest main
git checkout main
git pull origin main
git checkout your-branch
git rebase main
git push --force-with-lease
```

### For Reviewers

**Check for**:
- [ ] Changelog entries are user-focused
- [ ] Tests cover new functionality
- [ ] Documentation is updated
- [ ] No breaking changes (or well documented)
- [ ] Code follows project conventions
- [ ] Security considerations addressed

**Review checklist**:
```markdown
### Code Review
- [ ] Logic is correct and handles edge cases
- [ ] Error handling is appropriate
- [ ] No obvious performance issues
- [ ] Type safety is maintained

### Testing
- [ ] Tested locally or reviewed test results
- [ ] Test coverage is adequate
- [ ] Tests are meaningful (not just for coverage)

### Documentation  
- [ ] Changelog follows guidelines
- [ ] User-facing changes documented
- [ ] Code comments explain "why" not "what"

### Architecture
- [ ] Changes align with project architecture
- [ ] No unnecessary dependencies added
- [ ] Follows monorepo best practices
```

## Common Pitfalls

### ❌ Implementation-Focused Changelog

**Bad**:
```markdown
### Added
- Implemented ISessionManager interface
- Added SessionFactory class
- Created new EdgeWorker methods
```

**Good**:
```markdown
### Added  
- Cyrus now supports multiple concurrent sessions per Linear issue
- Each comment thread maintains its own Claude session for better context isolation
```

### ❌ Vague Descriptions

**Bad**:
```markdown
## Description
Updated some files to fix issues.
```

**Good**:
```markdown
## Description
Fixed webhook signature verification failures that occurred when Cyrus was 
restarted. The issue was caused by edge worker registrations expiring after 
1 hour. Now registrations persist for 90 days, eliminating restart-related 
verification failures.
```

### ❌ Missing Tests

**Bad**:
```markdown
## Pre-Submission Checklist
- [x] All tests pass
- [ ] Added tests for new functionality (will add later)
```

**Good**: Tests are included in the PR, or a follow-up PR is explicitly linked.

### ❌ Breaking Changes Without Migration Path

**Bad**:
```markdown
## Breaking Changes
Changed the config format. Update your config.
```

**Good**:
```markdown
## Breaking Changes

**Breaking change details:**
Repository config now requires explicit `allowedTools` array.

**Migration guide:**
Add to each repository in `~/.cyrus/config.json`:
```json
{
  "repositories": [{
    "allowedTools": ["Read(**)", "Edit(**)", "Bash(git:*)"]
  }]
}
```

Or use preset: `"allowedTools": "safe"`
```

### ❌ Massive PRs

**Problem**: PRs with 50+ file changes are hard to review

**Solution**: 
- Break into smaller, logical PRs
- Use feature flags for large features
- Create draft PRs for early feedback

### ❌ No Testing Instructions

**Bad**:
```markdown
## Testing Instructions
Tested it manually, works fine.
```

**Good**:
```markdown
## Testing Instructions

### Prerequisites
- Cyrus v0.1.55+ installed
- Linear workspace with test repository

### Test Steps
1. Create `.mcp.json` in repository root:
   ```json
   {
     "mcpServers": {
       "test": { "type": "stdio", "command": "echo", "args": ["test"] }
     }
   }
   ```
2. Assign Linear issue to Cyrus
3. Check Cyrus logs for "Loading MCP config from .mcp.json"
4. Verify test server appears in Claude's available tools

### Expected Results
- MCP config loads automatically without explicit `mcpConfigPath`
- Test server tools available in Claude session
- No errors in Cyrus logs
```

## Questions?

If you have questions about the PR process:

1. Check [CLAUDE.md](../CLAUDE.md) for development workflow
2. Review [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
3. Look at recent merged PRs for examples
4. Ask in GitHub Discussions

## Summary Checklist

Before submitting your PR, verify:

- [ ] Description explains **what** and **why**, not **how**
- [ ] Changelog entries are **user-focused** and **observable**
- [ ] All **checklist items** are completed
- [ ] Tests **pass** and cover new functionality
- [ ] Documentation is **updated** (CHANGELOG.md, README.md)
- [ ] No **breaking changes** (or well-documented with migration path)
- [ ] Testing instructions are **clear** and **reproducible**
- [ ] Target branch is **correct** for change type
- [ ] Code follows **project style** and conventions

Happy contributing! 🚀
