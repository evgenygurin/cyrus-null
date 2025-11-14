# Codegen Integration Instructions for Claude Agent

This document provides step-by-step instructions for Claude agents working with Codegen.com integration in the Cyrus project.

**Last Updated**: 2025-01-14  
**Status**: ✅ Complete  
**Target Audience**: Claude Code agents, developers implementing Codegen integration

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Setup](#authentication--setup)
3. [Agent Run Workflow](#agent-run-workflow)
4. [API Integration Patterns](#api-integration-patterns)
5. [Sandbox & Environment Management](#sandbox--environment-management)
6. [Error Handling & Retries](#error-handling--retries)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Best Practices](#best-practices)
9. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

### What is Codegen?

Codegen is a cloud-based platform for running AI code agents at scale. It provides:

- **Managed execution environments** with sandboxed containers
- **Deep integrations** with GitHub, Linear, Slack, and other tools
- **Real-time monitoring** and analytics for agent runs
- **Granular permission controls** for security
- **Snapshot & caching** for faster iterations

### Integration Architecture

```
┌─────────────────────────────────────────────────┐
│         Cyrus Control Panel (Next.js)          │
│         REST API + PostgreSQL                   │
└──────────────────┬──────────────────────────────┘
                   │ Webhooks
                   ▼
┌─────────────────────────────────────────────────┐
│         Edge Proxy (Cloudflare Workers)        │
│         OAuth & Webhook Handler                 │
└──────────────────┬──────────────────────────────┘
                   │ NDJSON Stream
                   ▼
┌─────────────────────────────────────────────────┐
│         EdgeWorker + TaskOrchestrator          │
│         Strategy: Local or Cloud                │
└──────────────────┬──────────────────────────────┘
                   │ API Calls
                   ▼
┌─────────────────────────────────────────────────┐
│         Codegen Cloud Platform                  │
│         Agent Execution & Management            │
└─────────────────────────────────────────────────┘
```

---

## Authentication & Setup

### Step 1: Obtain API Credentials

**Location**: Settings → API Keys in Codegen dashboard

1. Navigate to https://codegen.com/settings/api-keys
2. Generate a new API token with appropriate scopes:
   - `agent:read` - Read agent run status
   - `agent:write` - Create and manage agent runs
   - `agent:execute` - Execute code in sandboxes
   - `organization:read` - Read organization settings

3. Store credentials securely:
   ```bash
   # Environment variable
   export CODEGEN_API_TOKEN="cgn_..."
   
   # Or in .env file
   echo "CODEGEN_API_TOKEN=cgn_..." >> .env
   ```

**Security Note**: Never commit API tokens to version control. Use environment variables or secret management services.

### Step 2: Configure Organization

**File**: `apps/proxy/config/codegen.json` or environment variables

```json
{
  "organizationId": "your-org-id",
  "apiToken": "${CODEGEN_API_TOKEN}",
  "apiBaseUrl": "https://api.codegen.com/v1",
  "defaultSettings": {
    "timeout": 300000,
    "maxRetries": 3,
    "sandboxType": "standard"
  }
}
```

**Environment Variables Alternative**:
```bash
CODEGEN_ORG_ID=your-org-id
CODEGEN_API_TOKEN=cgn_...
CODEGEN_API_BASE_URL=https://api.codegen.com/v1
CODEGEN_TIMEOUT=300000
CODEGEN_MAX_RETRIES=3
```

### Step 3: Initialize SDK

**Package**: `@codegen/sdk` (Python SDK also available)

```typescript
import { Agent } from '@codegen/sdk';

// Initialize agent client
const agent = new Agent({
  orgId: process.env.CODEGEN_ORG_ID,
  token: process.env.CODEGEN_API_TOKEN,
  baseUrl: process.env.CODEGEN_API_BASE_URL,
});

// Verify connection
try {
  const org = await agent.getOrganization();
  console.log('Connected to organization:', org.name);
} catch (error) {
  console.error('Failed to connect to Codegen:', error);
  throw error;
}
```

---

## Agent Run Workflow

### Step 1: Create an Agent Run

**API Endpoint**: `POST /v1/agent-runs`

```typescript
interface CreateAgentRunRequest {
  repositoryUrl: string;
  branch?: string;
  task: string;
  context?: Record<string, any>;
  files?: string[];
  settings?: {
    timeout?: number;
    machineType?: 'small' | 'medium' | 'large';
    permissions?: string[];
  };
}

// Create agent run
const run = await agent.createRun({
  repositoryUrl: 'https://github.com/org/repo',
  branch: 'main',
  task: 'Fix authentication bug in user login flow',
  context: {
    linearIssueId: 'LIN-123',
    priority: 'high',
    relatedFiles: ['src/auth/login.ts', 'src/middleware/auth.ts']
  },
  settings: {
    timeout: 600000, // 10 minutes
    machineType: 'medium',
    permissions: ['read', 'write', 'execute']
  }
});

console.log('Agent run created:', run.id);
```

**Response**:
```json
{
  "id": "run_abc123",
  "status": "pending",
  "repositoryUrl": "https://github.com/org/repo",
  "branch": "main",
  "task": "Fix authentication bug in user login flow",
  "createdAt": "2025-01-14T10:00:00Z",
  "sandboxId": "sandbox_xyz789"
}
```

### Step 2: Monitor Run Status

**API Endpoint**: `GET /v1/agent-runs/{id}`

```typescript
// Poll for status updates
async function monitorRun(runId: string): Promise<AgentRun> {
  let run = await agent.getRun(runId);
  
  while (run.status === 'pending' || run.status === 'running') {
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
    run = await agent.getRun(runId);
    
    console.log(`Run ${runId} status: ${run.status}`);
    
    // Log progress if available
    if (run.progress) {
      console.log(`Progress: ${run.progress.percentage}%`);
      console.log(`Current step: ${run.progress.currentStep}`);
    }
  }
  
  return run;
}

// Monitor the run
const completedRun = await monitorRun(run.id);
console.log('Run completed with status:', completedRun.status);
```

**Run Statuses**:
- `pending` - Queued, waiting for execution
- `running` - Currently executing
- `completed` - Successfully completed
- `failed` - Failed with error
- `cancelled` - Manually cancelled
- `timeout` - Exceeded time limit

### Step 3: Retrieve Results

```typescript
if (completedRun.status === 'completed') {
  // Get generated files
  const files = await agent.getRunFiles(completedRun.id);
  
  // Get pull request if created
  if (completedRun.pullRequestUrl) {
    console.log('Pull request created:', completedRun.pullRequestUrl);
  }
  
  // Get execution logs
  const logs = await agent.getRunLogs(completedRun.id);
  console.log('Execution logs:', logs);
  
  // Get cost breakdown
  if (completedRun.usage) {
    console.log('Cost:', completedRun.usage.totalCost);
    console.log('Tokens used:', completedRun.usage.tokensUsed);
    console.log('Execution time:', completedRun.usage.executionTime);
  }
}
```

### Step 4: Handle Completion

```typescript
// Post result to Linear
if (completedRun.pullRequestUrl) {
  await linearClient.addComment(
    linearIssueId,
    `✅ Agent run completed! Pull request: ${completedRun.pullRequestUrl}`
  );
} else if (completedRun.status === 'failed') {
  await linearClient.addComment(
    linearIssueId,
    `❌ Agent run failed: ${completedRun.error?.message}`
  );
}

// Update session state
await sessionManager.updateSession(sessionId, {
  codegenRunId: completedRun.id,
  status: completedRun.status,
  result: completedRun.result,
});
```

---

## API Integration Patterns

### Pattern 1: Synchronous Execution

**Use Case**: Simple tasks that complete quickly (<2 minutes)

```typescript
async function synchronousRun(task: string): Promise<AgentRunResult> {
  const run = await agent.createRun({
    repositoryUrl: config.repositoryUrl,
    task,
    settings: { timeout: 120000 } // 2 minutes
  });
  
  // Wait for completion
  const result = await agent.waitForCompletion(run.id);
  
  return result;
}
```

### Pattern 2: Asynchronous with Webhooks

**Use Case**: Long-running tasks that may take several minutes

```typescript
// Configure webhook
await agent.configureWebhook({
  url: 'https://your-proxy.example.com/webhooks/codegen',
  events: ['run.completed', 'run.failed'],
  secret: process.env.WEBHOOK_SECRET,
});

// Create run without waiting
const run = await agent.createRun({
  repositoryUrl: config.repositoryUrl,
  task,
  webhookUrl: 'https://your-proxy.example.com/webhooks/codegen',
});

// Webhook handler (in proxy app)
app.post('/webhooks/codegen', async (req, res) => {
  const signature = req.headers['x-codegen-signature'];
  
  // Verify signature
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = req.body;
  
  if (event.type === 'run.completed') {
    // Handle completion
    await handleRunCompletion(event.data);
  } else if (event.type === 'run.failed') {
    // Handle failure
    await handleRunFailure(event.data);
  }
  
  res.status(200).json({ received: true });
});
```

### Pattern 3: Streaming Updates

**Use Case**: Real-time progress monitoring for Control Panel

```typescript
async function* streamRunProgress(runId: string): AsyncGenerator<RunProgress> {
  const run = await agent.getRun(runId);
  yield { status: run.status, progress: run.progress };
  
  while (run.status === 'pending' || run.status === 'running') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const updatedRun = await agent.getRun(runId);
    
    if (updatedRun.updatedAt !== run.updatedAt) {
      yield {
        status: updatedRun.status,
        progress: updatedRun.progress,
        logs: updatedRun.latestLogs,
      };
    }
  }
  
  // Final update
  const finalRun = await agent.getRun(runId);
  yield {
    status: finalRun.status,
    progress: finalRun.progress,
    result: finalRun.result,
  };
}

// Usage in API endpoint
app.get('/api/runs/:id/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  for await (const update of streamRunProgress(req.params.id)) {
    res.write(`data: ${JSON.stringify(update)}\n\n`);
  }
  
  res.end();
});
```

---

## Sandbox & Environment Management

### Sandbox Types

Codegen provides different sandbox configurations:

```typescript
type SandboxType = 'standard' | 'gpu' | 'high-memory' | 'high-cpu';

interface SandboxConfig {
  type: SandboxType;
  memory: string; // e.g., '2GB', '8GB'
  cpu: number;    // Number of CPU cores
  timeout: number; // Max execution time in ms
  disk: string;   // e.g., '10GB'
  gpu?: {
    type: 'nvidia-t4' | 'nvidia-a100';
    count: number;
  };
}
```

**Choosing the Right Sandbox**:

- **Standard** (default): General-purpose tasks, small-medium codebases
  - 2GB RAM, 2 CPU cores, 10GB disk
  - Best for: Bug fixes, small features, documentation

- **GPU**: AI/ML tasks requiring GPU acceleration
  - 8GB RAM, 4 CPU cores, 20GB disk, 1x T4 GPU
  - Best for: Model training, image processing

- **High-memory**: Large codebases, memory-intensive tasks
  - 16GB RAM, 4 CPU cores, 20GB disk
  - Best for: Large refactoring, build processes

- **High-CPU**: Parallel processing, compilation
  - 4GB RAM, 8 CPU cores, 10GB disk
  - Best for: Test suites, parallel builds

### Environment Variables

```typescript
// Pass environment variables to sandbox
const run = await agent.createRun({
  repositoryUrl: config.repositoryUrl,
  task: 'Run integration tests',
  environment: {
    NODE_ENV: 'test',
    DATABASE_URL: process.env.TEST_DATABASE_URL,
    API_KEY: process.env.TEST_API_KEY,
  },
  settings: {
    sandboxType: 'standard',
  },
});
```

**Security Best Practices**:
- Only pass necessary environment variables
- Use test/staging credentials, never production
- Sanitize sensitive data from logs
- Rotate API keys regularly

### Pre-installed Tools

Codegen sandboxes come with:
- Node.js (18.x, 20.x)
- Python (3.10, 3.11, 3.12)
- Git, GitHub CLI
- Docker
- Common build tools (make, cmake, etc.)
- Package managers (npm, pnpm, yarn, pip, poetry)

---

## Error Handling & Retries

### Automatic Retries

```typescript
const run = await agent.createRun({
  repositoryUrl: config.repositoryUrl,
  task: 'Deploy to staging',
  settings: {
    maxRetries: 3,
    retryStrategy: 'exponential-backoff',
    retryableErrors: [
      'network-error',
      'timeout',
      'rate-limit',
      'sandbox-unavailable',
    ],
  },
});
```

### Manual Error Handling

```typescript
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

function isRetryableError(error: any): boolean {
  const retryableCodes = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'NETWORK_ERROR',
    'RATE_LIMIT',
  ];
  
  return (
    retryableCodes.includes(error.code) ||
    (error.response?.status >= 500 && error.response?.status < 600) ||
    error.response?.status === 429 // Rate limit
  );
}

// Usage
const run = await executeWithRetry(() =>
  agent.createRun({
    repositoryUrl: config.repositoryUrl,
    task: 'Fix bug',
  })
);
```

### Error Recovery Strategies

```typescript
async function handleRunFailure(run: AgentRun): Promise<void> {
  const error = run.error;
  
  switch (error?.type) {
    case 'timeout':
      // Increase timeout and retry
      await agent.createRun({
        ...run.config,
        settings: {
          ...run.config.settings,
          timeout: run.config.settings.timeout * 2,
        },
      });
      break;
      
    case 'out-of-memory':
      // Upgrade to high-memory sandbox
      await agent.createRun({
        ...run.config,
        settings: {
          ...run.config.settings,
          sandboxType: 'high-memory',
        },
      });
      break;
      
    case 'compilation-error':
    case 'test-failure':
      // Post error details to Linear for human review
      await linearClient.addComment(
        run.context.linearIssueId,
        `❌ Agent run failed:\n\`\`\`\n${error.message}\n\`\`\`\n\nLogs: ${run.logsUrl}`
      );
      break;
      
    default:
      // Generic error handling
      console.error('Agent run failed:', error);
      throw error;
  }
}
```

---

## Monitoring & Analytics

### Run Metrics

```typescript
// Get run metrics
const metrics = await agent.getRunMetrics(runId);

console.log('Execution time:', metrics.executionTime);
console.log('CPU usage:', metrics.cpuUsage);
console.log('Memory usage:', metrics.memoryUsage);
console.log('API calls:', metrics.apiCalls);
console.log('Tokens used:', metrics.tokensUsed);
console.log('Cost:', metrics.cost);
```

### Organization Analytics

```typescript
// Get organization-wide analytics
const analytics = await agent.getAnalytics({
  startDate: '2025-01-01',
  endDate: '2025-01-14',
  groupBy: 'day',
});

console.log('Total runs:', analytics.totalRuns);
console.log('Success rate:', analytics.successRate);
console.log('Average execution time:', analytics.avgExecutionTime);
console.log('Total cost:', analytics.totalCost);
console.log('Top repositories:', analytics.topRepositories);
```

### Real-time Monitoring

```typescript
// Subscribe to run events
const unsubscribe = agent.subscribeToRun(runId, (event) => {
  switch (event.type) {
    case 'status-change':
      console.log('Status changed to:', event.data.status);
      break;
      
    case 'progress-update':
      console.log('Progress:', event.data.percentage, '%');
      break;
      
    case 'log-entry':
      console.log('[LOG]', event.data.message);
      break;
      
    case 'error':
      console.error('[ERROR]', event.data.error);
      break;
  }
});

// Cleanup when done
process.on('SIGINT', () => {
  unsubscribe();
});
```

---

## Best Practices

### 1. Task Description Quality

**❌ Bad**:
```typescript
await agent.createRun({
  task: 'Fix bug',
});
```

**✅ Good**:
```typescript
await agent.createRun({
  task: 'Fix authentication bug where users are logged out after 5 minutes. The issue is in src/auth/session.ts. The session timeout constant should be 60 minutes, not 5.',
  context: {
    issueUrl: 'https://linear.app/team/issue/ABC-123',
    affectedFiles: ['src/auth/session.ts', 'src/middleware/auth.ts'],
    reproSteps: 'Login → Wait 5 minutes → Try to access protected route',
  },
});
```

### 2. Context Enrichment

Provide rich context for better results:

```typescript
await agent.createRun({
  task: 'Add user profile page',
  context: {
    // Related issue/PR context
    linearIssue: {
      id: 'LIN-123',
      title: 'User profile page',
      description: '...',
      comments: [...],
    },
    
    // Relevant files
    files: [
      'src/pages/profile.tsx',
      'src/components/UserCard.tsx',
      'src/api/user.ts',
    ],
    
    // Code snippets
    examples: {
      component: 'See similar pattern in src/pages/settings.tsx',
      api: 'Use existing API client in src/api/client.ts',
    },
    
    // Requirements
    requirements: [
      'Use existing design system components',
      'Follow accessibility guidelines (WCAG 2.1 AA)',
      'Add unit tests',
    ],
  },
});
```

### 3. Resource Management

```typescript
// Use appropriate sandbox size
const sandboxType = determineSandboxType(task);

async function determineSandboxType(task: string): Promise<SandboxType> {
  if (task.includes('test') || task.includes('build')) {
    return 'high-cpu';
  }
  
  if (task.includes('refactor') || task.includes('migration')) {
    return 'high-memory';
  }
  
  if (task.includes('image') || task.includes('ml')) {
    return 'gpu';
  }
  
  return 'standard';
}
```

### 4. Cost Optimization

```typescript
// Estimate cost before execution
const estimate = await agent.estimateCost({
  task: 'Refactor authentication module',
  repositoryUrl: config.repositoryUrl,
  settings: {
    sandboxType: 'standard',
    timeout: 600000,
  },
});

console.log('Estimated cost:', estimate.cost);
console.log('Estimated time:', estimate.executionTime);

// Only proceed if cost is acceptable
if (estimate.cost > 5.00) {
  console.warn('Cost exceeds threshold, requires approval');
  await requestApproval(estimate);
}
```

### 5. Idempotency

```typescript
// Use idempotency key to prevent duplicate runs
const idempotencyKey = `linear-${linearIssueId}-${Date.now()}`;

const run = await agent.createRun({
  idempotencyKey,
  repositoryUrl: config.repositoryUrl,
  task: 'Fix bug',
});

// If run already exists with this key, returns existing run
```

---

## Common Issues & Solutions

### Issue 1: Timeout Errors

**Symptoms**: Runs consistently timeout before completion

**Solutions**:
1. Increase timeout setting
2. Break task into smaller sub-tasks
3. Optimize repository (remove large files, reduce dependencies)
4. Use high-CPU sandbox for parallel processing

```typescript
// Before: Task too large
await agent.createRun({
  task: 'Refactor entire authentication system',
  settings: { timeout: 300000 } // 5 minutes - likely to timeout
});

// After: Break into smaller tasks
const tasks = [
  'Refactor session management in src/auth/session.ts',
  'Refactor token validation in src/auth/token.ts',
  'Update authentication middleware in src/middleware/auth.ts',
];

for (const task of tasks) {
  await agent.createRun({
    task,
    settings: { timeout: 180000 } // 3 minutes per task
  });
}
```

### Issue 2: Rate Limiting

**Symptoms**: `429 Too Many Requests` errors

**Solutions**:
1. Implement exponential backoff
2. Use queue system for multiple runs
3. Upgrade plan for higher rate limits
4. Batch operations where possible

```typescript
// Queue implementation
class AgentRunQueue {
  private queue: AgentRunRequest[] = [];
  private processing = false;
  private rateLimitDelay = 1000; // 1 second between runs
  
  async enqueue(request: AgentRunRequest): Promise<AgentRun> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        ...request,
        resolve,
        reject,
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      
      try {
        const run = await agent.createRun(request);
        request.resolve(run);
      } catch (error) {
        if (error.response?.status === 429) {
          // Rate limited, put back in queue
          this.queue.unshift(request);
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        } else {
          request.reject(error);
        }
      }
      
      // Delay between runs
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
    }
    
    this.processing = false;
  }
}
```

### Issue 3: Permission Errors

**Symptoms**: Agent cannot read/write files or access APIs

**Solutions**:
1. Review and update agent permissions
2. Ensure OAuth tokens have correct scopes
3. Check repository access settings

```typescript
// Grant specific permissions
await agent.createRun({
  task: 'Create PR with bug fix',
  settings: {
    permissions: [
      'repository:read',
      'repository:write',
      'pull_request:create',
      'pull_request:review',
    ],
  },
});
```

### Issue 4: Sandbox Environment Issues

**Symptoms**: Missing dependencies, build failures

**Solutions**:
1. Use setup scripts to install dependencies
2. Cache dependencies for faster execution
3. Specify exact versions in package.json

```typescript
await agent.createRun({
  task: 'Run tests',
  setup: {
    // Install dependencies before task execution
    commands: [
      'pnpm install --frozen-lockfile',
      'pnpm build',
    ],
    cacheKey: 'node-modules-v1', // Cache for faster subsequent runs
  },
});
```

---

## Summary Checklist

When integrating Codegen in Cyrus:

- [ ] Obtain and securely store API credentials
- [ ] Configure organization settings
- [ ] Initialize SDK with proper error handling
- [ ] Choose appropriate sandbox type for each task
- [ ] Provide rich, detailed task descriptions with context
- [ ] Implement proper error handling and retries
- [ ] Set up monitoring and analytics
- [ ] Configure webhooks for asynchronous operations
- [ ] Implement cost estimation and approval flows
- [ ] Use idempotency keys to prevent duplicate runs
- [ ] Test with small tasks before scaling up
- [ ] Monitor rate limits and implement queue if needed
- [ ] Review and update agent permissions regularly
- [ ] Document any custom configurations or workarounds

---

## Additional Resources

- **Codegen Documentation**: https://docs.codegen.com
- **Codegen API Reference**: https://docs.codegen.com/api
- **Codegen Python SDK**: https://github.com/codegen-sh/codegen
- **Cyrus Architecture**: See `docs/UNIFIED_ARCHITECTURE.md`
- **Edge Worker Implementation**: See `packages/edge-worker/README.md`

---

**Version**: 1.0.0  
**Maintained by**: Cyrus Development Team  
**Questions?**: Open an issue on GitHub or contact the team on Slack
