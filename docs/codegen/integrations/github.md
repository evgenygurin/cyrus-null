# GitHub Integration

> Part of Codegen Platform Documentation

## Setup

1. Install Codegen GitHub App: [Install App](https://github.com/apps/codegen)
2. Grant necessary permissions
3. Select repositories for access

## Capabilities

**Pull Request Management**:

- ✅ Create PRs with detailed context
- ✅ Update PRs throughout development
- ✅ Manage merges and status checks
- ✅ Automated code reviews with inline comments

## Triggers

```bash
# Comment on PR or issue
@codegen-agent please fix the TypeScript errors in this PR

# Automatic PR review (when enabled)
# Triggers on every PR automatically
```

## Workflow

1. Agent reads repository code and issues/PRs
2. Creates branch and implements changes
3. Opens PR with description
4. Requests team feedback
5. Updates based on comments

## Required Permissions

- Repository content (read/write)
- Pull requests (read/write)
- Status checks (read/write)
- Issues (read/write)
- Workflows (read/write)
- Webhooks (read)
- Commit statuses (read/write)
- Repository administration (read)

## Example: Automated PR Workflow

```python
# Create agent run that generates PR
run = agent.run(
    prompt="""
    Implement user authentication feature in the auth-service repository:

    Tasks:
    1. Create UserAuthService with login/logout methods
    2. Implement JWT token generation and validation
    3. Add password hashing with bcrypt
    4. Create /login and /logout endpoints
    5. Add comprehensive tests (90%+ coverage)
    6. Update API documentation

    Create a PR with all changes following our contribution guidelines.
    """,
    repo_id=456
)

# Wait for completion
status = wait_for_completion(agent, run.id)

# Check created PR
for pr in status.github_pull_requests:
    print(f"PR created: {pr['title']}")
    print(f"URL: {pr['url']}")
    print(f"Branch: {pr['branch']}")
```

## Automatic Features

### Checks Auto-fixer

- **Triggers**: When CI checks fail on agent-created PRs
- **Behavior**: Automatically analyzes failure, fixes issues, pushes new commit, re-triggers checks

### PR Review (Automatic)

- **Triggers**: On every pull request (when enabled)
- **Provides**: Inline code comments, security analysis, quality suggestions, architectural feedback

## Configuration

### Enable at Organization Level

Visit `codegen.com/settings`:

```yaml
pr_review:
  enabled: true
  auto_approve: false
  require_changes: false
```

### Enable at Repository Level

Visit `codegen.com/repos/[repo-id]/settings`:

```yaml
pr_review:
  enabled: true
  custom_rules:
    - Check for SQL injection vulnerabilities
    - Enforce 80% test coverage minimum
    - Verify TypeScript strict mode compliance
    - Ensure API documentation is updated
```

## Best Practices

1. **Enable at both levels**: Organization and repository settings both required
2. **Start with org defaults**: Set global standards first
3. **Customize per repo**: Add project-specific rules
4. **Review agent feedback**: Use as learning opportunity
5. **Iterate on rules**: Refine based on team needs
