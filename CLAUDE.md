# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cyrus (Linear Claude Agent) is a monorepo JavaScript/TypeScript application that integrates Linear's issue tracking with multiple AI agent platforms to automate software development tasks. The project supports integration with:

- **Claude Code** (claude.ai/code) - Primary agent for local development
- **Codegen** (codegen.com) - Cloud-based agent execution platform
- **Cursor** - IDE-integrated agent capabilities

**Key capabilities:**
- Monitors Linear issues assigned to specific users/agents
- Creates isolated Git worktrees for each issue
- Runs agent sessions (Claude Code, Codegen, or Cursor) to process issues
- Posts responses back to Linear as comments
- Maintains conversation continuity using the `--continue` flag
- Supports edge worker mode for distributed processing
- Multi-agent coordination and collaboration patterns

## Agent Guidelines

For comprehensive step-by-step instructions on working with this codebase as an AI agent, see **[docs/AGENT_INSTRUCTIONS.md](docs/AGENT_INSTRUCTIONS.md)**. This document covers:

- Core principles and communication style
- Code investigation workflows
- Tool usage best practices
- Prompt engineering guidelines
- Error handling patterns
- Testing requirements
- Documentation standards
- Integration guidelines (Linear, Codegen, GitHub)

**Quick Reference**: Always read files before answering questions about them. Never speculate about code you haven't opened.

## Working with SDKs

When examining or working with a package SDK:

1. First, install the dependencies:

   ```bash
   pnpm install
   ```

2. Locate the specific SDK in the `node_modules` directory to examine its structure, types, and implementation details.

3. Review the SDK's documentation, source code, and type definitions to understand its API and usage patterns.

## Architecture Overview

The codebase follows a pnpm monorepo structure:

cyrus/
├── apps/
│   ├── cli/          # Main CLI application
│   ├── electron/     # Future Electron GUI (in development)
│   └── proxy/        # Edge proxy server for OAuth/webhooks
└── packages/
    ├── core/         # Shared types and session management
    ├── claude-parser/# Claude stdout parsing with jq
    ├── claude-runner/# Claude CLI execution wrapper
    ├── edge-worker/  # Edge worker client implementation
    └── ndjson-client/# NDJSON streaming client

```bash

For a detailed visual representation of how these components interact and map Claude Code sessions to Linear comment threads, see @architecture.md.

## Common Commands

### Monorepo-wide Commands (run from root)
```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Build lint for the entire repository
pnpm lint

# Run tests across all packages
pnpm test

# Run tests only in packages directory (recommended)
pnpm test:packages:run

# Run TypeScript type checking
pnpm typecheck

# Development mode (watch all packages)
pnpm dev
```

### App-specific Commands

#### CLI App (`apps/cli/`)

```bash
# Start the agent
pnpm start

# Development mode with auto-restart
pnpm dev

# Run tests
pnpm test
pnpm test:watch  # Watch mode

# Local development setup (link development version globally)
pnpm build                    # Build all packages first
pnpm uninstall cyrus-ai -g    # Remove published version
cd apps/cli                   # Navigate to CLI directory
pnpm install -g .            # Install local version globally
pnpm link -g .               # Link local development version
```

#### Electron App (`apps/electron/`)

```bash
# Development mode
pnpm dev

# Build for production
pnpm build:all

# Run electron in dev mode
pnpm electron:dev
```

#### Proxy App (`apps/proxy/`)

```bash
# Start proxy server
pnpm start

# Development mode with auto-restart
pnpm dev

# Run tests
pnpm test
```

### Package Commands (all packages follow same pattern)

```bash
# Build the package
pnpm build

# TypeScript type checking
pnpm typecheck

# Run tests
pnpm test        # Watch mode
pnpm test:run    # Run once

# Development mode (TypeScript watch)
pnpm dev
```

## Linear State Management

The agent automatically moves issues to the "started" state when assigned. Linear uses standardized state types:

- **State Types Reference**: <https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference/enums/ProjectStatusType>
- **Standard Types**: `triage`, `backlog`, `unstarted`, `started`, `completed`, `canceled`
- **Issue Assignment Behavior**: When an issue is assigned to the agent, it automatically transitions to a state with `type === 'started'` (In Progress)

## Important Development Notes

1. **Edge-Proxy Architecture**: The project is transitioning to separate OAuth/webhook handling from Claude processing.

2. **Dependencies**:
   - The claude-parser package requires `jq` to be installed on the system
   - Uses pnpm as package manager (v10.11.0)
   - TypeScript for all new packages

3. **Git Worktrees**: When processing issues, the agent creates separate git worktrees. If a `cyrus-setup.sh` script exists in the repository root, it's executed in new worktrees for project-specific initialization.

4. **Testing**: Uses Vitest for all packages. Run tests before committing changes.

## Development Workflow

When working on this codebase, follow these practices:

1. **Before submitting a Pull Request**:
   - Update `CHANGELOG.md` under the `## [Unreleased]` section with your changes
   - Use appropriate subsections: `### Added`, `### Changed`, `### Fixed`, `### Removed`
   - Include brief, clear descriptions of what was changed and why
   - Run `pnpm test:packages` to ensure all package tests pass
   - Run `pnpm typecheck` to verify TypeScript compilation
   - Consider running `pnpm build` to ensure the build succeeds

2. **Changelog Format**:
   - Follow [Keep a Changelog](https://keepachangelog.com/) format
   - **Focus only on end-user impact**: Write entries from the perspective of users running the `cyrus` CLI binary
   - Avoid technical implementation details, package names, or internal architecture changes
   - Be concise but descriptive about what users will experience differently
   - Group related changes together
   - Example: "New comments now feed into existing sessions" NOT "Implemented AsyncIterable<SDKUserMessage> for ClaudeRunner"

## Key Code Paths

- **Linear Integration**: `apps/cli/services/LinearIssueService.mjs`
- **Claude Execution**: `packages/claude-runner/src/ClaudeRunner.ts`
- **Session Management**: `packages/core/src/session/`
- **Edge Worker**: `packages/edge-worker/src/EdgeWorker.ts`
- **OAuth Flow**: `apps/proxy/src/services/OAuthService.mjs`

## Testing MCP Linear Integration

To test the Linear MCP (Model Context Protocol) integration in the claude-runner package:

1. **Setup Environment Variables**:

   ```bash
   cd packages/claude-runner
   # Create .env file with your Linear API token
   echo "LINEAR_API_TOKEN=your_linear_token_here" > .env
   ```

2. **Build the Package**:

   ```bash
   pnpm build
   ```

3. **Run the Test Script**:

   ```bash
   node test-scripts/simple-claude-runner-test.js
   ```

The test script demonstrates:

- Loading Linear API token from environment variables
- Configuring the official Linear HTTP MCP server
- Listing available MCP tools
- Using Linear MCP tools to fetch user info and issues
- Proper error handling and logging

The script will show:

- Whether the MCP server connects successfully
- What Linear tools are available
- Current user information
- Issues in your Linear workspace

This integration is automatically available in all Cyrus sessions - the EdgeWorker automatically configures the official Linear MCP server for each repository using its Linear token.

## Multi-Agent Platform Integration

Cyrus supports three primary agent execution platforms, each with distinct capabilities and use cases.

### Platform Comparison

| Feature | Claude Code | Codegen | Cursor |
|---------|------------|---------|--------|
| **Execution** | Local/Edge | Cloud | IDE-Integrated |
| **Best For** | Development tasks | PR reviews, CI/CD | Interactive coding |
| **Linear Integration** | Native (MCP) | API-based | API-based |
| **Session Management** | Manual/Automated | Automated | Manual |
| **Sandboxing** | Git worktrees | Cloud sandboxes | Local workspace |
| **Cost Model** | Token-based | Usage-based | Subscription |

### Claude Code Integration (Primary)

Claude Code (claude.ai/code) is the primary agent for Cyrus and powers the core functionality.

**Key Features:**
- Direct MCP (Model Context Protocol) integration with Linear
- Git worktree isolation for each issue
- Streaming output via NDJSON
- Conversation continuity with `--continue` flag
- Local and edge worker execution modes

**Usage in Cyrus:**
```typescript
// packages/claude-runner/src/ClaudeRunner.ts
const runner = new ClaudeRunner({
  workingDirectory: '/path/to/repo',
  apiKey: process.env.ANTHROPIC_API_KEY,
  mcpServers: {
    linear: {
      url: 'https://linear-mcp-server.com',
      apiKey: process.env.LINEAR_API_TOKEN
    }
  }
});

await runner.run({
  messages: [{ role: 'user', content: 'Fix the authentication bug' }],
  continueSession: true
});
```

**Configuration:**
- Environment variables: `ANTHROPIC_API_KEY`, `LINEAR_API_TOKEN`
- MCP servers configured via `mcpServers` parameter
- Tool restrictions via `allowedTools` array
- Session persistence with `.claude_history`

### Codegen Integration (Cloud Execution)

Codegen (codegen.com) provides cloud-based agent execution with advanced capabilities.

**Key Features:**
- PR auto-fixing and code review
- CI/CD checks integration (CircleCI, GitHub Actions)
- Cloud sandboxes with isolated execution environments
- Linear, Slack, Notion, Figma integrations
- Web search and database query capabilities
- Python SDK and REST API

**Core Capabilities:**
1. **PR Review Agent** - Automatic code review with suggestions
2. **Checks Auto-Fixer** - Fixes failing CI/CD checks automatically
3. **Issue-to-PR Workflow** - Takes Linear issues and creates PRs
4. **Background Execution** - Long-running tasks in cloud sandboxes
5. **Team Collaboration** - Multi-agent coordination

**API Integration:**
```typescript
// Future implementation for Codegen integration
import { CodegenClient } from '@codegen/sdk';

const codegen = new CodegenClient({
  apiKey: process.env.CODEGEN_API_KEY,
  organizationId: process.env.CODEGEN_ORG_ID
});

// Create agent run for Linear issue
const run = await codegen.agents.createRun({
  repository_id: repo.id,
  linear_issue_id: issue.id,
  prompt: `Fix issue: ${issue.title}\n\n${issue.description}`,
  integrations: {
    linear: { enabled: true },
    slack: { enabled: true }
  }
});

// Monitor run status
const status = await codegen.agents.getRun(run.id);
console.log(`Agent status: ${status.state}`);
```

**Codegen API Endpoints:**
- `POST /v1/organizations/{org_id}/agent/run` - Create agent run
- `GET /v1/organizations/{org_id}/agent/runs/{run_id}` - Get run status
- `GET /v1/organizations/{org_id}/agent/runs` - List all runs
- `POST /v1/organizations/{org_id}/agent/runs/{run_id}/resume` - Resume run
- `POST /v1/organizations/{org_id}/agent/remove-from-pr` - Remove agent from PR

**Integration Configuration:**
```typescript
// apps/cli/config/codegen.config.ts
export const codegenConfig = {
  organizationId: process.env.CODEGEN_ORG_ID,
  apiKey: process.env.CODEGEN_API_KEY,
  
  // Repository rules
  repositoryRules: {
    allowedTools: ['bash', 'edit', 'read', 'write'],
    restrictedPaths: ['node_modules/', '.git/', 'dist/'],
    maxExecutionTime: 600 // 10 minutes
  },
  
  // Model configuration
  modelConfig: {
    provider: 'anthropic', // or 'openai'
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.2
  },
  
  // Integrations
  integrations: {
    linear: {
      enabled: true,
      workspaceId: process.env.LINEAR_WORKSPACE_ID,
      autoCommentOnPR: true,
      autoTransitionStates: true
    },
    slack: {
      enabled: true,
      channelId: process.env.SLACK_CHANNEL_ID,
      notifyOnComplete: true
    },
    circleci: {
      enabled: true,
      autoFixFailingChecks: true
    }
  }
};
```

**Sandbox Configuration:**
```typescript
// Codegen sandbox setup commands
const setupCommands = [
  'npm install',
  'npm run build',
  'npm run test:setup'
];

// Environment variables for sandbox
const envVariables = {
  NODE_ENV: 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  API_KEY: process.env.API_KEY
};

// Secrets (encrypted in Codegen)
const secrets = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
};
```

**Webhooks:**
Codegen can send webhooks to Cyrus when agent runs complete:
```typescript
// apps/proxy/src/routes/webhooks/codegen.ts
export async function handleCodegenWebhook(req: Request) {
  const { event, run_id, status, pr_url } = req.body;
  
  if (event === 'agent_run.completed' && status === 'success') {
    // Update Linear issue
    await linear.issueUpdate(run.linear_issue_id, {
      stateId: 'DONE_STATE_ID'
    });
    
    // Post comment with PR link
    await linear.commentCreate({
      issueId: run.linear_issue_id,
      body: `✅ Codegen agent completed: ${pr_url}`
    });
  }
}
```

### Cursor Integration (IDE-Based)

Cursor (cursor.com) provides IDE-integrated agent capabilities with real-time collaboration.

**Key Features:**
- Background agents for autonomous task execution
- Inline code editing with AI assistance
- Tab autocomplete with context awareness
- Agent chat with planning and tools
- Git and GitHub integration
- Linear issue management from IDE

**Background Agents API:**
```typescript
// Cursor Background Agents API integration
const CURSOR_API_BASE = 'https://api.cursor.com/v1';

interface CursorAgent {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  created_at: string;
  task: string;
  conversation: Message[];
}

// List active agents
async function listCursorAgents(apiKey: string): Promise<CursorAgent[]> {
  const response = await fetch(`${CURSOR_API_BASE}/agents`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.json();
}

// Get agent status
async function getCursorAgentStatus(
  apiKey: string, 
  agentId: string
): Promise<CursorAgent> {
  const response = await fetch(`${CURSOR_API_BASE}/agents/${agentId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return response.json();
}

// Get agent conversation
async function getCursorAgentConversation(
  apiKey: string,
  agentId: string
): Promise<Message[]> {
  const response = await fetch(
    `${CURSOR_API_BASE}/agents/${agentId}/conversation`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }
  );
  return response.json();
}
```

**Cursor Configuration:**
```typescript
// .cursor/config.json
{
  "rules": [
    "Always follow TypeScript best practices",
    "Use pnpm for package management",
    "Run tests before committing",
    "Follow the monorepo structure"
  ],
  "memories": {
    "enabled": true,
    "storage": "local"
  },
  "integrations": {
    "linear": {
      "enabled": true,
      "workspace": process.env.LINEAR_WORKSPACE_ID
    },
    "github": {
      "enabled": true,
      "autoPR": true
    }
  },
  "modelConfig": {
    "defaultModel": "claude-3-5-sonnet-20241022",
    "temperature": 0.2
  }
}
```

**Cursor Rules File:**
```markdown
<!-- .cursorrules -->
# Cyrus Project Rules

## Code Standards
- Use TypeScript for all new code
- Follow existing architectural patterns
- Maintain test coverage above 80%
- Document public APIs with JSDoc

## Workflow
1. Create feature branch from main
2. Implement feature with tests
3. Run `pnpm test:packages` before committing
4. Create PR with descriptive title
5. Wait for CI checks to pass

## Linear Integration
- Always link commits to Linear issues
- Update issue status when starting work
- Comment on issues with progress updates
- Move to "In Review" when PR is created

## Agent Collaboration
- Mention @cyrus for architecture questions
- Mention @codegen for PR reviews
- Use Cursor for interactive development
```

### Multi-Agent Coordination Patterns

When multiple agents work on the same codebase, coordination is essential.

**Pattern 1: Sequential Handoff**
```typescript
// Agent 1 (Cursor) - Initial implementation
// Developer uses Cursor to implement feature interactively
// Result: Feature branch with initial implementation

// Agent 2 (Claude Code via Cyrus) - Testing and refinement
// Cyrus picks up the feature branch and adds tests
await cyrus.processIssue({
  issueId: 'CCB-123',
  task: 'Add comprehensive tests for new auth feature',
  baseBranch: 'feature/auth-implementation'
});

// Agent 3 (Codegen) - PR review and auto-fix
// Codegen reviews the PR and fixes any issues
await codegen.agents.createRun({
  type: 'pr_review',
  pr_url: 'https://github.com/org/repo/pull/456'
});
```

**Pattern 2: Parallel Execution**
```typescript
// Multiple agents work on different parts simultaneously
const tasks = [
  // Claude Code - Core logic
  cyrus.processIssue({
    issueId: 'CCB-124',
    task: 'Implement authentication service'
  }),
  
  // Codegen - Infrastructure
  codegen.agents.createRun({
    task: 'Set up database migrations for auth',
    label: 'infrastructure'
  }),
  
  // Cursor (manual) - UI components
  // Developer uses Cursor to build UI in parallel
];

await Promise.all(tasks);
```

**Pattern 3: Review and Refinement Loop**
```typescript
// Iterative improvement with multiple agents
let iteration = 0;
let approved = false;

while (!approved && iteration < 3) {
  // Implementation
  await cyrus.processIssue({
    issueId: 'CCB-125',
    continueSession: iteration > 0
  });
  
  // Review
  const review = await codegen.agents.createRun({
    type: 'pr_review',
    pr_url: latestPR
  });
  
  if (review.status === 'approved') {
    approved = true;
  } else {
    // Refinement
    await cyrus.processIssue({
      issueId: 'CCB-125',
      task: `Address review comments: ${review.comments.join(', ')}`
    });
  }
  
  iteration++;
}
```

**Pattern 4: Specialized Agent Routing**
```typescript
// Route issues to appropriate agent based on labels
async function routeIssueToAgent(issue: LinearIssue) {
  const labels = issue.labels.map(l => l.name);
  
  if (labels.includes('agent:cursor')) {
    // IDE-based interactive development
    console.log('👤 Route to developer using Cursor');
    await notifyDeveloper(issue);
  }
  else if (labels.includes('agent:codegen')) {
    // Cloud-based autonomous execution
    await codegen.agents.createRun({
      repository_id: issue.repository.id,
      linear_issue_id: issue.id,
      prompt: issue.description
    });
  }
  else if (labels.includes('agent:cyrus')) {
    // Local Claude Code execution
    await cyrus.processIssue({
      issueId: issue.identifier,
      task: issue.title
    });
  }
  else if (labels.includes('agent:multi')) {
    // Multi-agent collaboration
    await orchestrateMultiAgentTask(issue);
  }
}
```

### Agent Communication Protocol

Agents communicate through Linear issue comments and GitHub PR comments.

**Communication Format:**
```typescript
interface AgentMessage {
  agent: 'cyrus' | 'codegen' | 'cursor';
  type: 'status' | 'question' | 'handoff' | 'completion';
  content: string;
  metadata?: {
    sessionId?: string;
    prUrl?: string;
    commitSha?: string;
    reviewComments?: string[];
  };
}

// Example: Cyrus hands off to Codegen
await linear.commentCreate({
  issueId: 'CCB-123',
  body: `
🤖 **Cyrus Update**

**Status:** Implementation complete
**Type:** Handoff to Code Review

I've implemented the authentication service with the following changes:
- Created \`AuthService\` class with JWT support
- Added tests with 95% coverage
- Updated API documentation

**Next Steps:**
@codegen Please review the PR and run security checks.

**PR:** #456
**Commit:** abc123def
**Session:** cyrus-session-789

---
🤖 Generated by Cyrus (Claude Code Agent)
  `.trim()
});
```

### Environment Variables for Multi-Platform Support

```bash
# .env

# Claude Code (Primary)
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Codegen
CODEGEN_API_KEY=cg-...
CODEGEN_ORG_ID=org-...

# Cursor
CURSOR_API_KEY=cur-...
CURSOR_WORKSPACE_ID=ws-...

# Linear (Shared)
LINEAR_API_TOKEN=lin_api_...
LINEAR_WORKSPACE_ID=cyrus-workspace
LINEAR_TEAM_ID=CCB

# GitHub (Shared)
GITHUB_TOKEN=ghp_...
GITHUB_REPO=evgenygurin/cyrus-null

# Slack (Optional)
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C01234567

# CircleCI (Optional)
CIRCLECI_API_TOKEN=...
```

### Best Practices for Multi-Agent Development

1. **Clear Agent Assignment**
   - Use Linear labels to assign issues to specific agents
   - Document agent capabilities and limitations
   - Set expectations for response times

2. **Avoid Conflicts**
   - Use separate git worktrees or branches for each agent
   - Coordinate PR creation timing
   - Implement merge locks if needed

3. **Transparent Communication**
   - All agents post updates to Linear issues
   - Use structured message formats
   - Include session IDs and trace information

4. **Error Handling**
   - Agents should report failures clearly
   - Implement retry logic with backoff
   - Have human escalation paths

5. **Cost Management**
   - Monitor token usage across all platforms
   - Set budget limits per agent
   - Use cheaper models for simple tasks

6. **Security**
   - Encrypt all API keys and tokens
   - Use environment-specific credentials
   - Implement rate limiting
   - Audit agent actions regularly

## Publishing

**Important: Always publish packages in the correct order to ensure proper dependency resolution.**

### Pre-Publishing Checklist

1. **Update CHANGELOG.md**:
   - Move items from `## [Unreleased]` to a new versioned section
   - Use the CLI version number (e.g., `## [0.1.22] - 2025-01-06`)
   - Focus on end-user impact from the perspective of the `cyrus` CLI

2. **Commit all changes**:

   ```bash
   git add -A
   git commit -m "Prepare release v0.1.XX"
   git push
   ```

### Publishing Workflow

1. **Install dependencies from root**:

   ```bash
   pnpm install  # Ensures all workspace dependencies are up to date
   ```

2. **Build all packages from root first**:

   ```bash
   pnpm build  # Builds all packages to ensure dependencies are resolved
   ```

3. **Publish packages in dependency order**:

   **IMPORTANT**: Publish in this exact order to avoid dependency resolution issues:

   ```bash
   # 1. Packages with no internal dependencies
   cd packages/ndjson-client && pnpm publish --access public --no-git-checks
   cd ../..
   pnpm install  # Update lockfile

   # 2. Packages that depend on external deps only
   cd packages/claude-runner && pnpm publish --access public --no-git-checks
   cd ../..
   pnpm install  # Update lockfile

   # 3. Core package (depends on claude-runner)
   cd packages/core && pnpm publish --access public --no-git-checks
   cd ../..
   pnpm install  # Update lockfile

   # 4. Simple agent runner (depends on claude-runner)
   cd packages/simple-agent-runner && pnpm publish --access public --no-git-checks
   cd ../..
   pnpm install  # Update lockfile

   # 5. Edge worker (depends on core, claude-runner, ndjson-client, simple-agent-runner)
   cd packages/edge-worker && pnpm publish --access public --no-git-checks
   cd ../..
   pnpm install  # Update lockfile
   ```

4. **Finally publish the CLI**:

   ```bash
   pnpm install  # Final install to ensure all deps are latest
   cd apps/cli && pnpm publish --access public --no-git-checks
   cd ../..
   ```

5. **Create git tag and push**:

   ```bash
   git tag v0.1.XX
   git push origin <branch-name>
   git push origin v0.1.XX
   ```

**Key Notes:**

- Always use `--no-git-checks` flag to publish from feature branches
- Run `pnpm install` after each publish to update the lockfile
- The `simple-agent-runner` package MUST be published before `edge-worker`
- Build all packages once at the start, then publish without rebuilding
- This ensures `workspace:*` references resolve to published versions

---

## Codegen Platform Integration

### Overview

**Codegen** is an enterprise-grade platform for deploying AI code agents at scale. For comprehensive documentation, see [@docs/CODEGEN_AGENT_INSTRUCTIONS.md](docs/CODEGEN_AGENT_INSTRUCTIONS.md).

**Quick Start**:

```bash
# Install Codegen CLI
uv tool install codegen

# Authenticate
codegen login

# Run Claude Code with Codegen monitoring
codegen claude "your prompt here"
```

### Key Integration Points

#### 1. Linear Integration via Codegen

Codegen can monitor and process Linear issues similar to Cyrus:

```bash
# In Linear issue, assign to Codegen or mention
@codegen implement this feature following our architecture
```

**Benefits over Cyrus**:

- ✅ Enterprise-grade infrastructure (SOC 2 certified)
- ✅ Team visibility and analytics
- ✅ Multi-agent systems (parent/child agents)
- ✅ Automatic PR reviews
- ✅ Broader integrations (Slack, Jira, GitHub, etc.)

**Cyrus Advantages**:

- ✅ Lightweight, self-hosted
- ✅ Full control over execution
- ✅ Custom Linear workflow logic
- ✅ Direct Claude Code integration
- ✅ Git worktree isolation

#### 2. Using Codegen API for Automated Workflows

```typescript
// Example: Trigger Codegen agent from Cyrus for complex tasks
import { Agent } from 'codegen';

const agent = new Agent({
  org_id: process.env.CODEGEN_ORG_ID,
  token: process.env.CODEGEN_API_TOKEN
});

// Delegate complex multi-repo tasks to Codegen
const run = await agent.run({
  prompt: `
    Implement cross-service authentication:
    1. Update auth-service with JWT generation
    2. Update api-gateway with JWT validation
    3. Update user-service to verify tokens
    4. Add comprehensive tests to all services
  `,
  repo_id: 456,
  metadata: {
    source: 'cyrus',
    linear_issue: issueId
  }
});
```

#### 3. Complementary Use Cases

**Use Cyrus for**:

- Single-repository Linear workflows
- Custom Linear state management
- Tight Claude Code integration
- Development-specific Linear automations

**Use Codegen for**:

- Enterprise deployment at scale
- Multi-repository coordination
- Team collaboration features
- Advanced observability and analytics
- Automatic PR reviews
- Integration with multiple platforms (Slack, Jira, etc.)

### Setup Commands for Cyrus in Codegen

If using Codegen to manage Cyrus repository:

```bash
# .codegen/setup-commands.txt

# Install pnpm
npm install -g pnpm@10.11.0

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Install jq (required for claude-parser)
apt-get update && apt-get install -y jq

# Verify setup
pnpm typecheck
pnpm test:packages:run
```

### Prompting Patterns for Cyrus Development

When using Codegen agents to work on Cyrus:

```bash
# Good prompt example
Repository: cyrus-null
Branch: feature/add-slack-integration

Goal: Add Slack notification support to Cyrus agent

Tasks:
1. Create SlackNotificationService in packages/core/src/services/
2. Integrate with Linear webhook events
3. Send notifications when:
   - Issue assigned to agent
   - Agent starts processing
   - Agent completes work
   - PR created or updated
4. Add configuration for Slack webhook URL
5. Write comprehensive tests (90%+ coverage)
6. Update CHANGELOG.md under [Unreleased]

Context:
- Follow pattern in LinearIssueService (apps/cli/services/LinearIssueService.mjs)
- Use TypeScript for new services
- Maintain monorepo structure (packages vs apps)

Success Criteria:
- All existing tests pass
- New tests with 90%+ coverage
- TypeScript compilation succeeds
- CHANGELOG updated with user-facing changes
```

### Resources

- **Full Documentation**: [@docs/CODEGEN_AGENT_INSTRUCTIONS.md](docs/CODEGEN_AGENT_INSTRUCTIONS.md)
- **Codegen Platform**: <https://codegen.com>
- **API Documentation**: <https://docs.codegen.com>
- **Linear Integration**: <https://docs.codegen.com/integrations/linear.md>
- **Claude Code Integration**: <https://docs.codegen.com/capabilities/claude-code.md>
