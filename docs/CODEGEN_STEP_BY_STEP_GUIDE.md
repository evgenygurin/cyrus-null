# Codegen Platform - Step-by-Step Agent Guide

> **Version**: 2.0 (Based on Official Documentation - January 2025)
> **Purpose**: Practical step-by-step guide for AI agents working with Codegen

## 📋 Quick Reference

This guide provides actionable workflows for AI agents. It complements @docs/CODEGEN_AGENT_INSTRUCTIONS.md with practical step-by-step procedures.

## 🎯 Core Agent Workflows

### Workflow 1: Processing a New Linear Issue

When a Linear issue is assigned to you:

**Step 1: Analyze Issue Context**

```python
# Read issue details
issue = linear.get_issue(issue_id)

# Extract key information
- Title: {issue.title}
- Description: {issue.description}
- Labels: {issue.labels}
- Priority: {issue.priority}
- Scope: Identify affected files/directories
```

**Step 2: Create Agent Run**

```python
from codegen import Agent

agent = Agent(org_id="...", token="...")

# Structure your prompt using 5 elements
run = agent.run(
    prompt="""
    Repository: {repo_name}
    Linear Issue: {issue.identifier} - {issue.title}

    Goal: {high_level_objective}

    Tasks:
    1. {specific_task_1}
    2. {specific_task_2}
    3. {specific_task_3}

    Context:
    - Follow pattern in {reference_file}
    - Use {tech_stack} conventions
    - Maintain {architectural_pattern}

    Success Criteria:
    - All existing tests pass
    - New tests with 90%+ coverage
    - Update {documentation_file}
    - Linear issue moved to "Done"
    """,
    repo_id=repo_id,
    metadata={
        'source_type': 'LINEAR',
        'linear_issue_id': issue.id,
        'linear_identifier': issue.identifier,
        'priority': issue.priority
    }
)
```

**Step 3: Monitor Execution**

```python
import time

while True:
    status = agent.get_run(run.id)

    if status.status in ["completed", "failed", "cancelled"]:
        break

    # Update Linear issue with progress
    linear.update_issue(
        issue_id=issue.id,
        comment=f"Agent status: {status.status}"
    )

    time.sleep(10)  # Poll every 10 seconds
```

**Step 4: Handle Completion**

```python
if status.status == "completed":
    # Update Linear issue
    linear.update_issue(
        issue_id=issue.id,
        state="Done",
        comment=f"""
        ✅ Implementation complete!

        Summary: {status.summary}

        Pull Requests:
        {'\n'.join([f"- {pr['url']}" for pr in status.github_pull_requests])}
        """
    )
else:
    # Handle failure
    linear.update_issue(
        issue_id=issue.id,
        comment=f"❌ Agent failed: {status.result}"
    )
```

### Workflow 2: Resuming Agent for Follow-up

When user comments on Linear issue requesting changes:

**Step 1: Identify Original Run**

```python
# Find original agent run from Linear issue metadata
original_run_id = issue.metadata.get('codegen_run_id')
```

**Step 2: Resume with New Prompt**

```python
resumed = agent.resume(
    agent_run_id=original_run_id,
    prompt=f"""
    Based on feedback in Linear issue {issue.identifier}:

    Requested changes:
    {user_comment}

    Please update the implementation accordingly.
    """
)
```

**Step 3: Track Resumed Run**

```python
# Same monitoring loop as Workflow 1
# Update Linear with progress
```

### Workflow 3: Handling Failed CI Checks

When Checks Auto-fixer fails:

**Step 1: Analyze Failure**

```python
# Get logs from failed agent run
logs = agent.get_logs(agent_run_id=run.id, limit=100)

# Identify failure patterns
failures = [
    log for log in logs.items
    if 'error' in log.observation.lower() or log.message_type == 'ERROR'
]
```

**Step 2: Create Fix Agent**

```python
fix_run = agent.run(
    prompt=f"""
    Repository: {repo_name}
    PR: {pr_url}

    Goal: Fix failing CI checks

    Failed Checks:
    {'\n'.join([f"- {check.name}: {check.error}" for check in failed_checks])}

    Logs Analysis:
    {'\n'.join([f"- {log.thought}" for log in failures])}

    Tasks:
    1. Analyze the specific failures
    2. Implement targeted fixes
    3. Verify all tests pass
    4. Do NOT introduce new changes

    Success Criteria:
    - All CI checks pass
    - No regression in existing functionality
    """,
    metadata={
        'type': 'ci_fix',
        'original_run_id': run.id,
        'failed_checks': [check.name for check in failed_checks]
    }
)
```

### Workflow 4: Multi-Agent Coordination (Team Plan)

For complex tasks requiring sub-agents:

**Step 1: Create Parent Agent**

```python
parent_run = agent.run(
    prompt="""
    Repository: monorepo

    Goal: Implement cross-service authentication

    Tasks:
    1. Update auth-service with JWT generation
    2. Update api-gateway with JWT validation
    3. Update user-service to verify tokens
    4. Add integration tests

    Please create sub-tasks for each service.
    """
)
```

**Step 2: Create Sub-Issues in Linear**

```python
sub_issues = []

for service in ['auth-service', 'api-gateway', 'user-service']:
    sub_issue = linear.create_issue(
        title=f"Implement JWT for {service}",
        parent_id=parent_issue.id,
        description=f"Part of {parent_issue.identifier}",
        assignee="Codegen Bot"
    )
    sub_issues.append(sub_issue)
```

**Step 3: Monitor Sub-Agents**

```python
# Each sub-issue creates its own agent run
# Parent agent monitors children
all_complete = False

while not all_complete:
    sub_statuses = [linear.get_issue(issue.id) for issue in sub_issues]
    all_complete = all(s.state.type == 'completed' for s in sub_statuses)
    time.sleep(30)

# Resume parent when all children complete
parent_resume = agent.resume(
    agent_run_id=parent_run.id,
    prompt="All sub-tasks complete. Please verify integration."
)
```

## 🔧 API Operations Guide

### Agent Creation with Best Practices

```python
def create_robust_agent_run(agent, prompt, repo_id, **kwargs):
    """
    Create agent run with error handling and retry logic.
    """
    max_retries = 5

    for attempt in range(max_retries):
        try:
            run = agent.run(
                prompt=prompt,
                repo_id=repo_id,
                metadata=kwargs.get('metadata', {}),
                model=kwargs.get('model', 'claude-sonnet-4'),
                agent_type='claude_code'  # Recommended
            )

            return run

        except RateLimitError:
            # Exponential backoff
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            logging.warning(f"Rate limited. Waiting {wait_time:.2f}s...")
            time.sleep(wait_time)

        except BillingLimitError:
            logging.error("Billing limit reached")
            return None

        except InsufficientAccessError:
            logging.error("Insufficient permissions")
            return None

    raise Exception("Max retries exceeded")
```

### Intelligent Polling Pattern

```python
def wait_for_completion(agent, run_id, timeout=3600, callback=None):
    """
    Poll agent run with exponential backoff and callbacks.
    """
    start_time = time.time()
    wait_time = 2  # Start with 2 seconds
    max_wait = 30  # Cap at 30 seconds

    while time.time() - start_time < timeout:
        status = agent.get_run(run_id)

        # Callback for progress updates
        if callback:
            callback(status)

        if status.status in ['completed', 'failed', 'cancelled']:
            return status

        # Exponential backoff
        time.sleep(wait_time)
        wait_time = min(wait_time * 1.5, max_wait)

    raise TimeoutError(f"Agent run {run_id} timed out after {timeout}s")
```

### Log Analysis for Debugging

```python
def analyze_agent_logs(agent, run_id, error_types=None):
    """
    Analyze agent logs to identify issues and patterns.
    """
    if error_types is None:
        error_types = ['ERROR', 'VALIDATION_ERROR', 'TIMEOUT']

    # Get recent logs
    logs_response = agent.get_logs(run_id, limit=100, reverse=True)

    analysis = {
        'errors': [],
        'tool_usage': {},
        'key_decisions': []
    }

    for log in logs_response.items:
        # Track errors
        if log.message_type in error_types:
            analysis['errors'].append({
                'timestamp': log.created_at,
                'type': log.message_type,
                'tool': log.tool_name,
                'observation': log.observation
            })

        # Track tool usage
        if log.tool_name:
            analysis['tool_usage'][log.tool_name] = \
                analysis['tool_usage'].get(log.tool_name, 0) + 1

        # Track key decisions
        if log.thought and 'because' in log.thought.lower():
            analysis['key_decisions'].append({
                'timestamp': log.created_at,
                'reasoning': log.thought
            })

    return analysis
```

## 📊 Sandbox Best Practices

### Setup Commands Template

```bash
# .codegen/setup-commands.txt

# 1. Install specific Node.js version
nvm install 20
nvm use 20

# 2. Install dependencies
npm ci

# 3. Build TypeScript
npm run build

# 4. Run database migrations (if applicable)
npm run migrate

# 5. Seed test data
npm run seed:test

# 6. Create required directories
mkdir -p logs tmp uploads

# 7. Verify installation
node --version
npm --version
```

### Environment Variables Configuration

```python
# Configure via Codegen UI or API
secrets = {
    'DATABASE_URL': 'postgresql://user:pass@localhost:5432/testdb',
    'REDIS_URL': 'redis://localhost:6379',
    'API_KEY': 'test_key_12345',  # NEVER production keys!
    'STRIPE_SECRET_KEY': 'sk_test_...',  # Test mode only
    'NODE_ENV': 'development'
}

# Accessed in sandbox as environment variables
# os.environ['DATABASE_URL']
```

### Web Preview Setup

```python
# For Next.js
"""
npm run dev -- -p 3000
"""

# For Django
"""
python manage.py runserver 127.0.0.1:3000
"""

# For Express
"""
PORT=3000 npm run dev
"""

# Access via CG_PREVIEW_URL environment variable
preview_url = os.environ.get('CG_PREVIEW_URL')
```

## ⚙️ Configuration Strategies

### Agent Behavior Settings

**For Production Repositories:**

```yaml
propose_plan: true  # Review before execution
require_explicit_mentions: true  # Prevent accidental triggers
enable_pr_creation: true
enable_rules_detection: true
```

**For Development Repositories:**

```yaml
propose_plan: false  # Faster iteration
require_explicit_mentions: false  # More proactive
enable_pr_creation: true
enable_rules_detection: true
```

### Check Suite Configuration

```python
# Configure retry behavior per check
agent.update_check_suite_settings(
    repo_id=456,
    check_retry_count=1,  # Global retry
    check_retry_counts={
        'integration-tests': 3,  # Flaky tests get more retries
        'e2e-tests': 2,
        'unit-tests': 1
    },
    custom_prompts={
        'lint': """
        Fix linting errors following our .eslintrc.json config.
        Focus on code style, not functional changes.
        """,
        'typescript': """
        Fix TypeScript errors with strict mode compliance.
        Prefer type safety over 'any' types.
        """
    },
    ignored_checks=['build-docs', 'preview-deploy'],
    high_priority_apps=['security-scan', 'type-check']
)
```

### Repository Rules Example

```markdown
# AGENTS.md

## Project: E-commerce API

### Technology Stack
- TypeScript 5.0+
- Node.js 20.x
- Express 4.x
- PostgreSQL 15
- Redis 7.x

### Architecture Patterns
- Clean Architecture (Controllers → Services → Repositories)
- Dependency Injection via constructor
- Repository pattern for data access
- Service layer for business logic

### Code Style
- ESLint + Prettier configuration in .eslintrc.json
- Max line length: 88 characters
- Trailing commas required
- Prefer async/await over .then()

### Testing Requirements
- Jest for unit tests
- Supertest for API tests
- Minimum 80% coverage
- Test files: *.test.ts next to source

### File Organization
```

src/
├── controllers/   # HTTP handlers
├── services/      # Business logic
├── repositories/  # Data access
├── models/        # TypeScript interfaces
├── middlewares/   # Express middleware
└── utils/         # Shared utilities

```bash

### Database
- Migrations in db/migrations/
- Use TypeORM for queries
- Never use raw SQL in services

### Security
- Validate all inputs with Joi
- Sanitize user data
- Rate limit: 100 req/15min
- JWT auth for protected routes
```

## 🎯 Prompting Excellence

### Template: Feature Implementation

```text
Repository: {repo_name}
Branch: {branch_name}
Files: {affected_files}

Goal: Implement {feature_name}

Requirements:
- {requirement_1}
- {requirement_2}
- {requirement_3}

Tasks:
1. Create {file_1} with {functionality_1}
2. Implement {method_name} in {class_name}
3. Add integration with {external_service}
4. Write comprehensive tests covering:
   - {test_scenario_1}
   - {test_scenario_2}
   - Edge cases: {edge_cases}

Context:
- Follow pattern in {reference_implementation}
- Use {library_name} version {version}
- Maintain consistency with {existing_feature}
- Database schema: {schema_reference}

Success Criteria:
- All existing tests pass (npm test)
- New tests with 90%+ coverage
- TypeScript compilation succeeds (tsc --noEmit)
- ESLint passes (npm run lint)
- Integration test with {service} works
- Update API documentation in docs/api/{endpoint}.md
```

### Template: Bug Fix

```text
Bug: {bug_title}
Repository: {repo_name}
File: {file_path}:{line_number}

Observed Behavior:
{what_is_happening}

Expected Behavior:
{what_should_happen}

Steps to Reproduce:
1. {step_1}
2. {step_2}
3. {step_3}

Error Message:
```

{error_stack_trace}

```bash

Root Cause Analysis:
{if_known_provide_analysis}

Proposed Fix:
{how_to_fix_it}

Testing Plan:
- Add regression test in {test_file}
- Verify scenario: {test_scenario}
- Ensure no side effects in {related_functionality}

Success Criteria:
- Bug no longer reproducible
- Regression test added and passing
- All existing tests still pass
- No performance degradation
```

### Template: Refactoring

```text
Refactoring: {what_to_refactor}
Repository: {repo_name}
Scope: {files_or_directories}

Current State:
{description_of_current_implementation}

Problems:
- {problem_1}
- {problem_2}
- {problem_3}

Target State:
{description_of_desired_implementation}

Pattern to Follow:
{reference_to_example_or_documentation}

Implementation Steps:
1. {step_1}
2. {step_2}
3. {step_3}

Safety Requirements:
- Maintain backward compatibility
- All tests must pass at each step
- No changes to public API
- Performance must not degrade

Success Criteria:
- Code is more maintainable
- Test coverage maintained or improved
- Documentation updated
- Team review approved
```

## 🚨 Error Handling Strategies

### Common Errors and Resolutions

**402 Payment Required**

```python
try:
    run = agent.run(prompt=prompt)
except BillingLimitError:
    # Notify admin
    notify_admin("Codegen billing limit reached")
    # Fallback: queue for manual processing
    manual_queue.add(task)
```

**429 Rate Limit Exceeded**

```python
def handle_rate_limit(func, *args, **kwargs):
    max_retries = 5

    for attempt in range(max_retries):
        try:
            return func(*args, **kwargs)
        except RateLimitError:
            wait = (2 ** attempt) + random.uniform(0, 1)
            time.sleep(wait)

    raise Exception("Rate limit exceeded after retries")
```

**422 Validation Error**

```python
try:
    run = agent.run(prompt=prompt, repo_id=invalid_repo)
except ValidationError as e:
    logging.error(f"Invalid parameters: {e.details}")
    # Fix parameters and retry
    corrected_run = agent.run(prompt=prompt, repo_id=valid_repo)
```

## 📈 Monitoring and Analytics

### Track Agent Performance

```python
def track_agent_metrics(run_id, issue_id):
    """
    Track key metrics for agent performance analysis.
    """
    start_time = time.time()

    # Wait for completion
    status = wait_for_completion(agent, run_id)

    execution_time = time.time() - start_time

    # Analyze logs
    logs = agent.get_logs(run_id, limit=100)

    metrics = {
        'run_id': run_id,
        'issue_id': issue_id,
        'status': status.status,
        'execution_time_seconds': execution_time,
        'total_logs': logs.total_logs,
        'tools_used': len(set([l.tool_name for l in logs.items if l.tool_name])),
        'errors_count': len([l for l in logs.items if l.message_type == 'ERROR']),
        'pr_count': len(status.github_pull_requests),
        'created_at': status.created_at
    }

    # Store metrics
    store_metrics(metrics)

    return metrics
```

### Dashboard Queries

```python
# Most used tools
tool_usage = {}
for run in recent_runs:
    logs = agent.get_logs(run.id)
    for log in logs.items:
        if log.tool_name:
            tool_usage[log.tool_name] = tool_usage.get(log.tool_name, 0) + 1

# Success rate
total_runs = len(recent_runs)
successful = len([r for r in recent_runs if r.status == 'completed'])
success_rate = (successful / total_runs) * 100

# Average execution time
avg_time = sum([r.execution_time for r in recent_runs]) / total_runs
```

## 🎓 Advanced Patterns

### Pattern 1: Conditional Agent Execution

```python
def smart_agent_execution(issue, changes):
    """
    Execute agent only if changes meet certain criteria.
    """
    # Analyze changes
    has_tests = any('test' in f['path'] for f in changes['files'])
    has_src = any('src/' in f['path'] for f in changes['files'])
    lines_changed = sum(f['additions'] + f['deletions'] for f in changes['files'])

    # Determine if agent should run
    should_run = False
    tasks = []

    if has_src and not has_tests:
        should_run = True
        tasks.append("Add tests to cover source changes")

    if lines_changed > 500:
        should_run = True
        tasks.append("Review large changeset for quality")

    # Execute if criteria met
    if should_run:
        prompt = f"""
        Issue: {issue.identifier}

        Tasks:
        {chr(10).join([f'{i+1}. {t}' for i, t in enumerate(tasks)])}

        Files changed:
        {chr(10).join([f"- {f['path']}" for f in changes['files']])}
        """

        return agent.run(prompt=prompt, repo_id=issue.repo_id)

    return None
```

### Pattern 2: Agent Conversation Chaining

```python
def multi_step_workflow(repo_id):
    """
    Chain multiple agent interactions for complex workflows.
    """
    # Step 1: Analysis
    analysis = agent.run(
        prompt="""
        Analyze the codebase and identify:
        1. Areas with low test coverage
        2. Code duplication opportunities
        3. Performance bottlenecks

        Provide structured recommendations.
        """,
        repo_id=repo_id,
        metadata={'workflow_step': 'analysis'}
    )

    analysis_result = wait_for_completion(agent, analysis.id)

    # Step 2: Implementation based on analysis
    if 'test coverage' in analysis_result.summary.lower():
        testing = agent.resume(
            agent_run_id=analysis.id,
            prompt="""
            Based on your analysis, add tests for low coverage areas.
            Target 80%+ coverage.
            """
        )
        wait_for_completion(agent, testing.id)

    # Step 3: Refactoring
    if 'duplication' in analysis_result.summary.lower():
        refactor = agent.run(
            prompt="""
            Based on previous analysis, refactor duplicated code.
            Extract into shared utilities.
            """,
            repo_id=repo_id,
            metadata={'workflow_step': 'refactoring'}
        )
        wait_for_completion(agent, refactor.id)
```

### Pattern 3: Integration with CI/CD

```python
def ci_integration_handler():
    """
    Handle CI/CD pipeline integration.
    """
    pr_number = os.environ.get('PR_NUMBER')
    commit_sha = os.environ.get('COMMIT_SHA')

    agent = Agent(org_id=os.environ['CODEGEN_ORG_ID'],
                  token=os.environ['CODEGEN_API_TOKEN'])

    run = agent.run(
        prompt=f"""
        Review PR #{pr_number} (commit {commit_sha})

        Checklist:
        1. Run all tests
        2. Check linting
        3. Verify code coverage >80%
        4. Security scan
        5. Comment on PR with findings

        If all pass, approve. If issues found, request changes.
        """,
        metadata={
            'pr_number': pr_number,
            'commit_sha': commit_sha,
            'ci_run': True
        }
    )

    result = wait_for_completion(agent, run.id)

    # Set CI exit code
    sys.exit(0 if 'approved' in result.summary.lower() else 1)
```

---

## 🎯 Quick Decision Tree

**"Should I create a new agent run or resume existing?"**

```sql
Is this a follow-up to previous work?
├─ YES → Use agent.resume() with original run_id
└─ NO → Create new agent.run()
```

**"Which agent type should I use?"**

```text
Do you need Claude Code features?
├─ YES → agent_type='claude_code' (recommended)
└─ NO → agent_type='codegen'
```

**"How long should I wait before polling?"**

```text
Task complexity:
├─ Simple (< 5 min expected) → Poll every 5s, max_wait 10s
├─ Medium (5-15 min expected) → Poll every 10s, max_wait 30s
└─ Complex (> 15 min expected) → Poll every 30s, max_wait 60s
```

**"Should I enable 'Propose Plan'?"**

```text
Repository type:
├─ Production/Critical → YES
├─ Development → NO
└─ Testing → NO
```

---

**Document Status**: ✅ Complete
**Based On**: Official Codegen Documentation (January 2025)
**Coverage**: Workflows, API patterns, sandbox management, configuration, prompting, error handling, monitoring
