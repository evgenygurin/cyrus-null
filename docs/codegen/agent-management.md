# Agent Management

> Part of Codegen Platform Documentation

## Creating Agent Runs

### Endpoint

```text
POST /v1/organizations/{org_id}/agent/run
```

### Rate Limit

**10 requests per minute**

### Required Parameters

| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| `org_id`  | int    | Organization identifier (path) |
| `prompt`  | string | Instruction for the agent      |

### Optional Parameters

| Parameter    | Type   | Description                              | Default        |
|--------------|--------|------------------------------------------|----------------|
| `repo_id`    | int    | Target repository ID                     | Organization's default |
| `model`      | string | Model to use                             | Org setting    |
| `agent_type` | string | `codegen` or `claude_code`               | Org setting    |
| `images`     | array  | Base64-encoded image data URIs           | `null`         |
| `metadata`   | object | Custom JSON data                         | `{}`           |

### Example Request

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

# Create agent run with detailed context
result = agent.run(
    prompt="""
    In the `user-auth` repository, refactor the UserService class
    to use dependency injection pattern.

    Tasks:
    1. Extract database logic into UserRepository
    2. Implement constructor injection for UserRepository
    3. Update all tests to use mock repositories
    4. Ensure 90%+ test coverage

    Follow the pattern shown in ProductService/ProductRepository.
    """,
    repo_id=456,
    metadata={
        "task_type": "refactoring",
        "priority": "high",
        "sprint": "2025-Q1-S3"
    }
)

print(f"Agent run created: {result.id}")
print(f"View in UI: {result.web_url}")
```

### Response Structure

```json
{
  "id": 789,
  "organization_id": 123,
  "status": "running",
  "created_at": "2025-01-13T10:30:00Z",
  "web_url": "https://codegen.com/agents/789",
  "result": null,
  "summary": null,
  "source_type": "API",
  "github_pull_requests": [],
  "metadata": {
    "task_type": "refactoring",
    "priority": "high"
  }
}
```

### Error Responses

| Status | Scenario                      | Action                           |
|--------|-------------------------------|----------------------------------|
| 402    | Billing limit reached         | Upgrade plan or contact billing  |
| 403    | Insufficient access           | Verify organization membership   |
| 404    | No repositories configured    | Add repository to organization   |
| 422    | Invalid input                 | Check parameter validation       |
| 429    | Rate limit exceeded           | Implement exponential backoff    |

## Retrieving Agent Run Status

### Endpoint

```text
GET /v1/organizations/{org_id}/agent/run/{agent_run_id}
```

### Rate Limit

**60 requests per 30 seconds**

### Polling Pattern

```python
import time
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

# Create run
run = agent.run(prompt="Fix bug in payment processing")

# Poll for completion
while True:
    status = agent.get_run(run.id)

    print(f"Status: {status.status}")

    if status.status in ["completed", "failed", "cancelled"]:
        break

    time.sleep(5)  # Wait 5 seconds between polls

# Check results
if status.status == "completed":
    print(f"Summary: {status.summary}")
    print(f"Result: {status.result}")

    for pr in status.github_pull_requests:
        print(f"PR created: {pr['url']}")
```

### Best Practices for Polling

1. **Use exponential backoff** for long-running tasks:

   ```python
   import time

   wait_time = 2  # Start with 2 seconds
   max_wait = 60  # Cap at 60 seconds

   while True:
       status = agent.get_run(run_id)
       if status.status in ["completed", "failed"]:
           break

       time.sleep(wait_time)
       wait_time = min(wait_time * 1.5, max_wait)
   ```

2. **Respect rate limits**: Maximum 1 request per 0.5 seconds
3. **Set timeouts**: Don't poll indefinitely

   ```python
   import time

   timeout = 3600  # 1 hour timeout
   start_time = time.time()

   while time.time() - start_time < timeout:
       status = agent.get_run(run_id)
       if status.status in ["completed", "failed"]:
           break
       time.sleep(5)
   ```

## Listing Agent Runs

### Endpoint

```text
GET /v1/organizations/{org_id}/agent/runs
```

### Query Parameters

| Parameter     | Type   | Description                | Default | Range   |
|---------------|--------|----------------------------|---------|---------|
| `skip`        | int    | Offset for pagination      | 0       | 0+      |
| `limit`       | int    | Results per page           | 100     | 1-100   |
| `user_id`     | int    | Filter by user             | null    | -       |
| `source_type` | string | Filter by trigger source   | null    | See below |

### Source Type Values

- `LOCAL`, `SLACK`, `GITHUB`, `GITHUB_CHECK_SUITE`, `GITHUB_PR_REVIEW`
- `LINEAR`, `API`, `CHAT`, `JIRA`, `CLICKUP`, `MONDAY`, `SETUP_COMMANDS`

### Example

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

## Resuming Agent Runs

### Endpoint

```text
POST /v1/organizations/{org_id}/agent/run/resume
```

### Use Cases

- Continue conversation with agent
- Provide additional context
- Request modifications to previous work
- Add follow-up tasks

### Example

```python
# Original run
run = agent.run(prompt="Implement user authentication")

# Wait for completion
# ...

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

## Managing Agent Runs

### Ban All Checks (Stop Agent)

```text
POST /v1/organizations/{org_id}/agent/run/ban
```

**What it does**:

- Stops all current agents for the PR
- Prevents future CI/CD check suite events from being processed

**When to use**:

- Stop runaway processes
- Cancel unwanted automated workflows
- Emergency halt of agent execution

```python
agent.ban_checks(agent_run_id=789)
```

### Unban Checks (Resume Processing)

```text
POST /v1/organizations/{org_id}/agent/run/unban
```

**What it does**:

- Removes ban flag from PR
- Allows future CI/CD check suite events

```python
agent.unban_checks(agent_run_id=789)
```

### Remove from PR

```text
POST /v1/organizations/{org_id}/agent/run/remove-from-pr
```

**What it does**:

- Flags PR to prevent future processing
- Stops all current agents for that PR

```python
agent.remove_from_pr(agent_run_id=789)
```

## Agent Run Logs (ALPHA)

### Endpoint

```text
GET /v1/alpha/organizations/{org_id}/agent/run/{agent_run_id}/logs
```

### Rate Limit

**60 requests per 60 seconds**

### Query Parameters

| Parameter | Type | Description                     | Default |
|-----------|------|---------------------------------|---------|
| `skip`    | int  | Offset for pagination           | 0       |
| `limit`   | int  | Logs per page (max 100)         | 100     |
| `reverse` | bool | Reverse chronological order     | false   |

### Log Entry Structure

Each log contains:

- `agent_run_id` - Associated run identifier
- `created_at` - Timestamp
- `tool_name` - Tool executed
- `message_type` - Type of message
- `thought` - Agent's reasoning
- `observation` - Data observed
- `tool_input` - Tool parameters
- `tool_output` - Tool results

### Use Cases

1. **Debugging failures**:

   ```python
   logs = agent.get_logs(agent_run_id=789, reverse=True, limit=20)

   for log in logs.items:
       if "error" in log.observation.lower():
           print(f"[{log.created_at}] {log.tool_name}: {log.observation}")
   ```

2. **Understanding agent decisions**:

   ```python
   for log in logs.items:
       if log.thought:
           print(f"Agent thought: {log.thought}")
   ```

3. **Tracking tool usage**:

   ```python
   tool_usage = {}
   for log in logs.items:
       tool_usage[log.tool_name] = tool_usage.get(log.tool_name, 0) + 1

   print(f"Tool usage: {tool_usage}")
   ```
