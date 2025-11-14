# Slack Integration

> Part of Codegen Platform Documentation

## Setup

1. Install Codegen app to Slack workspace
2. Invite bot to relevant channels: `/invite @codegen`
3. Configure channel access

## Commands

```bash
# In any channel
@codegen implement user authentication with JWT

# In thread (continues conversation)
@codegen now add password reset functionality

# Direct message
DM to @codegen: Review PR #123 and provide feedback
```

## Notifications

- 🔔 Task start notifications
- 🔔 Progress updates during execution
- 🔔 Completion notifications with results
- 🔔 Error alerts

## Collaboration Features

- Team can see agent conversations
- Code snippets shared in-channel
- Real-time progress updates
- Cross-platform task coordination

## Security & Permissions

- ⚠️ Agent inherits **individual user permissions**
- ⚠️ No independent repository access
- ⚠️ Thread context includes all messages and media
- ⚠️ Solo mentions limit scope to single message

## Example Workflow

```bash
# 1. Developer posts in #engineering channel
Developer: "We need to add rate limiting to the API"

# 2. Tag Codegen
@codegen please implement rate limiting for our Express API:
- Use express-rate-limit package
- Limit: 100 requests per 15 minutes
- Apply to all /api/* routes
- Add tests
- Create PR

# 3. Agent responds
@codegen: Starting work on rate limiting implementation...

# 4. Progress updates
@codegen: ✓ Installed express-rate-limit
@codegen: ✓ Configured middleware
@codegen: ✓ Added tests (95% coverage)
@codegen: ✓ Created PR #456

# 5. Completion notification
@codegen: Task completed! PR ready for review: https://github.com/org/repo/pull/456
```

## Best Practices

1. **Use channels for team visibility**: Public channels allow team to learn from agent interactions
2. **Use threads for follow-ups**: Keep conversations organized
3. **Be specific in prompts**: Same prompting principles apply as API usage
4. **Tag for urgent**: Use @codegen mentions for immediate attention
5. **Review in GitHub**: Always review agent-created PRs before merging

## Common Use Cases

### Quick Bug Fixes

```bash
@codegen fix the null pointer exception in UserService.ts line 45
```

### Feature Implementation

```bash
@codegen implement OAuth2 authentication:
1. Add passport.js
2. Configure Google OAuth
3. Add login/logout routes
4. Update frontend with login button
```

### Code Review

```bash
@codegen review PR #123 and suggest improvements
```

### Documentation

```bash
@codegen update API docs to reflect new endpoints in commit abc123
```
