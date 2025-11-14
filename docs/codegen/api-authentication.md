# API Authentication & Setup

> Part of Codegen Platform Documentation

## Obtaining Credentials

Visit [codegen.com/token](https://codegen.com/token) to:

- Generate your **API Token** (tied to your user account)
- Locate your **Organization ID**

## Base URL

All API requests use:

```text
https://api.codegen.com/v1/
```

## Authentication Methods

### REST API

Include Bearer token in headers:

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  "https://api.codegen.com/v1/organizations/YOUR_ORG_ID/agent/run"
```

### Python SDK

```python
from codegen import Agent

agent = Agent(
    org_id="YOUR_ORG_ID",
    token="YOUR_API_TOKEN"
)

# Create agent run
task = agent.run(prompt="Fix authentication bug in user service")
```

## Security Best Practices

- ✅ Store tokens in environment variables, never hardcode
- ✅ Use secret management systems (Vault, AWS Secrets Manager)
- ✅ Rotate tokens periodically
- ✅ Grant minimum required permissions
- ❌ Never commit tokens to version control
- ❌ Never share tokens across teams

## Rate Limits by Endpoint

| Endpoint Category          | Rate Limit                  |
|----------------------------|----------------------------|
| Agent creation             | 10 requests per minute     |
| Agent status retrieval     | 60 requests per 30 seconds |
| Agent run listing          | 60 requests per 30 seconds |
| Organizations, Users, Repos| 60 requests per 30 seconds |
| Setup commands             | 5 requests per minute      |
| Log analysis              | 5 requests per minute      |
| Agent logs (ALPHA)         | 60 requests per 60 seconds |
| PR editing                 | 30 requests per minute     |

## Error Handling Best Practices

### Implement Exponential Backoff

```python
import time
import random

def create_agent_with_retry(agent, prompt, max_retries=5):
    """Create agent run with exponential backoff on rate limit."""

    for attempt in range(max_retries):
        try:
            return agent.run(prompt=prompt)

        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise

            # Exponential backoff with jitter
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            print(f"Rate limited. Waiting {wait_time:.2f}s...")
            time.sleep(wait_time)

    raise Exception("Max retries exceeded")
```

### Handle Specific Error Codes

```python
def handle_agent_creation(agent, prompt):
    """Handle agent creation with specific error handling."""

    try:
        run = agent.run(prompt=prompt)
        return run

    except BillingLimitError:  # 402
        print("❌ Billing limit reached. Contact administrator.")
        return None

    except InsufficientAccessError:  # 403
        print("❌ Insufficient permissions. Request organization access.")
        return None

    except NoRepositoriesError:  # 404
        print("❌ No repositories configured. Add repository first.")
        return None

    except ValidationError as e:  # 422
        print(f"❌ Invalid input: {e.message}")
        return None

    except RateLimitError:  # 429
        print("❌ Rate limit exceeded. Please try again later.")
        return None
```

### Graceful Degradation

```python
def get_agent_status_safe(agent, run_id):
    """Get agent status with fallback to cached data."""

    try:
        return agent.get_run(run_id)

    except RateLimitError:
        # Fall back to cached status
        cached = get_cached_status(run_id)
        if cached:
            print("⚠️ Using cached status due to rate limit")
            return cached
        raise

    except Exception as e:
        print(f"⚠️ Error retrieving status: {e}")
        return None
```

## Monitoring Rate Limits

```python
import time
from collections import deque

class RateLimiter:
    """Track API calls to avoid rate limits."""

    def __init__(self, max_calls, time_window):
        self.max_calls = max_calls
        self.time_window = time_window  # seconds
        self.calls = deque()

    def can_call(self):
        """Check if we can make another API call."""
        now = time.time()

        # Remove calls outside time window
        while self.calls and self.calls[0] < now - self.time_window:
            self.calls.popleft()

        return len(self.calls) < self.max_calls

    def record_call(self):
        """Record an API call."""
        self.calls.append(time.time())

    def wait_if_needed(self):
        """Wait if rate limit would be exceeded."""
        while not self.can_call():
            time.sleep(0.5)
        self.record_call()

# Usage
limiter = RateLimiter(max_calls=10, time_window=60)  # 10/minute

for task in tasks:
    limiter.wait_if_needed()
    agent.run(prompt=task.prompt)
```
