# Trigger.dev Integration Instructions for Claude Agent

This document provides step-by-step instructions for Claude agents working with Trigger.dev integration for background job processing and task orchestration in the Cyrus project.

**Last Updated**: 2025-01-14  
**Status**: ✅ Complete  
**Target Audience**: Claude Code agents, developers implementing background job processing

---

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Task Definition Patterns](#task-definition-patterns)
4. [Job Scheduling & Cron](#job-scheduling--cron)
5. [Error Handling & Retries](#error-handling--retries)
6. [Queues & Concurrency](#queues--concurrency)
7. [Monitoring & Observability](#monitoring--observability)
8. [AI Agent Workflows](#ai-agent-workflows)
9. [Deployment Strategies](#deployment-strategies)
10. [Best Practices](#best-practices)
11. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

### What is Trigger.dev?

Trigger.dev is an open-source task orchestration and background job platform designed for TypeScript/JavaScript applications. It provides:

- **Long-running tasks** with no timeouts
- **Automatic retries** with configurable strategies
- **Queue management** and concurrency control
- **Built-in observability** with detailed tracing
- **Elastic scaling** for production workloads
- **AI workflow support** with streaming and multi-step orchestration
- **Cron scheduling** for recurring tasks

### Why Use Trigger.dev in Cyrus?

Cyrus can leverage Trigger.dev for:

1. **Background Processing**: Linear webhook handlers, GitHub PR creation
2. **Scheduled Tasks**: Periodic issue polling, cleanup jobs, analytics
3. **AI Workflows**: Multi-step agent orchestration, RAG pipelines
4. **Long-running Operations**: Large codebase analysis, comprehensive testing
5. **Reliable Execution**: Critical tasks that must not fail (notifications, deployments)

### Integration Architecture

```
┌─────────────────────────────────────────────────┐
│         Cyrus Control Panel (Next.js)          │
│         User Interface & API                    │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/Webhooks
                   ▼
┌─────────────────────────────────────────────────┐
│         Edge Proxy (Cloudflare Workers)        │
│         Webhook Handler                         │
└──────────────────┬──────────────────────────────┘
                   │ Trigger Jobs
                   ▼
┌─────────────────────────────────────────────────┐
│         Trigger.dev Platform                    │
│         Task Queue & Execution                  │
└──────────────────┬──────────────────────────────┘
                   │ Execute Tasks
                   ▼
┌─────────────────────────────────────────────────┐
│         EdgeWorker / ClaudeRunner              │
│         Background Execution                    │
└─────────────────────────────────────────────────┘
```

---

## Setup & Configuration

### Step 1: Install Dependencies

```bash
# Install Trigger.dev SDK
pnpm add @trigger.dev/sdk@^3.0.0

# Install development CLI
pnpm add -D @trigger.dev/cli
```

### Step 2: Initialize Project

```bash
# Initialize Trigger.dev in your workspace
cd apps/proxy  # Or appropriate location
pnpm trigger.dev init

# This creates:
# - trigger.config.ts (configuration file)
# - trigger/ directory (task definitions)
```

### Step 3: Configure trigger.config.ts

**File**: `apps/proxy/trigger.config.ts`

```typescript
import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  // Project ID from Trigger.dev dashboard
  project: process.env.TRIGGER_PROJECT_ID || 'proj_cyrus_...',
  
  // API key for authentication
  apiKey: process.env.TRIGGER_API_KEY,
  
  // Build configuration
  build: {
    extensions: ['@trigger.dev/build/extensions/core'],
  },
  
  // Runtime configuration
  runtime: {
    // Maximum execution time (no limit for Trigger.dev)
    maxDuration: undefined,
    
    // Memory allocation
    memory: '2GB',
  },
  
  // Retry configuration
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  
  // Directories
  dirs: ['./trigger'],
});
```

### Step 4: Environment Variables

**File**: `.env` or `.env.local`

```bash
# Trigger.dev credentials
TRIGGER_PROJECT_ID=proj_cyrus_abc123
TRIGGER_API_KEY=tr_dev_...  # Development key
TRIGGER_SECRET_KEY=tr_sec_... # For webhook verification

# Runtime configuration
TRIGGER_RUNTIME_ENV=development  # or 'staging', 'production'

# Optional: Custom endpoint (for self-hosted)
TRIGGER_API_URL=https://api.trigger.dev
```

### Step 5: Verify Setup

```bash
# Test connection
pnpm trigger.dev whoami

# List environments
pnpm trigger.dev env list

# Run in development mode
pnpm trigger.dev dev
```

---

## Task Definition Patterns

### Pattern 1: Simple Background Task

**File**: `apps/proxy/trigger/linear-webhook-handler.ts`

```typescript
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

// Define input schema with Zod
const linearWebhookSchema = z.object({
  action: z.enum(['create', 'update', 'remove']),
  type: z.literal('Issue'),
  data: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    state: z.string(),
  }),
  webhookId: z.string(),
});

// Define task
export const handleLinearWebhook = task({
  id: 'linear-webhook-handler',
  schema: linearWebhookSchema,
  run: async (payload, { ctx }) => {
    const { action, data } = payload;
    
    console.log(`[${ctx.run.id}] Processing Linear webhook: ${action} for issue ${data.id}`);
    
    // Handle different actions
    switch (action) {
      case 'create':
        await handleIssueCreated(data);
        break;
      
      case 'update':
        await handleIssueUpdated(data);
        break;
      
      case 'remove':
        await handleIssueRemoved(data);
        break;
    }
    
    return {
      success: true,
      issueId: data.id,
      action,
      processedAt: new Date().toISOString(),
    };
  },
});

async function handleIssueCreated(issue: any) {
  // Check if assigned to agent
  if (issue.assigneeId === process.env.CYRUS_AGENT_ID) {
    console.log('Issue assigned to agent, creating session...');
    
    // Create new session
    await sessionManager.createSession({
      linearIssueId: issue.id,
      title: issue.title,
      description: issue.description,
      status: 'pending',
    });
  }
}

async function handleIssueUpdated(issue: any) {
  // Update existing session
  await sessionManager.updateSession(issue.id, {
    title: issue.title,
    description: issue.description,
    state: issue.state,
  });
}

async function handleIssueRemoved(issue: any) {
  // Archive session
  await sessionManager.archiveSession(issue.id);
}
```

### Pattern 2: Task with Subtasks

**File**: `apps/proxy/trigger/process-large-codebase.ts`

```typescript
import { task, runs } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

const processCodebaseSchema = z.object({
  repositoryUrl: z.string().url(),
  branch: z.string().default('main'),
  analysisType: z.enum(['security', 'quality', 'dependencies', 'all']),
});

// Parent task
export const processLargeCodebase = task({
  id: 'process-large-codebase',
  schema: processCodebaseSchema,
  run: async (payload, { ctx }) => {
    const { repositoryUrl, branch, analysisType } = payload;
    
    console.log(`Starting codebase analysis for ${repositoryUrl}`);
    
    // Clone repository
    const repoPath = await cloneRepository(repositoryUrl, branch);
    
    // Get all files
    const files = await getSourceFiles(repoPath);
    console.log(`Found ${files.length} source files`);
    
    // Split into batches
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    // Trigger subtasks in parallel
    const subtaskRuns = await Promise.all(
      batches.map((batch, index) =>
        runs.trigger(analyzeFilesBatch, {
          batch,
          batchIndex: index,
          analysisType,
          repositoryUrl,
        })
      )
    );
    
    console.log(`Triggered ${subtaskRuns.length} batch analysis tasks`);
    
    // Wait for all subtasks to complete
    const results = await Promise.all(
      subtaskRuns.map(run => runs.poll(run, { pollIntervalMs: 1000 }))
    );
    
    // Aggregate results
    const aggregated = aggregateAnalysisResults(results);
    
    // Generate report
    const reportUrl = await generateReport(aggregated, repositoryUrl);
    
    return {
      success: true,
      totalFiles: files.length,
      batchesProcessed: batches.length,
      reportUrl,
      summary: aggregated.summary,
    };
  },
});

// Subtask for batch processing
export const analyzeFilesBatch = task({
  id: 'analyze-files-batch',
  schema: z.object({
    batch: z.array(z.string()),
    batchIndex: z.number(),
    analysisType: z.enum(['security', 'quality', 'dependencies', 'all']),
    repositoryUrl: z.string(),
  }),
  run: async (payload) => {
    const { batch, batchIndex, analysisType } = payload;
    
    console.log(`Analyzing batch ${batchIndex} (${batch.length} files)`);
    
    const results = [];
    
    for (const file of batch) {
      // Analyze each file
      const analysis = await analyzeFile(file, analysisType);
      results.push(analysis);
    }
    
    return {
      batchIndex,
      filesAnalyzed: batch.length,
      results,
    };
  },
});
```

### Pattern 3: AI Agent Workflow

**File**: `apps/proxy/trigger/ai-code-review.ts`

```typescript
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

const codeReviewSchema = z.object({
  pullRequestUrl: z.string().url(),
  repositoryUrl: z.string().url(),
  files: z.array(z.object({
    path: z.string(),
    diff: z.string(),
  })),
});

export const aiCodeReview = task({
  id: 'ai-code-review',
  schema: codeReviewSchema,
  run: async (payload, { ctx }) => {
    const { pullRequestUrl, files } = payload;
    
    console.log(`Starting AI code review for ${pullRequestUrl}`);
    
    const reviews = [];
    
    // Review each file
    for (const file of files) {
      console.log(`Reviewing ${file.path}...`);
      
      // Use AI to analyze code changes
      const result = await generateText({
        model: openai('gpt-4-turbo'),
        prompt: `
          You are a senior code reviewer. Analyze the following code changes and provide:
          1. Security issues (if any)
          2. Code quality improvements
          3. Best practices violations
          4. Performance concerns
          
          File: ${file.path}
          
          Changes:
          \`\`\`diff
          ${file.diff}
          \`\`\`
          
          Provide your review in a structured format.
        `,
        maxTokens: 2000,
      });
      
      reviews.push({
        file: file.path,
        review: result.text,
        concerns: extractConcerns(result.text),
      });
      
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Generate summary
    const summary = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `
        Summarize the following code reviews into a concise overview:
        ${JSON.stringify(reviews, null, 2)}
        
        Provide:
        1. Overall assessment
        2. Critical issues that must be addressed
        3. Suggestions for improvement
      `,
      maxTokens: 1000,
    });
    
    // Post review to GitHub
    await postReviewToGitHub(pullRequestUrl, {
      summary: summary.text,
      reviews,
    });
    
    return {
      success: true,
      pullRequestUrl,
      filesReviewed: files.length,
      summary: summary.text,
      reviews,
    };
  },
});

function extractConcerns(reviewText: string): string[] {
  // Simple extraction logic
  const lines = reviewText.split('\n');
  const concerns = [];
  
  for (const line of lines) {
    if (
      line.includes('CRITICAL') ||
      line.includes('security') ||
      line.includes('vulnerability')
    ) {
      concerns.push(line.trim());
    }
  }
  
  return concerns;
}
```

---

## Job Scheduling & Cron

### Pattern 1: Simple Cron Schedule

**File**: `apps/proxy/trigger/scheduled-issue-sync.ts`

```typescript
import { schedules } from '@trigger.dev/sdk/v3';

// Run every 5 minutes
export const syncLinearIssues = schedules.task({
  id: 'sync-linear-issues',
  // Cron expression: every 5 minutes
  cron: '*/5 * * * *',
  run: async (payload, { ctx }) => {
    console.log('Starting scheduled Linear issues sync...');
    
    // Fetch assigned issues from Linear
    const issues = await linearClient.getAssignedIssues({
      assigneeId: process.env.CYRUS_AGENT_ID,
      states: ['started', 'in_progress'],
    });
    
    console.log(`Found ${issues.length} active issues`);
    
    // Sync each issue
    for (const issue of issues) {
      await syncIssueState(issue);
    }
    
    return {
      success: true,
      issuesSynced: issues.length,
      syncedAt: new Date().toISOString(),
    };
  },
});

// Run daily at 3 AM
export const dailyCleanup = schedules.task({
  id: 'daily-cleanup',
  cron: '0 3 * * *',
  run: async () => {
    console.log('Running daily cleanup...');
    
    // Clean up old sessions
    await sessionManager.cleanupOldSessions({
      olderThan: '30d',
    });
    
    // Archive completed issues
    await archiveCompletedIssues();
    
    // Generate daily report
    const report = await generateDailyReport();
    
    return {
      success: true,
      sessionsCleanedUp: report.sessionsCleanedUp,
      issuesArchived: report.issuesArchived,
    };
  },
});

// Run on first day of month
export const monthlyAnalytics = schedules.task({
  id: 'monthly-analytics',
  cron: '0 0 1 * *',
  run: async () => {
    console.log('Generating monthly analytics...');
    
    const analytics = await generateMonthlyAnalytics();
    
    // Send to team
    await sendAnalyticsReport(analytics);
    
    return {
      success: true,
      period: analytics.period,
      totalIssues: analytics.totalIssues,
      completionRate: analytics.completionRate,
    };
  },
});
```

### Pattern 2: Dynamic Scheduling

**File**: `apps/proxy/trigger/dynamic-reminder.ts`

```typescript
import { schedules, runs } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

const reminderSchema = z.object({
  issueId: z.string(),
  userId: z.string(),
  message: z.string(),
  scheduledFor: z.string().datetime(),
});

export const createReminder = task({
  id: 'create-reminder',
  schema: reminderSchema,
  run: async (payload) => {
    const { issueId, userId, message, scheduledFor } = payload;
    
    // Schedule a one-time task
    const scheduledRun = await schedules.create({
      task: sendReminder,
      cron: convertToCron(scheduledFor),
      maxAttempts: 1,
      payload: {
        issueId,
        userId,
        message,
      },
    });
    
    return {
      success: true,
      reminderId: scheduledRun.id,
      scheduledFor,
    };
  },
});

export const sendReminder = task({
  id: 'send-reminder',
  schema: z.object({
    issueId: z.string(),
    userId: z.string(),
    message: z.string(),
  }),
  run: async (payload) => {
    const { issueId, userId, message } = payload;
    
    // Send notification
    await notificationService.send({
      userId,
      type: 'reminder',
      title: 'Issue Reminder',
      message,
      link: `https://linear.app/issue/${issueId}`,
    });
    
    return {
      success: true,
      sentAt: new Date().toISOString(),
    };
  },
});
```

---

## Error Handling & Retries

### Automatic Retries

```typescript
import { task } from '@trigger.dev/sdk/v3';

export const reliableTask = task({
  id: 'reliable-task',
  // Retry configuration
  retry: {
    maxAttempts: 5,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    factor: 2,
    randomize: true,
  },
  run: async (payload) => {
    // This task will automatically retry up to 5 times
    // with exponential backoff if it fails
    
    try {
      const result = await performUnreliableOperation();
      return { success: true, result };
    } catch (error) {
      // Error will trigger automatic retry
      console.error('Operation failed:', error);
      throw error;
    }
  },
});
```

### Custom Error Handling

```typescript
import { task } from '@trigger.dev/sdk/v3';

class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

export const smartRetryTask = task({
  id: 'smart-retry-task',
  retry: {
    maxAttempts: 3,
    // Custom retry logic
    isRetryable: (error) => {
      // Only retry specific errors
      if (error instanceof NonRetryableError) {
        return false;
      }
      
      // Retry network errors
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        return true;
      }
      
      // Retry 5xx server errors
      if (error.response?.status >= 500) {
        return true;
      }
      
      // Don't retry 4xx client errors
      return false;
    },
  },
  run: async (payload, { ctx }) => {
    try {
      const result = await callExternalAPI();
      return { success: true, result };
    } catch (error) {
      console.error(`[Attempt ${ctx.attempt.number}] Error:`, error);
      
      if (isValidationError(error)) {
        // Don't retry validation errors
        throw new NonRetryableError('Invalid payload');
      }
      
      if (isNetworkError(error)) {
        // Retry network errors
        throw new RetryableError('Network error, will retry');
      }
      
      // Default: rethrow and let retry logic decide
      throw error;
    }
  },
});
```

### Error Notification

```typescript
import { task } from '@trigger.dev/sdk/v3';

export const taskWithErrorNotification = task({
  id: 'task-with-error-notification',
  retry: {
    maxAttempts: 3,
  },
  onFailure: async (payload, error, { ctx }) => {
    // Called after all retry attempts fail
    console.error('Task failed permanently:', error);
    
    // Send notification to team
    await notificationService.send({
      channel: '#cyrus-alerts',
      type: 'error',
      title: 'Task Failed',
      message: `Task ${ctx.task.id} failed after ${ctx.attempt.number} attempts`,
      error: error.message,
      runId: ctx.run.id,
    });
    
    // Log to error tracking service
    await errorTracker.report(error, {
      taskId: ctx.task.id,
      runId: ctx.run.id,
      payload,
    });
  },
  run: async (payload) => {
    // Task implementation
  },
});
```

---

## Queues & Concurrency

### Queue Configuration

```typescript
import { task } from '@trigger.dev/sdk/v3';

// High-priority queue (max 10 concurrent tasks)
export const urgentTask = task({
  id: 'urgent-task',
  queue: {
    name: 'urgent',
    concurrencyLimit: 10,
  },
  run: async (payload) => {
    // Critical operations
  },
});

// Normal priority queue (max 5 concurrent tasks)
export const normalTask = task({
  id: 'normal-task',
  queue: {
    name: 'normal',
    concurrencyLimit: 5,
  },
  run: async (payload) => {
    // Regular operations
  },
});

// Background queue (max 2 concurrent tasks)
export const backgroundTask = task({
  id: 'background-task',
  queue: {
    name: 'background',
    concurrencyLimit: 2,
  },
  run: async (payload) => {
    // Low-priority operations
  },
});
```

### Rate Limiting

```typescript
import { task } from '@trigger.dev/sdk/v3';

export const rateLimitedTask = task({
  id: 'rate-limited-task',
  queue: {
    name: 'api-calls',
    // Maximum 100 tasks per minute
    rateLimit: {
      limit: 100,
      period: '1m',
    },
  },
  run: async (payload) => {
    // API calls that should be rate-limited
    await callExternalAPI(payload);
  },
});
```

### Per-User Concurrency

```typescript
import { task } from '@trigger.dev/sdk/v3';

export const userSpecificTask = task({
  id: 'user-specific-task',
  queue: {
    name: 'user-tasks',
    // Each user can have max 1 concurrent task
    concurrencyKey: (payload) => `user-${payload.userId}`,
  },
  run: async (payload) => {
    // User-specific operations
  },
});
```

---

## Monitoring & Observability

### Structured Logging

```typescript
import { task, logger } from '@trigger.dev/sdk/v3';

export const observableTask = task({
  id: 'observable-task',
  run: async (payload, { ctx }) => {
    // Log with context
    logger.info('Task started', {
      runId: ctx.run.id,
      attemptNumber: ctx.attempt.number,
      payload,
    });
    
    // Log progress
    logger.debug('Processing step 1');
    await processStep1();
    
    logger.debug('Processing step 2');
    await processStep2();
    
    // Log with custom attributes
    logger.info('Task completed', {
      duration: ctx.run.durationMs,
      result: 'success',
    });
    
    return { success: true };
  },
});
```

### Custom Tracing

```typescript
import { task, tracer } from '@trigger.dev/sdk/v3';

export const tracedTask = task({
  id: 'traced-task',
  run: async (payload, { ctx }) => {
    // Create custom span
    return await tracer.startActiveSpan('database-query', async (span) => {
      try {
        const result = await database.query('SELECT * FROM issues');
        
        // Add span attributes
        span.setAttribute('rows', result.length);
        span.setAttribute('query', 'SELECT * FROM issues');
        
        return result;
      } finally {
        span.end();
      }
    });
  },
});
```

### Performance Metrics

```typescript
import { task } from '@trigger.dev/sdk/v3';

export const metricTask = task({
  id: 'metric-task',
  run: async (payload, { ctx }) => {
    const startTime = Date.now();
    
    // Perform operation
    const result = await performOperation();
    
    const duration = Date.now() - startTime;
    
    // Record custom metric
    ctx.metrics.gauge('operation_duration_ms', duration);
    ctx.metrics.increment('operations_completed');
    
    return result;
  },
});
```

---

## AI Agent Workflows

### Multi-Step Agent Orchestration

**File**: `apps/proxy/trigger/multi-step-agent.ts`

```typescript
import { task, runs } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const multiStepAgentSchema = z.object({
  issueId: z.string(),
  task: z.string(),
  repositoryUrl: z.string(),
});

// Main orchestrator
export const multiStepAgent = task({
  id: 'multi-step-agent',
  schema: multiStepAgentSchema,
  run: async (payload, { ctx }) => {
    const { issueId, task, repositoryUrl } = payload;
    
    console.log('Starting multi-step agent workflow');
    
    // Step 1: Analyze task
    const analysis = await runs.trigger(analyzeTask, {
      task,
      repositoryUrl,
    });
    
    const analysisResult = await runs.poll(analysis);
    console.log('Task analysis:', analysisResult);
    
    // Step 2: Generate plan
    const planning = await runs.trigger(generatePlan, {
      task,
      analysis: analysisResult,
    });
    
    const plan = await runs.poll(planning);
    console.log('Execution plan:', plan);
    
    // Step 3: Execute plan steps in parallel
    const executionRuns = await Promise.all(
      plan.steps.map(step =>
        runs.trigger(executeStep, {
          step,
          repositoryUrl,
        })
      )
    );
    
    // Wait for all executions
    const executions = await Promise.all(
      executionRuns.map(run => runs.poll(run))
    );
    
    // Step 4: Verify and create PR
    const verification = await runs.trigger(verifyAndCreatePR, {
      issueId,
      executions,
      repositoryUrl,
    });
    
    const result = await runs.poll(verification);
    
    return {
      success: true,
      issueId,
      pullRequestUrl: result.pullRequestUrl,
      stepsExecuted: plan.steps.length,
    };
  },
});

// Step 1: Analyze task
export const analyzeTask = task({
  id: 'analyze-task',
  run: async (payload) => {
    const { task, repositoryUrl } = payload;
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `
        Analyze this task and provide:
        1. Complexity assessment (simple/medium/complex)
        2. Affected areas of codebase
        3. Required changes
        4. Potential risks
        
        Task: ${task}
        Repository: ${repositoryUrl}
      `,
    });
    
    return {
      analysis: result.text,
      complexity: extractComplexity(result.text),
      affectedAreas: extractAffectedAreas(result.text),
    };
  },
});

// Step 2: Generate plan
export const generatePlan = task({
  id: 'generate-plan',
  run: async (payload) => {
    const { task, analysis } = payload;
    
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `
        Create a step-by-step execution plan for this task.
        
        Task: ${task}
        Analysis: ${JSON.stringify(analysis)}
        
        Return a JSON array of steps with:
        - description: what to do
        - files: which files to modify
        - changes: what changes to make
      `,
      response_format: { type: 'json_object' },
    });
    
    const plan = JSON.parse(result.text);
    
    return {
      steps: plan.steps,
      estimatedDuration: plan.estimatedDuration,
    };
  },
});

// Step 3: Execute individual step
export const executeStep = task({
  id: 'execute-step',
  run: async (payload) => {
    const { step, repositoryUrl } = payload;
    
    console.log(`Executing step: ${step.description}`);
    
    // Clone repo, make changes, commit
    const result = await executeCodeChanges(step, repositoryUrl);
    
    return {
      step: step.description,
      filesModified: result.filesModified,
      success: result.success,
    };
  },
});

// Step 4: Verify and create PR
export const verifyAndCreatePR = task({
  id: 'verify-and-create-pr',
  run: async (payload) => {
    const { issueId, executions, repositoryUrl } = payload;
    
    // Verify all changes
    const allSuccess = executions.every(e => e.success);
    
    if (!allSuccess) {
      throw new Error('Some steps failed');
    }
    
    // Create PR
    const pr = await githubClient.createPullRequest({
      repositoryUrl,
      title: `Fix for Linear issue ${issueId}`,
      body: generatePRDescription(executions),
      branch: `cyrus/fix-${issueId}`,
    });
    
    return {
      pullRequestUrl: pr.url,
      filesChanged: executions.flatMap(e => e.filesModified).length,
    };
  },
});
```

---

## Deployment Strategies

### Step 1: Development Testing

```bash
# Run in development mode
pnpm trigger.dev dev

# This starts local server and watches for changes
# Accessible at http://localhost:3000
```

### Step 2: Staging Deployment

```bash
# Deploy to staging environment
pnpm trigger.dev deploy --env staging

# Set staging environment variables
pnpm trigger.dev env set CYRUS_ENV=staging --env staging
```

### Step 3: Production Deployment

```bash
# Deploy to production
pnpm trigger.dev deploy --env production

# Verify deployment
pnpm trigger.dev deploys list --env production
```

### CI/CD Integration

**File**: `.github/workflows/deploy-trigger.yml`

```yaml
name: Deploy Trigger.dev Tasks

on:
  push:
    branches:
      - main
    paths:
      - 'apps/proxy/trigger/**'
      - 'apps/proxy/trigger.config.ts'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10.11.0
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Deploy to Trigger.dev
        run: |
          cd apps/proxy
          pnpm trigger.dev deploy --env production
        env:
          TRIGGER_API_KEY: ${{ secrets.TRIGGER_API_KEY }}
          TRIGGER_PROJECT_ID: ${{ secrets.TRIGGER_PROJECT_ID }}
```

---

## Best Practices

### 1. Task Idempotency

```typescript
import { task } from '@trigger.dev/sdk/v3';

export const idempotentTask = task({
  id: 'idempotent-task',
  // Use idempotency key to prevent duplicate executions
  idempotencyKey: (payload) => `issue-${payload.issueId}`,
  run: async (payload) => {
    // This task will only run once for each unique issueId
    // If triggered multiple times with same issueId,
    // subsequent calls return the original result
    
    await processIssue(payload.issueId);
  },
});
```

### 2. Payload Validation

```typescript
import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

// Always use Zod schema for type safety and validation
const strictSchema = z.object({
  issueId: z.string().uuid(),
  userId: z.string().uuid(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const validatedTask = task({
  id: 'validated-task',
  schema: strictSchema,
  run: async (payload) => {
    // Payload is automatically validated
    // TypeScript has full type inference
  },
});
```

### 3. Resource Cleanup

```typescript
import { task } from '@trigger.dev/sdk/v3';

export const cleanupTask = task({
  id: 'cleanup-task',
  run: async (payload) => {
    let tempDir: string | null = null;
    
    try {
      // Create temporary resources
      tempDir = await createTempDirectory();
      
      // Perform operations
      await processFiles(tempDir);
      
      return { success: true };
    } finally {
      // Always cleanup, even on error
      if (tempDir) {
        await removeTempDirectory(tempDir);
      }
    }
  },
});
```

### 4. Cost Optimization

```typescript
import { task } from '@trigger.dev/sdk/v3';

// Optimize by batching operations
export const batchOptimizedTask = task({
  id: 'batch-optimized',
  run: async (payload) => {
    const { items } = payload;
    
    // Process in batches instead of individually
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map(item => processItem(item))
      );
      
      results.push(...batchResults);
    }
    
    return { processed: results.length };
  },
});
```

---

## Common Issues & Solutions

### Issue 1: Task Timeouts

**Symptoms**: Tasks timeout before completion

**Solutions**:
```typescript
// Split long-running tasks into smaller chunks
export const longRunningTask = task({
  id: 'long-running',
  run: async (payload, { ctx }) => {
    const { items } = payload;
    
    // Process in chunks to avoid timeout
    for (let i = 0; i < items.length; i += 100) {
      const chunk = items.slice(i, i + 100);
      
      // Trigger subtask for each chunk
      await runs.trigger(processChunk, { chunk });
    }
    
    return { chunks: Math.ceil(items.length / 100) };
  },
});
```

### Issue 2: Memory Leaks

**Symptoms**: Tasks consume excessive memory

**Solutions**:
```typescript
export const memoryEfficientTask = task({
  id: 'memory-efficient',
  run: async (payload) => {
    const stream = createReadStream(payload.filePath);
    
    // Process stream instead of loading entire file
    for await (const chunk of stream) {
      await processChunk(chunk);
    }
    
    // Stream automatically releases memory
  },
});
```

### Issue 3: Rate Limiting

**Symptoms**: External API rate limits

**Solutions**:
```typescript
export const rateLimitedAPI = task({
  id: 'rate-limited-api',
  queue: {
    name: 'external-api',
    rateLimit: {
      limit: 10, // 10 requests
      period: '1m', // per minute
    },
  },
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 60000, // Wait 1 minute on rate limit
  },
  run: async (payload) => {
    try {
      return await callExternalAPI(payload);
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited, wait longer before retry
        throw new Error('Rate limited');
      }
      throw error;
    }
  },
});
```

---

## Summary Checklist

When integrating Trigger.dev in Cyrus:

- [ ] Install @trigger.dev/sdk and CLI
- [ ] Initialize project with trigger.dev init
- [ ] Configure trigger.config.ts with project ID and API key
- [ ] Define tasks with proper Zod schemas
- [ ] Implement retry logic and error handling
- [ ] Configure queues and concurrency limits
- [ ] Set up structured logging and tracing
- [ ] Add monitoring and alerting
- [ ] Test in development mode (trigger.dev dev)
- [ ] Deploy to staging and verify
- [ ] Set up CI/CD for automated deployments
- [ ] Configure cron schedules for recurring tasks
- [ ] Implement idempotency for critical tasks
- [ ] Optimize for cost and performance
- [ ] Document custom tasks and workflows

---

## Additional Resources

- **Trigger.dev Documentation**: https://trigger.dev/docs
- **Trigger.dev GitHub**: https://github.com/triggerdotdev/trigger.dev
- **AI Workflows Guide**: https://trigger.dev/docs/guides/ai-agents
- **Deployment Guide**: https://trigger.dev/docs/deployment
- **Cyrus Architecture**: See `docs/UNIFIED_ARCHITECTURE.md`

---

**Version**: 1.0.0  
**Maintained by**: Cyrus Development Team  
**Questions?**: Open an issue on GitHub or contact the team on Slack
