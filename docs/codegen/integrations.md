# Integrations

> Part of Codegen Platform Documentation

## 📋 Quick Navigation

This documentation is modularized for efficient token usage. See detailed integration guides below:

- **GitHub Integration**: @docs/codegen/integrations/github.md
- **Slack Integration**: @docs/codegen/integrations/slack.md
- **Linear Integration**: @docs/codegen/integrations/linear.md
- **MCP Servers**: @docs/codegen/integrations/mcp-servers.md

## Overview

Codegen integrates with major development and project management platforms through **OAuth-based connections** and **MCP (Model Context Protocol)** servers.

### Available Integrations

| Integration | Type | Capabilities |
|------------|------|--------------|
| **GitHub** | OAuth | PR creation, code review, repo management, CI/CD |
| **Slack** | OAuth | Commands, notifications, team collaboration |
| **Linear** | OAuth | Issue management, progress tracking, multi-agent systems |
| **Jira** | OAuth | Ticket management, status synchronization |
| **Notion** | OAuth | Documentation access |
| **Figma** | OAuth | Design file access |
| **ClickUp** | OAuth | Task management |
| **Monday.com** | OAuth | Work tracking |
| **Sentry** | OAuth | Error monitoring |
| **CircleCI** | API Key | CI/CD integration |
| **PostgreSQL** | Connection | Database queries |
| **MCP Servers** | Custom | Any MCP-compatible tool |

## Retrieving Integrations

```python
# Get all organization integrations
integrations = agent.get_integrations()

for integration in integrations.integrations:
    print(f"{integration.integration_type}: {'✓ Active' if integration.active else '✗ Inactive'}")
```

## Triggering Codegen Agents

### Manual Triggers

1. **Slack**: `@codegen implement feature X`
2. **Linear**: Assign issue to Codegen Bot
3. **Jira**: Assign ticket to Codegen
4. **ClickUp/Monday.com**: Assign task to Codegen
5. **GitHub**: `@codegen-agent fix the failing tests`
6. **Web Dashboard**: Visit `codegen.com/new`
7. **Terminal (CLI)**: `codegen agent create "your prompt"`
8. **API**: `agent.run(prompt="your task")`

### Automatic Triggers

#### Checks Auto-fixer

- **Triggers**: When CI checks fail on agent-created PRs
- **Behavior**: Automatically analyzes, fixes, and re-runs checks

#### PR Review (Automatic)

- **Triggers**: On every pull request (when enabled)
- **Provides**: Inline comments, security analysis, quality suggestions
