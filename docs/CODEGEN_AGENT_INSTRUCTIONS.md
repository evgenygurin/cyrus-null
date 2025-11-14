# Codegen Platform - Agent Instructions

> **Version**: 3.0 (Based on Official Codegen Documentation - January 2025)
> **Purpose**: Complete guide for integrating and working with Codegen AI agents
> **Updated**: 2025-01-14 - Complete documentation overhaul with comprehensive guides

## 📋 Quick Navigation

This documentation is modularized for efficient token usage. See detailed sections below:

**Getting Started:**

- **🚀 Step-by-Step Guide**: @docs/CODEGEN_STEP_BY_STEP_GUIDE.md ⭐ **START HERE**

**Core Documentation:**

- **🔧 Capabilities & Sandboxes**: @docs/codegen/capabilities-sandboxes.md
  - Claude Code Integration
  - Checks Auto-fixer
  - PR Review
  - Analytics
  - Triggering Methods
  - Sandboxes (Setup, Environment, Secrets, Web Preview, Editor)

- **⚙️ Settings & Configuration**: @docs/codegen/settings-configuration.md
  - Agent Behavior
  - Agent Permissions
  - LLM Configuration
  - Repository Rules
  - Team & User Roles

**API References:**

- **📡 API Reference (Complete)**: @docs/codegen/api-reference.md
  - Agents API (create, get, list, resume, ban/unban)
  - Organizations API (get orgs, MCP providers, OAuth)
  - Integrations API
  - CLI Rules API

- **🔀 Pull Requests & Repositories**: @docs/codegen/pull-requests-repositories.md
  - Edit PR / Edit PR Simple
  - Get Repositories
  - Check Suite Settings (get/update)

- **🚀 Advanced API Endpoints**: @docs/codegen/advanced-api-endpoints.md
  - Sandbox API (analyze logs)
  - Setup Commands (generate)
  - Slack Connect (tokens)
  - Users API (current user, get user, list users)

**Specialized Guides:**

- **✍️ Prompting Best Practices**: @docs/codegen/prompting-best-practices.md
- **🔗 Integrations**: @docs/codegen/integrations.md

## 🎯 Overview

### What is Codegen?

Codegen is an **enterprise-grade platform for deploying AI code agents at scale**. It provides the necessary infrastructure (sandboxes, integrations, telemetry) for successful code agent deployments.

**Key Capabilities**:

- 🤖 Automated code analysis, feature implementation, bug fixes, and testing
- 🔗 Seamless integration with GitHub, Slack, Linear, Jira, and other tools
- 🛡️ Secure, isolated sandbox environments for code execution
- 📊 Comprehensive analytics and observability
- 🔐 SOC 2 Type I & II certified with regular penetration testing

### Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Codegen Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API/SDK    │  │  Claude Code │  │  Web UI      │      │
│  │              │  │  Integration │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴───────┐    │
│  │           Agent Orchestration Layer                 │    │
│  └──────┬───────────────────────────────────────┬──────┘    │
│         │                                        │           │
│  ┌──────┴───────┐                     ┌─────────┴──────┐   │
│  │  Sandboxes   │                     │  Integrations  │   │
│  │  (Isolated   │                     │  (GitHub,      │   │
│  │  Execution)  │                     │  Slack, etc.)  │   │
│  └──────────────┘                     └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Core Concepts

### Agent Lifecycle

1. **Creation** → Agent run is created with a prompt
2. **Execution** → Agent executes in isolated sandbox
3. **Processing** → Agent analyzes code, makes changes, runs tests
4. **Completion** → Results are returned, PRs created if applicable
5. **Resume** → Agent can be resumed with follow-up prompts

### Agent Types

- **`codegen`** - Default Codegen agent
- **`claude_code`** - Claude Code integration mode (recommended)

### Source Types

Agents can be triggered from multiple sources:

- `LOCAL` - Local development environment
- `API` - Direct API calls
- `GITHUB` - GitHub events (PR reviews, check suites)
- `SLACK` - Slack workspace commands
- `LINEAR` - Linear issue assignments
- `JIRA` - Jira ticket creation
- `CHAT` - Web UI chat interface
- `SETUP_COMMANDS` - Repository setup automation

## 🚀 Quick Start

### Setup (3 Steps)

```bash
# 1. Install
uv tool install codegen

# 2. Authenticate
codegen login

# 3. Execute
codegen claude "implement user authentication with JWT"
```

### Claude Code Integration

**Claude Code** operates through Codegen's infrastructure, providing:

- ✅ Persistent history across all local Claude sessions
- ✅ Automatic logging to cloud (searchable from any device)
- ✅ Team visibility into development patterns
- ✅ Automatic access to all Codegen integrations via MCP
- ✅ Background execution for long-running tasks

## 📚 Documentation Overview

All documentation is modularized for efficient token usage and easy navigation. Each guide is comprehensive and self-contained.

### Core Capabilities & Infrastructure

**Capabilities & Sandboxes Guide** (@docs/codegen/capabilities-sandboxes.md):

- **Claude Code**: Integration, features, benefits, usage
- **Checks Auto-fixer**: Automated CI failure fixing, retry logic, configuration
- **PR Review**: Automated code review, security scanning, quality assessment
- **Analytics**: Metrics tracking, cost analysis, performance insights
- **Triggering**: Manual and automatic trigger methods
- **Sandboxes**: Secure execution environments, setup commands, secrets management

**Settings & Configuration Guide** (@docs/codegen/settings-configuration.md):

- **Agent Behavior**: Propose plan, require mentions, configuration strategies
- **Permissions**: PR creation, rules detection, signed commits
- **LLM Configuration**: Model selection, cost optimization, custom API keys
- **Repository Rules**: AGENTS.md, CLAUDE.md, priority hierarchy
- **Team Roles**: Admin, Manager, Member permissions and management

### API Documentation

**Complete API Reference** (@docs/codegen/api-reference.md):

- **Agents API**: Create, get, list, resume, ban/unban agent runs
- **Organizations API**: Get organizations, MCP providers, OAuth management
- **Integrations API**: Get organization integrations
- **CLI Rules API**: Get organization and user rules
- Rate limits, error handling, complete examples

**Pull Requests & Repositories API** (@docs/codegen/pull-requests-repositories.md):

- **Pull Requests**: Edit PR, Edit PR Simple
- **Repositories**: Get repositories, check suite settings
- **Configuration**: Retry counts, ignored checks, custom prompts
- Complete workflow examples

**Advanced API Endpoints** (@docs/codegen/advanced-api-endpoints.md):

- **Sandbox API**: Analyze sandbox logs for troubleshooting
- **Setup Commands**: Generate setup commands for repositories
- **Slack Connect**: Generate connection tokens
- **Users API**: Current user, get user, list users

### Integrations

**Available Integrations** (14 platforms):

- **Development**: GitHub, CircleCI
- **Communication & PM**: Slack, Linear, Jira, ClickUp, Monday.com, Notion
- **Data & Analytics**: PostgreSQL, Sentry
- **Design**: Figma
- **Advanced**: MCP Servers, Web Search

See @docs/codegen/integrations.md for detailed integration guides.

## 🛠️ Essential Commands

### CLI Commands

```bash
# Launch interactive terminal UI
codegen

# Create new agent run
codegen agent create "implement user authentication"

# View agent runs
codegen agents list

# Get run details
codegen agents get <run-id>

# Run Claude Code with Codegen monitoring
codegen claude "your prompt here"

# Background execution
codegen claude --background "run extensive test suite"
```

### Python SDK

```python
from codegen import Agent

# Initialize
agent = Agent(org_id="123", token="sk-...")

# Create and monitor run
task = agent.run(
    prompt="Review PR #456 and provide feedback",
    repo_id=789
)

# Check completion
if task.status == "completed":
    print(f"Result: {task.result}")
    for pr in task.github_pull_requests:
        print(f"PR: {pr['url']}")
```

## 🎯 Common Use Cases

### 1. Automated Code Review

```bash
# In GitHub PR
@codegen-agent please review this PR and suggest improvements
```

### 2. Bug Fixes from Linear

```bash
# In Linear issue, assign to Codegen
Assignee: Codegen Bot
```

### 3. Team Collaboration via Slack

```bash
# In Slack channel
@codegen implement rate limiting for our API:
- Use express-rate-limit
- 100 requests per 15 minutes
- Add tests and create PR
```

### 4. Automated Testing

```python
agent.run(prompt="""
Run full test suite in payment-api:
1. Install dependencies: npm ci
2. Run tests: npm test
3. Generate coverage: npm run coverage
4. Report failures with details
""")
```

## ⚡ Best Practices Summary

1. **Prompting**: Be specific, provide context, define success criteria
2. **Rate Limits**: Implement exponential backoff, respect limits
3. **Security**: Never hardcode tokens, use environment variables
4. **Integrations**: Configure at org level, customize per repo
5. **Testing**: Always include comprehensive tests in prompts
6. **Documentation**: Update docs as part of agent tasks
7. **Monitoring**: Check `codegen.com/agents` for session history

## 📖 Additional Resources

- **Codegen Platform**: <https://codegen.com>
- **API Documentation**: <https://docs.codegen.com>
- **Linear Integration**: <https://docs.codegen.com/integrations/linear.md>
- **Claude Code Integration**: <https://docs.codegen.com/capabilities/claude-code.md>

## 🔗 Quick Reference

### Core Operations

| Task | Method | Example |
|------|--------|---------|
| **Create agent** | API/SDK | `agent.run(prompt="...")` |
| **Monitor progress** | CLI | `codegen` (terminal UI) |
| **Resume agent** | API/SDK | `agent.resume(run_id, prompt="...")` |
| **Get logs** | API | `agent.get_logs(run_id)` |

### Integration Triggers

| Integration | Trigger Method | Example |
|------------|---------------|---------|
| **Slack** | Mention in channel/DM | `@codegen implement feature X` |
| **Linear** | Assign issue | Assign to "Codegen Bot" |
| **Linear** | Comment mention | `@codegen fix this bug` |
| **Jira** | Assign ticket | Assign to "Codegen" |
| **ClickUp** | Assign task | Assign to "Codegen" |
| **Monday.com** | Assign task | Assign to "Codegen" |
| **GitHub** | PR/Issue comment | `@codegen-agent review this PR` |
| **API** | Programmatic | `agent.run(prompt="...")` |
| **CLI** | Command line | `codegen agent create "task"` |
| **Web UI** | Dashboard | Visit `codegen.com/new` |

### Automatic Features

| Feature | Activation | Configuration |
|---------|-----------|---------------|
| **PR Review** | Every PR (when enabled) | Org + Repo settings |
| **Checks Auto-fixer** | Failed CI checks | Retry count settings |
| **Setup Commands** | Sandbox initialization | Repository settings |

### Integration Capabilities

| Integration | Primary Use | Access Method |
|------------|------------|---------------|
| **GitHub** | Code & PRs | OAuth App |
| **Slack** | Team communication | OAuth App |
| **Linear** | Issue tracking | OAuth/API Key |
| **Jira** | Ticket management | OAuth |
| **PostgreSQL** | Database queries | MCP Server |
| **Sentry** | Error monitoring | OAuth |
| **CircleCI** | CI/CD | API Key |
| **Notion** | Documentation | OAuth |
| **Figma** | Design files | OAuth |
| **MCP Servers** | Custom tools | Configuration |

---

## 📖 Documentation Structure Summary

**Total Documentation Pages**: 8

1. **CODEGEN_AGENT_INSTRUCTIONS.md** (This file) - Main index and quick reference
2. **CODEGEN_STEP_BY_STEP_GUIDE.md** - Practical workflows for agents
3. **capabilities-sandboxes.md** - Complete guide (1800+ lines)
4. **settings-configuration.md** - Complete guide (1100+ lines)
5. **api-reference.md** - Complete API documentation
6. **pull-requests-repositories.md** - PR & Repo APIs
7. **advanced-api-endpoints.md** - Sandbox, Users, Setup APIs
8. **integrations.md** - All 14 platform integrations

**Document Status**: ✅ Complete Comprehensive Documentation
**Last Updated**: 2025-01-14
**Coverage**: All APIs, Capabilities, Settings, Sandboxes, Integrations
**Token Optimization**: Modular @imports architecture for efficient loading
