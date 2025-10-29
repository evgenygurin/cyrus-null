# Linear Configuration Guide for Codegen Integration

## Table of Contents
1. [Overview](#overview)
2. [Agent Interaction Guidelines](#agent-interaction-guidelines)
3. [Workspace Setup](#workspace-setup)
4. [Team Configuration](#team-configuration)
5. [Workflow & States](#workflow--states)
6. [Labels System](#labels-system)
7. [GitHub Integration](#github-integration)
8. [CircleCI Integration](#circleci-integration)
9. [Sentry Integration](#sentry-integration)
10. [Agent Best Practices](#agent-best-practices)
11. [Current Configuration Status](#current-configuration-status)

---

## Overview

This guide provides comprehensive instructions for configuring Linear to work optimally with Codegen AI agents, GitHub, Sentry, and CircleCI. It follows Linear's official Agent Interaction Guidelines (AIG) and best practices for AI-driven development workflows.

### Key Principles

1. **Agents as Collaborative Users**: Agents are treated like team members in Linear
2. **Transparency**: All agent actions should be visible and traceable
3. **User Control**: Users maintain final authority over all agent actions
4. **Session-Based Interaction**: Agent work is tracked through sessions with clear lifecycle states

---

## Agent Interaction Guidelines

### 1. Disclosure
- Agents must clearly identify themselves as non-human
- Use clear naming conventions (e.g., "Codegen Bot", "Cyrus Agent")
- Maintain a clear boundary between human and agentic users

### 2. Native Platform Integration
- Work through existing Linear UI patterns and standard actions
- Use Linear's native features rather than creating custom workflows
- Respect Linear's data model and conventions

### 3. Feedback and Transparency
- Provide immediate feedback when invoked (within 10 seconds)
- Clearly indicate the agent's current state (thinking, waiting, executing)
- Make the agent's reasoning and decision process fully transparent

### 4. User Control
- Respect user requests to disengage
- Step back immediately when asked
- Only re-engage with clear user permission

### 5. Accountability
- Final responsibility always remains with a human user
- Agents perform tasks but cannot be held ultimately accountable
- Always provide clear audit trails

---

## Workspace Setup

### Basic Configuration

1. **Create Workspace**
   - Go to Linear Settings → General
   - Set workspace name and URL slug
   - Configure default settings

2. **Invite Team Members**
   - Settings → Members → Invite
   - Assign appropriate roles (Admin, Member, Guest)
   - Configure agent users with appropriate permissions

3. **Agent Users Setup**
   - Create dedicated user accounts for agents
   - Use naming convention: `[Agent Name] Bot` (e.g., "Codegen Bot")
   - Set profile pictures to clearly identify as bots
   - Grant appropriate scopes:
     - `app:assignable` - Allow agents to be assigned issues
     - `app:mentionable` - Allow @mentions of agents

### OAuth Configuration for Agents

1. **Create Application**
   - Go to Settings → API → Applications
   - Click "Create Application"
   - Set application name (e.g., "Codegen Integration")
   - Configure OAuth scopes:
     - `read` - Read workspace data
     - `write` - Create/update issues and comments
     - `issues:create` - Create issues
     - `comments:create` - Add comments
     - `app:assignable` - Be assignable to issues
     - `app:mentionable` - Be mentionable in comments

2. **Get Credentials**
   - Note the Client ID and Client Secret
   - Configure callback URL for OAuth flow
   - Store credentials securely

---

## Team Configuration

### Team Structure

**Current Configuration:**
- Team Name: Claude Code Bot (CCB)
- Team Key: CCB
- Color: #ff324c

### Recommended Team Structure

For small to medium projects:
```
Workspace
├── Engineering Team (ENG)
│   ├── Backend (BACK)
│   ├── Frontend (FRONT)
│   └── DevOps (OPS)
└── Product Team (PROD)
```

### Team Settings

1. **Access Settings → Teams**
2. **Configure for each team:**
   - Team name and key
   - Team icon and color
   - Default issue status
   - Auto-assignment rules
   - Notification preferences

3. **Enable Triage (Recommended)**
   - Go to Team Settings → Triage
   - Enable triage inbox
   - Configure triage rules for automated routing
   - Set triage responsibility rotation

---

## Workflow & States

### Current State Configuration

✅ **Current States:**
1. **Backlog** (type: `backlog`) - Position: 0.0
2. **Todo** (type: `unstarted`) - Position: 1.0
3. **In Progress** (type: `started`) - Position: 2.0
4. **In Review** (type: `started`) - Position: 1002.0
5. **Done** (type: `completed`) - Position: 3.0
6. **Canceled** (type: `canceled`) - Position: 4.0
7. **Duplicate** (type: `canceled`) - Position: 5.0

### Recommended State Flow

```
Backlog → Todo → In Progress → In Review → Done
                      ↓
                  Canceled/Duplicate
```

### State Configuration Best Practices

1. **Backlog States**
   - Use for prioritization
   - First status is default for new issues
   - Consider adding: "Icebox" for low-priority items

2. **Unstarted States**
   - "Todo" for ready-to-work items
   - Consider adding: "Ready" for fully-specified work

3. **Started States** (Critical for Agents!)
   - "In Progress" - Active development
   - "In Review" - Code review stage
   - Consider adding: "Ready to Merge" for approved PRs

4. **Completed States**
   - "Done" for completed work
   - Consider adding: "Deployed" for production releases

5. **Canceled States**
   - "Canceled" for work that won't be done
   - "Duplicate" for duplicate issues

### State Automation Rules

Configure at: **Settings → Teams → Issue statuses & automations**

**Recommended Automations:**
- Auto-close inactive issues after 30 days
- Auto-archive completed issues after 14 days
- Move to "In Progress" when PR is created
- Move to "In Review" when PR is ready for review
- Move to "Done" when PR is merged

### Agent State Management

According to Linear's best practices:

1. **When Agent Receives Assignment:**
   - If issue is not in `started`, `completed`, or `canceled` status
   - Move to first "started" status (e.g., "In Progress")
   - Set agent as delegate if not already set

2. **When Agent Completes Work:**
   - Emit `response` activity type
   - Move issue to appropriate state based on outcome:
     - "In Review" if code review needed
     - "Done" if no review needed
     - "Blocked" if waiting on dependencies

3. **When Agent Needs Input:**
   - Emit `elicitation` activity type
   - Keep issue in "In Progress"
   - Add clear comment explaining what's needed

---

## Labels System

### Current Label Configuration

✅ **Domain Labels** (What area of codebase)
- `domain:api` - API development and integration
- `domain:database` - Database-related tasks
- `domain:infrastructure` - DevOps and infrastructure tasks
- `domain:frontend` - Frontend development tasks

✅ **Status Labels** (Current state metadata)
- `status:approved` - Approved and ready to merge
- `status:in-review` - Currently under review
- `status:needs-review` - Ready for human review
- `status:blocked` - Blocked waiting on dependencies

✅ **Priority Labels** (Urgency level)
- `priority:low` - Non-urgent backlog item
- `priority:medium` - Standard priority (< 1 week)
- `priority:high` - Important task (< 1 day)
- `priority:urgent` - Immediate attention required (< 2 hours)

✅ **Type Labels** (Kind of work)
- `type:feature` - New feature development
- `type:bugfix` - Bug resolution and fixes
- `type:refactor` - Code refactoring and improvements
- `type:documentation` - Documentation tasks and updates
- `type:testing` - Testing and QA tasks
- `type:deployment` - Deployment and release tasks

✅ **Agent Labels** (Agent assignment)
- `agent:codegen` - Tasks for Codegen AI agent
- `agent:cyrus` - Tasks for Cyrus Linear-Claude integration agent
- `agent:cursor` - Tasks for Cursor code editor integration
- `agent:multi` - Multi-agent collaboration required

✅ **Technology Labels**
- `python` - Python/FastAPI related tasks
- `backend` - Backend development tasks
- `ml-classification` - Machine learning and classification tasks

✅ **Automation Labels**
- `automated` - Automatically created issues
- `codegen` - Codegen-related
- `critical` - Critical issues
- `post-merge` - Post-merge checks
- `health-monitoring` - Health monitoring issues

### Recommended Additional Labels

#### CI/CD Integration
- `ci:github-actions` - GitHub Actions related
- `ci:circleci` - CircleCI related
- `ci:failing` - CI pipeline failing

#### Monitoring & Observability
- `monitoring:sentry` - Sentry error tracking
- `monitoring:performance` - Performance issues
- `monitoring:uptime` - Uptime/availability issues

#### Review & Quality
- `review:approved` - Code review approved
- `review:changes-requested` - Changes requested
- `review:needs-attention` - Review needs attention

### Label Usage Best Practices

1. **Use Consistent Prefixes**
   - Makes labels easier to find and filter
   - Groups related labels together
   - Examples: `domain:`, `type:`, `priority:`

2. **Provide Clear Descriptions**
   - Every label should have a helpful description
   - Include SLA expectations where relevant (e.g., "< 2 hours")

3. **Agent Labeling Rules**
   - Always add agent label when assigning to an agent
   - Add relevant domain and type labels
   - Include priority based on urgency
   - Add CI/CD labels when relevant

4. **Automation Labeling**
   - Automated systems should always add `automated` label
   - Include source integration label (e.g., `ci:github-actions`)
   - Add relevant status labels

---

## GitHub Integration

### Setup Process

1. **Install GitHub Integration**
   - Go to Settings → Features → Integrations → GitHub
   - Click "Add to Linear"
   - Select GitHub organization
   - Authorize Linear app

2. **Connect Repositories**
   - Select repositories to integrate
   - Install GitHub App on selected repos
   - Authenticate personal GitHub account

### Issue Linking Methods

**Method 1: Branch Names**
```bash
git checkout -b CCB-123-feature-name
```

**Method 2: PR Title**
```
[CCB-123] Add new feature
```

**Method 3: PR Description (Recommended)**
```markdown
Fixes CCB-123
Closes CCB-124
Resolves CCB-125
```

**Magic Words:**
- `Fixes` / `Fix` / `Fixed`
- `Closes` / `Close` / `Closed`
- `Resolves` / `Resolve` / `Resolved`

### Workflow Automation

Configure at: **Settings → Integrations → GitHub → Workflow Automation**

**Recommended Rules:**

#### PR Draft Created
- Update status: "In Progress"
- Add label: `status:draft`

#### PR Ready for Review
- Update status: "In Review"
- Add label: `status:needs-review`
- Remove label: `status:draft`

#### Review Requested
- Add label: `status:in-review`
- Add assignee from reviewer list

#### Changes Requested
- Add label: `review:changes-requested`
- Move to: "In Progress"

#### PR Approved
- Update status: "Ready to Merge"
- Add label: `status:approved`
- Remove label: `status:needs-review`

#### PR Merged (main/master branch)
- Update status: "Done"
- Add label: `deployed`
- Add comment: "Merged to production"

#### PR Merged (staging branch)
- Update status: "In QA"
- Add label: `status:staging`
- Add comment: "Deployed to staging"

#### PR Merged (develop branch)
- Update status: "Testing"
- Add label: `status:development`

#### PR Closed (not merged)
- Update status: "Canceled"
- Add comment: "PR closed without merge"

### Branch-Specific Rules

Create custom automations for different target branches:

```
Target Branch: main
├── On PR Open: → "In Review"
├── On PR Approve: → "Ready to Merge"  
└── On PR Merge: → "Done" + Add "deployed" label

Target Branch: staging
├── On PR Open: → "In Review"
└── On PR Merge: → "In QA" + Add "staging" label

Target Branch: develop
├── On PR Open: → "In Review"
└── On PR Merge: → "Testing"
```

### GitHub Actions Integration

**Recommended Workflow for Linear Integration:**

```yaml
name: Linear Issue Update
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  update-linear:
    runs-on: ubuntu-latest
    steps:
      - name: Extract Issue ID
        id: issue
        run: |
          # Extract CCB-XXX from branch or PR
          ISSUE_ID=$(echo "${{ github.head_ref }}" | grep -oE '[A-Z]+-[0-9]+')
          echo "issue_id=$ISSUE_ID" >> $GITHUB_OUTPUT
      
      - name: Update Linear Issue
        uses: linear/action@v1
        with:
          linear-token: ${{ secrets.LINEAR_TOKEN }}
          issue-id: ${{ steps.issue.outputs.issue_id }}
          status: "In Progress"
          comment: "CI checks completed: ${{ job.status }}"
```

### Best Practices

1. **Use Issue Templates**
   - Create GitHub issue templates that match Linear structure
   - Include Linear issue ID field
   - Auto-sync with Linear triage

2. **PR Templates**
   - Include Linear issue reference section
   - Add checklist for common tasks
   - Include testing instructions

3. **Commit Message Convention**
   - Include Linear issue ID in commits
   - Format: `[CCB-123] Commit message`
   - Helps with traceability

4. **Status Comments**
   - Linear automatically comments on PR activity
   - Configure which events trigger comments
   - Keep team informed of progress

---

## CircleCI Integration

### Setup Process

1. **Install CircleCI in GitHub**
   - Go to CircleCI dashboard
   - Connect GitHub account
   - Select repositories

2. **Configure CircleCI with Linear**
   - Add Linear API token to CircleCI environment variables
   - Key: `LINEAR_API_KEY`
   - Value: Your Linear API token

### CircleCI Configuration

**`.circleci/config.yml` with Linear Integration:**

```yaml
version: 2.1

orbs:
  linear: linear/linear@1.0.0  # If available

jobs:
  build-and-test:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      
      - run:
          name: Install dependencies
          command: npm ci
      
      - run:
          name: Run tests
          command: npm test
      
      - run:
          name: Build
          command: npm run build
      
      - run:
          name: Update Linear on success
          command: |
            ISSUE_ID=$(echo $CIRCLE_BRANCH | grep -oE '[A-Z]+-[0-9]+')
            if [ ! -z "$ISSUE_ID" ]; then
              curl -X POST https://api.linear.app/graphql \
                -H "Authorization: $LINEAR_API_KEY" \
                -H "Content-Type: application/json" \
                -d '{
                  "query": "mutation { commentCreate(input: { issueId: \"'$ISSUE_ID'\", body: \"✅ CircleCI build passed: '$CIRCLE_BUILD_URL'\" }) { success } }"
                }'
            fi
          when: on_success
      
      - run:
          name: Update Linear on failure
          command: |
            ISSUE_ID=$(echo $CIRCLE_BRANCH | grep -oE '[A-Z]+-[0-9]+')
            if [ ! -z "$ISSUE_ID" ]; then
              curl -X POST https://api.linear.app/graphql \
                -H "Authorization: $LINEAR_API_KEY" \
                -H "Content-Type: application/json" \
                -d '{
                  "query": "mutation { commentCreate(input: { issueId: \"'$ISSUE_ID'\", body: \"❌ CircleCI build failed: '$CIRCLE_BUILD_URL'\" }) { success } }"
                }'
            fi
          when: on_fail

workflows:
  build-test-deploy:
    jobs:
      - build-and-test:
          filters:
            branches:
              ignore: main
      
      - deploy:
          requires:
            - build-and-test
          filters:
            branches:
              only: main
```

### Health Monitoring with CircleCI

Create automated health checks that create Linear issues on failure:

```yaml
jobs:
  health-check:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      
      - run:
          name: Run health checks
          command: ./scripts/health-check.sh
      
      - run:
          name: Create Linear issue on failure
          command: |
            if [ $? -ne 0 ]; then
              curl -X POST https://api.linear.app/graphql \
                -H "Authorization: $LINEAR_API_KEY" \
                -H "Content-Type: application/json" \
                -d '{
                  "query": "mutation { issueCreate(input: { 
                    teamId: \"'$LINEAR_TEAM_ID'\",
                    title: \"🚨 CRITICAL: Health Check Failed\",
                    description: \"Health check failed on '$CIRCLE_BRANCH' - Build: '$CIRCLE_BUILD_URL'\",
                    priority: 1,
                    labelIds: [\"'$LABEL_CRITICAL'\", \"'$LABEL_AUTOMATED'\"]
                  }) { success issue { id identifier } } }"
                }'
            fi
          when: on_fail

workflows:
  scheduled-health:
    triggers:
      - schedule:
          cron: "0 * * * *"  # Every hour
          filters:
            branches:
              only: main
    jobs:
      - health-check
```

### CircleCI Status Updates

Create a script to update Linear issue status based on CircleCI pipeline state:

```bash
#!/bin/bash
# scripts/update-linear-status.sh

ISSUE_ID=$(echo $CIRCLE_BRANCH | grep -oE '[A-Z]+-[0-9]+')
if [ -z "$ISSUE_ID" ]; then
  echo "No Linear issue ID found in branch name"
  exit 0
fi

WORKFLOW_STATUS=$1  # pass workflow status as argument

case $WORKFLOW_STATUS in
  "running")
    STATUS="In Progress"
    COMMENT="🔄 CircleCI workflow started: $CIRCLE_BUILD_URL"
    ;;
  "success")
    STATUS="In Review"
    COMMENT="✅ CircleCI checks passed: $CIRCLE_BUILD_URL"
    ;;
  "failed")
    STATUS="In Progress"
    COMMENT="❌ CircleCI checks failed: $CIRCLE_BUILD_URL"
    ;;
esac

# Update Linear issue
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation {
      commentCreate(input: {
        issueId: \\\"$ISSUE_ID\\\",
        body: \\\"$COMMENT\\\"
      }) { success }
      
      issueUpdate(id: \\\"$ISSUE_ID\\\", input: {
        stateId: \\\"$LINEAR_STATE_ID\\\"
      }) { success }
    }\"
  }"
```

### Best Practices

1. **Use Environment Variables**
   - Store Linear API key securely in CircleCI
   - Use context for shared secrets
   - Never commit tokens to repository

2. **Conditional Updates**
   - Only update Linear on relevant branches
   - Skip updates for automated commits
   - Handle edge cases gracefully

3. **Status Mapping**
   - Map CircleCI statuses to Linear states
   - Keep status transitions logical
   - Update labels to reflect CI state

4. **Error Handling**
   - Always check for Linear issue ID
   - Handle API failures gracefully
   - Log all Linear API calls

---

## Sentry Integration

### Setup Process

1. **Install Sentry Integration**
   - Go to Settings → Integrations → Sentry
   - Click "Add to Linear"
   - Authenticate with Sentry account
   - Select Sentry organization and projects

2. **Configure Issue Creation Rules**
   - Go to Sentry → Settings → Integrations → Linear
   - Configure when to create Linear issues:
     - New error first seen
     - Error regression (returns after being resolved)
     - Error frequency threshold exceeded

### Sentry Configuration

**In Sentry Project Settings:**

```yaml
# sentry-issue-rules.yml
rules:
  - name: Critical Errors to Linear
    conditions:
      - event.level: error
      - event.tags.environment: production
    actions:
      - create_linear_issue:
          team: CCB
          priority: urgent
          labels:
            - critical
            - automated
            - monitoring:sentry
          title: "🚨 Production Error: {{ error.type }}"
          description: |
            **Error:** {{ error.type }}
            **Message:** {{ error.message }}
            **Environment:** {{ tags.environment }}
            **Release:** {{ release }}
            **First Seen:** {{ first_seen }}
            **Event Count:** {{ event_count }}
            
            **Stack Trace:**
            ```
            {{ stacktrace }}
            ```
            
            [View in Sentry]({{ event_url }})

  - name: High Frequency Errors
    conditions:
      - event.frequency: "> 100 per hour"
    actions:
      - create_linear_issue:
          team: CCB
          priority: high
          labels:
            - automated
            - monitoring:sentry
            - monitoring:performance
```

### Automatic Issue Linking

Configure Sentry to link to Linear issues:

```javascript
// sentry.config.js
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  beforeSend(event, hint) {
    // Extract Linear issue ID from commit message or branch
    const issueId = extractLinearIssue(event);
    
    if (issueId) {
      event.tags = {
        ...event.tags,
        linear_issue: issueId
      };
    }
    
    return event;
  },
  
  integrations: [
    new Sentry.Integrations.Linear({
      apiKey: process.env.LINEAR_API_KEY,
      teamKey: 'CCB',
      autoCreateIssues: true,
      issueTemplate: {
        priority: 1,  // Urgent
        labels: ['monitoring:sentry', 'automated']
      }
    })
  ]
});

function extractLinearIssue(event) {
  // Check release version
  const release = event.release?.version || '';
  const match = release.match(/[A-Z]+-\d+/);
  
  if (match) {
    return match[0];
  }
  
  // Check transaction name
  const transaction = event.transaction || '';
  const txMatch = transaction.match(/[A-Z]+-\d+/);
  
  return txMatch ? txMatch[0] : null;
}
```

### Sentry Alert Rules to Linear

```javascript
// scripts/sentry-to-linear.js
const { LinearClient } = require('@linear/sdk');
const Sentry = require('@sentry/node');

async function createLinearIssueFromSentry(sentryIssue) {
  const linear = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY
  });
  
  const team = await linear.team('CCB');
  
  const priority = sentryIssue.level === 'error' ? 1 : 2;
  const labels = ['automated', 'monitoring:sentry'];
  
  if (sentryIssue.tags?.environment === 'production') {
    labels.push('critical');
  }
  
  const issue = await linear.issueCreate({
    teamId: team.id,
    title: `🚨 ${sentryIssue.title}`,
    description: `
**Sentry Issue:** [${sentryIssue.shortId}](${sentryIssue.permalink})

**Environment:** ${sentryIssue.tags?.environment || 'unknown'}
**Release:** ${sentryIssue.firstRelease?.version || 'unknown'}
**Count:** ${sentryIssue.count} events
**Users Affected:** ${sentryIssue.userCount}

**Error Message:**
\`\`\`
${sentryIssue.metadata.value}
\`\`\`

**Last Seen:** ${sentryIssue.lastSeen}

**Stack Trace:**
\`\`\`
${sentryIssue.metadata.stacktrace?.frames?.slice(0, 5).map(f => 
  `  at ${f.function} (${f.filename}:${f.lineno})`
).join('\n')}
\`\`\`

[View Full Issue in Sentry](${sentryIssue.permalink})
    `,
    priority,
    labelIds: await getLabelIds(linear, labels)
  });
  
  return issue;
}

async function getLabelIds(linear, labelNames) {
  const labels = await linear.issueLabels();
  return labels.nodes
    .filter(l => labelNames.includes(l.name))
    .map(l => l.id);
}

module.exports = { createLinearIssueFromSentry };
```

### Sentry Performance Monitoring

Create Linear issues for performance regressions:

```javascript
// scripts/sentry-performance-monitor.js
async function checkPerformanceRegression() {
  const transactions = await Sentry.getTransactions({
    project: 'your-project',
    environment: 'production',
    query: 'p95(transaction.duration):>1000'  // P95 > 1 second
  });
  
  for (const transaction of transactions) {
    const linear = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY
    });
    
    // Check if issue already exists
    const existing = await linear.issues({
      filter: {
        title: { contains: `Performance: ${transaction.transaction}` }
      }
    });
    
    if (existing.nodes.length === 0) {
      await linear.issueCreate({
        teamId: 'CCB_TEAM_ID',
        title: `🐌 Performance Regression: ${transaction.transaction}`,
        description: `
**Transaction:** ${transaction.transaction}
**P95 Duration:** ${transaction.p95}ms (threshold: 1000ms)
**P50 Duration:** ${transaction.p50}ms
**Event Count:** ${transaction.count}

[View in Sentry](${transaction.url})
        `,
        priority: 2,  // High priority
        labelIds: ['monitoring:performance', 'monitoring:sentry', 'automated']
      });
    }
  }
}

// Run every hour
setInterval(checkPerformanceRegression, 60 * 60 * 1000);
```

### Best Practices

1. **Deduplication**
   - Check for existing Linear issues before creating new ones
   - Use Sentry issue fingerprinting
   - Group similar errors together

2. **Context Enrichment**
   - Include relevant tags (environment, release, user)
   - Add stack traces (formatted)
   - Link to Sentry for full details

3. **Priority Mapping**
   ```
   Sentry Level → Linear Priority
   ────────────────────────────────
   fatal        → urgent
   error        → high
   warning      → medium
   info         → low
   ```

4. **Auto-resolution**
   - When Sentry issue is resolved, update Linear issue
   - Add comment with resolution details
   - Move to "Done" status

5. **Release Tracking**
   - Tag Linear issues with release version
   - Track which release introduced the issue
   - Link to release notes

---

## Agent Best Practices

### Session Lifecycle Management

**1. Session Creation**
- Agent sessions are automatically created when:
  - Agent is @mentioned in a comment
  - Issue is assigned to agent
  - Agent proactively creates session via API

**2. Immediate Response (< 10 seconds)**
```javascript
// Example: Acknowledge session start
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'thought',
  body: '🤖 Received assignment, analyzing issue...'
});
```

**3. Session States**
- `pending` - Session created, agent not yet active
- `active` - Agent actively working
- `awaitingInput` - Agent waiting for user response
- `error` - Agent encountered an error
- `complete` - Agent finished work

**4. Activity Types**

Use semantic activity types to communicate:

```javascript
// Internal reasoning (not shown to users by default)
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'thought',
  body: 'Analyzing codebase structure...'
});

// Request clarification from user
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'elicitation',
  body: 'Which API endpoint should I modify? Please clarify.'
});

// Tool/action invocation
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'action',
  body: 'Running tests...',
  result: 'Tests passed ✅'
});

// Final response/completed work
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'response',
  body: 'Implemented feature and created PR: https://github.com/...'
});

// Error reporting
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'error',
  body: 'Failed to build: syntax error in file.ts:42'
});
```

### State Management Rules

**1. Issue State Transitions**
```javascript
async function manageIssueState(issue, agent) {
  // When agent starts work
  if (!['started', 'completed', 'canceled'].includes(issue.state.type)) {
    await linear.issueUpdate(issue.id, {
      stateId: FIRST_STARTED_STATE_ID  // "In Progress"
    });
  }
  
  // Set agent as delegate if not set
  if (!issue.delegate) {
    await linear.issueUpdate(issue.id, {
      delegateId: agent.id
    });
  }
}
```

**2. Completion Handling**
```javascript
async function completeWork(session, issue, outcome) {
  if (outcome === 'success') {
    // Emit response activity
    await linear.agentActivityCreate({
      sessionId: session.id,
      type: 'response',
      body: 'Work completed successfully. Created PR #123'
    });
    
    // Update issue state
    await linear.issueUpdate(issue.id, {
      stateId: IN_REVIEW_STATE_ID
    });
  } else if (outcome === 'needs_input') {
    // Emit elicitation activity
    await linear.agentActivityCreate({
      sessionId: session.id,
      type: 'elicitation',
      body: 'Need additional information to proceed...'
    });
    // Keep issue in "In Progress"
  } else if (outcome === 'error') {
    // Emit error activity
    await linear.agentActivityCreate({
      sessionId: session.id,
      type: 'error',
      body: 'Encountered error during execution...'
    });
    // Keep issue in "In Progress" or move to "Blocked"
  }
}
```

### Conversation History

**DO NOT rely on editable comments!**

```javascript
// ❌ WRONG: Using issue comments for conversation history
const comments = await issue.comments();
const history = comments.nodes.map(c => c.body);

// ✅ CORRECT: Use Agent Activities
async function getConversationHistory(session) {
  const activities = await linear.agentActivities({
    filter: { sessionId: session.id }
  });
  
  return activities.nodes
    .filter(a => a.type !== 'thought')  // Exclude internal thoughts
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(a => ({
      type: a.type,
      body: a.body,
      result: a.result,
      timestamp: a.createdAt
    }));
}
```

### Agent Interaction Patterns

**1. @Mention Pattern**
```javascript
// User mentions agent in comment
await linear.comment('CCB-123', {
  body: '@codegen please implement authentication'
});

// Agent receives webhook, creates session, responds
await handleMention(issue, mention) {
  const session = await linear.agentSessionCreate({
    issueId: issue.id,
    agentId: AGENT_ID
  });
  
  await linear.agentActivityCreate({
    sessionId: session.id,
    type: 'thought',
    body: 'Analyzing authentication requirements...'
  });
  
  // Do work...
  
  await linear.agentActivityCreate({
    sessionId: session.id,
    type: 'response',
    body: 'Implemented OAuth2 authentication. Ready for review.'
  });
}
```

**2. Assignment Pattern**
```javascript
// User assigns issue to agent
await linear.issueUpdate('CCB-123', {
  assigneeId: AGENT_ID
});

// Agent receives webhook, starts work
await handleAssignment(issue) {
  // Move to started state
  await manageIssueState(issue, agent);
  
  // Create session
  const session = await linear.agentSessionCreate({
    issueId: issue.id,
    agentId: AGENT_ID
  });
  
  // Acknowledge and start work
  await linear.agentActivityCreate({
    sessionId: session.id,
    type: 'thought',
    body: 'Starting work on assigned issue...'
  });
}
```

**3. Multi-Agent Collaboration**
```javascript
// Agent mentions another agent
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'action',
  body: '@cyrus please review the database schema changes',
  result: 'Waiting for review from Cyrus'
});

// Second agent joins session
const cyrusSession = await linear.agentSessionCreate({
  issueId: issue.id,
  agentId: CYRUS_AGENT_ID,
  parentSessionId: session.id  // Link to parent session
});
```

### Transparency Guidelines

**1. Progress Updates**
```javascript
// Provide regular updates for long-running tasks
async function longRunningTask(session) {
  await updateProgress(session, 'Starting build process...');
  
  await buildApp();
  await updateProgress(session, 'Build complete. Running tests...');
  
  await runTests();
  await updateProgress(session, 'Tests passed. Deploying...');
  
  await deploy();
  await updateProgress(session, 'Deployment successful ✅');
}

async function updateProgress(session, message) {
  await linear.agentActivityCreate({
    sessionId: session.id,
    type: 'action',
    body: message
  });
}
```

**2. Decision Transparency**
```javascript
// Explain reasoning behind decisions
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'thought',
  body: `
**Decision:** Using React Query for data fetching

**Reasoning:**
- Existing codebase uses React Query
- Provides built-in caching
- Reduces boilerplate code
- Team familiar with the library

**Alternatives considered:**
- SWR: Less mature ecosystem
- Redux: Too much overhead for simple data fetching
  `
});
```

**3. Error Communication**
```javascript
// Clear error reporting with context
await linear.agentActivityCreate({
  sessionId: session.id,
  type: 'error',
  body: `
❌ **Build Failed**

**Error:** Type error in \`src/utils/auth.ts:42\`

**Root Cause:** Missing type definition for User interface

**Attempted Fixes:**
1. Checked imports - all correct
2. Ran type generation - exposed missing type
3. Added type definition - build now passes

**Next Steps:**
Running tests to ensure fix doesn't break anything...
  `
});
```

### User Control & Disengagement

**1. Respecting Stop Requests**
```javascript
// User requests agent to stop
const stopKeywords = ['stop', 'cancel', 'abort', 'disengage'];

async function handleComment(comment, session) {
  const body = comment.body.toLowerCase();
  
  if (stopKeywords.some(kw => body.includes(kw))) {
    await linear.agentActivityCreate({
      sessionId: session.id,
      type: 'response',
      body: 'Understood. Stopping work immediately. Please let me know if you need anything else.'
    });
    
    await linear.agentSessionUpdate(session.id, {
      state: 'complete'
    });
    
    // Terminate all running processes
    await cleanupWork(session);
    return true;  // Don't continue processing
  }
  
  return false;  // Continue normally
}
```

**2. Permission for Re-engagement**
```javascript
// Wait for explicit permission to continue
async function requestPermission(session, action) {
  await linear.agentActivityCreate({
    sessionId: session.id,
    type: 'elicitation',
    body: `
I've completed the initial analysis. Next steps would be:
1. Modify database schema
2. Update API endpoints
3. Add migration scripts

**This will affect production data.**

Would you like me to proceed? Reply with "proceed" to continue or "stop" to review first.
    `
  });
  
  // Wait for user response before continuing
  await session.awaitUserResponse();
}
```

### Performance & Efficiency

**1. Session Timeout Management**
```javascript
// Activities can be sent for up to 30 minutes after session start
const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 minutes

async function workWithTimeout(session) {
  const startTime = Date.now();
  
  while (workRemaining) {
    if (Date.now() - startTime > SESSION_TIMEOUT - 5 * 60 * 1000) {
      // 5 minutes before timeout, warn user
      await linear.agentActivityCreate({
        sessionId: session.id,
        type: 'elicitation',
        body: 'Session nearing timeout. Continue in new session?'
      });
      
      // Wait for user confirmation or create new session
      break;
    }
    
    await doWork();
  }
}
```

**2. Batching Updates**
```javascript
// Batch multiple activities to reduce API calls
const activityBuffer = [];

async function addActivity(session, activity) {
  activityBuffer.push(activity);
  
  if (activityBuffer.length >= 5 || shouldFlush()) {
    await flushActivities(session);
  }
}

async function flushActivities(session) {
  if (activityBuffer.length === 0) return;
  
  // Linear doesn't have batch API yet, but this prepares for it
  for (const activity of activityBuffer) {
    await linear.agentActivityCreate({
      sessionId: session.id,
      ...activity
    });
  }
  
  activityBuffer.length = 0;
}
```

---

## Current Configuration Status

### ✅ Configured

1. **Team Setup**
   - Team Name: Claude Code Bot (CCB)
   - Team Key: CCB
   - Team Color: #ff324c

2. **Workflow States** (7 states)
   - Backlog, Todo, In Progress, In Review, Done, Canceled, Duplicate
   - Properly typed for agent automation

3. **Label System** (31 labels)
   - Domain labels (4)
   - Status labels (4)
   - Priority labels (4)
   - Type labels (6)
   - Agent labels (4)
   - Technology labels (3)
   - Automation labels (6)

### ⚠️ Needs Configuration

1. **GitHub Integration**
   - Install GitHub app
   - Connect repositories
   - Configure workflow automation rules
   - Set up branch-specific rules

2. **CircleCI Integration**
   - Add Linear API token to CircleCI
   - Configure CircleCI config with Linear updates
   - Set up health monitoring
   - Create automated issue creation scripts

3. **Sentry Integration**
   - Install Sentry integration in Linear
   - Configure Sentry alert rules
   - Set up automatic issue creation
   - Map Sentry severity to Linear priority

4. **Projects**
   - No projects currently configured
   - Create projects for major initiatives
   - Assign project leads
   - Set start/target dates

5. **Triage**
   - Configure triage inbox
   - Set up triage rules for automation
   - Define triage responsibility rotation

6. **Templates**
   - Create issue templates for common types
   - Set up project templates
   - Configure document templates

7. **Cycles** (Optional)
   - Enable cycles if using sprint-based workflow
   - Configure cycle duration
   - Set up cycle automation

### 📋 Recommended Next Steps

**Priority 1: GitHub Integration**
1. Install GitHub app from Linear settings
2. Connect your repositories
3. Configure PR workflow automations
4. Test issue linking methods

**Priority 2: CI/CD Monitoring**
1. Add Linear API token to CircleCI/GitHub Actions
2. Configure automated status updates
3. Set up health monitoring issue creation
4. Test full workflow end-to-end

**Priority 3: Error Tracking**
1. Install Sentry integration
2. Configure critical error → Linear issue rules
3. Set up performance monitoring
4. Test automatic issue creation

**Priority 4: Project Structure**
1. Create main projects for your initiatives
2. Assign project leads
3. Create project roadmap views
4. Link relevant issues to projects

**Priority 5: Advanced Features**
1. Enable cycles if needed
2. Configure triage for external issue intake
3. Create custom views for team needs
4. Set up notifications preferences

---

## Appendix: GraphQL Mutations

### Common Linear GraphQL Mutations for Agents

**Create Issue:**
```graphql
mutation CreateIssue($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue {
      id
      identifier
      title
      url
    }
  }
}
```

**Update Issue State:**
```graphql
mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) {
    success
    issue {
      id
      state {
        id
        name
        type
      }
    }
  }
}
```

**Create Agent Session:**
```graphql
mutation CreateSession($input: AgentSessionCreateInput!) {
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

**Create Agent Activity:**
```graphql
mutation CreateActivity($input: AgentActivityCreateInput!) {
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

**Add Comment:**
```graphql
mutation CreateComment($input: CommentCreateInput!) {
  commentCreate(input: $input) {
    success
    comment {
      id
      body
      createdAt
    }
  }
}
```

---

## Conclusion

This configuration guide provides a comprehensive foundation for setting up Linear to work seamlessly with Codegen agents, GitHub, CircleCI, and Sentry. The key to success is:

1. **Follow Linear's Agent Interaction Guidelines** - Transparency, user control, accountability
2. **Automate workflow transitions** - Reduce manual status updates
3. **Create clear feedback loops** - CI/CD → Linear, Sentry → Linear, Agents → Linear
4. **Maintain conversation history** - Use Agent Activities, not editable comments
5. **Respect user agency** - Always allow users to disengage agents

For questions or issues, refer to:
- [Linear Documentation](https://linear.app/docs)
- [Linear API Reference](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)
- [Linear Agent Interaction Guidelines](https://linear.app/developers/aig)
- [Codegen Documentation](https://docs.codegen.com)
