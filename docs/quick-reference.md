# Cyrus Quick Reference

Quick reference guide for common Cyrus operations, commands, and workflows.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Common Commands](#common-commands)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Key File Locations](#key-file-locations)

## Installation & Setup

### Initial Installation

```bash
# Install globally via npm
npm install -g cyrus-ai

# Or install from source
git clone https://github.com/ceedaragents/cyrus.git
cd cyrus
pnpm install
pnpm build
```

### First Run

```bash
# Start Cyrus (will prompt for configuration)
cyrus

# Or with environment file
cyrus --env-file=/path/to/.env
```

### Prerequisites

- Node.js 18+
- pnpm (v10.11.0 or higher)
- git CLI configured
- gh CLI (optional, for GitHub PR creation): `brew install gh`

## Common Commands

### Monorepo Commands (Run from root)

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run tests (all packages)
pnpm test

# Run tests (packages only, recommended)
pnpm test:packages:run

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Development mode (watch all)
pnpm dev
```

### CLI App Commands

```bash
cd apps/cli

# Start the agent
pnpm start

# Development mode
pnpm dev

# Run tests
pnpm test
pnpm test:watch

# Link local version globally
pnpm build
pnpm uninstall cyrus-ai -g
pnpm install -g .
```

### Proxy Worker Commands

```bash
cd apps/proxy-worker

# Start proxy server
pnpm start

# Development mode
pnpm dev

# Run tests
pnpm test
```

### Web Panel Commands

```bash
cd apps/web-panel

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Configuration

### Configuration File Location

```
~/.cyrus/config.json
```

### Essential Configuration

```json
{
  "repositories": [{
    "id": "workspace-123456",
    "name": "my-app",
    "repositoryPath": "/path/to/repo",
    "allowedTools": ["Read(**)", "Edit(**)", "Bash(git:*)", "Bash(gh:*)", "Task"],
    "mcpConfigPath": "./mcp-config.json",
    "teamKeys": ["TEAM"],
    "projectKeys": ["Project Name"],
    "routingLabels": ["backend", "api"]
  }]
}
```

### Tool Presets

```json
{
  "allowedTools": "readOnly"  // Read-only tools (7 tools)
  // or
  "allowedTools": "safe"      // All except Bash (10 tools)
  // or
  "allowedTools": "all"       // All tools including Bash (11 tools)
  // or
  "allowedTools": ["Read(**)", "Edit(**)", "Task"]  // Custom array
}
```

### Prompt-Based Routing

```json
{
  "labelPrompts": {
    "debugger": {
      "labels": ["Bug", "Hotfix"],
      "allowedTools": "readOnly"
    },
    "builder": {
      "labels": ["Feature", "Improvement"],
      "allowedTools": "safe"
    },
    "scoper": {
      "labels": ["PRD", "RFC"],
      "allowedTools": ["Read(**)", "WebFetch", "WebSearch"]
    }
  }
}
```

## Development Workflow

### Making Changes

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test:packages:run`
4. Type check: `pnpm typecheck`
5. Build: `pnpm build`
6. Update CHANGELOG.md (under `## [Unreleased]`)
7. Commit and push

### Publishing Packages

**IMPORTANT: Publish in this exact order:**

```bash
# Build all first
pnpm install
pnpm build

# 1. Packages with no internal dependencies
cd packages/ndjson-client && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

# 2. Claude runner
cd packages/claude-runner && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

# 3. Core package
cd packages/core && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

# 4. Simple agent runner
cd packages/simple-agent-runner && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

# 5. Edge worker
cd packages/edge-worker && pnpm publish --access public --no-git-checks
cd ../.. && pnpm install

# 6. Finally, CLI
pnpm install
cd apps/cli && pnpm publish --access public --no-git-checks
cd ../..

# Create tag
git tag v0.1.XX
git push origin <branch-name>
git push origin v0.1.XX
```

### Testing Linear MCP Integration

```bash
cd packages/claude-runner

# Setup environment
echo "LINEAR_API_TOKEN=your_token" > .env

# Build and test
pnpm build
node test-scripts/simple-claude-runner-test.js
```

## Troubleshooting

### Common Issues

**Issue: Package not found after publishing**
```bash
# Solution: Update lockfile after each publish
pnpm install
```

**Issue: Tests failing in CI**
```bash
# Run tests locally first
pnpm test:packages:run
pnpm typecheck
pnpm build
```

**Issue: Claude can't access repository**
```bash
# Check repository path in config
cat ~/.cyrus/config.json | grep repositoryPath

# Verify git worktrees
git worktree list
```

**Issue: Linear webhooks not received**
```bash
# Check webhook configuration
echo $CYRUS_BASE_URL
echo $CYRUS_SERVER_PORT

# Verify proxy is running
cd apps/proxy-worker && pnpm start
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=cyrus:* cyrus

# Check logs
tail -f ~/.cyrus/logs/cyrus.log
```

## Key File Locations

### Configuration & Data

- `~/.cyrus/config.json` - Main configuration
- `~/.cyrus/sessions/` - Session data
- `~/.cyrus/logs/` - Application logs

### Repository Files

- `cyrus-setup.sh` - Repository setup script (optional)
- `mcp-config.json` - MCP server configuration (optional)

### Important Code Paths

- `apps/cli/src/application/` - CLI application logic
- `packages/claude-runner/src/ClaudeRunner.ts` - Claude execution
- `packages/core/src/session/` - Session management
- `packages/edge-worker/src/EdgeWorker.ts` - Edge worker orchestration
- `apps/proxy-worker/src/services/` - OAuth & webhook services

### Documentation

- `README.md` - Main readme
- `CLAUDE.md` - Claude Code instructions
- `CHANGELOG.md` - Change history
- `docs/README.md` - Documentation index
- `docs/UNIFIED_ARCHITECTURE.md` - Architecture overview
- `docs/LOCAL_DEVELOPMENT_SETUP.md` - Development guide

## Quick Links

- [Main README](../README.md)
- [CLAUDE.md - Development Guide](../CLAUDE.md)
- [Architecture Overview](./UNIFIED_ARCHITECTURE.md)
- [Local Development Setup](./LOCAL_DEVELOPMENT_SETUP.md)
- [Linear Configuration Guide](./LINEAR_CONFIGURATION_GUIDE.md)
- [Branching Workflow](./BRANCHING_WORKFLOW.md)

## Environment Variables

### Server Configuration

```bash
# Server port (default: 3456)
CYRUS_SERVER_PORT=3456

# Public base URL for webhooks and OAuth
CYRUS_BASE_URL=https://your-domain.com

# Direct Linear OAuth (optional, for self-hosted)
LINEAR_DIRECT_WEBHOOKS=true
LINEAR_CLIENT_ID=your_client_id
LINEAR_CLIENT_SECRET=your_client_secret
LINEAR_WEBHOOK_SECRET=your_webhook_secret
```

### Development

```bash
# Enable debug logging
DEBUG=cyrus:*

# Custom config location
CYRUS_CONFIG_PATH=/path/to/config.json
```

---

**Last Updated**: 2025-01-14  
**Version**: 1.0.0
