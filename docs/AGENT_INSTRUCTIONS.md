# Cyrus Agent Instructions

**Version**: 1.0.0  
**Date**: 2025-01-20  
**Status**: Comprehensive Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Agent Workflow](#agent-workflow)
4. [Linear Integration](#linear-integration)
5. [Codegen Integration](#codegen-integration)
6. [Step-by-Step Procedures](#step-by-step-procedures)
7. [Best Practices](#best-practices)
8. [Error Handling](#error-handling)
9. [Examples](#examples)

---

## Overview

This document provides comprehensive instructions for Cyrus agents integrating Linear's issue tracking with Codegen's cloud execution platform. It combines insights from:

- **Linear Documentation** (`https://linear.app/llms.txt`)
- **Codegen Documentation** (`https://docs.codegen.com/llms.txt`)
- **Existing Cyrus Documentation** (UNIFIED_ARCHITECTURE.md, LINEAR_CONFIGURATION_GUIDE.md)

### What is Cyrus?

Cyrus is an intelligent agent system that:
1. Monitors Linear issues assigned to AI agents
2. Creates isolated execution environments (sandboxes)
3. Runs Claude Code or Codegen agents to process tasks
4. Posts responses back to Linear with full transparency
5. Maintains conversation continuity across sessions

---

## Core Principles

### 1. Agent Interaction Guidelines (AIG)

Based on Linear's official Agent Interaction Guidelines:

#### Disclosure
- **Always identify as AI**: Make it clear you are a bot, not a human
- **Use consistent naming**: "Cyrus Agent", "Codegen Bot", etc.
- **Transparent actions**: Every action should be visible and traceable

#### Native Platform Integration
- **Use Linear's native features**: Work within Linear's data model
- **Follow standard patterns**: Use established workflows and conventions
- **Respect platform conventions**: Honor issue states, labels, and relationships

#### Feedback and Transparency
- **Immediate acknowledgment**: Respond within 10 seconds of invocation
- **Progress updates**: Provide regular status updates for long-running tasks
- **Show reasoning**: Explain decisions and thought processes
- **Expose state changes**: Make all state transitions visible

#### User Control
- **Respect disengagement**: Stop immediately when asked
- **Request permission**: Ask before destructive or major actions
- **Allow intervention**: Users can override or cancel at any time
- **Clear re-engagement**: Only resume with explicit permission

#### Accountability
- **Human responsibility**: Final accountability stays with humans
- **Audit trails**: Maintain complete history of all actions
- **Blame-free errors**: Report failures constructively without deflection

---

## Agent Workflow

### Session Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    1. TRIGGER EVENT                         │
│  • Issue assigned to agent                                  │
│  • Agent @mentioned in comment                              │
│  • Webhook from GitHub/CircleCI/Sentry                      │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              2. SESSION CREATION (<10s)                     │
│  • Create AgentSession via Linear API                       │
│  • Set state to 'pending'                                   │
│  • Emit initial 'thought' activity: "Analyzing issue..."    │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              3. ISSUE STATE MANAGEMENT                      │
│  • Move issue to "In Progress" if not started               │
│  • Set agent as delegate                                    │
│  • Add relevant labels (agent:cyrus, type:*, domain:*)      │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              4. EXECUTION DECISION                          │
│  Decision: Local (ClaudeRunner) or Cloud (Codegen)?        │
│                                                              │
│  Use Cloud (Codegen) when:                                  │
│  • Repository has Codegen setup                             │
│  • Task requires isolated sandbox                           │
│  • Parallel execution needed                                │
│  • User explicitly requests cloud execution                 │
│                                                              │
│  Use Local (ClaudeRunner) when:                             │
│  • Repository not configured for Codegen                    │
│  • Simple tasks requiring git worktrees                     │
│  • Local debugging needed                                   │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              5. TASK EXECUTION                              │
│  A. Environment Setup                                       │
│     • Create git worktree (local) or Codegen sandbox        │
│     • Run setup commands (cyrus-setup.sh if exists)         │
│     • Configure MCP servers (Linear, GitHub, etc.)          │
│                                                              │
│  B. Continuous Updates (every major step)                   │
│     • Emit 'action' activities for tool usage               │
│     • Emit 'thought' activities for reasoning               │
│     • Update issue comments with progress                   │
│                                                              │
│  C. Handle User Input                                       │
│     • Emit 'elicitation' when clarification needed          │
│     • Set session state to 'awaitingInput'                  │
│     • Resume when user responds                             │
└─────────────────┬───────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              6. COMPLETION HANDLING                         │
│  Success Path:                                              │
│  • Emit 'response' activity with results                    │
│  • Move issue to "In Review" (if PR created)                │
│  • Move issue to "Done" (if no review needed)               │
│  • Add completion comment with summary                      │
│  • Set session state to 'complete'                          │
│                                                              │
│  Error Path:                                                │
│  • Emit 'error' activity with details                       │
│  • Keep issue in "In Progress" or move to "Blocked"         │
│  • Add error comment with troubleshooting steps             │
│  • Set session state to 'error'                             │
│                                                              │
│  Needs Input Path:                                          │
│  • Emit 'elicitation' activity with question                │
│  • Keep issue in "In Progress"                              │
│  • Set session state to 'awaitingInput'                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Linear Integration

### Authentication

**OAuth 2.0 Flow** (Recommended for apps):
```javascript
// 1. Redirect user to Linear OAuth
const authUrl = `https://linear.app/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `response_type=code&` +
  `scope=read,write,issues:create,comments:create,app:assignable,app:mentionable`;

// 2. Exchange code for token
const response = await fetch('https://api.linear.app/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),
});

const { access_token } = await response.json();
```

**Personal API Key** (Quick start):
```javascript
import { LinearClient } from '@linear/sdk';

const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});
```

### GraphQL API Essentials

#### Creating Issues
```graphql
mutation CreateIssue($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue {
      id
      identifier
      title
      url
      state {
        id
        name
        type
      }
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "teamId": "team_uuid",
    "title": "Implement authentication",
    "description": "## Requirements\n\n- OAuth2 flow\n- JWT tokens\n- Refresh logic",
    "priority": 1,
    "labelIds": ["label_uuid_1", "label_uuid_2"],
    "assigneeId": "agent_user_uuid"
  }
}
```

#### Updating Issue State
```graphql
mutation UpdateIssue($id: String!, $stateId: String!) {
  issueUpdate(id: $id, input: { stateId: $stateId }) {
    success
    issue {
      id
      state {
        name
        type
      }
    }
  }
}
```

#### Creating Agent Sessions
```graphql
mutation CreateAgentSession($input: AgentSessionCreateInput!) {
  agentSessionCreate(input: $input) {
    success
    session {
      id
      state
      issue {
        id
        identifier
      }
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "issueId": "issue_uuid",
    "agentId": "agent_user_uuid"
  }
}
```

#### Creating Agent Activities
```graphql
mutation CreateAgentActivity($input: AgentActivityCreateInput!) {
  agentActivityCreate(input: $input) {
    success
    activity {
      id
      type
      body
      createdAt
    }
  }
}
```

**Activity Types:**
- `thought` - Internal reasoning (collapsed by default in UI)
- `action` - Tool/command execution
- `response` - Final answer or completed work
- `elicitation` - Request for user input
- `error` - Error reporting

**Example Activities:**
```json
// Initial acknowledgment
{
  "input": {
    "sessionId": "session_uuid",
    "type": "thought",
    "body": "🤖 Received assignment, analyzing requirements..."
  }
}

// Tool execution
{
  "input": {
    "sessionId": "session_uuid",
    "type": "action",
    "body": "Running tests with `npm test`",
    "result": "✅ All tests passed (23/23)"
  }
}

// Request clarification
{
  "input": {
    "sessionId": "session_uuid",
    "type": "elicitation",
    "body": "Which API endpoint should I modify? `/api/auth/login` or `/api/auth/oauth`?"
  }
}

// Final response
{
  "input": {
    "sessionId": "session_uuid",
    "type": "response",
    "body": "✅ **Completed**\n\n**Changes:**\n- Implemented OAuth2 flow\n- Added JWT token generation\n- Created refresh token logic\n\n**PR:** https://github.com/org/repo/pull/123"
  }
}

// Error
{
  "input": {
    "sessionId": "session_uuid",
    "type": "error",
    "body": "❌ Build failed: Type error in `src/auth.ts:42`\n\nAttempted fixes:\n1. Checked imports ✅\n2. Ran type generation ✅\n3. Need clarification on User interface definition"
  }
}
```

### Webhooks

**Subscribe to Linear Events:**

```javascript
// Webhook payload structure
interface LinearWebhook {
  action: 'create' | 'update' | 'remove';
  type: 'Issue' | 'Comment' | 'IssueLabel' | 'Project';
  data: {
    id: string;
    // Entity-specific fields
  };
  url: string;
  webhookTimestamp: number;
}

// Handle issue assignment
if (webhook.type === 'Issue' && webhook.action === 'update') {
  const issue = webhook.data;
  
  if (issue.assignee?.id === AGENT_USER_ID) {
    // Agent was assigned - start work!
    await handleIssueAssignment(issue);
  }
}

// Handle @mentions in comments
if (webhook.type === 'Comment' && webhook.action === 'create') {
  const comment = webhook.data;
  
  if (comment.body.includes(`@${AGENT_USERNAME}`)) {
    // Agent was mentioned - respond!
    await handleMention(comment);
  }
}
```

**Register Webhook:**
```graphql
mutation CreateWebhook($input: WebhookCreateInput!) {
  webhookCreate(input: $input) {
    success
    webhook {
      id
      url
      enabled
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "url": "https://your-proxy.workers.dev/webhooks/linear",
    "resourceTypes": ["Issue", "Comment"],
    "teamId": "team_uuid"
  }
}
```

### TypeScript SDK Usage

```typescript
import { LinearClient } from '@linear/sdk';

// Initialize client
const linear = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

// Fetch issues assigned to agent
const assignedIssues = await linear.issues({
  filter: {
    assignee: { id: { eq: AGENT_USER_ID } },
    state: { type: { neq: 'completed' } },
  },
  orderBy: LinearDocument.PaginationOrderBy.UpdatedAt,
});

for (const issue of assignedIssues.nodes) {
  console.log(`${issue.identifier}: ${issue.title}`);
  
  // Create session
  const session = await linear.agentSessionCreate({
    issueId: issue.id,
    agentId: AGENT_USER_ID,
  });
  
  // Emit initial thought
  await linear.agentActivityCreate({
    sessionId: session.session!.id,
    type: 'thought',
    body: 'Analyzing issue...',
  });
  
  // Do work...
  await processIssue(issue, session.session!);
  
  // Complete
  await linear.agentActivityCreate({
    sessionId: session.session!.id,
    type: 'response',
    body: 'Work completed successfully!',
  });
}
```

### MCP Server

Linear provides an official MCP (Model Context Protocol) server that allows Claude and other AI assistants to interact with Linear directly.

**Installation:**
```bash
npm install @linear/mcp-server
```

**Configuration for Claude:**
```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key"
      }
    }
  }
}
```

**Available MCP Tools:**
- `linear_list_issues` - List and search issues
- `linear_get_issue` - Get issue details
- `linear_create_issue` - Create new issues
- `linear_update_issue` - Update issue properties
- `linear_add_comment` - Add comments to issues
- `linear_list_teams` - List workspace teams
- `linear_list_projects` - List projects
- `linear_search` - Full-text search

**Usage in Cyrus:**
```typescript
// Automatically configured in EdgeWorker for each repository
const mcpConfig = {
  command: 'npx',
  args: ['-y', '@linear/mcp-server'],
  env: {
    LINEAR_API_KEY: repository.linearToken,
  },
};

// Available to Claude in every session
// Claude can use: "Use the linear_list_issues tool to find related issues"
```

---

## Codegen Integration

### Codegen Platform Overview

Codegen (https://codegen.com) provides:
- **Cloud Execution**: Isolated sandboxes for running AI agents
- **Integrations**: Built-in GitHub, Linear, Sentry, CircleCI, etc.
- **MCP Support**: Native Model Context Protocol server support
- **Analytics**: Cost tracking, performance metrics, error monitoring
- **Web Preview**: Live preview of running applications
- **Setup Commands**: Automated environment configuration

### Authentication

```bash
# Get API token from https://codegen.com/settings/api-keys
export CODEGEN_API_KEY="your_api_key"
```

### Creating Agent Runs

**Via API:**
```bash
curl -X POST https://api.codegen.com/v1/agent-runs \
  -H "Authorization: Bearer $CODEGEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_uuid",
    "prompt": "Fix the failing tests in the authentication module",
    "repository": "owner/repo",
    "branch": "feature/auth-fix",
    "context": {
      "linear_issue": "CCB-123",
      "github_pr": "456"
    }
  }'
```

**Response:**
```json
{
  "agent_run_id": "run_uuid",
  "status": "running",
  "created_at": "2025-01-20T10:00:00Z",
  "sandbox_url": "https://sandbox-run-uuid.codegen.dev"
}
```

### Polling for Status

```bash
curl https://api.codegen.com/v1/agent-runs/run_uuid \
  -H "Authorization: Bearer $CODEGEN_API_KEY"
```

**Response:**
```json
{
  "agent_run_id": "run_uuid",
  "status": "completed",
  "result": {
    "success": true,
    "changes": [
      "src/auth/login.ts",
      "tests/auth.test.ts"
    ],
    "pr_url": "https://github.com/owner/repo/pull/457",
    "summary": "Fixed failing authentication tests by updating mock data"
  },
  "duration_seconds": 180,
  "cost_usd": 0.15
}
```

### Streaming Logs

```bash
curl https://api.codegen.com/v1/agent-runs/run_uuid/logs \
  -H "Authorization: Bearer $CODEGEN_API_KEY" \
  -H "Accept: text/event-stream"
```

**SSE Stream:**
```
event: log
data: {"timestamp": "2025-01-20T10:00:01Z", "message": "Cloning repository..."}

event: log
data: {"timestamp": "2025-01-20T10:00:05Z", "message": "Running setup commands..."}

event: log
data: {"timestamp": "2025-01-20T10:00:30Z", "message": "Analyzing test failures..."}

event: status
data: {"status": "running", "progress": 45}

event: log
data: {"timestamp": "2025-01-20T10:02:00Z", "message": "Creating PR..."}

event: complete
data: {"status": "completed", "pr_url": "https://github.com/owner/repo/pull/457"}
```

### Setup Commands

Codegen can automatically configure sandbox environments:

**In Repository Root: `codegen-setup.json`**
```json
{
  "commands": [
    "npm install",
    "npm run build",
    "cp .env.example .env"
  ],
  "environment": {
    "NODE_ENV": "development",
    "DATABASE_URL": "postgresql://sandbox:password@localhost:5432/testdb"
  },
  "services": [
    {
      "name": "postgres",
      "image": "postgres:15",
      "env": {
        "POSTGRES_PASSWORD": "password"
      }
    }
  ]
}
```

**Or Via API:**
```bash
curl -X POST https://api.codegen.com/v1/repositories/repo_id/setup-commands \
  -H "Authorization: Bearer $CODEGEN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": ["npm install", "npm run build"],
    "auto_detect": true
  }'
```

### Integrations

Codegen auto-configures integrations when repository is connected:

**GitHub:**
- Automatic PR creation
- Check suite status updates
- Branch protection integration
- PR review comments

**Linear:**
- Automatic issue updates
- Comment threading
- Status synchronization
- Label management

**Sentry:**
- Error tracking in sandbox
- Performance monitoring
- Release tagging

**CircleCI:**
- Workflow status
- Test result retrieval
- Artifact access

### MCP Servers in Codegen

Codegen natively supports MCP servers:

**Configure via UI or API:**
```json
{
  "mcp_servers": [
    {
      "name": "linear",
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_TOKEN}"
      }
    },
    {
      "name": "github",
      "command": "npx",
      "args": ["-y", "@github/mcp-server"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  ]
}
```

**Available in Agent Context:**
```typescript
// Claude can use MCP tools directly:
// "Use linear_create_issue to create a follow-up task"
// "Use github_create_pr_comment to request review"
```

---

## Step-by-Step Procedures

### Procedure 1: Handle New Issue Assignment

**Trigger**: Agent user is assigned to a Linear issue

**Steps:**

1. **Receive Webhook** (<1s)
   ```typescript
   const webhook = await parseLinearWebhook(request);
   if (webhook.type !== 'Issue' || webhook.action !== 'update') return;
   if (webhook.data.assignee?.id !== AGENT_USER_ID) return;
   ```

2. **Fetch Issue Details** (1-2s)
   ```typescript
   const issue = await linear.issue(webhook.data.id);
   const team = await issue.team;
   const state = await issue.state;
   const labels = await issue.labels();
   ```

3. **Create Agent Session** (1-2s)
   ```typescript
   const session = await linear.agentSessionCreate({
     issueId: issue.id,
     agentId: AGENT_USER_ID,
   });
   ```

4. **Immediate Acknowledgment** (<10s total)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.session!.id,
     type: 'thought',
     body: '🤖 Received assignment. Analyzing requirements...',
   });
   ```

5. **Update Issue State** (2-3s)
   ```typescript
   // Move to "In Progress" if not already started
   if (!['started', 'completed', 'canceled'].includes(state.type)) {
     const startedState = await team.states({
       filter: { type: { eq: 'started' } },
     });
     
     await linear.issueUpdate(issue.id, {
       stateId: startedState.nodes[0].id,
       delegateId: AGENT_USER_ID,
     });
   }
   ```

6. **Analyze Requirements** (5-10s)
   ```typescript
   const analysis = {
     title: issue.title,
     description: issue.description,
     labels: labels.nodes.map(l => l.name),
     priority: issue.priority,
     relatedIssues: await issue.relations(),
     attachments: await issue.attachments(),
   };
   
   await linear.agentActivityCreate({
     sessionId: session.session!.id,
     type: 'thought',
     body: `**Analysis Complete**\n\nTask: ${analysis.title}\nPriority: ${analysis.priority}\nLabels: ${analysis.labels.join(', ')}`,
   });
   ```

7. **Decide Execution Strategy** (1-2s)
   ```typescript
   const useCodegen = 
     repository.codegenEnabled &&
     (labels.includes('cloud-execution') || 
      repository.preferCodegen);
   
   if (useCodegen) {
     await executeViaCodegen(issue, session, analysis);
   } else {
     await executeViaLocal(issue, session, analysis);
   }
   ```

8. **Execute Task** (minutes to hours)
   - See Procedure 2 (Codegen) or Procedure 3 (Local)

9. **Post Completion** (5-10s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.session!.id,
     type: 'response',
     body: completionMessage,
   });
   
   await linear.issueUpdate(issue.id, {
     stateId: reviewStateId, // or doneStateId
   });
   
   await linear.agentSessionUpdate(session.session!.id, {
     state: 'complete',
   });
   ```

### Procedure 2: Execute Task via Codegen

**Prerequisites**: Repository configured with Codegen credentials

**Steps:**

1. **Prepare Prompt** (2-3s)
   ```typescript
   const prompt = buildCodegenPrompt({
     issueTitle: issue.title,
     issueDescription: issue.description,
     issueId: issue.identifier,
     context: {
       relatedFiles: await findRelatedFiles(issue),
       recentCommits: await getRecentCommits(repository),
       failingTests: await getFailingTests(issue),
     },
   });
   ```

2. **Create Agent Run** (1-2s)
   ```typescript
   const agentRun = await codegenClient.createAgentRun({
     organizationId: repository.codegenOrgId,
     prompt,
     repository: repository.fullName,
     branch: `${team.key}-${issue.number}`,
     context: {
       linearIssueId: issue.id,
       linearIssueIdentifier: issue.identifier,
       sessionId: session.session!.id,
     },
   });
   
   await linear.agentActivityCreate({
     sessionId: session.session!.id,
     type: 'action',
     body: `Starting cloud execution...\n\n[View Sandbox](${agentRun.sandboxUrl})`,
   });
   ```

3. **Stream Logs to Linear** (continuous)
   ```typescript
   const logStream = await codegenClient.streamLogs(agentRun.id);
   
   for await (const event of logStream) {
     if (event.type === 'log') {
       // Batch log updates every 30 seconds or 10 lines
       logBuffer.push(event.message);
       
       if (shouldFlushLogs()) {
         await linear.agentActivityCreate({
           sessionId: session.session!.id,
           type: 'action',
           body: '```\n' + logBuffer.join('\n') + '\n```',
         });
         logBuffer = [];
       }
     }
     
     if (event.type === 'status') {
       await linear.agentActivityCreate({
         sessionId: session.session!.id,
         type: 'thought',
         body: `Progress: ${event.progress}% - ${event.message}`,
       });
     }
   }
   ```

4. **Handle Completion** (5-10s)
   ```typescript
   const result = await codegenClient.getAgentRun(agentRun.id);
   
   if (result.status === 'completed' && result.result.success) {
     await linear.agentActivityCreate({
       sessionId: session.session!.id,
       type: 'response',
       body: formatSuccessMessage(result),
     });
     
     // Move to "In Review"
     await linear.issueUpdate(issue.id, {
       stateId: inReviewStateId,
     });
   } else if (result.status === 'failed') {
     await linear.agentActivityCreate({
       sessionId: session.session!.id,
       type: 'error',
       body: formatErrorMessage(result),
     });
   }
   ```

5. **Update Metrics** (1-2s)
   ```typescript
   await database.executionMetrics.create({
     sessionId: session.session!.id,
     executorType: 'codegen',
     durationSeconds: result.duration_seconds,
     costUsd: result.cost_usd,
     success: result.result.success,
     filesChanged: result.result.changes.length,
   });
   ```

### Procedure 3: Execute Task via Local ClaudeRunner

**Prerequisites**: Repository cloned locally, Claude CLI available

**Steps:**

1. **Create Git Worktree** (5-10s)
   ```typescript
   const branchName = `${team.key}-${issue.number}`;
   const worktreePath = path.join(WORKTREES_DIR, branchName);
   
   await git.worktreeAdd(worktreePath, branchName, {
     createBranch: true,
     base: 'main',
   });
   
   await linear.agentActivityCreate({
     sessionId: session.session!.id,
     type: 'action',
     body: `Created worktree at \`${worktreePath}\``,
   });
   ```

2. **Run Setup Script** (if exists) (10-60s)
   ```typescript
   const setupScript = path.join(repository.localPath, 'cyrus-setup.sh');
   
   if (await fs.exists(setupScript)) {
     await linear.agentActivityCreate({
       sessionId: session.session!.id,
       type: 'action',
       body: 'Running setup script...',
     });
     
     const setupResult = await exec('bash cyrus-setup.sh', {
       cwd: worktreePath,
     });
     
     await linear.agentActivityCreate({
       sessionId: session.session!.id,
       type: 'action',
       body: '```\n' + setupResult.stdout + '\n```',
     });
   }
   ```

3. **Build Prompt for Claude** (2-3s)
   ```typescript
   const claudePrompt = buildClaudePrompt({
     issueTitle: issue.title,
     issueDescription: issue.description,
     context: {
       recentComments: await getRecentComments(issue),
       relatedIssues: await issue.relations(),
       files: await findRelatedFiles(issue),
     },
   });
   ```

4. **Execute Claude Code** (minutes)
   ```typescript
   const claude = new ClaudeRunner({
     workingDirectory: worktreePath,
     mcpServers: [
       {
         name: 'linear',
         command: 'npx',
         args: ['-y', '@linear/mcp-server'],
         env: { LINEAR_API_KEY: repository.linearToken },
       },
     ],
   });
   
   for await (const message of claude.run(claudePrompt)) {
     if (message.type === 'tool_use') {
       await linear.agentActivityCreate({
         sessionId: session.session!.id,
         type: 'action',
         body: `Using tool: \`${message.tool}\`\n\n${message.description}`,
       });
     }
     
     if (message.type === 'text') {
       // Only send substantial text blocks to Linear
       if (message.content.length > 100) {
         await linear.agentActivityCreate({
           sessionId: session.session!.id,
           type: 'thought',
           body: message.content,
         });
       }
     }
   }
   ```

5. **Create PR** (if changes made) (10-20s)
   ```typescript
   const changes = await git.status(worktreePath);
   
   if (changes.modified.length > 0 || changes.created.length > 0) {
     await git.add('.', { cwd: worktreePath });
     await git.commit(`Fix ${issue.identifier}: ${issue.title}`, {
       cwd: worktreePath,
     });
     await git.push('origin', branchName, { cwd: worktreePath });
     
     const pr = await github.createPullRequest({
       owner: repository.owner,
       repo: repository.name,
       title: `Fix ${issue.identifier}: ${issue.title}`,
       body: `Fixes ${issue.identifier}\n\n${generatePRDescription(changes)}`,
       head: branchName,
       base: 'main',
     });
     
     await linear.agentActivityCreate({
       sessionId: session.session!.id,
       type: 'response',
       body: `✅ **Completed**\n\n**PR:** ${pr.html_url}`,
     });
   }
   ```

6. **Cleanup** (2-5s)
   ```typescript
   // Don't delete worktree immediately - keep for debugging
   // Schedule cleanup after 7 days or when PR is merged
   await scheduleWorktreeCleanup(worktreePath, {
     afterDays: 7,
     orWhenPRMerged: pr.number,
   });
   ```

### Procedure 4: Handle User Response (Continue Session)

**Trigger**: User comments on issue during active session

**Steps:**

1. **Receive Comment Webhook** (<1s)
   ```typescript
   const webhook = await parseLinearWebhook(request);
   if (webhook.type !== 'Comment' || webhook.action !== 'create') return;
   
   const comment = webhook.data;
   const issue = await linear.issue(comment.issueId);
   ```

2. **Find Active Session** (1-2s)
   ```typescript
   const activeSessions = await linear.agentSessions({
     filter: {
       issueId: { eq: issue.id },
       state: { in: ['active', 'awaitingInput'] },
     },
   });
   
   if (activeSessions.nodes.length === 0) {
     // No active session - ignore or start new one
     return;
   }
   
   const session = activeSessions.nodes[0];
   ```

3. **Check if Agent Mentioned** (0.5s)
   ```typescript
   const isMentioned = comment.body.includes(`@${AGENT_USERNAME}`);
   const isResponse = session.state === 'awaitingInput';
   
   if (!isMentioned && !isResponse) {
     // Not for this agent
     return;
   }
   ```

4. **Acknowledge Response** (<5s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'thought',
     body: '📨 Received your response, processing...',
   });
   ```

5. **Resume Execution** (depends on task)
   ```typescript
   // Get conversation history from agent activities
   const activities = await linear.agentActivities({
     filter: { sessionId: { eq: session.id } },
   });
   
   const conversationHistory = activities.nodes
     .filter(a => a.type !== 'thought')
     .map(a => ({
       role: 'assistant',
       content: a.body,
     }));
   
   // Add user's response
   conversationHistory.push({
     role: 'user',
     content: comment.body,
   });
   
   // Continue with executor
   if (session.metadata.executorType === 'codegen') {
     await resumeCodegenExecution(session, conversationHistory);
   } else {
     await resumeLocalExecution(session, conversationHistory);
   }
   ```

6. **Update Session State** (1s)
   ```typescript
   await linear.agentSessionUpdate(session.id, {
     state: 'active',
   });
   ```

### Procedure 5: Handle Stop Request

**Trigger**: User comments "stop", "cancel", "abort", or similar

**Steps:**

1. **Detect Stop Request** (0.5s)
   ```typescript
   const stopKeywords = [
     'stop', 'cancel', 'abort', 'disengage', 
     'halt', 'cease', 'terminate'
   ];
   
   const isStopRequest = stopKeywords.some(kw =>
     comment.body.toLowerCase().includes(kw)
   );
   
   if (!isStopRequest) return;
   ```

2. **Immediate Acknowledgment** (<2s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'response',
     body: '✋ Stopping immediately. Let me know if you need anything else!',
   });
   ```

3. **Terminate Execution** (2-5s)
   ```typescript
   if (session.metadata.executorType === 'codegen') {
     // Stop Codegen agent run
     await codegenClient.stopAgentRun(session.metadata.agentRunId);
   } else {
     // Kill local Claude process
     await claudeProcess.kill('SIGTERM');
   }
   ```

4. **Cleanup** (2-5s)
   ```typescript
   // Save current state for potential resume
   await database.sessionState.create({
     sessionId: session.id,
     state: 'cancelled_by_user',
     snapshot: await captureSessionSnapshot(session),
   });
   
   await linear.agentSessionUpdate(session.id, {
     state: 'complete',
   });
   ```

5. **No Further Actions** 
   ```typescript
   // Agent must not resume unless explicitly re-invited
   // User has full control
   ```

---

## Best Practices

### 1. Transparency in Every Action

**DO:**
```typescript
// Before major action
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'elicitation',
  body: `I'm about to modify the database schema. This will:\n\n` +
        `- Add 'refresh_token' column to users table\n\n` +
        `- Create 'oauth_sessions' table\n\n` +
        `- Add foreign key constraints\n\n` +
        `Reply "proceed" to continue or "stop" to review first.`,
});
```

**DON'T:**
```typescript
// Silent major action
await runMigration('add_refresh_tokens');
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'response',
  body: 'Done!', // User has no idea what happened
});
```

### 2. Conversation History via Activities (Not Comments)

**DO:**
```typescript
// Use agent activities for conversation
const history = await linear.agentActivities({
  filter: { sessionId: { eq: session.id } },
});

const conversationContext = history.nodes
  .filter(a => ['response', 'elicitation', 'action'].includes(a.type))
  .map(a => a.body)
  .join('\n\n');
```

**DON'T:**
```typescript
// Don't rely on issue comments - users can edit them!
const comments = await issue.comments();
const conversationContext = comments.nodes.map(c => c.body).join('\n\n');
```

### 3. Progressive Disclosure of Complexity

**DO:**
```typescript
// Start simple
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'thought',
  body: 'Analyzing authentication flow...',
});

// Add details as needed
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'thought',
  body: `**Analysis Details**\n\n` +
        `- Current: Session-based auth\n` +
        `- Proposed: JWT + refresh tokens\n` +
        `- Migration path: Gradual rollout`,
});
```

**DON'T:**
```typescript
// Overwhelming detail upfront
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'thought',
  body: '```\n' + JSON.stringify(massiveAnalysisObject, null, 2) + '\n```',
});
```

### 4. Error Communication

**DO:**
```typescript
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'error',
  body: `❌ **Build Failed**\n\n` +
        `**Error:** Type error in \`src/auth.ts:42\`\n\n` +
        `**Cause:** Missing type definition for User interface\n\n` +
        `**Attempted Fixes:**\n` +
        `1. ✅ Checked imports\n` +
        `2. ✅ Ran type generation\n` +
        `3. ❌ Type definition still missing\n\n` +
        `**Next Steps:**\n` +
        `Could you confirm the correct User interface definition?`,
});
```

**DON'T:**
```typescript
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'error',
  body: 'Error: TypeError on line 42', // No context, no next steps
});
```

### 5. Session Timeout Management

**DO:**
```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD = 25 * 60 * 1000; // 25 minutes

async function runWithTimeoutAwareness(session: Session) {
  const startTime = Date.now();
  
  while (workRemaining) {
    const elapsed = Date.now() - startTime;
    
    if (elapsed > WARNING_THRESHOLD && !warningShown) {
      await linear.agentActivityCreate({
        sessionId: session.id,
        type: 'elicitation',
        body: `⏰ Session nearing 30-minute timeout. Should I:\n\n` +
              `1. Continue in new session\n` +
              `2. Save progress and wait for confirmation\n` +
              `3. Push current changes as draft PR\n\n` +
              `Reply with option number.`,
      });
      warningShown = true;
      break;
    }
    
    await doWork();
  }
}
```

**DON'T:**
```typescript
// Work silently until timeout, then fail
while (workRemaining) {
  await doWork(); // Might timeout mid-task
}
```

### 6. Batch Updates for Performance

**DO:**
```typescript
const activityBatch = [];
let lastFlush = Date.now();

async function addActivity(activity: AgentActivity) {
  activityBatch.push(activity);
  
  const shouldFlush = 
    activityBatch.length >= 5 ||
    Date.now() - lastFlush > 30000 || // 30 seconds
    activity.type === 'response' || // Always flush responses
    activity.type === 'error'; // Always flush errors
  
  if (shouldFlush) {
    await flushActivities();
  }
}

async function flushActivities() {
  // Send all batched activities
  for (const activity of activityBatch) {
    await linear.agentActivityCreate(activity);
  }
  activityBatch = [];
  lastFlush = Date.now();
}
```

**DON'T:**
```typescript
// Create activity for every tiny step
await linear.agentActivityCreate({ body: 'Reading file...' });
await linear.agentActivityCreate({ body: 'Parsing JSON...' });
await linear.agentActivityCreate({ body: 'Validating schema...' });
// Too many updates, poor UX
```

### 7. Respect User Preferences

**DO:**
```typescript
// Check user preferences before acting
const userPrefs = await database.userPreferences.findUnique({
  where: { userId: issue.creator.id },
});

if (userPrefs.autoCreatePR) {
  await createPullRequest();
} else {
  await linear.agentActivityCreate({
    sessionId: session.id,
    type: 'elicitation',
    body: 'Changes ready. Should I create a PR?',
  });
}
```

**DON'T:**
```typescript
// Always assume user wants PR
await createPullRequest(); // User might want to review first
```

### 8. Label Everything

**DO:**
```typescript
// Add comprehensive labels
await linear.issueUpdate(issue.id, {
  labelIds: [
    ...existingLabelIds,
    labelMap.get('agent:cyrus'),
    labelMap.get('type:bugfix'),
    labelMap.get('domain:auth'),
    labelMap.get('priority:high'),
    labelMap.get('status:in-review'),
  ].filter(Boolean),
});
```

**DON'T:**
```typescript
// Sparse labeling
await linear.issueUpdate(issue.id, {
  labelIds: [labelMap.get('agent:cyrus')],
}); // Missing context labels
```

---

## Error Handling

### Common Error Scenarios

#### 1. Linear API Rate Limiting

**Error:**
```
GraphQLError: API rate limit exceeded
```

**Handling:**
```typescript
async function linearRequestWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('rate limit')) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
await linearRequestWithRetry(() => 
  linear.agentActivityCreate({ sessionId, type, body })
);
```

#### 2. Codegen Sandbox Failure

**Error:**
```json
{
  "status": "failed",
  "error": "Setup commands failed: npm install returned exit code 1"
}
```

**Handling:**
```typescript
if (agentRun.status === 'failed') {
  // Get detailed error
  const logs = await codegenClient.getLogs(agentRun.id);
  
  // Analyze error
  const errorAnalysis = analyzeSetupError(logs);
  
  await linear.agentActivityCreate({
    sessionId: session.id,
    type: 'error',
    body: `❌ **Sandbox Setup Failed**\n\n` +
          `**Error:** ${errorAnalysis.message}\n\n` +
          `**Likely Cause:** ${errorAnalysis.cause}\n\n` +
          `**Suggested Fix:** ${errorAnalysis.fix}\n\n` +
          `**Logs:**\n\`\`\`\n${errorAnalysis.relevantLogs}\n\`\`\`\n\n` +
          `Would you like me to:\n` +
          `1. Retry with different setup commands\n` +
          `2. Switch to local execution\n` +
          `3. Wait for manual fix`,
  });
  
  // Don't fail silently - ask for input
  await linear.agentSessionUpdate(session.id, {
    state: 'awaitingInput',
  });
}
```

#### 3. Git Merge Conflicts

**Error:**
```
CONFLICT (content): Merge conflict in src/auth.ts
```

**Handling:**
```typescript
try {
  await git.merge('main', { cwd: worktreePath });
} catch (error) {
  if (error.message.includes('CONFLICT')) {
    await linear.agentActivityCreate({
      sessionId: session.id,
      type: 'error',
      body: `⚠️ **Merge Conflict Detected**\n\n` +
            `**Files:**\n${getConflictedFiles(error)}\n\n` +
            `I can try to auto-resolve simple conflicts. ` +
            `For complex conflicts, manual review is recommended.\n\n` +
            `Reply:\n` +
            `- "auto-resolve" to let me attempt automatic resolution\n` +
            `- "manual" to handle conflicts yourself\n` +
            `- "rebase" to rebase instead of merge`,
    });
    
    await linear.agentSessionUpdate(session.id, {
      state: 'awaitingInput',
    });
  } else {
    throw error;
  }
}
```

#### 4. Session Timeout

**Error:**
```
Session expired: Cannot add activities after 30 minutes
```

**Handling:**
```typescript
async function ensureSessionValid(session: Session) {
  const elapsed = Date.now() - new Date(session.createdAt).getTime();
  
  if (elapsed > 30 * 60 * 1000) {
    // Create new session
    const newSession = await linear.agentSessionCreate({
      issueId: session.issueId,
      agentId: session.agentId,
      parentSessionId: session.id, // Link to previous session
    });
    
    await linear.agentActivityCreate({
      sessionId: newSession.session!.id,
      type: 'thought',
      body: `🔄 Continued from previous session (${session.id})`,
    });
    
    return newSession.session!;
  }
  
  return session;
}

// Use before every activity
session = await ensureSessionValid(session);
await linear.agentActivityCreate({ sessionId: session.id, ... });
```

#### 5. Network Failures

**Error:**
```
FetchError: request to https://api.linear.app/graphql failed
```

**Handling:**
```typescript
async function robustLinearRequest<T>(
  fn: () => Promise<T>
): Promise<T> {
  const maxAttempts = 3;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isNetworkError = 
        error.name === 'FetchError' ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT');
      
      if (isNetworkError && attempt < maxAttempts) {
        console.log(`Network error, attempt ${attempt}/${maxAttempts}`);
        await sleep(1000 * attempt); // Linear backoff
        continue;
      }
      
      // Not network error or max attempts reached
      throw error;
    }
  }
  
  throw new Error('Unreachable');
}
```

---

## Examples

### Example 1: Simple Bug Fix

**Linear Issue:**
```
CCB-101: Fix login validation error

Description:
Login form doesn't validate email format, allowing invalid emails.

Steps to reproduce:
1. Go to /login
2. Enter "not-an-email" in email field
3. Click login
4. No validation error shown

Expected: Show "Invalid email format" error
Actual: Form submits anyway
```

**Agent Workflow:**

1. **Assignment** (webhook received)
   ```typescript
   // Agent assigned to CCB-101
   ```

2. **Initial Response** (<10s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'thought',
     body: '🤖 Analyzing login validation issue...',
   });
   ```

3. **Analysis** (10-20s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'thought',
     body: `**Analysis Complete**\n\n` +
           `**Issue:** Email validation missing in login form\n` +
           `**Location:** Likely \`src/components/LoginForm.tsx\`\n` +
           `**Fix:** Add email regex validation\n` +
           `**Test:** Add unit test for validation`,
   });
   ```

4. **Execution** (2-3 minutes)
   ```typescript
   // Running via ClaudeRunner
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Analyzing LoginForm component...',
   });
   
   // Claude makes changes
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Added email validation:\n' +
           '```typescript\n' +
           'const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n' +
           'if (!emailRegex.test(email)) {\n' +
           '  setError("Invalid email format");\n' +
           '  return;\n' +
           '}\n' +
           '```',
   });
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Running tests...',
     result: '✅ All tests passed (3/3 new tests)',
   });
   ```

5. **PR Creation** (10-20s)
   ```typescript
   const pr = await github.createPullRequest({...});
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'response',
     body: `✅ **Fix Complete**\n\n` +
           `**Changes:**\n` +
           `- Added email format validation to LoginForm\n` +
           `- Added error message display\n` +
           `- Added 3 unit tests\n\n` +
           `**PR:** ${pr.html_url}\n\n` +
           `**Tests:** All passing ✅`,
   });
   ```

6. **State Update** (1-2s)
   ```typescript
   await linear.issueUpdate(issue.id, {
     stateId: inReviewStateId,
   });
   ```

### Example 2: Feature with Clarification Needed

**Linear Issue:**
```
CCB-102: Add OAuth login

Description:
Users should be able to login with Google OAuth.

Requirements:
- Google OAuth2 integration
- Store OAuth tokens
- Link to existing accounts
```

**Agent Workflow:**

1. **Assignment & Initial Analysis** (<10s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'thought',
     body: '🤖 Analyzing OAuth requirements...',
   });
   ```

2. **Identify Ambiguity** (15-20s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'elicitation',
     body: `**OAuth Implementation Questions**\n\n` +
           `I need clarification on a few points:\n\n` +
           `1. **Token Storage**: Where should I store refresh tokens?\n` +
           `   - Database (recommended for production)\n` +
           `   - Redis (faster, but needs setup)\n\n` +
           `2. **Account Linking**: What if email already exists?\n` +
           `   - Auto-link if email matches\n` +
           `   - Require explicit confirmation\n\n` +
           `3. **Scopes**: Which Google scopes do you need?\n` +
           `   - Just email + profile\n` +
           `   - Also calendar/drive access?\n\n` +
           `Please reply with your preferences!`,
   });
   
   await linear.agentSessionUpdate(session.id, {
     state: 'awaitingInput',
   });
   ```

3. **User Responds** (minutes to hours later)
   ```
   User comment: "Database storage, auto-link, just email + profile"
   ```

4. **Resume Execution** (<5s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'thought',
     body: '📨 Thanks! Proceeding with:\n' +
           '- Database token storage\n' +
           '- Auto-linking for matching emails\n' +
           '- Basic scopes (email, profile)',
   });
   
   await linear.agentSessionUpdate(session.id, {
     state: 'active',
   });
   ```

5. **Implementation** (5-10 minutes)
   ```typescript
   // Progress updates every major step
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Creating OAuth configuration...',
   });
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Adding database migration for oauth_tokens table...',
   });
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Implementing OAuth callback handler...',
   });
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Adding account linking logic...',
   });
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: 'Running tests...',
     result: '✅ 8/8 tests passing',
   });
   ```

6. **Completion** (10-20s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'response',
     body: `✅ **OAuth Implementation Complete**\n\n` +
           `**What I Built:**\n` +
           `- Google OAuth2 integration\n` +
           `- Database storage for tokens (encrypted)\n` +
           `- Auto-linking for existing emails\n` +
           `- Proper error handling\n\n` +
           `**Files Changed:**\n` +
           `- \`src/auth/oauth.ts\` (new)\n` +
           `- \`src/auth/callback.ts\` (new)\n` +
           `- \`migrations/add_oauth_tokens.sql\` (new)\n` +
           `- \`src/config/oauth.ts\` (new)\n\n` +
           `**Environment Variables Needed:**\n` +
           `\`\`\`\n` +
           `GOOGLE_CLIENT_ID=your_client_id\n` +
           `GOOGLE_CLIENT_SECRET=your_client_secret\n` +
           `OAUTH_CALLBACK_URL=https://yourapp.com/auth/callback\n` +
           `\`\`\`\n\n` +
           `**PR:** https://github.com/org/repo/pull/456\n\n` +
           `**Next Steps:**\n` +
           `1. Add environment variables to production\n` +
           `2. Run database migration\n` +
           `3. Test OAuth flow in staging`,
   });
   ```

### Example 3: Error Recovery

**Scenario:** Codegen sandbox fails during execution

**Workflow:**

1. **Start Execution** (normal)
   ```typescript
   const agentRun = await codegenClient.createAgentRun({...});
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: `Starting cloud execution...\n[Sandbox](${agentRun.sandboxUrl})`,
   });
   ```

2. **Setup Failure** (detected via polling)
   ```typescript
   const result = await codegenClient.getAgentRun(agentRun.id);
   // { status: 'failed', error: 'npm install failed' }
   ```

3. **Error Analysis** (2-3s)
   ```typescript
   const logs = await codegenClient.getLogs(agentRun.id);
   const analysis = analyzeError(logs);
   
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'error',
     body: `❌ **Sandbox Setup Failed**\n\n` +
           `**Error:** ${analysis.error}\n\n` +
           `**Cause:** ${analysis.cause}\n\n` +
           `**Logs:**\n\`\`\`\n${analysis.relevantLogs}\n\`\`\`\n\n` +
           `**I can try:**\n` +
           `1. Retry with npm ci instead of npm install\n` +
           `2. Use yarn instead\n` +
           `3. Switch to local execution\n\n` +
           `Reply with option number or "stop" to cancel.`,
   });
   
   await linear.agentSessionUpdate(session.id, {
     state: 'awaitingInput',
   });
   ```

4. **User Chooses Option** 
   ```
   User: "1"
   ```

5. **Retry with Fix** (5-10s)
   ```typescript
   await linear.agentActivityCreate({
     sessionId: session.id,
     type: 'action',
     body: '🔄 Retrying with `npm ci`...',
   });
   
   const retryRun = await codegenClient.createAgentRun({
     ...originalConfig,
     setupCommands: ['npm ci', 'npm run build'],
   });
   
   // Continue normally if succeeds
   ```

---

## Conclusion

This comprehensive guide provides the foundation for building reliable, transparent, and user-friendly AI agents with Cyrus. Key takeaways:

1. **Always be transparent**: Every action should be visible
2. **Respect user control**: Users can stop or redirect at any time
3. **Use proper channels**: Agent activities for conversation, not editable comments
4. **Handle errors gracefully**: Provide context, attempted fixes, and next steps
5. **Stay within timeouts**: Session activities expire after 30 minutes
6. **Label everything**: Use Linear's label system for categorization
7. **Choose the right executor**: Codegen for cloud, ClaudeRunner for local

### Resources

- **Linear Documentation**: https://linear.app/llms.txt
- **Linear Agent Guidelines**: https://linear.app/developers/aig.md
- **Linear GraphQL Schema**: https://studio.apollographql.com/public/Linear-API/schema/reference
- **Codegen Documentation**: https://docs.codegen.com/llms.txt
- **Cyrus Architecture**: docs/UNIFIED_ARCHITECTURE.md
- **Linear Configuration**: docs/LINEAR_CONFIGURATION_GUIDE.md

### Next Steps

1. Review existing Linear Configuration Guide
2. Set up Codegen integration for your repositories
3. Configure MCP servers (Linear, GitHub, etc.)
4. Test agent workflow end-to-end
5. Monitor execution metrics and costs
6. Iterate based on user feedback

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-20  
**Maintainer**: Cyrus Development Team
