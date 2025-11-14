# Pull Requests & Repositories API

> Part of Codegen Platform Documentation

## Pull Requests API

### Edit Pull Request

**Endpoint**: `PATCH /organizations/{org_id}/repos/{repo_id}/prs/{pr_id}`

**Rate Limit**: 30 requests per minute

**Path Parameters**:

- `org_id` (integer, required): Organization identifier
- `repo_id` (integer, required): Repository identifier
- `pr_id` (integer, required): Pull request identifier

**Request Body**:

```json
{
  "state": "open"
}
```

**Supported States**:

- `open` - Reopen a closed PR
- `closed` - Close an open PR
- `draft` - Convert to draft PR
- `ready_for_review` - Mark draft as ready for review

**Response (200)**:

```json
{
  "success": true,
  "url": "https://github.com/org/repo/pull/123",
  "number": 123,
  "title": "Feature: Add authentication",
  "state": "open",
  "error": null
}
```

**Error Responses**:

- **422**: Validation error with field-level details
- **429**: Rate limit exceeded

**Access Requirements**:

- User must have write permissions to the repository
- Authorization header required in practice

**Use Cases**:

- Programmatic PR workflow state management
- Automating review process transitions
- PR lifecycle automation without UI interaction

**Example**:

```python
# Close a pull request
response = agent.edit_pr(
    org_id=123,
    repo_id=456,
    pr_id=789,
    state="closed"
)

if response.success:
    print(f"PR #{response.number} closed: {response.url}")
else:
    print(f"Error: {response.error}")
```

---

### Edit Pull Request Simple

**Endpoint**: `PATCH /organizations/{org_id}/prs/{pr_id}`

**Rate Limit**: 30 requests per minute

**Path Parameters**:

- `org_id` (integer, required): Organization identifier
- `pr_id` (integer, required): Pull request identifier

**Key Difference**: Only requires PR ID, not repository ID

**Request Body**:

```json
{
  "state": "ready_for_review"
}
```

**Response (200)**: Same structure as Edit Pull Request

**When to Use**:

Choose this endpoint when:

- You have org ID and PR ID available
- You don't need to specify repository ID
- Simplified parameter requirements preferred

**Example**:

```python
# Mark draft PR as ready for review
response = agent.edit_pr_simple(
    org_id=123,
    pr_id=789,
    state="ready_for_review"
)
```

**Comparison**:

| Feature | Edit PR | Edit PR Simple |
|---------|---------|----------------|
| **Path** | `/orgs/{org_id}/repos/{repo_id}/prs/{pr_id}` | `/orgs/{org_id}/prs/{pr_id}` |
| **Params** | org_id, repo_id, pr_id | org_id, pr_id |
| **Use Case** | When repo ID is known | When only PR ID available |

---

## Repositories API

### Get Repositories

**Endpoint**: `GET /organizations/{org_id}/repos`

**Rate Limit**: 60 requests per 30 seconds

**Path Parameters**:

- `org_id` (integer, required): Organization identifier

**Query Parameters**:

| Parameter | Type | Description | Default | Range |
|-----------|------|-------------|---------|-------|
| `skip` | integer | Pagination offset | 0 | 0+ |
| `limit` | integer | Results per page | 100 | 1-100 |

**Response (200)**:

```json
{
  "items": [
    {
      "id": 456,
      "name": "user-service",
      "full_name": "acme-corp/user-service",
      "description": "User authentication and management service",
      "github_id": "123456789",
      "organization_id": 123,
      "visibility": "private",
      "archived": false,
      "setup_status": "complete",
      "language": "TypeScript"
    }
  ],
  "total": 25,
  "page": 1,
  "size": 100,
  "pages": 1
}
```

**Repository Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique identifier |
| `name` | string | Repository name |
| `full_name` | string | Complete name (org/repo) |
| `description` | string/null | Repository description |
| `github_id` | string | GitHub identifier |
| `organization_id` | integer | Parent organization ID |
| `visibility` | string/null | Public/private status |
| `archived` | boolean/null | Archive status |
| `setup_status` | string | Configuration state |
| `language` | string/null | Primary language |

**Setup Status Values**:

- `complete` - Fully configured
- `pending` - Setup in progress
- `failed` - Setup encountered errors
- `not_started` - No setup initiated

**Example**:

```python
# Get all repositories
repos = agent.get_repositories(org_id=123)

for repo in repos.items:
    print(f"Repo: {repo.full_name}")
    print(f"  Language: {repo.language}")
    print(f"  Status: {repo.setup_status}")
    print(f"  Archived: {repo.archived}")

# Pagination
if repos.pages > 1:
    page2 = agent.get_repositories(org_id=123, skip=100, limit=100)
```

**Filtering by Setup Status**:

```python
# Get only fully configured repos
repos = agent.get_repositories(org_id=123)
configured = [r for r in repos.items if r.setup_status == 'complete']

# Get repos needing setup
needs_setup = [r for r in repos.items if r.setup_status in ['pending', 'failed', 'not_started']]
```

---

### Get Check Suite Settings

**Endpoint**: `GET /organizations/{org_id}/repos/check-suite-settings`

**Query Parameters**:

- `repo_id` (integer, required): Repository identifier

**Response (200)**:

```json
{
  "check_retry_count": 3,
  "ignored_checks": ["lint-check", "docs-build"],
  "check_retry_counts": {
    "integration-tests": 5,
    "e2e-tests": 2
  },
  "custom_prompts": {
    "type-check": "Fix TypeScript errors using strict mode",
    "security-scan": "Address security vulnerabilities in dependencies"
  },
  "high_priority_apps": ["security-scan", "critical-tests"],
  "available_check_suite_names": [
    "type-check",
    "lint-check",
    "integration-tests",
    "e2e-tests",
    "security-scan",
    "docs-build"
  ]
}
```

**Configuration Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `check_retry_count` | integer | Global retry count for all checks |
| `ignored_checks` | string[] | Checks to skip completely |
| `check_retry_counts` | object | Per-check retry configuration |
| `custom_prompts` | object | Custom prompts for specific checks |
| `high_priority_apps` | string[] | Apps triggering immediate processing on failure |
| `available_check_suite_names` | string[] | All available check names |

**Example**:

```python
# Get check suite settings
settings = agent.get_check_suite_settings(org_id=123, repo_id=456)

print(f"Global retry count: {settings.check_retry_count}")
print(f"Ignored checks: {settings.ignored_checks}")
print(f"High priority apps: {settings.high_priority_apps}")

# Check if specific check is ignored
if "lint-check" in settings.ignored_checks:
    print("Linting checks are ignored")

# Get retry count for specific check
integration_retries = settings.check_retry_counts.get("integration-tests", settings.check_retry_count)
print(f"Integration tests retry count: {integration_retries}")
```

---

### Update Check Suite Settings

**Endpoint**: `PUT /organizations/{org_id}/repos/check-suite-settings`

**Query Parameters**:

- `repo_id` (integer, required): Repository identifier

**Request Body**:

```json
{
  "check_retry_count": 5,
  "ignored_checks": ["lint-check"],
  "check_retry_counts": {
    "integration-tests": 3,
    "e2e-tests": 2
  },
  "custom_prompts": {
    "type-check": "Fix TypeScript errors following our style guide",
    "security-scan": "Address all high and critical severity issues"
  },
  "high_priority_apps": ["security-scan"]
}
```

**Configuration Parameters**:

### 1. **check_retry_count**

- **Type**: Integer or null
- **Range**: 0-10
- **Purpose**: Global retry count for failed checks
- **Default**: 0 (no retries)

**Example**:

```python
# Set global retry to 3 attempts
agent.update_check_suite_settings(
    org_id=123,
    repo_id=456,
    check_retry_count=3
)
```

### 2. **ignored_checks**

- **Type**: Array of strings or null
- **Purpose**: List of check names to skip
- **Use Case**: Skip non-critical checks or flaky tests

**Example**:

```python
# Ignore documentation and lint checks
agent.update_check_suite_settings(
    org_id=123,
    repo_id=456,
    ignored_checks=["docs-build", "lint-check"]
)
```

### 3. **check_retry_counts**

- **Type**: Object (key-value pairs) or null
- **Purpose**: Per-check retry counts
- **Use Case**: Different retry strategies for different checks

**Example**:

```python
# Set specific retry counts per check
agent.update_check_suite_settings(
    org_id=123,
    repo_id=456,
    check_retry_counts={
        "integration-tests": 5,  # Retry integration tests 5 times
        "e2e-tests": 2,          # Retry e2e tests 2 times
        "unit-tests": 3          # Retry unit tests 3 times
    }
)
```

### 4. **custom_prompts**

- **Type**: Object (key-value pairs) or null
- **Purpose**: Custom prompts per check
- **Use Case**: Provide specific instructions for fixing different types of failures

**Example**:

```python
# Set custom prompts for specific checks
agent.update_check_suite_settings(
    org_id=123,
    repo_id=456,
    custom_prompts={
        "type-check": "Fix TypeScript errors. Prefer type safety over 'any'",
        "security-scan": "Address all vulnerabilities with CVSS score > 7.0",
        "lint-check": "Fix linting errors following our ESLint config"
    }
)
```

### 5. **high_priority_apps**

- **Type**: Array of strings or null
- **Purpose**: Apps that trigger immediate processing on failure
- **Use Case**: Critical checks that need immediate attention

**Example**:

```python
# Mark security and critical tests as high priority
agent.update_check_suite_settings(
    org_id=123,
    repo_id=456,
    high_priority_apps=["security-scan", "critical-tests"]
)
```

**Response (200)**: Empty JSON object `{}`

**Error Responses**:

- **422**: Validation error with location, message, and error type

**Complete Configuration Example**:

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

# Complete check suite configuration
agent.update_check_suite_settings(
    repo_id=456,
    check_retry_count=3,  # Global retry count
    ignored_checks=[
        "docs-build",     # Skip documentation builds
        "spell-check"     # Skip spell checking
    ],
    check_retry_counts={
        "integration-tests": 5,  # Critical tests get more retries
        "e2e-tests": 3,
        "unit-tests": 2
    },
    custom_prompts={
        "type-check": "Fix TypeScript errors using strict mode and proper types",
        "lint-check": "Fix linting errors following our ESLint configuration",
        "security-scan": "Address all critical and high severity vulnerabilities",
        "integration-tests": "Fix failing integration tests. Check database connections and API responses"
    },
    high_priority_apps=[
        "security-scan",      # Immediate processing for security issues
        "integration-tests"   # Immediate processing for integration failures
    ]
)

print("✓ Check suite settings updated successfully")
```

**Best Practices**:

1. **Validate Retry Counts**:

   - Keep retry counts within 0-10 range
   - Higher retry counts for flaky tests
   - Lower retry counts for fast-failing checks

2. **Use Granular Settings**:

   - Configure per-check retries for fine-tuned control
   - Use custom prompts to guide fix strategies
   - Designate critical checks as high-priority

3. **Ignore Non-Critical Checks**:

   - Skip documentation builds for speed
   - Ignore flaky tests temporarily
   - Focus agent attention on critical failures

4. **Custom Prompts Strategy**:

   - Provide specific, actionable instructions
   - Reference style guides and standards
   - Include context about common failure patterns

5. **High Priority Configuration**:
   - Security checks should be high priority
   - Critical business logic tests
   - Integration tests for core functionality

**Monitoring Configuration**:

```python
# Get current settings
current = agent.get_check_suite_settings(org_id=123, repo_id=456)

# Compare with desired state
if current.check_retry_count < 3:
    print("⚠️ Retry count too low, updating...")
    agent.update_check_suite_settings(
        repo_id=456,
        check_retry_count=3
    )

# Verify high priority apps
required_high_priority = ["security-scan"]
if not all(app in current.high_priority_apps for app in required_high_priority):
    print("⚠️ Missing required high priority apps, updating...")
    agent.update_check_suite_settings(
        repo_id=456,
        high_priority_apps=required_high_priority
    )
```

---

## Complete Workflow Example

```python
from codegen import Agent
import time

def setup_repository_automation(org_id, repo_id):
    """Configure repository for automated CI/CD handling."""

    agent = Agent(org_id=org_id, token="sk-...")

    # Step 1: Get repository info
    repos = agent.get_repositories(org_id=org_id)
    repo = next((r for r in repos.items if r.id == repo_id), None)

    if not repo:
        print(f"❌ Repository {repo_id} not found")
        return

    print(f"✓ Found repository: {repo.full_name}")
    print(f"  Language: {repo.language}")
    print(f"  Setup Status: {repo.setup_status}")

    # Step 2: Get current check suite settings
    current_settings = agent.get_check_suite_settings(
        org_id=org_id,
        repo_id=repo_id
    )

    print(f"\n✓ Current settings:")
    print(f"  Global retries: {current_settings.check_retry_count}")
    print(f"  Ignored checks: {current_settings.ignored_checks}")

    # Step 3: Update check suite settings
    agent.update_check_suite_settings(
        repo_id=repo_id,
        check_retry_count=3,
        ignored_checks=["docs-build"],
        check_retry_counts={
            "integration-tests": 5,
            "e2e-tests": 3,
            "security-scan": 1  # Don't retry security scans
        },
        custom_prompts={
            "type-check": f"Fix TypeScript errors in {repo.language} codebase",
            "integration-tests": "Fix failing integration tests. Check API endpoints and database connections",
            "security-scan": "Address all critical and high severity vulnerabilities"
        },
        high_priority_apps=["security-scan", "integration-tests"]
    )

    print("\n✓ Check suite settings updated")

    # Step 4: Test with agent run
    run = agent.run(
        prompt=f"""
        Review the {repo.full_name} repository configuration:
        1. Verify all tests pass
        2. Check for security vulnerabilities
        3. Ensure code quality standards are met
        4. Report any issues found
        """,
        repo_id=repo_id
    )

    print(f"\n✓ Created agent run: {run.id}")
    print(f"  Web URL: {run.web_url}")

    # Step 5: Monitor agent run
    while True:
        status = agent.get_run(run.id)
        print(f"  Status: {status.status}")

        if status.status in ["completed", "failed", "cancelled"]:
            break

        time.sleep(10)

    # Step 6: Check results
    if status.status == "completed":
        print(f"\n✓ Configuration verified")
        print(f"Summary: {status.summary}")

        # If PR created, update state
        for pr in status.github_pull_requests:
            print(f"\n✓ PR created: {pr['url']}")

            # Mark as ready for review
            agent.edit_pr_simple(
                org_id=org_id,
                pr_id=pr['id'],
                state="ready_for_review"
            )

            print(f"  ✓ PR marked as ready for review")

    return status

# Execute workflow
setup_repository_automation(org_id=123, repo_id=456)
```

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-01-14
**Coverage**: Pull Requests API, Repositories API, Check Suite Settings
