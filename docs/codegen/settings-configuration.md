# Settings & Configuration - Complete Guide

> Part of Codegen Platform Documentation

## 📋 Quick Navigation

- **Agent Behavior**: See Agent Behavior section
- **Agent Permissions**: See Permissions section
- **LLM Configuration**: See Models section
- **Repository Rules**: See Rules section
- **Team & User Roles**: See Roles section

---

## ⚙️ Agent Behavior Settings

### Overview

Configure how agents interact with your team and present their work.

### Configurable Settings

#### 1. Propose Plan

**Description**: Controls whether agents present detailed implementation plans before executing code modifications.

**When Enabled**:

```text
Agent receives prompt: "Implement user authentication"

Agent responds with plan:
┌─ Implementation Plan ────────────────────────┐
│ 1. Create User model with Prisma            │
│ 2. Implement JWT token generation           │
│ 3. Create login/signup API endpoints        │
│ 4. Add middleware for protected routes      │
│ 5. Implement session management             │
│ 6. Add password hashing with bcrypt         │
│ 7. Create frontend login/signup forms       │
│ 8. Add tests for authentication flow        │
└──────────────────────────────────────────────┘

Proceed with implementation? (yes/no)
```

**When Disabled**:

```text
Agent receives prompt: "Implement user authentication"

Agent immediately:
1. Analyzes requirements
2. Implements all changes
3. Creates PR with complete solution
```

**Recommendations**:

| Team Experience | Setting | Reason |
|----------------|---------|---------|
| **New to agents** | ✅ Enabled | Learn agent thinking, catch issues early |
| **Experienced team** | ⚠️ Consider disabling | Faster execution for routine tasks |
| **Critical systems** | ✅ Enabled | Review before changes to production code |
| **Experimental projects** | ❌ Disabled | Move fast, iterate quickly |

**Configuration**:

```text
Settings → Organization → Agent Behavior
[✓] Propose Plan

Apply to: All repositories
Override: Repository settings may override
```

#### 2. Require Explicit GitHub Mentions

**Description**: Determines if agents only respond to explicit `@codegen` or `@codegen-sh` mentions.

**When Enabled**:

```text
GitHub PR Comment:
"This code needs security review"
→ Agent does NOT respond

GitHub PR Comment:
"@codegen-agent please review security"
→ Agent responds ✓
```

**When Disabled**:

```text
GitHub PR Comment:
"This code needs security review"
→ Agent may proactively respond

GitHub PR Comment:
"Looks good"
→ Agent may ask questions or provide suggestions
```

**Recommendations**:

| Scenario | Setting | Reason |
|----------|---------|---------|
| **Large organization** | ✅ Enabled | Reduce noise, controlled activation |
| **Small team** | ❌ Disabled | Proactive assistance helpful |
| **High PR volume** | ✅ Enabled | Prevent overwhelming agent activity |
| **Learning phase** | ❌ Disabled | See what agent can do proactively |

**Configuration**:

```text
Settings → Organization → Agent Behavior
[✓] Require Explicit GitHub Mentions

When enabled:
- Agents only respond to @codegen or @codegen-sh
- Reduces unsolicited agent comments
- Gives team precise control
```

### Configuration Scope

**Organization Level**:

- Settings apply to ALL repositories
- Changes affect entire organization
- Immediate effect on new agent runs

**Repository Level** (where supported):

- May override organization settings
- Repository-specific customization
- Granular control per project

### Best Practices

**Getting Started (First 30 Days)**:

```text
✅ Propose Plan: Enabled
✅ Require Explicit Mentions: Enabled

Reason: Learn how agents work, control activation
```

**Experienced Teams (After 30 Days)**:

```text
Critical repositories:
  ✅ Propose Plan: Enabled
  ✅ Require Explicit Mentions: Enabled

Routine projects:
  ❌ Propose Plan: Disabled (for speed)
  ⚠️ Require Explicit Mentions: Team preference
```

**Advanced Configuration**:

```python
# Example: Different settings per repository type

# Production infrastructure
infrastructure_repos = ["k8s-config", "terraform", "ansible"]
settings = {
    "propose_plan": True,  # Always review plans
    "require_mentions": True  # Explicit activation only
}

# Development services
service_repos = ["user-service", "payment-service", "notification-service"]
settings = {
    "propose_plan": False,  # Fast iteration
    "require_mentions": False  # Proactive assistance
}

# Experimental projects
experimental_repos = ["ml-experiments", "prototype-app"]
settings = {
    "propose_plan": False,  # Move fast
    "require_mentions": False  # Full autonomy
}
```

---

## 🔐 Agent Permissions

### Overview

Control what actions agents can perform within your organization.

### Permission Settings

#### 1. PR Creation

**Description**: Determines if agents can create pull requests with code changes.

**When Enabled**:

```text
Agent workflow:
1. Analyze task
2. Implement changes
3. Create PR automatically ✓
4. Link to issue/ticket
5. Request review
```

**When Disabled**:

```text
Agent workflow:
1. Analyze task
2. Provide analysis and suggestions only
3. Recommend changes
4. No PRs created ❌
```

**Recommendations**:

| Use Case | Setting | Reason |
|----------|---------|---------|
| **Production repos** | ✅ Enabled | Full automation, faster delivery |
| **Learning/Training** | ❌ Disabled | Manual review and learning |
| **Open source** | ⚠️ Carefully enable | Consider contribution guidelines |
| **Highly regulated** | ❌ Disabled | Human approval required first |

**Configuration**:

```text
Settings → Organization → Permissions
[✓] Enable PR Creation

When enabled:
- Agents create PRs with complete implementations
- PRs linked to triggering issue/ticket
- Auto-fixer monitors CI checks
- PR review agent provides feedback
```

#### 2. Rules Detection

**Description**: Automatic discovery of repository-specific rule files.

**Detected Files**:

- `AGENTS.md` (preferred)
- `CLAUDE.md`
- `.cursorrules`
- `.clinerules`
- `.windsurfrules`
- `**/*.mdc`
- `.cursor/rules/**/*.mdc`

**When Enabled**:

```text
Agent activates on repository
  ↓
Automatically discovers rule files
  ↓
Loads and applies repository rules
  ↓
Integrates with task context
```

**When Disabled**:

```text
Agent activates on repository
  ↓
Only uses organization rules
  ↓
Manual configuration required
```

**Recommendations**:

| Scenario | Setting | Reason |
|----------|---------|---------|
| **Standardized repos** | ✅ Enabled | Automatic, no manual config |
| **Strict control** | ❌ Disabled | Manual rule management |
| **Multi-tool teams** | ✅ Enabled | Works with Cursor, Windsurf, etc |
| **Security compliance** | ⚠️ Review rules | Audit auto-detected files |

**Configuration**:

```text
Settings → Organization → Permissions
[✓] Enable Rules Detection

When enabled:
- Automatic discovery via ripgrep
- Repository-specific rules loaded
- Version-controlled alongside code
- Priority: User > Repo > Organization
```

#### 3. Signed Commits

**Description**: Require ALL commits to be cryptographically signed.

**When Enabled**:

```text
Organization-wide enforcement:
✅ All agent commits signed
✅ Cryptographic verification
✅ Audit trail maintained
⚠️ Cannot be overridden per repository
```

**Security Benefits**:

- Cryptographic verification of commit authenticity
- Compliance with security policies
- Audit trail for all code changes
- Protection against commit spoofing

**Considerations**:

- Organization-wide setting (cannot override per repo)
- Requires GPG key configuration
- Affects ALL repositories
- Compliance requirement for many organizations

**Configuration**:

```text
Settings → Organization → Permissions
[✓] Require Signed Commits

WARNING: This setting applies to ALL repositories
in this organization and CANNOT be overridden
at the repository level.
```

### Permission Strategy

**Conservative Start** (Recommended for new teams):

```text
Week 1-2:
  ❌ PR Creation: Disabled
  ✅ Rules Detection: Enabled
  ⚠️ Signed Commits: Based on policy

Goal: Learn without changes

Week 3-4:
  ✅ PR Creation: Enable for non-critical repos
  ✅ Rules Detection: Enabled
  ⚠️ Signed Commits: Based on policy

Goal: Test in safe environments

Month 2+:
  ✅ PR Creation: Enable organization-wide
  ✅ Rules Detection: Enabled
  ✅ Signed Commits: Enable if required

Goal: Full automation with trust
```

**Security-First Approach**:

```text
All repositories:
  ✅ PR Creation: Enabled (with review required)
  ✅ Rules Detection: Enabled (audit rules quarterly)
  ✅ Signed Commits: Enforced
  ✅ PR Review: Auto-review all PRs
  ✅ Auto-fixer: Enabled with strict limits
```

---

## 🤖 LLM Configuration

### Available Models & Providers

#### Anthropic (Recommended)

| Model | Use Case | Performance | Cost | Speed |
|-------|----------|-------------|------|-------|
| **Claude 4 Sonnet** | ⭐ General purpose | ⭐⭐⭐⭐⭐ | $$ | Fast |
| **Claude 4 Opus** | Complex reasoning | ⭐⭐⭐⭐⭐ | $$$$ | Slower |
| **Claude 4 Haiku** | Simple tasks | ⭐⭐⭐ | $ | Very fast |

**Recommendation**: **Claude 4 Sonnet** for best balance of performance, reliability, and cost.

#### OpenAI

| Model | Use Case | Performance | Cost |
|-------|----------|-------------|------|
| **GPT-4 Turbo** | General purpose | ⭐⭐⭐⭐ | $$$ |
| **GPT-4** | High quality | ⭐⭐⭐⭐⭐ | $$$$ |
| **GPT-3.5 Turbo** | Simple tasks | ⭐⭐⭐ | $ |

#### Google

| Model | Use Case | Performance | Cost |
|-------|----------|-------------|------|
| **Gemini Pro** | General purpose | ⭐⭐⭐⭐ | $$ |
| **Gemini Ultra** | Complex tasks | ⭐⭐⭐⭐⭐ | $$$$ |

#### Grok (xAI)

| Model | Use Case | Performance | Cost |
|-------|----------|-------------|------|
| **Grok models** | Experimental | ⭐⭐⭐ | Varies |

### Model Selection Process

**Configuration Path**:

```text
Settings → Organization → LLM Configuration
  ↓
1. Choose provider (Anthropic, OpenAI, Google, Grok)
  ↓
2. Select specific model from provider catalog
  ↓
3. (Optional) Configure custom API keys
  ↓
4. Save and apply organization-wide
```

### Performance vs Cost Considerations

**Official Recommendation**:

> "Our internal testing and prompt engineering are heavily optimized for Claude 4 Sonnet, and it consistently delivers the best performance, reliability, and cost-effectiveness for most software engineering tasks."

**Cost Comparison** (Estimated):

```python
# Example monthly costs for 1000 agent runs
models_cost_analysis = {
    "Claude 4 Haiku": {
        "cost_per_run": 0.05,
        "monthly_total": 50,
        "use_case": "Simple tasks, quick fixes"
    },
    "Claude 4 Sonnet": {
        "cost_per_run": 0.18,
        "monthly_total": 180,
        "use_case": "General purpose (RECOMMENDED)"
    },
    "Claude 4 Opus": {
        "cost_per_run": 0.45,
        "monthly_total": 450,
        "use_case": "Complex reasoning, critical tasks"
    },
    "GPT-4 Turbo": {
        "cost_per_run": 0.22,
        "monthly_total": 220,
        "use_case": "Alternative to Sonnet"
    },
    "GPT-4": {
        "cost_per_run": 0.50,
        "monthly_total": 500,
        "use_case": "Highest quality OpenAI"
    }
}
```

**Performance Metrics** (from analytics):

```text
Model Quality Scores (internal testing):
─────────────────────────────────────
Claude 4 Sonnet:  4.6/5 ⭐ (RECOMMENDED)
Claude 4 Opus:    4.8/5 ⭐
GPT-4:            4.5/5
GPT-4 Turbo:      4.3/5
Claude 4 Haiku:   4.0/5
Gemini Pro:       4.2/5
```

### Organization-Level Settings

**Global Application**:

```text
Selected model applies to:
✅ All agent runs
✅ All repositories
✅ All team members

Unless:
⚠️ Per-repository override (plan-dependent)
⚠️ Per-agent override (enterprise feature)
```

### Custom Configuration Options

**Advanced Settings**:

```text
Settings → Organization → LLM Configuration → Advanced

[✓] Use Custom API Keys

Provider: Anthropic
API Key: sk-ant-api03-...
Base URL: https://api.anthropic.com

Billing:
✅ Costs billed to your Anthropic account
✅ Direct relationship with provider
✅ Enterprise volume discounts apply
```

**Use Cases for Custom Keys**:

1. **Azure OpenAI**:

   ```text
   Provider: OpenAI
   Base URL: https://your-resource.openai.azure.com
   API Key: your-azure-key
   Deployment: gpt-4-deployment-name
   ```

2. **Self-Hosted Solutions**:

   ```text
   Provider: Custom
   Base URL: https://llm.yourcompany.com
   API Key: internal-key
   ```

3. **Enterprise Agreements**:

   ```text
   Provider: Anthropic
   API Key: enterprise-key-with-volume-discount
   Billing: Direct enterprise contract
   ```

### Model Selection Strategy

**Small Team (<10 people)**:

```text
Default: Claude 4 Sonnet
Reasoning: Best cost/performance balance
Monthly cost: ~$500-2000
```

**Medium Team (10-50 people)**:

```text
Standard tasks: Claude 4 Sonnet
Complex tasks: Claude 4 Opus (on-demand)
Simple tasks: Claude 4 Haiku

Strategy: Use analytics to optimize mix
Monthly cost: ~$2000-10000
```

**Large Organization (50+ people)**:

```text
Tier 1 (Critical): Claude 4 Opus
Tier 2 (Standard): Claude 4 Sonnet
Tier 3 (Simple): Claude 4 Haiku

Strategy: Per-repository model selection
Monthly cost: $10000+
Optimization: Volume discounts, analytics-driven
```

**Example Configuration**:

```python
# Repository-specific model selection
repo_model_config = {
    # Critical production services
    "payment-service": "claude-4-opus",
    "auth-service": "claude-4-opus",
    "user-data-service": "claude-4-opus",

    # Standard development
    "admin-dashboard": "claude-4-sonnet",
    "analytics-api": "claude-4-sonnet",
    "notification-service": "claude-4-sonnet",

    # Simple maintenance
    "docs-site": "claude-4-haiku",
    "internal-tools": "claude-4-haiku",
    "scripts": "claude-4-haiku"
}

# Estimated monthly costs (1000 runs per repo)
total_opus = 3 * 450  # $1,350
total_sonnet = 3 * 180  # $540
total_haiku = 3 * 50  # $150
total_monthly = total_opus + total_sonnet + total_haiku  # $2,040
```

---

## 📋 Repository Rules

### Overview

Repository-specific instructions that agents use as guidance alongside tasks.

### Supported File Formats

**Automatic Detection** (via ripgrep):

1. **`AGENTS.md`** (⭐ Preferred)
2. `CLAUDE.md`
3. `.cursorrules`
4. `.clinerules`
5. `.windsurfrules`
6. `**/*.mdc` (Markdown files anywhere)
7. `.cursor/rules/**/*.mdc`

### Character Limits

**Global Budget**: 25,000 characters combined

**Behavior**:

```text
Total characters < 25,000:
  ✅ All rules loaded

Total characters > 25,000:
  ⚠️ Truncation occurs
  Priority: Per-file truncation first
  Then: Aggregate level truncation
```

### How Agents Use Rules

**Discovery Process**:

```text
1. Agent activates on repository
   ↓
2. Run ripgrep for supported patterns
   ↓
3. Extract file contents
   ↓
4. Encode and transport to agent context
   ↓
5. Integrate with specific task
```

**Integration**:

> "Rules are text prompts, not strict settings. Agents use them as guidance alongside the specific task you've given them."

### Priority Hierarchy

```text
User Rules (highest)
  ↓
Repository Rules (medium)
  ↓
Organization Rules (lowest)
```

**Conflict Resolution**:

```text
User prompt:      "Use Python 3.11"
Repository rule:  "Use Python 3.13"
Org rule:         "Use Python 3.12"

Agent uses: Python 3.11 (user wins)
```

### Rule File Examples

#### Example 1: AGENTS.md (Comprehensive)

```markdown
# Agent Instructions for User Service

## Architecture

This service uses:

- **Framework**: FastAPI 0.100+
- **Database**: PostgreSQL 15 with Prisma ORM
- **Auth**: JWT tokens with refresh mechanism
- **Testing**: pytest with 90%+ coverage requirement

## Code Standards

### Python

- Python 3.13 required
- Type hints mandatory for all public functions
- Use `uv` for dependency management
- Follow PEP 8 with max line length 88
- Ruff for linting and formatting

### API Design

- RESTful endpoints following OpenAPI 3.0
- Pydantic models for request/response validation
- Dependency injection for services
- Async/await for all I/O operations

### Testing

- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 90% coverage for new code

## Security Checklist

When implementing features, ensure:

- [ ] Input validation (Pydantic models)
- [ ] Authentication/authorization checks
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (response sanitization)
- [ ] Rate limiting on endpoints
- [ ] CORS configuration
- [ ] Secrets from environment variables only

## Common Commands

```bash
# Setup
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt

# Development
uvicorn main:app --reload

# Testing
pytest --cov=src --cov-report=html

# Linting
ruff check .
ruff format .

# Type checking
mypy src/
```

## PR Requirements

- All tests passing
- Coverage ≥ 90%
- Type checking passes
- Linting passes
- Documentation updated
- CHANGELOG.md updated

## Architecture Decisions

### Why FastAPI?

- Async support for high performance
- Automatic OpenAPI documentation
- Pydantic integration
- Type safety

### Why Prisma?

- Type-safe database queries
- Automatic migrations
- Great TypeScript/Python support

```text

#### Example 2: React/Next.js Project

```markdown
# Frontend Development Rules

## Stack

- Next.js 14 (App Router)
- React 18
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui components

## Component Standards

### File Structure

```text
src/
├── app/              # Next.js app router
├── components/       # Reusable components
│   ├── ui/          # shadcn/ui components
│   └── features/    # Feature-specific components
├── lib/             # Utilities and helpers
└── hooks/           # Custom React hooks
```

### Component Guidelines

- Functional components only
- TypeScript for all components
- Props must be typed interfaces
- Use React Server Components by default
- Client components only when needed ('use client')

### Example Component

```typescript
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Bad - no types, inline styles
export function Button(props) {
  return <button style={{color: 'red'}}>{props.text}</button>;
}
```

## State Management

- Server state: TanStack Query
- Client state: Zustand (when needed)
- Form state: React Hook Form + Zod

## Performance

- Memoize expensive calculations (useMemo)
- Avoid inline function definitions in JSX
- Use dynamic imports for code splitting
- Optimize images with next/image

## Testing

- Unit tests: Vitest
- Component tests: Testing Library
- E2E tests: Playwright
- Minimum 85% coverage

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)

```bash

#### Example 3: Security-Focused Repository

```markdown
# Security-Critical Repository Rules

## Security Requirements

### Authentication & Authorization

ALWAYS implement:

- JWT tokens with short expiration (15 min)
- Refresh tokens with rotation
- Multi-factor authentication support
- Rate limiting on auth endpoints

### Input Validation

ALL user inputs must:

- Use Zod schemas for validation
- Sanitize before database queries
- Validate file uploads (type, size, content)
- Reject unexpected fields

### Database Security

- Use parameterized queries ONLY
- No string concatenation in SQL
- Apply least privilege principle
- Encrypt sensitive data at rest

### API Security

- CORS configuration reviewed
- Rate limiting (100 req/15min per IP)
- Request size limits
- API key rotation policy

### Dependencies

- Monthly security audit
- Automated vulnerability scanning
- No dependencies with known CVEs > 7.0
- Pin exact versions in lockfiles

### Secrets Management

- NEVER hardcode credentials
- Use environment variables
- Rotate secrets quarterly
- Secrets vault for production

## Code Review Checklist

Security reviewer must verify:

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevented
- [ ] XSS prevention implemented
- [ ] CSRF tokens used
- [ ] Authentication checked
- [ ] Authorization enforced
- [ ] Rate limiting applied
- [ ] Logging for security events
- [ ] Error messages don't leak info
```

### Best Practices

**DO**:

✅ Version control rules with code
✅ Keep rules focused and actionable
✅ Include examples and patterns
✅ Update rules when architecture changes
✅ Document WHY, not just WHAT
✅ Use consistent formatting

**DON'T**:

❌ Exceed 25k character limit
❌ Include sensitive information
❌ Write vague guidelines
❌ Duplicate organization rules
❌ Forget to update outdated rules

---

## 👥 Team & User Roles

### Role Types

Codegen implements three hierarchical roles:

#### 1. Admin

**Full administrative access to the organization**

**Permissions**:

- ✅ Repository deletion authority
- ✅ Billing and subscription management
- ✅ User role modifications
- ✅ Integration configuration (GitHub, Slack, etc.)
- ✅ Complete organizational configuration
- ✅ Security settings management
- ✅ Access to all repositories
- ✅ Agent configuration
- ✅ Analytics and reporting

#### 2. Manager

**Operational management with limited administrative control**

**Permissions**:

- ✅ Manage integrations (GitHub, Linear, Jira, etc.)
- ✅ Repository access and operations
- ✅ Agent configuration
- ✅ Team member invitations
- ✅ Project management
- ❌ Billing modifications
- ❌ User role changes (except promoting to Member)
- ❌ Repository deletion
- ❌ Organization security settings

#### 3. Member

**Basic contributor access**

**Permissions**:

- ✅ View and work with assigned repositories
- ✅ Create and monitor agent runs
- ✅ Comment on PRs and issues
- ✅ Trigger agents via Slack/Linear/GitHub
- ❌ Repository management
- ❌ User role modifications
- ❌ Integration configuration
- ❌ Organization settings

### Permissions Comparison

| Action | Admin | Manager | Member |
|--------|-------|---------|--------|
| **View repositories** | ✅ All | ✅ Assigned | ✅ Assigned |
| **Create agent runs** | ✅ | ✅ | ✅ |
| **Configure integrations** | ✅ | ✅ | ❌ |
| **Manage team members** | ✅ All | ⚠️ Limited | ❌ |
| **Delete repositories** | ✅ | ❌ | ❌ |
| **Modify billing** | ✅ | ❌ | ❌ |
| **Change security settings** | ✅ | ❌ | ❌ |
| **View analytics** | ✅ Full | ✅ Team | ⚠️ Personal |

### Role Assignment & Management

**Default Assignment**:

```text
New team member added
  ↓
Automatically assigned: Member role
  ↓
Admin can promote to Manager or Admin
```

**Role Modifications**:

- Only Admins can promote/demote team members
- Cannot grant roles exceeding your own level
- Changes activate immediately
- Email notification sent to affected user

**Safeguards**:

```text
Manager tries to promote user to Admin:
  ❌ Action denied
  Reason: Cannot grant role exceeding own level

Admin promotes user to Admin:
  ✅ Action allowed
  Confirmation required
```

### Organization Management

**Administrative Functions** (Admin only):

1. **Team Composition**:

   - Invite new members
   - Promote/demote members
   - Remove members
   - Transfer ownership

2. **Feature Access Control**:

   - Enable/disable integrations
   - Configure agent behavior
   - Set permissions
   - Manage security settings

3. **Integration Configuration**:

   ```text
   Available integrations:
   - GitHub (code repositories)
   - Slack (team communication)
   - Linear (issue tracking)
   - Jira (project management)
   - PostgreSQL (database access)
   - Sentry (error monitoring)
   - ... and 7 more
   ```

4. **Billing Operations**:
   - Subscription management
   - Payment methods
   - Usage monitoring
   - Cost allocation

### Role-Based Workflows

**Scenario 1: Small Startup (5-10 people)**:

```text
Structure:
├── 1 Admin (Founder/CTO)
├── 2 Managers (Tech leads)
└── 5-7 Members (Developers)

Workflow:
- Admin: Handles billing, security, major config
- Managers: Day-to-day operations, integrations
- Members: Development work, agent usage
```

**Scenario 2: Medium Company (50-100 people)**:

```text
Structure:
├── 2-3 Admins (Engineering leadership)
├── 10-15 Managers (Team leads, senior engineers)
└── 35-85 Members (Developers, QA, DevOps)

Workflow:
- Admins: Organization-wide policies, budget
- Managers: Team-specific configuration
- Members: Execution and development
```

**Scenario 3: Enterprise (100+ people)**:

```text
Structure:
├── 5-10 Admins (C-level, Directors)
├── 20-40 Managers (Engineering managers)
└── 75-150 Members (Engineers across teams)

Workflow:
- Admins: Strategic decisions, compliance
- Managers: Department/team management
- Members: Specialized development work
```

### Best Practices

**Role Assignment Strategy**:

```python
# Recommended role distribution
team_size = 50
recommended_distribution = {
    "admins": max(2, team_size * 0.05),    # 5% or minimum 2
    "managers": team_size * 0.20,          # 20%
    "members": team_size * 0.75            # 75%
}

# Example for 50-person team:
# - 3 Admins (5%)
# - 10 Managers (20%)
# - 37 Members (75%)
```

**Security Considerations**:

✅ **DO**:

- Limit Admin role to essential personnel
- Regular access reviews (quarterly)
- Remove access for departing employees immediately
- Use Manager role for team leads
- Grant least privilege necessary

❌ **DON'T**:

- Give everyone Admin access
- Leave inactive users with elevated roles
- Share accounts across team members
- Grant Admin for convenience

**Audit & Compliance**:

```text
Quarterly Review Checklist:
[ ] Review all Admin users
[ ] Verify Manager assignments
[ ] Remove inactive accounts
[ ] Update team member list
[ ] Review integration access
[ ] Check repository permissions
[ ] Audit agent usage patterns
```

---

## Complete Configuration Example

```python
from codegen import Agent

def configure_organization(org_id):
    """Complete organization configuration."""

    agent = Agent(org_id=org_id, token="sk-...")

    print("🔧 Codegen Organization Configuration")
    print("=" * 50)

    # Step 1: Agent Behavior
    print("\n1. Agent Behavior Settings")
    print("   [✓] Propose Plan: Enabled")
    print("   [✓] Require Explicit Mentions: Enabled")
    print("   Rationale: Conservative start, review before execution")

    # Step 2: Permissions
    print("\n2. Agent Permissions")
    print("   [✓] PR Creation: Enabled")
    print("   [✓] Rules Detection: Enabled")
    print("   [✓] Signed Commits: Enabled (compliance requirement)")
    print("   Rationale: Full automation with security controls")

    # Step 3: LLM Configuration
    print("\n3. LLM Configuration")
    print("   Provider: Anthropic")
    print("   Model: Claude 4 Sonnet (recommended)")
    print("   Rationale: Best cost/performance balance")

    # Step 4: Repository Rules
    print("\n4. Repository Rules")
    print("   Detected files:")
    repos = agent.get_repositories(org_id=org_id)

    for repo in repos.items[:5]:  # Show first 5
        print(f"   - {repo.full_name}")
        print(f"     Setup status: {repo.setup_status}")
        # Check for AGENTS.md
        # (would use file check in real implementation)

    # Step 5: Team Roles
    print("\n5. Team & User Roles")
    users = agent.get_users(org_id=org_id)

    admins = [u for u in users.items if u.role == "ADMIN"]
    managers = [u for u in users.items if u.role == "MANAGER"]
    members = [u for u in users.items if u.role == "MEMBER"]

    print(f"   Admins: {len(admins)}")
    for admin in admins:
        print(f"     - {admin.full_name} (@{admin.github_username})")

    print(f"   Managers: {len(managers)}")
    print(f"   Members: {len(members)}")
    print(f"   Total: {users.total} users")

    # Step 6: Integration Status
    print("\n6. Active Integrations")
    integrations = agent.get_integrations()

    for integration in integrations.integrations:
        if integration.active:
            status = "✓ Active"
        else:
            status = "✗ Inactive"

        print(f"   {integration.integration_type}: {status}")

    print(f"\n   Total active: {integrations.total_active_integrations}")

    # Summary
    print("\n" + "=" * 50)
    print("✓ Configuration review complete")
    print("\nRecommendations:")
    print("1. Enable auto-fixer for repositories")
    print("2. Configure setup commands per repo")
    print("3. Add AGENTS.md to critical repos")
    print("4. Review team role distribution")
    print("5. Monitor analytics for optimization")

# Execute configuration review
configure_organization(org_id=123)
```

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-01-14
**Coverage**: Agent Behavior, Permissions, LLM Configuration, Repository Rules, Team Roles
