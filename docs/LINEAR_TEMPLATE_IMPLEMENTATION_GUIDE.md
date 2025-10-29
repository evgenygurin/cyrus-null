# Linear Template Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing all 10 issue templates in Linear's UI. These templates are specifically designed for autonomous agent workflows, multi-agent coordination, and platform integrations.

---

## Template Categories

### 🟢 Basic Templates (Human & Agent Tasks)
Templates 1-5 are suitable for both human and agent tasks.

### 🔵 Advanced Agent Templates
Templates 6-7 are specifically designed for autonomous agent session management and coordination.

### 🟣 Platform Integration Templates
Templates 8-10 are for Codegen platform integration, self-healing systems, and repository configuration.

---

## Implementation Instructions

### Navigation to Templates

1. Go to **Linear Settings** → **Teams** → **Claude Code Bot (CCB)**
2. Click on **Templates** tab
3. Click **"Create Template"** button

---

## Template 1: 🐛 Bug Report

**Navigation:** Team Settings → Templates → Create Template

**Configuration:**
- **Name:** `🐛 Bug Report`
- **Description:** `Report a bug or unexpected behavior`
- **Type:** Issue Template

**Title Pattern:**
```
[Bug] {{summary}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `type:bugfix`
- **State:** Backlog
- **Priority:** High

---

## Template 2: ✨ Feature Request

**Configuration:**
- **Name:** `✨ Feature Request`
- **Description:** `Propose a new feature or enhancement`

**Title Pattern:**
```
[Feature] {{summary}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `type:feature`
- **State:** Backlog
- **Priority:** Medium

---

## Template 3: 🤖 Agent Task

**Configuration:**
- **Name:** `🤖 Agent Task`
- **Description:** `Task for autonomous agent execution`

**Title Pattern:**
```
[Agent] {{summary}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `agent:cyrus`, `automated`
- **State:** Backlog
- **Assignee:** Cyrus Agent (if configured)

---

## Template 4: 🔌 Integration Issue

**Configuration:**
- **Name:** `🔌 Integration Issue`
- **Description:** `Issues with external service integrations`

**Title Pattern:**
```
[Integration] {{service}} - {{issue}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `domain:infrastructure`
- **State:** Todo
- **Priority:** High

---

## Template 5: ⚡ Performance Issue

**Configuration:**
- **Name:** `⚡ Performance Issue`
- **Description:** `Report performance problems or optimization needs`

**Title Pattern:**
```
[Performance] {{area}} - {{issue}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `monitoring:performance`, `type:refactor`
- **State:** Backlog
- **Priority:** Medium

---

## Template 6: 🧠 Agent Session Management

**Configuration:**
- **Name:** `🧠 Agent Session Management`
- **Description:** `Configure and manage autonomous agent sessions`

**Title Pattern:**
```
[Session] {{agent_name}} - {{objective}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `agent:planning`, `automated`
- **State:** Backlog

---

## Template 7: 🤝 Multi-Agent Coordination

**Configuration:**
- **Name:** `🤝 Multi-Agent Coordination`
- **Description:** `Coordinate work across multiple autonomous agents`

**Title Pattern:**
```
[Multi-Agent] {{workflow_name}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `agent:multi`, `type:feature`, `agent:coordination`
- **State:** Backlog
- **Priority:** High

---

## Template 8: 🔌 Codegen Platform Task

**Configuration:**
- **Name:** `🔌 Codegen Platform Task`
- **Description:** `Tasks requiring Codegen platform integration and MCP servers`

**Title Pattern:**
```
[Codegen] {{task_name}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `agent:codegen`, `integration:codegen`, `automated`
- **State:** Backlog
- **Priority:** Medium

---

## Template 9: 🔄 Self-Healing System Alert

**Configuration:**
- **Name:** `🔄 Self-Healing System Alert`
- **Description:** `Automated detection and recovery from system issues`

**Title Pattern:**
```
[Self-Healing] {{system_component}} - {{issue_type}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `critical`, `monitoring:uptime`, `automated`, `self-healing`
- **State:** Todo
- **Priority:** Urgent

---

## Template 10: 📋 Repository Rules Configuration

**Configuration:**
- **Name:** `📋 Repository Rules & Prompts`
- **Description:** `Configure .codegen/ directory rules and AI prompting`

**Title Pattern:**
```
[Repo Rules] {{repository_name}} - {{rule_type}}
```

**Description Template:**
```markdown
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
```

**Default Values:**
- **Labels:** `type:documentation`, `domain:infrastructure`, `repository-rules`
- **State:** Backlog
- **Priority:** Medium

---

## Testing Templates

After creating each template, test it:

1. **Create Test Issue:**
   - Click "New Issue" in Linear
   - Select the template from dropdown
   - Verify all fields populate correctly
   - Check default labels are applied
   - Verify default state and priority

2. **Edit and Save:**
   - Fill in placeholder values
   - Save the issue
   - Verify formatting is preserved
   - Check that checklists work properly

3. **Agent Assignment:**
   - For agent templates (3, 6, 7, 8, 9):
   - Assign to an agent user
   - Verify workflow triggers (if configured)
   - Test mention functionality

---

## Template Maintenance

### Monthly Review
- [ ] Review template usage statistics
- [ ] Update templates based on feedback
- [ ] Add new templates as needs arise
- [ ] Archive unused templates

### Quarterly Updates
- [ ] Align with latest Linear features
- [ ] Update based on agent capabilities
- [ ] Incorporate lessons learned
- [ ] Document template changes

---

## Troubleshooting

**Issue: Template not showing in dropdown**
- Verify template is saved
- Check team settings
- Refresh Linear UI
- Clear browser cache

**Issue: Default values not applying**
- Verify label IDs are correct
- Check state configuration
- Ensure permissions are correct

**Issue: Markdown formatting broken**
- Use proper markdown syntax
- Test with markdown preview
- Avoid complex HTML
- Keep formatting simple

---

## Additional Resources

- **Linear Templates Documentation:** https://linear.app/docs/templates
- **Linear Agent Interaction Guidelines:** https://linear.app/developers/aig
- **Codegen Documentation:** https://docs.codegen.com
- **Configuration Guide:** [LINEAR_CONFIGURATION_GUIDE.md](./LINEAR_CONFIGURATION_GUIDE.md)

---

**Last Updated:** 2025-01-29  
**Version:** 1.0  
**Status:** Ready for implementation
