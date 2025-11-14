# MCP Servers Integration

> Part of Codegen Platform Documentation

## What is MCP?

**Model Context Protocol (MCP)** - Standard for connecting external tools and services to AI agents.

## Configuration

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://..."],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost/db"
      }
    },
    "custom-api": {
      "command": "node",
      "args": ["./mcp-servers/custom-api-server.js"],
      "env": {
        "API_KEY": "${CUSTOM_API_KEY}"
      }
    }
  }
}
```

## Supported Server Types

- **Databases**: PostgreSQL, MySQL, MongoDB
- **APIs**: REST, GraphQL endpoints
- **CI/CD**: Jenkins, GitLab CI, CircleCI
- **Cloud Services**: AWS, GCP, Azure
- **Custom Tools**: Any MCP-compatible server

## Example: Database Integration

```python
# Agent automatically uses configured MCP tools
run = agent.run(
    prompt="""
    Query the PostgreSQL database to find:
    1. All users created in the last 7 days
    2. Their total order count
    3. Average order value per user

    Generate a summary report and save to analytics/weekly_users.md
    """,
    repo_id=456
)
```

## Automatic Features

### Checks Auto-fixer

- **Triggers**: When CI checks fail on agent-created PRs
- **Behavior**: Automatically analyzes failure, fixes issues, pushes new commit, re-triggers checks

### PR Review (Automatic)

- **Triggers**: On every pull request (when enabled)
- **Provides**: Inline code comments, security analysis, quality suggestions, architectural feedback

## Best Practices

1. **Enable at both levels**: Organization and repository settings both required
2. **Start with org defaults**: Set global standards first
3. **Customize per repo**: Add project-specific rules
4. **Review agent feedback**: Use as learning opportunity
5. **Iterate on rules**: Refine based on team needs
