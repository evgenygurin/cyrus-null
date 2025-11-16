# Phase 1: Linear UI Configuration Guide

## Overview
This document provides step-by-step instructions for completing Phase 1 workspace configuration through Linear's UI. These configurations cannot be automated via API and must be done manually.

---

## ✅ Completed Programmatically
- [x] 4 Strategic Projects Created
  - Agent Development
  - Infrastructure & DevOps  
  - Documentation & Knowledge Base
  - Integration & Automation
- [x] 6 Project Milestones Created
- [x] 30+ Labels Already Configured

---

## 🔧 Required UI Configurations

### 1. Workflow States Enhancement

**Navigation:** Team Settings → Workflow → States

Add the following custom states:

#### Ready (Unstarted Type)
- **Name:** Ready
- **Type:** Unstarted
- **Description:** Fully specified work ready for execution
- **Color:** Blue (#3b82f6)
- **Position:** After "Todo"

#### Blocked (Started Type)
- **Name:** Blocked
- **Type:** Started  
- **Description:** Waiting on dependencies or external blockers
- **Color:** Orange (#f97316)
- **Position:** After "In Progress"

#### Ready to Merge (Started Type)
- **Name:** Ready to Merge
- **Type:** Started
- **Description:** PR approved and ready for merge
- **Color:** Purple (#a855f7)
- **Position:** After "In Review"

#### Deployed (Completed Type)
- **Name:** Deployed
- **Type:** Completed
- **Description:** Successfully deployed to production
- **Color:** Green (#10b981)
- **Position:** After "Done"

#### Auto-Archive Settings
- **Setting:** Team Settings → Workflow → Auto-archive
- **Configure:**
  - ✅ Auto-archive completed issues after 14 days
  - ✅ Auto-close inactive issues after 30 days

**Expected Result:** 11 total workflow states covering entire lifecycle

---

### 2. Enhanced Label System

**Navigation:** Team Settings → Labels → Create Label

Add the following label categories:

#### CI/CD Labels
```
ci:github-actions     #22c55e  "GitHub Actions workflow"
ci:circleci          #343434  "CircleCI pipeline"  
ci:jenkins           #d24939  "Jenkins job"
ci:failing           #ef4444  "CI pipeline failing"
ci:passing           #10b981  "CI pipeline passing"
```

#### Monitoring Labels
```
monitoring:sentry      #362d59  "Sentry error tracking"
monitoring:performance #f59e0b  "Performance monitoring"
monitoring:uptime      #06b6d4  "Uptime monitoring"
monitoring:logs        #64748b  "Log aggregation"
```

#### Environment Labels
```
env:production   #dc2626  "Production environment"
env:staging      #f59e0b  "Staging environment"  
env:development  #3b82f6  "Development environment"
env:local        #6b7280  "Local development"
```

#### Integration Labels
```
integration:github    #171515  "GitHub integration"
integration:linear    #5e6ad2  "Linear integration"
integration:slack     #e01e5a  "Slack integration"
integration:notion    #000000  "Notion integration"
integration:figma     #f24e1e  "Figma integration"
```

#### Review Labels (Additional)
```
review:security      #7c3aed  "Security review required"
review:performance   #f59e0b  "Performance review needed"
review:architecture  #8b5cf6  "Architecture review"
```

#### Agent Workflow Labels
```
agent:planning     #ec4899  "Agent in planning phase"
agent:executing    #3b82f6  "Agent executing task"
agent:reviewing    #a855f7  "Agent reviewing work"
agent:blocked      #f97316  "Agent blocked on issue"
agent:completed    #10b981  "Agent completed task"
```

**Expected Result:** 50+ total labels for comprehensive categorization

---

### 3. Issue Templates

**Navigation:** Team Settings → Templates → Create Template

#### Template 1: Bug Report
```yaml
Name: 🐛 Bug Report
Description: Report a bug or unexpected behavior
Fields:
  - Title: [Bug] {{summary}}
  - Description: |
      ## Bug Description
      Clear description of the bug
      
      ## Steps to Reproduce
      1. 
      2. 
      3. 
      
      ## Expected Behavior
      What should happen
      
      ## Actual Behavior
      What actually happens
      
      ## Environment
      - OS: 
      - Browser/Node version:
      - Package version:
      
      ## Additional Context
      Screenshots, logs, etc.
      
Default Labels: type:bugfix
Default State: Backlog
Default Priority: High
```

#### Template 2: Feature Request
```yaml
Name: ✨ Feature Request
Description: Propose a new feature or enhancement
Fields:
  - Title: [Feature] {{summary}}
  - Description: |
      ## Feature Description
      Clear description of the proposed feature
      
      ## Problem Statement
      What problem does this solve?
      
      ## Proposed Solution
      How should this work?
      
      ## Alternatives Considered
      What other approaches did you consider?
      
      ## Success Criteria
      How will we know this is successful?
      
      ## Dependencies
      What does this depend on?
      
Default Labels: type:feature
Default State: Backlog  
Default Priority: Medium
```

#### Template 3: Agent Task
```yaml
Name: 🤖 Agent Task
Description: Task for autonomous agent execution
Fields:
  - Title: [Agent] {{summary}}
  - Description: |
      ## Objective
      Clear, specific goal for the agent
      
      ## Context
      Relevant background and constraints
      
      ## Acceptance Criteria
      - [ ] Criterion 1
      - [ ] Criterion 2
      - [ ] Criterion 3
      
      ## Files/Modules
      Which parts of codebase are affected?
      
      ## Testing Requirements
      What tests are needed?
      
      ## Agent Instructions
      Special instructions or preferences
      
Default Labels: agent:cyrus, automated
Default State: Backlog
Default Assignee: Cyrus Agent
```

#### Template 4: Integration Issue
```yaml
Name: 🔌 Integration Issue
Description: Issues with external service integrations
Fields:
  - Title: [Integration] {{service}} - {{issue}}
  - Description: |
      ## Integration Service
      Which service? (GitHub, CircleCI, Sentry, etc.)
      
      ## Issue Description
      What's not working?
      
      ## Error Messages
      ```
      Paste error messages here
      ```
      
      ## Configuration
      Relevant config settings (sanitized)
      
      ## Expected Behavior
      How should the integration work?
      
      ## Impact
      What's affected by this issue?
      
Default Labels: domain:infrastructure
Default State: Todo
Default Priority: High
```

#### Template 5: Performance Issue
```yaml
Name: ⚡ Performance Issue  
Description: Report performance problems or optimization needs
Fields:
  - Title: [Performance] {{area}} - {{issue}}
  - Description: |
      ## Performance Issue
      What's slow or inefficient?
      
      ## Current Performance
      - Metric: 
      - Value:
      
      ## Target Performance
      - Metric:
      - Target:
      
      ## Affected Areas
      Which parts of the system?
      
      ## Profiling Data
      Include profiling results if available
      
      ## Proposed Optimizations
      Ideas for improvement
      
Default Labels: monitoring:performance, type:refactor
Default State: Backlog
Default Priority: Medium
```

#### Template 6: Agent Session Management
```yaml
Name: 🧠 Agent Session Management
Description: Configure and manage autonomous agent sessions
Fields:
  - Title: [Session] {{agent_name}} - {{objective}}
  - Description: |
      ## Session Type
      - [ ] Single-agent execution
      - [ ] Multi-agent collaboration
      - [ ] Parent-child session hierarchy
      - [ ] Long-running workflow
      
      ## Agent Configuration
      **Primary Agent:** @[agent-name]
      **Collaborating Agents:** @[agent-1], @[agent-2]
      **Session Timeout:** 30 minutes (default)
      
      ## Objective
      Clear, specific goal for the agent session
      
      ## Context & Constraints
      - **Repository:** [repo-name]
      - **Branch Strategy:** [main/feature/hotfix]
      - **Files/Modules:** [list affected areas]
      - **Dependencies:** [external dependencies]
      
      ## Activity Tracking Requirements
      - [ ] Emit `thought` activities for internal reasoning
      - [ ] Emit `action` activities for tool invocations
      - [ ] Emit `elicitation` activities when user input needed
      - [ ] Emit `response` activities for completion
      - [ ] Emit `error` activities on failures
      
      ## Success Criteria
      - [ ] Criterion 1
      - [ ] Criterion 2
      - [ ] Criterion 3
      
      ## Response Time Requirements
      - **Initial Acknowledgment:** < 10 seconds
      - **Progress Updates:** Every 2-5 minutes
      - **Final Response:** As needed
      
      ## Session State Management
      - **Initial State:** Backlog/Todo → In Progress
      - **On Completion:** In Progress → In Review
      - **On Error:** In Progress → Blocked
      - **On User Stop:** Any → Complete (disengage)
      
      ## Parent Session (if child session)
      Link to parent: CCB-XXX
      
Default Labels: agent:planning, automated
Default State: Backlog
Default Assignee: [Select agent]
```

#### Template 7: Multi-Agent Coordination
```yaml
Name: 🤝 Multi-Agent Coordination
Description: Coordinate work across multiple autonomous agents
Fields:
  - Title: [Multi-Agent] {{workflow_name}}
  - Description: |
      ## Coordination Strategy
      - [ ] Sequential execution (Agent A → Agent B → Agent C)
      - [ ] Parallel execution (All agents work simultaneously)
      - [ ] Hierarchical (Parent agent delegates to children)
      - [ ] Collaborative (Agents work together on shared goal)
      
      ## Agent Roles & Responsibilities
      
      **Agent 1: @[agent-name]**
      - Role: [Backend/Frontend/DevOps/Testing]
      - Responsibilities:
        - Task 1
        - Task 2
      
      **Agent 2: @[agent-name]**
      - Role: [Backend/Frontend/DevOps/Testing]
      - Responsibilities:
        - Task 1
        - Task 2
      
      **Agent 3: @[agent-name]**
      - Role: [Backend/Frontend/DevOps/Testing]
      - Responsibilities:
        - Task 1
        - Task 2
      
      ## Workflow Phases
      
      ### Phase 1: [Name]
      - **Agent:** @[agent-name]
      - **Duration:** [estimate]
      - **Output:** [deliverable]
      - **Handoff to:** Phase 2
      
      ### Phase 2: [Name]
      - **Agent:** @[agent-name]
      - **Duration:** [estimate]
      - **Output:** [deliverable]
      - **Handoff to:** Phase 3
      
      ### Phase 3: [Name]
      - **Agent:** @[agent-name]
      - **Duration:** [estimate]
      - **Output:** [deliverable]
      - **Completion:** Final review
      
      ## Inter-Agent Communication Protocol
      - Agents use @mentions for handoffs
      - Each agent creates child session linked to parent
      - Progress tracked via agent activities
      - Session state reflects overall workflow state
      
      ## Dependencies & Blockers
      - [ ] Dependency 1
      - [ ] Dependency 2
      - [ ] Blocker 1 (if any)
      
      ## Conflict Resolution
      If agents disagree or encounter conflicts:
      1. Agents emit `elicitation` activity
      2. Request human arbitration
      3. Wait for user decision
      4. Resume based on user guidance
      
      ## Success Criteria
      - [ ] All agent phases complete successfully
      - [ ] No unresolved conflicts
      - [ ] All tests pass
      - [ ] Code review approved
      
Default Labels: agent:multi, type:feature, agent:coordination
Default State: Backlog
Default Priority: High
```

#### Template 8: Codegen Platform Integration
```yaml
Name: 🔌 Codegen Platform Task
Description: Tasks requiring Codegen platform integration and MCP servers
Fields:
  - Title: [Codegen] {{task_name}}
  - Description: |
      ## Codegen Configuration
      **Platform:** Codegen.com
      **MCP Servers Required:**
      - [ ] Linear MCP (issue management)
      - [ ] GitHub MCP (repository access)
      - [ ] File system MCP (local files)
      - [ ] Web search MCP (research)
      - [ ] Custom MCP: [name]
      
      ## Repository Rules (.codegen/)
      - [ ] Update .codegen/system.md
      - [ ] Update .codegen/context.md
      - [ ] Create task-specific prompts
      - [ ] Configure tool permissions
      
      ## Task Objective
      Clear description of what Codegen should accomplish
      
      ## Context Requirements
      **Required Context:**
      - Codebase files: [list]
      - Documentation: [links]
      - API references: [links]
      - Previous issues: [CCB-XXX, CCB-YYY]
      
      ## Tool Permissions
      - [ ] Read files
      - [ ] Write files
      - [ ] Execute commands
      - [ ] Make API calls
      - [ ] Create PRs
      - [ ] Update Linear issues
      
      ## Execution Strategy
      - [ ] Single-shot execution
      - [ ] Iterative refinement
      - [ ] Interactive mode (requires user feedback)
      - [ ] Background task (async)
      
      ## Integration Points
      - **GitHub:** [PR creation, branch management]
      - **Linear:** [issue updates, comments, session activities]
      - **CI/CD:** [trigger builds, wait for results]
      - **Monitoring:** [check Sentry, update status]
      
      ## Quality Gates
      - [ ] Type checking passes
      - [ ] Unit tests pass
      - [ ] Integration tests pass
      - [ ] Linting passes
      - [ ] Code review approved
      
      ## Acceptance Criteria
      - [ ] Criterion 1
      - [ ] Criterion 2
      - [ ] Criterion 3
      
      ## Rollback Plan
      If task fails or causes issues:
      1. [Rollback step 1]
      2. [Rollback step 2]
      3. [Notify team]
      
Default Labels: agent:codegen, integration:codegen, automated
Default State: Backlog
Default Priority: Medium
```

#### Template 9: Self-Healing System Issue
```yaml
Name: 🔄 Self-Healing System Alert
Description: Automated detection and recovery from system issues
Fields:
  - Title: [Self-Healing] {{system_component}} - {{issue_type}}
  - Description: |
      ## Issue Detection
      **Detected By:** [Monitoring system/Health check/CI/CD]
      **Detection Time:** [timestamp]
      **Severity:** [Critical/High/Medium/Low]
      
      ## System Component
      - **Component:** [name]
      - **Environment:** [production/staging/development]
      - **Status:** [degraded/failing/down]
      
      ## Error Details
      ```
      [Error message or stack trace]
      ```
      
      ## Metrics
      - **Error Rate:** [number] errors/min
      - **Affected Users:** [number or percentage]
      - **Duration:** [how long issue has persisted]
      - **SLO Impact:** [within/exceeded thresholds]
      
      ## Automated Recovery Attempts
      
      ### Attempt 1: [Recovery Action]
      - **Status:** [Success/Failed/In Progress]
      - **Time:** [timestamp]
      - **Result:** [description]
      
      ### Attempt 2: [Recovery Action]
      - **Status:** [Success/Failed/In Progress]
      - **Time:** [timestamp]
      - **Result:** [description]
      
      ### Attempt 3: [Recovery Action]
      - **Status:** [Success/Failed/In Progress]
      - **Time:** [timestamp]
      - **Result:** [description]
      
      ## Circuit Breaker Status
      - **State:** [Closed/Open/Half-Open]
      - **Failure Threshold:** [number]
      - **Current Failures:** [number]
      - **Reset Timeout:** [duration]
      
      ## Agent Assignment
      If automated recovery fails after 3 attempts:
      - [ ] Assign to @[agent-name] for investigation
      - [ ] Escalate to human if agent cannot resolve
      - [ ] Page on-call engineer if critical
      
      ## Root Cause Analysis
      [To be filled by investigating agent or human]
      
      ## Prevention Strategy
      - [ ] Add monitoring for early detection
      - [ ] Implement additional health checks
      - [ ] Update runbook with recovery steps
      - [ ] Add automated tests for this scenario
      
      ## Related Issues
      - Similar issue: CCB-XXX
      - Previous occurrence: CCB-YYY
      
      ## Resolution
      [To be filled upon resolution]
      
Default Labels: critical, monitoring:uptime, automated, self-healing
Default State: Todo
Default Priority: Urgent
```

#### Template 10: Repository Rules Configuration
```yaml
Name: 📋 Repository Rules & Prompts
Description: Configure .codegen/ directory rules and AI prompting
Fields:
  - Title: [Repo Rules] {{repository_name}} - {{rule_type}}
  - Description: |
      ## Repository
      **Name:** [repository-name]
      **URL:** [github-url]
      **Branch:** [main/develop]
      
      ## Rule Type
      - [ ] System instructions (.codegen/system.md)
      - [ ] Context definitions (.codegen/context.md)
      - [ ] Task-specific prompts (.codegen/prompts/*)
      - [ ] Tool permissions (.codegen/tools.json)
      - [ ] Code style guidelines (.codegen/style.md)
      
      ## System Instructions
      ```markdown
      # System Instructions
      
      ## Project Overview
      [High-level description]
      
      ## Architecture
      [Key architectural decisions]
      
      ## Development Workflow
      [Standard workflow steps]
      
      ## Quality Standards
      [Testing, linting, review requirements]
      ```
      
      ## Context Definitions
      ```markdown
      # Context
      
      ## Key Concepts
      - Concept 1: [definition]
      - Concept 2: [definition]
      
      ## Important Files
      - File 1: [purpose]
      - File 2: [purpose]
      
      ## External Dependencies
      - Dependency 1: [purpose]
      - Dependency 2: [purpose]
      ```
      
      ## Task-Specific Prompts
      
      ### Prompt: feature-development
      ```
      When developing new features:
      1. [Step 1]
      2. [Step 2]
      3. [Step 3]
      
      Always ensure:
      - [Requirement 1]
      - [Requirement 2]
      ```
      
      ### Prompt: bug-fixing
      ```
      When fixing bugs:
      1. [Step 1]
      2. [Step 2]
      3. [Step 3]
      ```
      
      ### Prompt: refactoring
      ```
      When refactoring code:
      1. [Step 1]
      2. [Step 2]
      3. [Step 3]
      ```
      
      ## Tool Permissions
      ```json
      {
        "allowedTools": [
          "read_file",
          "write_file",
          "execute_command",
          "create_pr",
          "update_issue"
        ],
        "restrictedPaths": [
          ".env",
          "secrets/",
          "credentials/"
        ],
        "allowedCommands": [
          "npm test",
          "npm build",
          "git status"
        ]
      }
      ```
      
      ## Code Style Guidelines
      - **Language:** [TypeScript/Python/etc]
      - **Formatter:** [Prettier/Black/etc]
      - **Linter:** [ESLint/Pylint/etc]
      - **Style Guide:** [Airbnb/Google/etc]
      
      ## Implementation Steps
      - [ ] Create .codegen/ directory
      - [ ] Write system.md
      - [ ] Write context.md
      - [ ] Create prompts/ subdirectory
      - [ ] Write task-specific prompts
      - [ ] Create tools.json
      - [ ] Write style.md
      - [ ] Test with sample agent task
      - [ ] Update main README.md to reference rules
      
      ## Validation
      - [ ] Rules are clear and unambiguous
      - [ ] Prompts follow best practices
      - [ ] Tool permissions are secure
      - [ ] All paths are correct
      - [ ] Documentation is complete
      
Default Labels: type:documentation, domain:infrastructure, repository-rules
Default State: Backlog
Default Priority: Medium
```

---

## Template Summary

The autonomous agent project now includes **10 comprehensive templates**:

### Basic Templates (1-5)
1. **🐛 Bug Report** - Standard bug reporting with environment details
2. **✨ Feature Request** - Feature proposals with alternatives analysis
3. **🤖 Agent Task** - General autonomous agent execution tasks
4. **🔌 Integration Issue** - External service integration problems
5. **⚡ Performance Issue** - Performance optimization needs

### Advanced Agent Templates (6-7)
6. **🧠 Agent Session Management** - Comprehensive agent session configuration
   - Session types (single/multi/parent-child)
   - Activity tracking (thought/action/elicitation/response/error)
   - Response time requirements (<10s acknowledgment)
   - State management workflows
   
7. **🤝 Multi-Agent Coordination** - Complex multi-agent workflows
   - Coordination strategies (sequential/parallel/hierarchical)
   - Agent role assignment
   - Workflow phases with handoffs
   - Inter-agent communication protocol
   - Conflict resolution procedures

### Platform Integration Templates (8-10)
8. **🔌 Codegen Platform Task** - Codegen.com integration tasks
   - MCP server configuration
   - Repository rules (.codegen/)
   - Tool permissions and security
   - Quality gates and rollback plans
   
9. **🔄 Self-Healing System Alert** - Automated issue detection & recovery
   - Automated recovery attempts (3 levels)
   - Circuit breaker status tracking
   - Escalation workflows
   - Root cause analysis framework
   
10. **📋 Repository Rules Configuration** - .codegen/ directory setup
    - System instructions and context
    - Task-specific prompts
    - Tool permissions and restrictions
    - Code style guidelines

### Template Usage Guidelines

**For Human Tasks:**
- Use Templates 1, 2, 4, 5 (Bug Report, Feature Request, Integration, Performance)

**For Simple Agent Tasks:**
- Use Template 3 (Agent Task)
- Use Template 6 (Agent Session Management) for better tracking

**For Complex Agent Workflows:**
- Use Template 7 (Multi-Agent Coordination) for orchestration
- Use Template 8 (Codegen Platform Task) for platform integration
- Use Template 9 (Self-Healing) for automated monitoring systems

**For Repository Configuration:**
- Use Template 10 (Repository Rules) to set up .codegen/ directory

---

### 4. Custom Views

**Navigation:** Team Settings → Views → Create View

#### View 1: My Active Work
```yaml
Name: 🎯 My Active Work
Type: List
Filters:
  - Assignee: Current user
  - State: In Progress, In Review, Blocked
Sort: Priority (High to Low)
Group By: State
```

#### View 2: Needs Review
```yaml
Name: 👀 Needs Review
Type: List
Filters:
  - State: In Review
  - Labels: Contains "status:needs-review"
Sort: Updated At (Oldest first)
Group By: Priority
```

#### View 3: Blocked Items
```yaml
Name: 🚧 Blocked Items
Type: List
Filters:
  - State: Blocked
  - OR Labels: Contains "status:blocked" OR "agent:blocked"
Sort: Created At (Oldest first)
Group By: Team
```

#### View 4: Agent Queue
```yaml
Name: 🤖 Agent Queue
Type: Board
Filters:
  - Assignee: Cyrus Agent OR Codegen Bot
  - State: Not Canceled, Not Done, Not Deployed
Columns: By State
Sort: Priority (High to Low)
```

#### View 5: Critical Issues
```yaml
Name: 🔴 Critical Issues
Type: List
Filters:
  - Priority: Urgent OR High
  - State: Not Completed, Not Canceled
  - OR Labels: Contains "critical" OR "priority:urgent"
Sort: Priority (High to Low), Created At (Oldest first)
Group By: State
```

#### View 6: CI/CD Status
```yaml
Name: 🔄 CI/CD Status
Type: List
Filters:
  - Labels: Contains any "ci:" prefix
  - State: Not Completed, Not Canceled
Sort: Updated At (Newest first)
Group By: Label (ci:*)
```

---

### 5. Cycles Configuration

**Navigation:** Team Settings → Cycles

#### Enable Cycles
```yaml
Settings:
  ✅ Enable cycles
  
Duration: 2 weeks
  
Start Day: Monday

Auto-archive: 
  ✅ Auto-archive completed cycles after end

Cycle Automation:
  ✅ Move incomplete issues to next cycle
  ✅ Notify team 2 days before cycle end
  
Cooldown Period: 0 days (continuous sprints)
```

#### Create Initial Cycle
```yaml
Name: Sprint 1 - Foundation
Start Date: Next Monday
Duration: 2 weeks
Description: Phase 1 workspace configuration and initial setup
```

---

### 6. Triage Configuration

**Navigation:** Team Settings → Triage

#### Enable Triage
```yaml
Settings:
  ✅ Enable triage for team
  
Triage Rules:
  1. New issues → Triage inbox
  2. No assignee → Triage inbox
  3. No project → Triage inbox
  
Auto-routing Rules:
  - Label "type:bugfix" AND Priority "Urgent" → Assign to on-call
  - Label "agent:*" → Assign to respective agent
  - Label "ci:failing" → Move to "Todo", set Priority "High"
  
Responsibility Rotation:
  ✅ Enable rotation
  Frequency: Weekly
  Team Members: [Configure based on team]
```

---

## Validation Checklist

After completing all configurations, verify:

### Workflow & States
- [ ] 11+ workflow states configured
  - [ ] Ready (Unstarted)
  - [ ] Blocked (Started)
  - [ ] Ready to Merge (Started)
  - [ ] Deployed (Completed)
- [ ] Auto-archive settings configured (14 days)
- [ ] Auto-close inactive issues (30 days)

### Labels
- [ ] 50+ labels across all categories
  - [ ] CI/CD labels (5)
  - [ ] Monitoring labels (4)
  - [ ] Environment labels (4)
  - [ ] Integration labels (5)
  - [ ] Review labels (3)
  - [ ] Agent workflow labels (5)

### Templates
- [ ] 10 issue templates created and tested
  - [ ] Bug Report template
  - [ ] Feature Request template
  - [ ] Agent Task template
  - [ ] Integration Issue template
  - [ ] Performance Issue template
  - [ ] **Agent Session Management template** (new)
  - [ ] **Multi-Agent Coordination template** (new)
  - [ ] **Codegen Platform Task template** (new)
  - [ ] **Self-Healing System Alert template** (new)
  - [ ] **Repository Rules Configuration template** (new)

### Views
- [ ] 6 custom views created and functional
  - [ ] My Active Work
  - [ ] Needs Review
  - [ ] Blocked Items
  - [ ] Agent Queue
  - [ ] Critical Issues
  - [ ] CI/CD Status

### Advanced Features
- [ ] Cycles enabled with 2-week duration
- [ ] Triage enabled with automation rules
- [ ] Initial cycle created (Sprint 1 - Foundation)

### Project Structure
- [ ] All 4 projects visible and accessible
  - [ ] Agent Development
  - [ ] Infrastructure & DevOps
  - [ ] Documentation & Knowledge Base
  - [ ] Integration & Automation
- [ ] All 6 milestones properly linked to projects

---

## Next Steps

Once Phase 1 is complete:

1. Update CCB-283 status to "Done"
2. Move to Phase 2 (CCB-284): Agent Session & Activity Management
3. Configure GitHub integration per docs/LINEAR_CONFIGURATION_GUIDE.md
4. Set up CircleCI and Sentry integrations

---

## Resources

- [Linear Workflow Documentation](https://linear.app/docs/workflows)
- [Linear Labels Guide](https://linear.app/docs/labels)
- [Linear Templates](https://linear.app/docs/templates)
- [Linear Cycles](https://linear.app/docs/cycles)
- [Linear Triage](https://linear.app/docs/triage)

---

**Document Status:** Ready for implementation  
**Last Updated:** 2025-10-29  
**Phase:** 1 of 12
