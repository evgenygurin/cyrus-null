# API Reference - Complete Technical Guide

> Part of Codegen Platform Documentation

## 📋 Quick Navigation

- **Authentication**: @docs/codegen/api-authentication.md
- **Agent Management**: @docs/codegen/agent-management.md
- **Organizations**: See Organizations API below
- **Integrations**: See Integrations API below

## Base URL

```text
https://api.codegen.com/v1/
```

## Authentication

All API requests require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  "https://api.codegen.com/v1/organizations/YOUR_ORG_ID/agent/runs"
```

Obtain your API token and Organization ID at: [codegen.com/token](https://codegen.com/token)

---

## Agents API

### Create Agent Run

**Endpoint**: `POST /organizations/{org_id}/agent/run`

**Rate Limit**: 10 requests per minute

**Path Parameters**:

- `org_id` (integer, required): Organization identifier

**Request Body** (application/json):

```json
{
  "prompt": "string (required)",
  "repo_id": 123,
  "model": "string (optional)",
  "agent_type": "codegen|claude_code",
  "images": ["data:image/png;base64,..."],
  "metadata": {
    "task_type": "feature",
    "priority": "high"
  }
}
```

**Required Fields**:

- `prompt` (string): Instruction for the agent

**Optional Fields**:

- `repo_id` (integer): Target repository (defaults to org default)
- `model` (string): Model selection (defaults to org setting)
- `agent_type` (string): "codegen" or "claude_code" (defaults to org setting)
- `images` (array of strings): Base64-encoded data URIs
- `metadata` (object): Custom JSON data

**Response (200)**:

```json
{
  "id": 789,
  "organization_id": 123,
  "status": "running|completed|failed|cancelled",
  "created_at": "2025-01-14T10:30:00Z",
  "web_url": "https://codegen.com/agents/789",
  "result": "string or null",
  "summary": "string or null",
  "source_type": "API|LOCAL|SLACK|GITHUB|LINEAR|...",
  "github_pull_requests": [
    {
      "id": 456,
      "title": "Feature: Add authentication",
      "url": "https://github.com/org/repo/pull/456",
      "created_at": "2025-01-14T10:35:00Z",
      "head_branch_name": "feature/auth"
    }
  ],
  "metadata": {
    "task_type": "feature",
    "priority": "high"
  }
}
```

**Error Responses**:

| Code | Scenario | Message |
|------|----------|---------|
| 402 | Billing limit reached | "Alloted agent runs for the current billing plan have been reached" |
| 403 | Insufficient access | "You do not have access to this organization." |
| 404 | No repositories | "No repositories configured in organization" |
| 422 | Invalid input | Validation error details |
| 429 | Rate limit | "Rate limit exceeded. Please try again later." |

**Example**:

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

run = agent.run(
    prompt="Refactor UserService to use dependency injection",
    repo_id=456,
    metadata={
        "task_type": "refactoring",
        "priority": "high"
    }
)

print(f"Run ID: {run.id}")
print(f"Status: {run.status}")
print(f"Web URL: {run.web_url}")
```

---

### Get Agent Run

**Endpoint**: `GET /organizations/{org_id}/agent/run/{agent_run_id}`

**Rate Limit**: 60 requests per 30 seconds

**Path Parameters**:

- `org_id` (integer, required): Organization identifier
- `agent_run_id` (integer, required): Agent run identifier

**Response (200)**: Same structure as Create Agent Run

**Error Responses**:

| Code | Scenario |
|------|----------|
| 403 | "You do not have access to this organization" |
| 404 | "Agent run not found" |
| 422 | Validation errors |
| 429 | "Rate limit exceeded. Please try again later" |

**Polling Pattern**:

```python
import time

# Poll for completion
while True:
    status = agent.get_run(run.id)

    if status.status in ["completed", "failed", "cancelled"]:
        break

    time.sleep(5)  # Wait 5 seconds between polls

# Check results
if status.status == "completed":
    print(f"Summary: {status.summary}")
    for pr in status.github_pull_requests:
        print(f"PR: {pr['url']}")
```

**Best Practice**: Use exponential backoff for long-running tasks:

```python
wait_time = 2  # Start with 2 seconds
max_wait = 60  # Cap at 60 seconds

while True:
    status = agent.get_run(run_id)
    if status.status in ["completed", "failed"]:
        break

    time.sleep(wait_time)
    wait_time = min(wait_time * 1.5, max_wait)
```

---

### List Agent Runs

**Endpoint**: `GET /organizations/{org_id}/agent/runs`

**Rate Limit**: 60 requests per 30 seconds

**Path Parameters**:

- `org_id` (integer, required)

**Query Parameters**:

| Parameter | Type | Description | Default | Range |
|-----------|------|-------------|---------|-------|
| `skip` | integer | Pagination offset | 0 | 0+ |
| `limit` | integer | Results per page | 100 | 1-100 |
| `user_id` | integer | Filter by user | null | - |
| `source_type` | enum | Filter by source | null | See below |

**Source Types**:

- `LOCAL`, `SLACK`, `GITHUB`, `GITHUB_CHECK_SUITE`, `GITHUB_PR_REVIEW`
- `LINEAR`, `API`, `CHAT`, `JIRA`, `CLICKUP`, `MONDAY`, `SETUP_COMMANDS`

**Response (200)**:

```json
{
  "items": [
    {
      "id": 789,
      "organization_id": 123,
      "status": "completed",
      "created_at": "2025-01-14T10:30:00Z",
      "web_url": "https://codegen.com/agents/789",
      "result": "...",
      "summary": "...",
      "source_type": "API",
      "github_pull_requests": [...],
      "metadata": {...}
    }
  ],
  "total": 150,
  "page": 1,
  "size": 100,
  "pages": 2
}
```

**Example**:

```python
# List all API-triggered runs
runs = agent.list_runs(
    source_type="API",
    limit=50
)

for run in runs.items:
    print(f"Run {run.id}: {run.status} - {run.summary}")

# Pagination
page2 = agent.list_runs(skip=100, limit=100)
```

---

### Resume Agent Run

**Endpoint**: `POST /organizations/{org_id}/agent/run/resume`

**Path Parameters**:

- `org_id` (integer, required)

**Request Body**:

```json
{
  "agent_run_id": 789,
  "prompt": "string (required)",
  "images": ["data:image/png;base64,..."]
}
```

**Required Fields**:

- `agent_run_id` (integer): ID of agent run to resume
- `prompt` (string): Continuation instruction

**Optional Fields**:

- `images` (array): Base64-encoded data URIs

**Response (200)**: AgentRunResponse object (same as Create Agent Run)

**Use Cases**:

- Continue conversation with agent
- Provide additional context
- Request modifications to previous work
- Add follow-up tasks

**Example**:

```python
# Original run
run = agent.run(prompt="Implement user authentication")

# Wait for completion...

# Resume with follow-up
continued = agent.resume(
    agent_run_id=run.id,
    prompt="""
    Great work! Now please:
    1. Add rate limiting to login endpoint
    2. Implement password reset functionality
    3. Add email verification
    """
)
```

---

### Ban All Checks For Agent Run

**Endpoint**: `POST /organizations/{org_id}/agent/run/ban`

**Purpose**: Stops all current agents for the PR and prevents future CI/CD check suite events from processing.

**Path Parameters**:

- `org_id` (integer, required)

**Request Body**:

```json
{
  "agent_run_id": 789,
  "before_card_order_id": "string or null",
  "after_card_order_id": "string or null"
}
```

**When to Use**:

- Stop runaway processes
- Cancel unwanted automated workflows
- Emergency halt of agent execution

**Example**:

```python
agent.ban_checks(agent_run_id=789)
```

---

### Unban All Checks For Agent Run

**Endpoint**: `POST /organizations/{org_id}/agent/run/unban`

**Purpose**: Removes ban flag from PR to allow future CI/CD check suite events.

**Request Body**: Same as Ban endpoint

**Example**:

```python
agent.unban_checks(agent_run_id=789)
```

---

### Remove Codegen From PR

**Endpoint**: `POST /organizations/{org_id}/agent/run/remove-from-pr`

**Purpose**: User-friendly alternative to ban operation. Flags PR to prevent future processing and stops all current agents.

**Request Body**: Same as Ban endpoint

**Example**:

```python
agent.remove_from_pr(agent_run_id=789)
```

---

## Organizations API

### Get Organizations

**Endpoint**: `GET /organizations`

**Rate Limit**: 60 requests per 30 seconds

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
      "id": 123,
      "name": "Acme Corp",
      "settings": {
        "enable_pr_creation": true,
        "enable_rules_detection": true
      }
    }
  ],
  "total": 5,
  "page": 1,
  "size": 100,
  "pages": 1
}
```

**Organization Settings**:

- `enable_pr_creation` (boolean): Controls PR generation (default: true)
- `enable_rules_detection` (boolean): Enables automated rules detection (default: true)

**Example**:

```python
orgs = agent.get_organizations()

for org in orgs.items:
    print(f"Org: {org.name} (ID: {org.id})")
    print(f"  PR Creation: {org.settings.enable_pr_creation}")
    print(f"  Rules Detection: {org.settings.enable_rules_detection}")
```

---

### Get MCP Providers

**Endpoint**: `GET /mcp-providers`

**Purpose**: Retrieves OAuth providers configured for Model Context Protocol integration.

**Parameters**: None

**Response (200)**:

```json
[
  {
    "id": 1,
    "name": "GitHub",
    "issuer": "https://github.com",
    "authorization_endpoint": "https://github.com/login/oauth/authorize",
    "token_endpoint": "https://github.com/login/oauth/access_token",
    "default_scopes": ["repo", "user"],
    "is_mcp": true,
    "meta": {
      "description": "GitHub OAuth integration"
    }
  }
]
```

**MCP Provider Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Provider identifier |
| `name` | string | Provider name |
| `issuer` | string | OAuth issuer |
| `authorization_endpoint` | string | OAuth authorization URL |
| `token_endpoint` | string | OAuth token exchange URL |
| `default_scopes` | array/null | Default permission scopes |
| `is_mcp` | boolean | MCP compatibility flag |
| `meta` | object/null | Additional metadata |

---

### Get OAuth Token Status

**Endpoint**: `GET /oauth/tokens/status`

**Query Parameters**:

- `org_id` (integer, required): Organization identifier

**Response (200)**: List of provider names with active OAuth tokens

**Purpose**: Check which providers have valid, connected tokens for current user and organization.

**Example**:

```python
# Check OAuth status
status = agent.get_oauth_status(org_id=123)

# Returns list like: ["github", "slack", "linear"]
for provider in status:
    print(f"✓ {provider} connected")
```

---

### Revoke OAuth Token

**Endpoint**: `POST /oauth/tokens/revoke`

**Request Body**:

```json
{
  "provider": "github",
  "org_id": 123
}
```

**⚠️ Important**: Marks ALL tokens as inactive for the specified provider and organization.

**Impact**:

- Affects all tokens organization-wide
- Connected applications lose authentication immediately
- Users must re-authenticate to restore access
- No selective revocation available

**Example**:

```python
# Revoke all GitHub tokens for organization
agent.revoke_oauth_token(
    provider="github",
    org_id=123
)
```

---

## Integrations API

### Get Organization Integrations

**Endpoint**: `GET /organizations/{org_id}/integrations`

**Rate Limit**: 60 requests per 30 seconds

**Path Parameters**:

- `org_id` (integer, required)

**Response (200)**:

```json
{
  "organization_id": 123,
  "organization_name": "Acme Corp",
  "total_active_integrations": 5,
  "integrations": [
    {
      "integration_type": "github",
      "active": true,
      "token_id": 456,
      "installation_id": 789,
      "metadata": {
        "app_id": "123456"
      }
    },
    {
      "integration_type": "slack",
      "active": true,
      "token_id": 457,
      "installation_id": null,
      "metadata": {
        "workspace": "acme-dev"
      }
    },
    {
      "integration_type": "linear",
      "active": true,
      "token_id": 458,
      "installation_id": null,
      "metadata": {
        "workspace_id": "abc123"
      }
    }
  ]
}
```

**Integration Types**:

- `github`, `slack`, `linear`, `jira`, `clickup`, `monday`, `notion`
- `figma`, `sentry`, `circleci`, `postgres`

**Integration Status Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `integration_type` | string | Integration identifier |
| `active` | boolean | Current operational state |
| `token_id` | integer/null | Associated token ID |
| `installation_id` | integer/null | App installation reference |
| `metadata` | object/null | Configuration data |

**Example**:

```python
# Get all integrations
integrations = agent.get_integrations()

print(f"Organization: {integrations.organization_name}")
print(f"Active Integrations: {integrations.total_active_integrations}")

for integration in integrations.integrations:
    status = "✓ Active" if integration.active else "✗ Inactive"
    print(f"{integration.integration_type}: {status}")
```

---

## CLI Rules API

### Get CLI Rules

**Endpoint**: `GET /organizations/{org_id}/cli/rules`

**Rate Limit**: 30 requests per minute

**Path Parameters**:

- `org_id` (integer, required)

**Response (200)**:

```json
{
  "organization_rules": "string or null",
  "user_custom_prompt": "string or null"
}
```

**Purpose**: Retrieves organization-specific rules and user-defined custom prompts for AI agents.

**Fields**:

- `organization_rules`: Org-level guidelines (same as MCP organization_rules prompt)
- `user_custom_prompt`: User-specific instructions

**Example**:

```python
rules = agent.get_cli_rules(org_id=123)

if rules.organization_rules:
    print("Organization Rules:")
    print(rules.organization_rules)

if rules.user_custom_prompt:
    print("\nUser Custom Prompt:")
    print(rules.user_custom_prompt)
```

---

## Rate Limits Summary

| Endpoint Category | Rate Limit |
|------------------|------------|
| Create Agent Run | 10 req/min |
| Get Agent Run | 60 req/30s |
| List Agent Runs | 60 req/30s |
| Resume Agent Run | Not specified |
| Organizations API | 60 req/30s |
| Integrations API | 60 req/30s |
| CLI Rules API | 30 req/min |

**Best Practices**:

1. Implement exponential backoff on 429 errors
2. Cache results when possible
3. Use pagination for large datasets
4. Respect rate limits to avoid blocking

---

## Error Handling

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 402 | Payment Required | Upgrade billing plan |
| 403 | Forbidden | Check organization access |
| 404 | Not Found | Verify resource exists |
| 422 | Unprocessable Entity | Fix validation errors |
| 429 | Too Many Requests | Implement backoff |

### Error Response Structure

```json
{
  "detail": [
    {
      "loc": ["body", "prompt"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Retry Pattern

```python
import time
import random

def api_call_with_retry(func, max_retries=5):
    """Execute API call with exponential backoff."""

    for attempt in range(max_retries):
        try:
            return func()

        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise

            # Exponential backoff with jitter
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            print(f"Rate limited. Waiting {wait_time:.2f}s...")
            time.sleep(wait_time)

    raise Exception("Max retries exceeded")

# Usage
run = api_call_with_retry(
    lambda: agent.run(prompt="your task")
)
```

---

## Complete Example: Multi-Step Workflow

```python
from codegen import Agent
import time

def complete_workflow():
    """Example: Create, monitor, and resume agent run."""

    # Initialize agent
    agent = Agent(
        org_id=123,
        token="sk-..."
    )

    # Step 1: Get organization info
    orgs = agent.get_organizations()
    print(f"Organization: {orgs.items[0].name}")

    # Step 2: Check integrations
    integrations = agent.get_integrations()
    print(f"Active integrations: {integrations.total_active_integrations}")

    # Step 3: Create agent run
    run = agent.run(
        prompt="Implement user authentication with JWT",
        repo_id=456,
        metadata={
            "task_type": "feature",
            "priority": "high"
        }
    )

    print(f"Created run: {run.id}")
    print(f"Web URL: {run.web_url}")

    # Step 4: Poll for completion
    while True:
        status = agent.get_run(run.id)
        print(f"Status: {status.status}")

        if status.status in ["completed", "failed", "cancelled"]:
            break

        time.sleep(10)

    # Step 5: Check results
    if status.status == "completed":
        print(f"Summary: {status.summary}")

        for pr in status.github_pull_requests:
            print(f"PR created: {pr['url']}")

        # Step 6: Resume with follow-up
        continued = agent.resume(
            agent_run_id=run.id,
            prompt="""
            Great! Now please:
            1. Add rate limiting to the login endpoint
            2. Add password reset functionality
            3. Update documentation
            """
        )

        print(f"Resumed run: {continued.id}")

    return status

# Execute workflow
result = complete_workflow()
```

---

**Document Status**: ✅ Complete API Reference
**Last Updated**: 2025-01-14
**Coverage**: Agents, Organizations, Integrations, CLI Rules APIs
