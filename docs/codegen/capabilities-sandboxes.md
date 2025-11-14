# Capabilities & Sandboxes - Complete Guide

> Part of Codegen Platform Documentation

## 📋 Quick Navigation

- **Claude Code Integration**: See Claude Code section below
- **Checks Auto-fixer**: See Auto-fixer section
- **PR Review**: See PR Review section
- **Analytics**: See Analytics section
- **Triggering Methods**: See Triggering section
- **Sandboxes**: See Sandboxes section

---

## 🤖 Claude Code Integration

### Overview

Claude Code is Anthropic's official CLI tool integrated through Codegen, bringing AI-assisted development capabilities with enterprise-grade infrastructure.

### Key Differences from Standard Codegen Agents

| Feature | Standard Agent | Claude Code Agent |
|---------|---------------|-------------------|
| **Logging** | Manual configuration | ✅ Automatic cloud sync |
| **MCP Integration** | Limited | ✅ Direct access to all connected tools |
| **Execution** | Synchronous | ✅ Background async execution |
| **Sandboxes** | Local only | ✅ Optional remote cloud environments |
| **Session History** | Local only | ✅ Persistent across all devices |

### Core Features

#### Session Management

- **Persistent History**: All local Claude sessions automatically sync to cloud
- **Searchable Conversations**: Access from any device at codegen.com/agents
- **Device Sync**: Continue work seamlessly across machines
- **Team Visibility**: Shared session history for collaboration

#### Tool Integration

Claude Code automatically accesses all Codegen integrations without additional setup:

- **Slack**: Message channels, DM users, get workspace info
- **Linear/Jira**: Create tickets, update status, query issues
- **GitHub**: Create PRs, review code, manage repositories
- **Custom MCP Servers**: Databases, APIs, custom tools

#### Development Capabilities

**Complex Workflows**:

```bash
codegen claude "When tests fail:
1. Create a Linear ticket with failure details
2. Notify the team on Slack #eng-alerts
3. Create a draft PR with potential fixes"
```

**Background Execution**:

```bash
# Long-running tasks execute asynchronously
codegen claude --background "Run full test suite and generate coverage report"

# Continue working while agent processes
```

**Remote Sandboxes**:

- Pre-configured dependencies
- Consistent tooling across team
- Cloud-based execution environments

### Getting Started

**Installation**:

```bash
# Install Codegen CLI
uv tool install codegen

# Verify installation
codegen --version
```

**Authentication**:

```bash
# Login with Codegen account
codegen login

# Verify authentication
codegen whoami
```

**Basic Usage**:

```bash
# Simple prompt
codegen claude "implement user authentication"

# With specific repository context
codegen claude "refactor UserService to use dependency injection"

# Background execution
codegen claude --background "run extensive test suite"

# Continue previous conversation
codegen claude --continue "now add password reset functionality"
```

### Analytics & Insights

Track through dashboard at codegen.com/agents:

- **Token Usage**: Monitor consumption across sessions
- **Task Completion**: Success rates and failure patterns
- **Integration Usage**: Which tools are used most frequently
- **Team Adoption**: Usage metrics across team members

### Best Practices

**When to Use Claude Code**:

- ✅ Complex multi-step workflows
- ✅ Integration with multiple platforms (Slack + Linear + GitHub)
- ✅ Long-running background tasks
- ✅ Team collaboration with shared context
- ✅ Persistent session history needed

**When to Use Standard Agents**:

- Simple one-off tasks
- GitHub-only workflows
- Immediate synchronous results required

---

## 🔧 Checks Auto-Fixer

### Overview

Intelligent automated system that monitors CI failures on Codegen pull requests and automatically pushes fix commits without manual intervention.

### How It Works

**5-Step Process**:

1. **Detection** 🔍

   - Monitors GitHub check runs in real-time
   - Detects CI status changes immediately
   - Triggers analysis on failure events

2. **Analysis** 🧠

   - Examines build logs comprehensively
   - Identifies error messages and stack traces
   - Determines root causes of failures

3. **Solution Generation** 💡

   - Creates targeted code changes
   - Applies fix patterns from historical data
   - Generates minimal, focused commits

4. **Application** ✅

   - Commits fixes to PR branch automatically
   - Includes descriptive commit messages
   - Triggers CI re-run

5. **Validation** 🎯
   - Monitors subsequent check runs
   - Confirms success or triggers retry
   - Reports final status

### Triggers for Auto-Fixing

Auto-fixing activates when:

**Compilation & Build**:

- TypeScript/JavaScript compilation errors
- Go/Rust/Java build failures
- Missing dependencies
- Configuration errors

**Testing**:

- Unit test failures
- Integration test failures
- E2E test failures
- Test timeout issues

**Code Quality**:

- ESLint/TSLint violations
- Prettier formatting issues
- Python flake8/black violations
- Go vet/golint issues

**Static Analysis**:

- Type checking errors
- Security scanner warnings
- Code complexity violations
- Dependency vulnerabilities

### Retry Logic

**Default Behavior**:

- **3 retries** before giving up
- Progressive learning from each attempt
- Escalation to human review after max retries

**Example Flow**:

```text
Attempt 1: Fix syntax error → CI passes ✅
```

```text
Attempt 1: Fix import statement → CI fails ❌
Attempt 2: Add missing dependency → CI fails ❌
Attempt 3: Update package.json + fix import → CI passes ✅
```

```text
Attempt 1: Fix test assertion → CI fails ❌
Attempt 2: Update test data → CI fails ❌
Attempt 3: Refactor test logic → CI fails ❌
→ Escalate to human review 👤
```

### Configuration Options

#### Organization Level

**Enable/Disable Feature**:

```text
Settings → Organization → Auto-fixer
[✓] Enable Checks Auto-fixer
```

**Global Retry Count**:

```text
Default Retry Count: [3]
Range: 0-10
```

#### Repository Level

**Per-Repository Settings**:

```python
# Get current settings
settings = agent.get_check_suite_settings(org_id=123, repo_id=456)

print(f"Global retry count: {settings.check_retry_count}")
print(f"Ignored checks: {settings.ignored_checks}")
```

**Custom Retry Counts**:

```python
# Configure per-check retry logic
agent.update_check_suite_settings(
    repo_id=456,
    check_retry_count=3,  # Global default
    check_retry_counts={
        "integration-tests": 5,  # More retries for flaky tests
        "e2e-tests": 3,
        "security-scan": 1,      # Don't retry security scans
        "lint-check": 2
    }
)
```

**Ignored Checks**:

```python
# Skip specific checks entirely
agent.update_check_suite_settings(
    repo_id=456,
    ignored_checks=[
        "docs-build",      # Skip documentation builds
        "spell-check",     # Skip spell checking
        "optional-lint"    # Skip optional linting
    ]
)
```

**Custom Prompts**:

```python
# Provide specific fix instructions per check
agent.update_check_suite_settings(
    repo_id=456,
    custom_prompts={
        "type-check": "Fix TypeScript errors using strict mode. Prefer type safety over 'any'",
        "security-scan": "Address all vulnerabilities with CVSS score > 7.0. Update dependencies when possible",
        "integration-tests": "Fix integration test failures. Check database connections and API responses carefully"
    }
)
```

**High Priority Apps**:

```python
# Apps that trigger immediate processing on failure
agent.update_check_suite_settings(
    repo_id=456,
    high_priority_apps=[
        "security-scan",      # Immediate attention for security
        "integration-tests",  # Critical business logic
        "production-build"    # Production deployments
    ]
)
```

### Limitations & Requirements

**Requirements**:

- ✅ Codegen must have write access to repository
- ✅ Feature must be enabled at org level
- ✅ Repository must have CI/CD configured
- ✅ Checks must report to GitHub via check runs API

**Limitations**:

- ❌ Only operates on Codegen-created PRs
- ❌ Respects team workflow permissions
- ❌ Cannot fix infrastructure failures
- ❌ Cannot access external services without credentials

### GitHub Integration

**Check Run Annotations**:

- Line-specific feedback in code
- Error messages with context
- Suggested fixes inline

**PR Comments**:

- Summary of attempted fixes
- Explanation of changes made
- Links to relevant documentation

**One-Click Fixes**:

- "Fix This" buttons in GitHub UI
- Instant application of suggested changes
- Real-time progress updates

### Complete Example

```python
from codegen import Agent
import time

def configure_autofixer_for_repo(org_id, repo_id):
    """Configure comprehensive auto-fixer settings."""

    agent = Agent(org_id=org_id, token="sk-...")

    # Get current settings
    current = agent.get_check_suite_settings(org_id=org_id, repo_id=repo_id)

    print("Current Auto-fixer Settings:")
    print(f"  Global retry count: {current.check_retry_count}")
    print(f"  Ignored checks: {current.ignored_checks}")
    print(f"  High priority: {current.high_priority_apps}")

    # Update with comprehensive configuration
    agent.update_check_suite_settings(
        repo_id=repo_id,

        # Global retry count
        check_retry_count=3,

        # Skip non-critical checks
        ignored_checks=[
            "docs-build",
            "spell-check",
            "markdown-lint"
        ],

        # Per-check retry logic
        check_retry_counts={
            "security-scan": 1,        # Don't retry security scans
            "type-check": 2,           # Quick fixes for type errors
            "unit-tests": 3,           # Standard retry for unit tests
            "integration-tests": 5,    # More retries for integration
            "e2e-tests": 4,            # E2E can be flaky
            "build-production": 2      # Production builds get fewer tries
        },

        # Custom prompts for each check type
        custom_prompts={
            "type-check": """
Fix TypeScript errors:
1. Use strict type checking
2. Prefer explicit types over 'any'
3. Fix import statements
4. Ensure all function signatures are typed
            """,

            "security-scan": """
Address security vulnerabilities:
1. Update dependencies to patched versions
2. Fix code patterns flagged by scanners
3. Address CVSS score > 7.0 first
4. Document any accepted risks
            """,

            "integration-tests": """
Fix integration test failures:
1. Check database connections and migrations
2. Verify API endpoints respond correctly
3. Ensure test data is properly seeded
4. Check for race conditions or timing issues
            """,

            "e2e-tests": """
Fix E2E test failures:
1. Verify UI elements exist before interaction
2. Add appropriate waits for async operations
3. Check for flaky selectors
4. Ensure test isolation
            """
        },

        # High priority apps get immediate processing
        high_priority_apps=[
            "security-scan",
            "integration-tests",
            "build-production"
        ]
    )

    print("\n✓ Auto-fixer configured successfully")

    # Verify configuration
    updated = agent.get_check_suite_settings(org_id=org_id, repo_id=repo_id)

    print("\nNew Auto-fixer Settings:")
    print(f"  Global retry count: {updated.check_retry_count}")
    print(f"  Ignored checks ({len(updated.ignored_checks)}): {updated.ignored_checks}")
    print(f"  Custom prompts: {len(updated.custom_prompts)} configured")
    print(f"  High priority apps: {updated.high_priority_apps}")

# Execute configuration
configure_autofixer_for_repo(org_id=123, repo_id=456)
```

---

## 📝 PR Review

### Overview

Automated code review system that conducts comprehensive analysis and provides actionable feedback on pull requests.

### What It Reviews

**Inline Feedback**:

- Line-specific comments with context
- Actionable suggestions for improvements
- Reference to best practices and patterns

**Security Analysis**:

- Vulnerability scanning (SQL injection, XSS, etc.)
- Unsafe pattern detection
- Dependency security checks
- Authentication/authorization issues

**Quality Assessment**:

- Code maintainability metrics
- Best practices adherence
- Design pattern recognition
- Performance considerations

**Design Evaluation**:

- Architectural feedback
- Structure and organization
- Separation of concerns
- SOLID principles compliance

### How to Enable

**Step 1: Organization Level**:

```text
Settings → Organization → PR Review
[✓] Enable PR Review
```

**Configuration Options**:

- Baseline review rules
- Organization-wide coding standards
- Security requirements
- Review frequency

**Step 2: Repository Level**:

```text
Repository Settings → Review
[✓] Enable for this repository
```

**Repository-Specific Options**:

- Custom review guidelines
- Language-specific requirements
- Framework conventions
- Project-specific patterns

**Both levels must be enabled** for feature to function.

### Review Process

**Automatic Activation**:

```text
1. Pull request created
2. Codegen agent automatically spins up
3. Comprehensive code analysis begins
4. Review posted as PR comments
```

**Review Timeline**:

- Small PRs (< 100 lines): ~2-5 minutes
- Medium PRs (100-500 lines): ~5-15 minutes
- Large PRs (500+ lines): ~15-30 minutes

### Configuration Options

**Organization Settings**:

```python
# Example organization-level rules
organization_rules = """
Code Review Standards:

1. Security:
   - No hardcoded credentials
   - Input validation required
   - SQL injection prevention

2. Quality:
   - All functions must have JSDoc/docstrings
   - Test coverage minimum 80%
   - No commented-out code

3. Style:
   - Follow ESLint/Prettier configuration
   - Meaningful variable names
   - Maximum function length: 50 lines

4. Architecture:
   - Single Responsibility Principle
   - Dependency Injection preferred
   - Avoid circular dependencies
"""
```

**Repository-Level Customization**:

Create `AGENTS.md` in repository root:

```markdown
# PR Review Guidelines

## Framework-Specific Rules

### React Components

- Use functional components with hooks
- Props must be typed with TypeScript
- Memoize expensive calculations
- Avoid inline function definitions in JSX

### API Endpoints

- All endpoints must have rate limiting
- Input validation using Zod schemas
- Error handling with proper HTTP codes
- OpenAPI documentation required

## Testing Requirements

- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 90% coverage for new code

## Security Checklist

- [ ] Input validation
- [ ] Authentication/authorization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
```

### Access Requirements

**Minimum Permissions**:

- ✅ Read access to repository
- ✅ PR comment permissions
- ✅ Check runs API access (if using status checks)

**Optional Permissions**:

- Suggested changes (requires write access)
- Auto-fix commits (requires write access)
- PR status updates (requires write access)

### Review Output Examples

**Inline Comment Example**:

```typescript
// File: src/services/UserService.ts
async function deleteUser(userId: string) {
  await db.query('DELETE FROM users WHERE id = ' + userId); // ⚠️ Security issue
}
```

**Codegen Review**:

```text
🔒 Security Vulnerability: SQL Injection Risk

This code is vulnerable to SQL injection. An attacker could pass a
malicious userId to delete arbitrary data or compromise the database.

Suggested fix:
async function deleteUser(userId: string) {
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}

Or using an ORM:
async function deleteUser(userId: string) {
  await User.destroy({ where: { id: userId } });
}

References:
- OWASP SQL Injection Prevention Cheat Sheet
- Your organization's security guidelines
```

**Architecture Feedback Example**:

```typescript
// File: src/components/UserDashboard.tsx
function UserDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  // ... 200 more lines of component logic
}
```

**Codegen Review**:

```text
📐 Architecture Suggestion: Component Too Large

This component has multiple responsibilities:
1. Data fetching
2. State management
3. UI rendering
4. Business logic

Consider refactoring into smaller, focused components:

1. Custom hook for data fetching:
   useUsers() -> handles API call and state

2. Separate UI components:
   UserList, UserCard, UserFilters

3. Business logic layer:
   userService.ts for API calls

Example refactor:
function UserDashboard() {
  const { users, loading, error } = useUsers();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <UserList users={users} />;
}

This improves:
- Testability
- Reusability
- Maintainability
- Code organization
```

### Best Practices

**Effective PR Review Configuration**:

```python
# Repository: AGENTS.md
"""
# PR Review Configuration

## Priority Checks

1. **Security** (CRITICAL):
   - Authentication/authorization
   - Input validation
   - SQL injection prevention
   - XSS prevention
   - Dependency vulnerabilities

2. **Correctness** (HIGH):
   - Business logic accuracy
   - Error handling
   - Edge cases coverage
   - Test coverage

3. **Maintainability** (MEDIUM):
   - Code organization
   - Documentation
   - Naming conventions
   - Code duplication

4. **Style** (LOW):
   - Formatting (automated)
   - Comment quality
   - File organization

## Language-Specific Guidelines

### TypeScript
- Strict mode enabled
- No 'any' types except when absolutely necessary
- Proper interface definitions
- Generics for reusable code

### Python
- Type hints required
- Docstrings for all public functions
- Follow PEP 8
- Use modern Python features (3.12+)

## Framework Guidelines

### Next.js
- Server components by default
- Client components only when needed
- Proper data fetching patterns
- Image optimization

### FastAPI
- Pydantic models for validation
- Dependency injection
- Proper async/await usage
- OpenAPI documentation
"""
```

---

## 📊 Analytics

### Overview

Comprehensive analytics platform for monitoring agent performance, costs, and team activity.

### Tracked Metrics

#### 1. Pull Request Analytics

**Metrics**:

- Code merged (lines, files, PRs)
- Review velocity (time to merge)
- Contributor activity patterns
- PR success rates

**Insights**:

- Which teams adopt agents fastest
- Merge time reduction percentages
- Code quality trends over time
- Bottleneck identification

#### 2. Agent Tool Usage

**Metrics**:

- Tool invocation frequency
- Success rates per tool
- Error patterns
- Integration performance

**Insights**:

- Most effective tools for tasks
- Tool usage optimization opportunities
- Integration health monitoring

#### 3. Cost Analysis

**Metrics**:

- Spending across models (Claude, GPT-4, etc.)
- Cost per agent run
- Cost per repository
- Token consumption trends

**Insights**:

- Model cost-effectiveness
- Budget forecasting
- Optimization opportunities
- ROI calculations

#### 4. Performance Insights

**Metrics**:

- Agent response times
- Task completion rates
- Retry frequency
- Success/failure ratios

**Insights**:

- Performance bottlenecks
- Task complexity analysis
- Agent efficiency trends

#### 5. Team Activity

**Metrics**:

- Team member agent interactions
- Feature adoption rates
- Collaboration patterns
- Usage frequency

**Insights**:

- Training needs identification
- Adoption barriers
- Team productivity patterns

### Dashboard Features

**Real-Time Monitoring**:

```text
┌─ Live Agent Activity ────────────────────────┐
│ Active Agents: 12                             │
│ Queued Tasks: 5                               │
│ Completed Today: 47                           │
│ Success Rate: 94.2%                           │
└───────────────────────────────────────────────┘
```

**Interactive Charts**:

- Time-series graphs for trend analysis
- Drill-down capabilities for detailed views
- Custom date range selection
- Export to CSV/PDF

**User-Specific Views**:

- Filter by team member
- Individual productivity metrics
- Personal usage patterns
- Cost attribution

**Status Filtering**:

- Completed, failed, cancelled, running
- Filter by source (Slack, Linear, GitHub, API)
- Repository-specific views
- Integration-specific metrics

### Key Insights & Reporting

**Merge Velocity Tracking**:

```text
Average Time to Merge (Last 30 Days)
─────────────────────────────────────
Without Agent: 4.2 days
With Agent:    1.8 days
Improvement:   -57% ✓
```

**Trend Analysis**:

```python
# Example: Agent effectiveness over time
{
  "month": "2025-01",
  "metrics": {
    "total_runs": 1250,
    "success_rate": 94.2,
    "avg_completion_time": "12m 34s",
    "cost_per_run": "$0.23",
    "lines_of_code": 45_000,
    "prs_created": 183
  }
}
```

**Cost Breakdown**:

```text
Model Usage & Costs (January 2025)
───────────────────────────────────────
Claude 4 Sonnet:  $2,340 (78%)
Claude 4 Opus:      $520 (17%)
Claude 4 Haiku:     $150 (5%)
───────────────────────────────────────
Total:            $3,010
```

**Live Dashboards**:

Access at `codegen.com/analytics`

- Real-time agent activity
- Cost tracking
- Performance metrics
- Team adoption

### Practical Applications

**1. ROI Evaluation**:

```python
# Calculate ROI for agent adoption
monthly_cost = 3_010  # From analytics
prs_created = 183
time_saved_per_pr = 2  # hours
engineer_hourly_rate = 75

time_saved_total = prs_created * time_saved_per_pr  # 366 hours
value_of_time = time_saved_total * engineer_hourly_rate  # $27,450

roi = ((value_of_time - monthly_cost) / monthly_cost) * 100
print(f"ROI: {roi}%")  # ~812% ROI
```

**2. Model Selection Optimization**:

```python
# Analyze cost-performance balance
from analytics import get_model_performance

models = get_model_performance(date_range="last_30_days")

for model in models:
    cost_per_success = model.total_cost / model.successful_runs
    avg_quality_score = model.avg_quality_rating

    print(f"{model.name}:")
    print(f"  Cost per success: ${cost_per_success:.2f}")
    print(f"  Quality score: {avg_quality_score}/5")
    print(f"  Efficiency: {avg_quality_score / cost_per_success:.2f}")

# Output:
# Claude 4 Sonnet:
#   Cost per success: $0.18
#   Quality score: 4.6/5
#   Efficiency: 25.56
#
# Claude 4 Opus:
#   Cost per success: $0.45
#   Quality score: 4.8/5
#   Efficiency: 10.67
```

**3. Budget Forecasting**:

```python
# Forecast next month's costs
from analytics import forecast_costs

forecast = forecast_costs(
    historical_months=3,
    growth_rate=0.15  # 15% team growth
)

print(f"Forecasted cost: ${forecast.projected_cost}")
print(f"Confidence interval: ${forecast.lower_bound} - ${forecast.upper_bound}")
print(f"Recommended budget: ${forecast.recommended_budget}")
```

**4. Team Adoption Tracking**:

```python
# Identify adoption opportunities
from analytics import get_team_adoption

adoption = get_team_adoption(org_id=123)

# Find low-adoption teams
low_adoption = [
    team for team in adoption.teams
    if team.usage_percentage < 50
]

for team in low_adoption:
    print(f"{team.name}: {team.usage_percentage}% adoption")
    print(f"  Blockers: {team.identified_blockers}")
    print(f"  Recommendations: {team.adoption_recommendations}")
```

---

## 🔔 Triggering Codegen

### Manual Triggers

#### Slack Integration

**Channel Mentions**:

```text
In #engineering channel:
@codegen please review the authentication flow in user-service

In #bugs channel:
@codegen fix the login timeout issue in PR #234
```

**Direct Messages**:

```text
DM to Codegen bot:
Implement rate limiting for our API endpoints:
1. Use express-rate-limit
2. 100 requests per 15 minutes per IP
3. Add tests
4. Create PR
```

**Thread Continuity**:

All messages in a Slack thread route to the same agent instance.

#### GitHub Integration

**PR Comments**:

```text
On pull request:
@codegen-agent please review this PR and check for security vulnerabilities
```

**Issue Comments**:

```text
On issue:
@codegen-agent investigate this authentication bug and create a fix
```

#### Project Management Platforms

**Linear**:

```text
Method 1: Assign issue to "Codegen Bot"
Method 2: Comment: @codegen implement this feature
```

**Jira**:

```text
Method 1: Assign ticket to "Codegen"
Method 2: Comment: @codegen fix this bug
```

**ClickUp & Monday.com**:

```text
Assign task to "Codegen" user
```

#### Web Dashboard

**Direct Access**:

```text
Visit: codegen.com/new

1. Select repository
2. Enter prompt
3. Click "Create Agent Run"
```

#### CLI

**Command Line**:

```bash
# Create agent run
codegen agent create "implement user authentication"

# With specific repository
codegen agent create "refactor UserService" --repo user-service

# Background execution
codegen claude --background "run full test suite"
```

#### API

**Programmatic Trigger**:

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

run = agent.run(
    prompt="Fix failing integration tests",
    repo_id=456,
    metadata={
        "source": "ci_pipeline",
        "build_id": "12345"
    }
)
```

### Automatic Triggers

#### 1. Checks Auto-Fixer

**Automatically fixes failing CI checks** on agent-created PRs.

**Triggers**:

- GitHub check run failures
- Test failures
- Build failures
- Linting errors

**Behavior**:

```text
1. CI check fails
2. Agent analyzes logs
3. Agent creates fix commit
4. CI re-runs automatically
5. Process repeats (up to retry limit)
```

**Configuration**:

See Checks Auto-Fixer section above.

#### 2. PR Review

**Delivers automated code review** on all pull requests.

**Triggers**:

- PR opened
- New commits pushed
- PR ready for review

**Behavior**:

```text
1. PR created/updated
2. Agent spins up automatically
3. Comprehensive review conducted
4. Comments posted to PR
```

**Configuration**:

Must be enabled at both organization and repository levels.

### Context Management

**Unified Agent Instances**:

Each trigger source maintains dedicated agent instances:

| Source | Context Behavior |
|--------|------------------|
| **Slack Thread** | All messages → same agent |
| **Linear Issue** | All comments → same agent |
| **Jira Ticket** | All comments → same agent |
| **GitHub Issue** | All comments → same agent |
| **GitHub PR** | All comments → same agent |

**Cross-Platform Continuity**:

When agents create PRs from tickets:

```text
Linear Issue #123
  ↓
Agent creates GitHub PR #456
  ↓
Comment on either Linear OR GitHub
  ↓
Same agent responds in both places
```

**Example**:

```text
Linear Issue: "Implement authentication"
  Comment: @codegen start implementation

Agent creates PR #456 on GitHub

GitHub PR #456:
  Comment: @codegen-agent add password reset

Agent updates BOTH:
  - GitHub PR (with new commits)
  - Linear Issue (with progress update)
```

### Unified Agent Environment

**Regardless of trigger method**:

- ✅ Runs in secure sandbox
- ✅ Accesses all integrations
- ✅ Creates trackable runs
- ✅ Viewable at codegen.com/agents
- ✅ Same capabilities and permissions

---

## 🏗️ Sandboxes

### Overview

Secure, isolated Docker-based environments where agents safely execute code and run commands without impacting local or production systems.

### Architecture & Isolation

**Docker-Based Infrastructure**:

- Isolated execution contexts per agent
- No access to host system
- Controlled network access
- Resource limits enforced

**Enterprise Configuration**:

- Custom resource allocation
- Security parameter customization
- Per-organization settings
- Compliance controls

### File System & Capabilities

#### Storage

- **Read/Write/Modify**: Full file system access within sandbox
- **Persistence**: Files persist between agent interactions in same context
- **Snapshots**: Filesystem snapshots for faster startup

#### Command Execution

```bash
# Agents can execute shell commands
bash, sh, zsh

# Language runtimes
python3, node, npm, yarn, pnpm

# Development tools
git, curl, wget, jq

# Build tools
make, cmake, cargo, go build
```

#### Multi-Language Support

**Pre-installed Runtimes**:

- Python 3.13
- Node.js (via nvm)
- Go
- Rust
- Java
- Ruby

**Package Managers**:

- Python: `pip`, `uv` (pre-installed)
- Node.js: `npm`, `yarn`, `pnpm`
- System: `apt-get`

#### Network Operations

**Allowed**:

- Package installation (`npm install`, `pip install`)
- API calls to external services
- Git operations
- HTTP/HTTPS requests

**Can Be Restricted**:

- Organization security policies
- Repository-specific rules
- Compliance requirements

### Lifecycle & State Management

**File System Persistence**:

```text
Agent Run 1:
  npm install    → Dependencies installed
  Files persist  → Stored in snapshot

Agent Run 2 (same context):
  Dependencies already available ✓
  No reinstallation needed
```

**Context Boundaries**:

- Same Linear issue = Same sandbox
- Same GitHub PR = Same sandbox
- Different issue = New sandbox

### Setup Commands

**Purpose**: Initialize sandbox environment with consistent starting point.

**Configuration**:

```text
Visit: codegen.com/repos → Select repo → Setup Commands

Example for Node.js project:
─────────────────────────────
# Switch to Node 20
nvm use 20

# Install dependencies
npm ci

# Build project
npm run build

# Run migrations (if needed)
npm run migrate
```

**Execution**:

- Runs once per sandbox initialization
- Creates filesystem snapshot
- All future runs start from snapshot
- **Must be non-interactive**

**Common Use Cases**:

1. **Dependency Installation**:

   ```bash
   npm ci
   pip install -r requirements.txt
   bundle install
   ```

2. **Version Management**:

   ```bash
   nvm use 20
   pyenv local 3.13
   rbenv local 3.2.0
   ```

3. **Build Steps**:

   ```bash
   npm run build
   cargo build
   go build ./...
   ```

4. **Virtual Environments**:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

**Best Practices**:

✅ Use exact versions (`npm ci` not `npm install`)
✅ Lock files should be committed
✅ Test commands locally first
✅ Keep commands idempotent
✅ Minimize installation time

❌ No interactive prompts
❌ No user input required
❌ No manual confirmations

### Environment Variables

**Default Variables** (13 pre-configured):

```bash
# Node.js
NVM_DIR=/root/.nvm
NVM_BIN=/root/.nvm/versions/node/v20.11.0/bin
NODE_VERSION=20.11.0
NODE_OPTIONS=--max-old-space-size=8192
NPM_CONFIG_YES=true
COREPACK_ENABLE_DOWNLOAD_PROMPT=0
YARN_ENABLE_IMMUTABLE_INSTALLS=false

# Python
PYTHONUNBUFFERED=1
PYTHONPATH=/usr/local/lib/python3.13/site-packages
PIP_NO_INPUT=1

# System
DEBIAN_FRONTEND=noninteractive
IS_SANDBOX=true

# Preview (dynamically set)
CG_PREVIEW_URL=https://preview-abc123.codegen.dev
```

**Custom Variables**:

```text
Repository Settings → Environment Variables

Add variables as key-value pairs:

DATABASE_URL=postgresql://localhost:5432/dev
API_KEY=test_key_abc123
FEATURE_FLAGS={"newUI":true}
```

**Security Considerations**:

⚠️ **Only use staging/development credentials**
⚠️ **Never store production secrets**
⚠️ **Use repository secrets for sensitive data**

### Repository Secrets

**Storage & Security**:

- Encrypted at rest
- Restricted access controls
- Per-repository isolation
- Automatic injection as environment variables

**Setup Process**:

```text
Repository Settings → Secrets → Add Secret

Name:  STRIPE_API_KEY
Value: sk_test_abc123...
```

**Access in Sandbox**:

```python
import os

# Secrets automatically available as env vars
stripe_key = os.getenv("STRIPE_API_KEY")
db_url = os.getenv("DATABASE_URL")
```

**Best Practices**:

✅ **Staging credentials only**
✅ **Non-production API keys**
✅ **Test database credentials**
✅ **Development service tokens**

❌ **Production API keys**
❌ **Production database passwords**
❌ **Real customer data access**
❌ **Payment processing credentials**

**Common Use Cases**:

- Staging service API keys
- Test database connection strings
- Third-party test tokens (Stripe test mode)
- Feature flag configuration

### Web Preview

**Purpose**: Long-lived development server for testing web applications.

**Configuration**:

```text
Repository Settings → Web Preview Commands

Example for Next.js:
npm run dev

Example for Django:
python manage.py runserver 127.0.0.1:3000

Example for Rails:
bundle exec rails server -b 127.0.0.1 -p 3000
```

**Port Requirement**:

⚠️ **Must listen on port 3000**

**Access**:

```text
1. Agent starts development server
2. "View Web Preview" button appears on trace page
3. Click button → Opens in new tab
4. Secure proxy to sandbox port 3000
```

**Preview URL Variable**:

```javascript
// Automatically available in sandbox
const previewUrl = process.env.CG_PREVIEW_URL;
// "https://preview-abc123.codegen.dev"

// Use for CORS, webhooks, absolute URLs
```

**Limitations**:

- ❌ Not for production hosting
- ❌ Not publicly accessible
- ❌ Only available during active agent runs
- ✅ Perfect for development and debugging

### Remote Editor (VSCode)

**Overview**: Fully functional VSCode instance tunneled into agent's sandbox.

**Features**:

**1. Command Execution**:

```bash
# Open terminal in VSCode
# Execute commands in sandbox context
npm test
python manage.py shell
git status
```

**2. Progress Monitoring**:

- See files agent creates in real-time
- Watch agent modifications live
- Understand agent decision-making

**3. Live Debugging**:

```text
VSCode Debugger → Attach to running process
Step through code
Inspect variables
Set breakpoints
```

**4. Manual Edits**:

- Quick fixes and experiments
- Temporary changes
- ⚠️ Agent may overwrite changes

**Access**:

```text
Agent trace page → "Open Remote Editor" button
  ↓
Unique password generated
  ↓
VSCode opens with sandbox access
```

**Security**:

- Unique password per session
- Dynamically generated at runtime
- Automatic cleanup after session

**Use Cases**:

✅ Debug failing tests in agent environment
✅ Inspect agent-generated files
✅ Quick manual fixes
✅ Experiment with changes
✅ Understand agent workflow

---

## Complete Example: Advanced Sandbox Workflow

```python
from codegen import Agent
import time

def advanced_sandbox_workflow(org_id, repo_id):
    """
    Complete workflow demonstrating all sandbox features:
    1. Setup commands configuration
    2. Environment variables and secrets
    3. Web preview
    4. Remote editor access
    5. Auto-fixer integration
    """

    agent = Agent(org_id=org_id, token="sk-...")

    print("🔧 Step 1: Configure Setup Commands")

    # Generate optimal setup commands
    setup_response = agent.generate_setup_commands(
        repo_id=repo_id,
        prompt="""
        Generate setup commands for Next.js 14 project:
        1. Use Node.js 20
        2. Install dependencies with pnpm
        3. Run database migrations
        4. Build project
        5. Generate Prisma client
        """
    )

    # Wait for generation
    setup_status = wait_for_agent(agent, setup_response.agent_run_id)

    print("✓ Setup commands generated")
    print(setup_status.result)

    print("\n📝 Step 2: Configure Environment & Secrets")

    # Note: These would be set via web UI
    print("""
    Set in Repository Settings:

    Environment Variables:
    - DATABASE_URL=postgresql://localhost:5432/dev
    - NEXT_PUBLIC_API_URL=http://localhost:3000/api
    - NODE_ENV=development

    Secrets:
    - STRIPE_API_KEY=sk_test_...
    - SENDGRID_API_KEY=SG.test...
    """)

    print("\n🏗️ Step 3: Create Agent Run with Web Preview")

    run = agent.run(
        prompt="""
        Implement user authentication feature:
        1. Create login/signup pages
        2. Add JWT token generation
        3. Implement protected routes
        4. Add session management
        5. Start development server for testing

        After implementation, start the dev server so I can
        test the authentication flow in the web preview.
        """,
        repo_id=repo_id
    )

    print(f"✓ Agent run created: {run.id}")
    print(f"Web URL: {run.web_url}")

    # Monitor progress
    print("\n⏳ Monitoring agent progress...")

    while True:
        status = agent.get_run(run.id)

        print(f"Status: {status.status}")

        if "server" in status.result.lower():
            print("\n🌐 Development server started!")
            print(f"View web preview: {status.web_url}/preview")
            print("Remote editor available for debugging")

        if status.status in ["completed", "failed", "cancelled"]:
            break

        time.sleep(10)

    print("\n✓ Implementation complete")

    # Step 4: Check if PR was created
    if status.github_pull_requests:
        pr = status.github_pull_requests[0]

        print(f"\n📋 Pull Request Created:")
        print(f"Title: {pr['title']}")
        print(f"URL: {pr['url']}")

        # Auto-fixer will monitor CI checks automatically
        print("\n🔧 Auto-fixer monitoring CI checks...")

    print("\n📊 Summary:")
    print(f"- Setup: Automated via setup commands")
    print(f"- Environment: Configured with secrets")
    print(f"- Preview: Available at web URL")
    print(f"- Editor: Remote VSCode access enabled")
    print(f"- CI: Auto-fixer monitoring enabled")

    return status

def wait_for_agent(agent, run_id, timeout=600):
    """Wait for agent completion."""
    start_time = time.time()

    while time.time() - start_time < timeout:
        status = agent.get_run(run_id)

        if status.status in ["completed", "failed", "cancelled"]:
            return status

        time.sleep(10)

    raise TimeoutError(f"Agent run {run_id} timed out")

# Execute workflow
result = advanced_sandbox_workflow(org_id=123, repo_id=456)
```

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-01-14
**Coverage**: Claude Code, Auto-fixer, PR Review, Analytics, Triggering, Sandboxes
