# Linear Implementation Checklist

This checklist provides step-by-step instructions for implementing the Linear configuration described in the [Configuration Guide](./LINEAR_CONFIGURATION_GUIDE.md).

---

## Phase 1: GitHub Integration (Priority 1)

### Step 1: Install GitHub Integration

- [ ] Go to Linear Settings → Features → Integrations
- [ ] Find "GitHub" integration
- [ ] Click "Add to Linear"
- [ ] Select your GitHub organization
- [ ] Click "Install" to install the Linear GitHub App

### Step 2: Connect Repositories

- [ ] In the GitHub integration settings, click "Connect Repositories"
- [ ] Select the repositories you want to integrate:
  - [ ] `evgenygurin/cyrus-null` (this repository)
  - [ ] Add any other relevant repositories
- [ ] Grant necessary permissions
- [ ] Authenticate your personal GitHub account

### Step 3: Configure PR Workflow Automations

Go to Settings → Integrations → GitHub → Workflow Automation

**For all branches:**
- [ ] **When PR is opened (draft)**
  - Action: Update issue status to "In Progress"
  - Action: Add label "status:draft"
  
- [ ] **When PR is ready for review**
  - Action: Update issue status to "In Review"
  - Action: Add label "status:needs-review"
  - Action: Remove label "status:draft"
  
- [ ] **When review is requested**
  - Action: Add label "status:in-review"
  
- [ ] **When changes are requested**
  - Action: Add label "review:changes-requested"
  - Action: Update issue status to "In Progress"
  
- [ ] **When PR is approved**
  - Action: Add label "status:approved"
  - Action: Remove label "status:needs-review"

**Branch-specific rules:**

**For `main` branch:**
- [ ] **When PR is merged to main**
  - Action: Update issue status to "Done"
  - Action: Add label "deployed"
  - Action: Add comment "✅ Merged to production"
  
- [ ] **When PR is closed without merge**
  - Action: Update issue status to "Canceled"
  - Action: Add comment "PR closed without merge"

**For `staging` branch (if you have one):**
- [ ] **When PR is merged to staging**
  - Action: Update issue status to "In QA"
  - Action: Add label "status:staging"
  - Action: Add comment "Deployed to staging"

**For `develop` branch (if you have one):**
- [ ] **When PR is merged to develop**
  - Action: Update issue status to "Testing"
  - Action: Add label "status:development"

### Step 4: Create GitHub Issue Templates

Create `.github/ISSUE_TEMPLATE/` directory with templates:

- [ ] **Bug Report Template** (`.github/ISSUE_TEMPLATE/bug_report.md`)
  ```markdown
  ---
  name: Bug Report
  about: Report a bug
  title: '[BUG] '
  labels: 'type:bugfix, priority:medium'
  ---
  
  **Linear Issue:** CCB-XXX
  
  ## Description
  A clear description of the bug.
  
  ## Steps to Reproduce
  1. 
  2. 
  3. 
  
  ## Expected Behavior
  
  ## Actual Behavior
  
  ## Environment
  - OS:
  - Browser:
  - Version:
  ```

- [ ] **Feature Request Template** (`.github/ISSUE_TEMPLATE/feature_request.md`)
  ```markdown
  ---
  name: Feature Request
  about: Suggest a new feature
  title: '[FEATURE] '
  labels: 'type:feature, priority:medium'
  ---
  
  **Linear Issue:** CCB-XXX
  
  ## Feature Description
  
  ## Use Case
  
  ## Proposed Solution
  
  ## Alternatives Considered
  ```

### Step 5: Create GitHub PR Template

- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`:
  ```markdown
  ## Linear Issue
  
  Fixes CCB-XXX
  
  ## Description
  
  Brief description of changes.
  
  ## Changes Made
  
  - [ ] Change 1
  - [ ] Change 2
  - [ ] Change 3
  
  ## Testing
  
  - [ ] Unit tests added/updated
  - [ ] Integration tests added/updated
  - [ ] Manual testing completed
  
  ## Checklist
  
  - [ ] Code follows project style guidelines
  - [ ] Self-review completed
  - [ ] Documentation updated
  - [ ] No new warnings
  - [ ] Tests pass locally
  
  ## Screenshots (if applicable)
  
  ## Additional Context
  ```

### Step 6: Test GitHub Integration

- [ ] Create a test issue in Linear (e.g., "Test GitHub Integration")
- [ ] Create a branch: `git checkout -b CCB-XXX-test-integration`
- [ ] Make a small change and commit
- [ ] Push branch: `git push origin CCB-XXX-test-integration`
- [ ] Create PR on GitHub with issue ID in title/description
- [ ] Verify Linear issue shows linked PR
- [ ] Test PR state transitions (draft → ready → approved → merged)
- [ ] Verify Linear issue status updates automatically
- [ ] Clean up test issue and PR

---

## Phase 2: CircleCI Integration (Priority 2)

### Step 1: Add Linear API Token to CircleCI

- [ ] Get Linear API token:
  - Go to Linear Settings → API → Personal API Keys
  - Click "Create Key"
  - Name it "CircleCI Integration"
  - Copy the token (save it securely!)

- [ ] Add to CircleCI:
  - Go to CircleCI project settings
  - Navigate to "Environment Variables"
  - Add variable: `LINEAR_API_KEY` with your token
  - Add variable: `LINEAR_TEAM_ID` with value: `9b57e540-4b72-46d5-a12f-b22198635ded`

### Step 2: Get Linear State IDs

Run this query in Linear API explorer (Settings → API → API Explorer):

```graphql
query GetTeamStates {
  team(id: "9b57e540-4b72-46d5-a12f-b22198635ded") {
    states {
      nodes {
        id
        name
        type
      }
    }
  }
}
```

Record the state IDs:
- [ ] In Progress state ID: `e8b67272-204e-4f32-898a-96b2fa2ea5ea`
- [ ] In Review state ID: `2f1bf008-49b1-45a7-80b9-9059cac24c75`
- [ ] Done state ID: `5a8d78af-94fd-4150-a333-b323544a9812`

Add these to CircleCI environment variables:
- [ ] `LINEAR_STATE_IN_PROGRESS`
- [ ] `LINEAR_STATE_IN_REVIEW`
- [ ] `LINEAR_STATE_DONE`

### Step 3: Get Linear Label IDs

Run this query:

```graphql
query GetLabels {
  team(id: "9b57e540-4b72-46d5-a12f-b22198635ded") {
    labels {
      nodes {
        id
        name
      }
    }
  }
}
```

Add important label IDs to CircleCI:
- [ ] `LINEAR_LABEL_CRITICAL` = `a93a0511-e3e3-417d-b41a-4c3e93b57192`
- [ ] `LINEAR_LABEL_AUTOMATED` = `20223c05-ac95-4fa1-9e46-0af0926ac147`

### Step 4: Create Linear Update Script

- [ ] Create `scripts/update-linear-status.sh`:
  ```bash
  #!/bin/bash
  
  # Extract Linear issue ID from branch name
  ISSUE_ID=$(echo $CIRCLE_BRANCH | grep -oE '[A-Z]+-[0-9]+')
  
  if [ -z "$ISSUE_ID" ]; then
    echo "No Linear issue ID found in branch name: $CIRCLE_BRANCH"
    exit 0
  fi
  
  WORKFLOW_STATUS=$1
  WORKFLOW_URL=$CIRCLE_BUILD_URL
  
  case $WORKFLOW_STATUS in
    "running")
      STATUS_ID=$LINEAR_STATE_IN_PROGRESS
      COMMENT="🔄 CircleCI workflow started: $WORKFLOW_URL"
      ;;
    "success")
      STATUS_ID=$LINEAR_STATE_IN_REVIEW
      COMMENT="✅ CircleCI checks passed: $WORKFLOW_URL"
      ;;
    "failed")
      STATUS_ID=$LINEAR_STATE_IN_PROGRESS
      COMMENT="❌ CircleCI checks failed: $WORKFLOW_URL"
      ;;
  esac
  
  # Get issue by identifier
  ISSUE_QUERY=$(cat <<EOF
  {
    "query": "query { issue(id: \"$ISSUE_ID\") { id } }"
  }
  EOF
  )
  
  ISSUE_RESPONSE=$(curl -s -X POST https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$ISSUE_QUERY")
  
  ISSUE_UUID=$(echo $ISSUE_RESPONSE | jq -r '.data.issue.id')
  
  if [ "$ISSUE_UUID" == "null" ]; then
    echo "Issue $ISSUE_ID not found"
    exit 0
  fi
  
  # Update Linear issue
  UPDATE_QUERY=$(cat <<EOF
  {
    "query": "mutation { commentCreate(input: { issueId: \"$ISSUE_UUID\", body: \"$COMMENT\" }) { success } issueUpdate(id: \"$ISSUE_UUID\", input: { stateId: \"$STATUS_ID\" }) { success } }"
  }
  EOF
  )
  
  curl -X POST https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_QUERY"
  
  echo "Updated Linear issue $ISSUE_ID"
  ```

- [ ] Make script executable: `chmod +x scripts/update-linear-status.sh`

### Step 5: Update CircleCI Configuration

- [ ] Update `.circleci/config.yml` to include Linear updates:
  ```yaml
  version: 2.1
  
  jobs:
    build-and-test:
      docker:
        - image: cimg/node:20.0
      steps:
        - checkout
        
        - run:
            name: Notify Linear - Starting
            command: ./scripts/update-linear-status.sh running
        
        - run:
            name: Install dependencies
            command: pnpm install
        
        - run:
            name: Run tests
            command: pnpm test:packages:run
        
        - run:
            name: Type check
            command: pnpm typecheck
        
        - run:
            name: Build
            command: pnpm build
        
        - run:
            name: Notify Linear - Success
            command: ./scripts/update-linear-status.sh success
            when: on_success
        
        - run:
            name: Notify Linear - Failure
            command: ./scripts/update-linear-status.sh failed
            when: on_fail
  
  workflows:
    build-test:
      jobs:
        - build-and-test
  ```

### Step 6: Create Health Monitoring Job

- [ ] Add to `.circleci/config.yml`:
  ```yaml
  jobs:
    health-check:
      docker:
        - image: cimg/node:20.0
      steps:
        - checkout
        
        - run:
            name: Run health checks
            command: |
              pnpm install
              pnpm test:packages:run
              pnpm build
        
        - run:
            name: Create Linear issue on failure
            command: |
              if [ $? -ne 0 ]; then
                MUTATION=$(cat <<EOF
                {
                  "query": "mutation {
                    issueCreate(input: {
                      teamId: \"$LINEAR_TEAM_ID\",
                      title: \"🚨 CRITICAL: Health Check Failed - $(date +%Y-%m-%d)\",
                      description: \"Automated health check failed.\\n\\nBuild: $CIRCLE_BUILD_URL\\nBranch: $CIRCLE_BRANCH\\nCommit: $CIRCLE_SHA1\",
                      priority: 1,
                      labelIds: [\"$LINEAR_LABEL_CRITICAL\", \"$LINEAR_LABEL_AUTOMATED\"]
                    }) {
                      success
                      issue { id identifier }
                    }
                  }"
                }
  EOF
                )
                
                curl -X POST https://api.linear.app/graphql \
                  -H "Authorization: $LINEAR_API_KEY" \
                  -H "Content-Type: application/json" \
                  -d "$MUTATION"
              fi
            when: on_fail
  
  workflows:
    scheduled-health:
      triggers:
        - schedule:
            cron: "0 */6 * * *"  # Every 6 hours
            filters:
              branches:
                only: main
      jobs:
        - health-check
  ```

### Step 7: Test CircleCI Integration

- [ ] Push changes to a test branch with Linear issue ID
- [ ] Verify CircleCI workflow runs
- [ ] Check that Linear issue receives status updates
- [ ] Verify comments appear in Linear
- [ ] Test failure scenario (introduce failing test)
- [ ] Verify failure notification in Linear

---

## Phase 3: Sentry Integration (Priority 3)

### Step 1: Install Sentry in Linear

- [ ] Go to Linear Settings → Integrations
- [ ] Find "Sentry" integration
- [ ] Click "Add to Linear"
- [ ] Authenticate with your Sentry account
- [ ] Select Sentry organization
- [ ] Select projects to connect

### Step 2: Configure Sentry Issue Creation Rules

In Sentry project settings (for each project):

- [ ] Go to Settings → Integrations → Linear
- [ ] Enable "Create Linear issues for new errors"
- [ ] Configure rule: "Create issue when error is first seen"
  - Team: Claude Code Bot (CCB)
  - Priority: High
  - Labels: `monitoring:sentry`, `automated`
  
- [ ] Configure rule: "Create issue when error regresses"
  - Team: Claude Code Bot (CCB)
  - Priority: Urgent
  - Labels: `monitoring:sentry`, `automated`, `critical`

### Step 3: Configure Sentry SDK in Application

Add/update Sentry configuration in your application:

**For Node.js/TypeScript:**
- [ ] Install Sentry: `pnpm add @sentry/node`
- [ ] Create `sentry.config.ts`:
  ```typescript
  import * as Sentry from '@sentry/node';
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Add Linear issue ID as tag
    beforeSend(event, hint) {
      // Try to extract Linear issue from context
      const issueId = extractLinearIssue(event);
      if (issueId) {
        event.tags = {
          ...event.tags,
          linear_issue: issueId
        };
      }
      return event;
    },
    
    // Performance monitoring
    tracesSampleRate: 0.1,
    
    // Session tracking
    autoSessionTracking: true,
  });
  
  function extractLinearIssue(event: Sentry.Event): string | null {
    // Check release version
    const release = event.release || '';
    const match = release.match(/[A-Z]+-\d+/);
    return match ? match[0] : null;
  }
  
  export default Sentry;
  ```

### Step 4: Create Sentry Alert Rules

In Sentry project settings:

- [ ] **Critical Production Errors**
  - Condition: `event.level:error` AND `event.tags.environment:production`
  - Action: Create Linear issue
  - Team: CCB
  - Priority: Urgent
  - Labels: `critical`, `monitoring:sentry`, `automated`
  
- [ ] **High Frequency Errors**
  - Condition: Event frequency > 100 per hour
  - Action: Create Linear issue
  - Team: CCB
  - Priority: High
  - Labels: `monitoring:sentry`, `automated`
  
- [ ] **Performance Regressions**
  - Condition: P95 duration > 1000ms
  - Action: Create Linear issue
  - Team: CCB
  - Priority: Medium
  - Labels: `monitoring:performance`, `monitoring:sentry`, `automated`

### Step 5: Configure Automatic Issue Resolution

- [ ] In Sentry → Settings → Integrations → Linear
- [ ] Enable "Update Linear issues when Sentry issues resolve"
- [ ] Configure to add comment and move to "Done" status

### Step 6: Create Performance Monitoring Script

- [ ] Create `scripts/sentry-performance-monitor.js`:
  ```javascript
  const { LinearClient } = require('@linear/sdk');
  const Sentry = require('@sentry/node');
  
  async function checkPerformanceRegression() {
    const linear = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY
    });
    
    // Get transactions with P95 > 1000ms
    const transactions = await Sentry.getTransactions({
      project: 'your-project',
      environment: 'production',
      query: 'p95(transaction.duration):>1000'
    });
    
    for (const transaction of transactions) {
      // Check if issue already exists
      const existing = await linear.issues({
        filter: {
          title: { contains: `Performance: ${transaction.transaction}` },
          state: { type: { nin: ['completed', 'canceled'] } }
        }
      });
      
      if (existing.nodes.length === 0) {
        await linear.issueCreate({
          teamId: '9b57e540-4b72-46d5-a12f-b22198635ded',
          title: `🐌 Performance Regression: ${transaction.transaction}`,
          description: `
  **Transaction:** ${transaction.transaction}
  **P95 Duration:** ${transaction.p95}ms (threshold: 1000ms)
  **P50 Duration:** ${transaction.p50}ms
  **Event Count:** ${transaction.count}
  **Environment:** production
  
  [View in Sentry](${transaction.url})
          `,
          priority: 2,
          labelIds: [
            // Add your label IDs
          ]
        });
      }
    }
  }
  
  // Run every hour
  setInterval(checkPerformanceRegression, 60 * 60 * 1000);
  ```

### Step 7: Test Sentry Integration

- [ ] Trigger a test error in your application
- [ ] Verify error appears in Sentry
- [ ] Check that Linear issue is created automatically
- [ ] Verify issue contains relevant error details
- [ ] Test issue resolution flow
- [ ] Mark error as resolved in Sentry
- [ ] Verify Linear issue updates accordingly

---

## Phase 4: Project Structure (Priority 4)

### Step 1: Create Main Projects

- [ ] Create project: "Cyrus Development"
  - Lead: [Assign yourself or team lead]
  - Start date: [Current date]
  - Target date: [3-6 months from now]
  - Description: Main development of Cyrus Linear-Claude agent
  
- [ ] Create project: "Infrastructure & DevOps"
  - Lead: [Assign]
  - Description: CI/CD, deployment, monitoring
  
- [ ] Create project: "Documentation"
  - Lead: [Assign]
  - Description: User guides, API docs, architecture docs

### Step 2: Link Existing Issues to Projects

- [ ] Review backlog issues
- [ ] Assign appropriate project to each issue
- [ ] Ensure all active issues have projects

### Step 3: Create Project Views

For each project:
- [ ] Create view: "Current Sprint"
  - Filter: State = In Progress OR In Review
  - Group by: Assignee
  
- [ ] Create view: "Bugs"
  - Filter: Label = type:bugfix
  - Sort by: Priority (descending)
  
- [ ] Create view: "Backlog"
  - Filter: State = Backlog OR Todo
  - Sort by: Priority, Created date

### Step 4: Create Project Roadmap

- [ ] Go to Projects view
- [ ] Switch to Timeline view
- [ ] Adjust project timelines
- [ ] Add milestones for each project
- [ ] Share roadmap with team

---

## Phase 5: Advanced Features (Priority 5)

### Step 1: Configure Triage

- [ ] Go to Settings → Teams → CCB → Triage
- [ ] Enable triage inbox
- [ ] Configure default triage rules:
  - Issues from GitHub → Triage
  - Issues from Sentry → Triage
  - Issues from non-team members → Triage

### Step 2: Create Triage Rules (Business/Enterprise only)

If you have Business or Enterprise plan:
- [ ] Create rule: "Critical errors to In Progress"
  - Condition: Label = critical
  - Action: Move to In Progress, assign to on-call
  
- [ ] Create rule: "Bugs to team lead"
  - Condition: Label = type:bugfix
  - Action: Assign to team lead for triage

### Step 3: Enable Cycles (Optional)

If using sprint-based workflow:
- [ ] Go to Settings → Teams → CCB → Cycles
- [ ] Enable cycles
- [ ] Set cycle duration (1 or 2 weeks recommended)
- [ ] Set cycle start day
- [ ] Configure auto-archive completed cycles

### Step 4: Create Custom Views

- [ ] **My Active Work**
  - Filter: Assignee = me, State = In Progress OR In Review
  - Group by: Project
  - Sort by: Priority
  
- [ ] **Needs Review**
  - Filter: State = In Review, Label = status:needs-review
  - Sort by: Created date (oldest first)
  
- [ ] **Blocked Items**
  - Filter: Label = status:blocked
  - Group by: Assignee
  - Sort by: Priority
  
- [ ] **Agent Queue**
  - Filter: Label contains "agent:"
  - Group by: Agent label
  - Sort by: Priority

### Step 5: Configure Notifications

- [ ] Go to Settings → Account → Notifications
- [ ] Configure notification preferences:
  - Issues assigned to you: ✅ Desktop + Slack
  - Issues you're subscribed to: ✅ Desktop
  - Mentions: ✅ Desktop + Slack + Email
  - Comments on issues: ✅ Desktop
  
- [ ] Configure email digest:
  - Frequency: Daily summary
  - Time: 9:00 AM
  - Include: Assigned issues, mentions

### Step 6: Set Up Team Slack Integration (Optional)

- [ ] Go to Settings → Integrations → Slack
- [ ] Connect Slack workspace
- [ ] Configure notifications:
  - New issues → #dev-notifications
  - Critical issues → #alerts
  - PR updates → #github-updates

---

## Phase 6: Agent Configuration

### Step 1: Create Agent User Accounts

For each agent you want to integrate:

- [ ] **Codegen Bot**
  - Go to Settings → Members
  - Invite: codegen@[your-domain].com
  - Role: Member
  - Set profile picture (robot emoji or icon)
  - Update name to "Codegen Bot"
  
- [ ] **Cyrus Bot**
  - Similar steps as above
  - Email: cyrus@[your-domain].com

### Step 2: Create OAuth Applications

For each agent:

- [ ] Go to Settings → API → Applications
- [ ] Create application: "Codegen Integration"
  - Redirect URL: [Your callback URL]
  - Scopes: `read`, `write`, `issues:create`, `comments:create`, `app:assignable`, `app:mentionable`
- [ ] Save Client ID and Client Secret

### Step 3: Configure Agent Session Behavior

In your agent code:

- [ ] Implement session creation on issue assignment
- [ ] Implement immediate acknowledgment (< 10 seconds)
- [ ] Implement activity types (thought, action, response, error, elicitation)
- [ ] Implement session state management
- [ ] Implement conversation history using agent activities

### Step 4: Test Agent Workflow

- [ ] Create test issue
- [ ] Assign to agent
- [ ] Verify agent acknowledges within 10 seconds
- [ ] Verify agent activities appear in Linear
- [ ] Verify status transitions work correctly
- [ ] Test @mention workflow
- [ ] Test multi-agent collaboration (if applicable)

---

## Verification & Testing

### Final Checklist

- [ ] **GitHub Integration**
  - ✅ PRs link to Linear issues automatically
  - ✅ Issue status updates on PR state changes
  - ✅ Branch names with issue IDs work correctly
  - ✅ PR comments appear in Linear
  
- [ ] **CircleCI Integration**
  - ✅ Build status updates appear in Linear
  - ✅ Failed builds create/update issues
  - ✅ Health monitoring creates issues on failure
  - ✅ Issue status updates based on CI state
  
- [ ] **Sentry Integration**
  - ✅ Errors create Linear issues automatically
  - ✅ Error details are formatted correctly
  - ✅ Performance issues are tracked
  - ✅ Resolved errors update Linear issues
  
- [ ] **Project Structure**
  - ✅ All major projects created
  - ✅ Issues assigned to projects
  - ✅ Roadmap is visible and accurate
  - ✅ Project views configured
  
- [ ] **Agent Configuration**
  - ✅ Agent accounts created and configured
  - ✅ OAuth applications set up
  - ✅ Session workflow tested
  - ✅ Activity types working correctly

### Success Metrics

After implementation, monitor these metrics:

- **Issue Resolution Time**: Time from creation to completion
- **PR Merge Time**: Time from PR creation to merge
- **CI Failure Rate**: Percentage of builds that fail
- **Error Rate**: Number of new Sentry issues per day
- **Agent Effectiveness**: Issues successfully completed by agents
- **Integration Usage**: Number of automatic status updates per day

### Troubleshooting

**GitHub integration not working:**
- [ ] Verify Linear GitHub app is installed
- [ ] Check repository is connected in Linear settings
- [ ] Verify branch/PR naming includes issue ID
- [ ] Check Linear issue exists and is accessible

**CircleCI updates failing:**
- [ ] Verify LINEAR_API_KEY is set in CircleCI
- [ ] Check script has execute permissions
- [ ] Verify Linear issue ID extraction works
- [ ] Check API response for errors

**Sentry issues not creating:**
- [ ] Verify Sentry integration is connected
- [ ] Check alert rules are configured
- [ ] Verify team ID and label IDs are correct
- [ ] Check Sentry project permissions

**Agent not responding:**
- [ ] Verify agent OAuth application scopes
- [ ] Check webhook delivery in Linear settings
- [ ] Verify agent service is running
- [ ] Check agent logs for errors

---

## Maintenance

### Weekly Tasks

- [ ] Review and triage unassigned issues
- [ ] Update project roadmap
- [ ] Check CI/CD health metrics
- [ ] Review Sentry error trends

### Monthly Tasks

- [ ] Review and update labels
- [ ] Archive completed projects
- [ ] Update workflow automation rules
- [ ] Review agent effectiveness metrics

### Quarterly Tasks

- [ ] Team retrospective on Linear usage
- [ ] Update documentation
- [ ] Review and optimize integrations
- [ ] Plan new automation opportunities

---

## Additional Resources

- **Linear Documentation**: https://linear.app/docs
- **Linear API**: https://developers.linear.app
- **GitHub Integration**: https://linear.app/docs/github
- **CircleCI Docs**: https://circleci.com/docs
- **Sentry Docs**: https://docs.sentry.io
- **Configuration Guide**: [LINEAR_CONFIGURATION_GUIDE.md](./LINEAR_CONFIGURATION_GUIDE.md)

---

## Support

If you encounter issues during implementation:

1. Check the [Configuration Guide](./LINEAR_CONFIGURATION_GUIDE.md) for detailed explanations
2. Review Linear's [Agent Interaction Guidelines](https://linear.app/developers/aig)
3. Check integration-specific documentation
4. Contact Linear support if needed
5. Review this repository's issue tracker for similar problems

---

**Last Updated**: 2025-01-29
**Version**: 1.0
