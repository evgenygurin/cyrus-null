# Advanced API Endpoints

> Part of Codegen Platform Documentation

## Sandbox API

### Analyze Sandbox Logs

**Endpoint**: `POST /organizations/{org_id}/sandbox/{sandbox_id}/analyze-logs`

**Rate Limit**: 5 requests per minute

**Path Parameters**:

- `org_id` (integer, required): Organization identifier
- `sandbox_id` (integer, required): Sandbox identifier

**Purpose**: Analyze setup logs from a sandbox using AI agent. Identifies errors, provides insights about failures, and suggests solutions.

**Request Body**: None (empty payload)

**Response (200)**:

```json
{
  "agent_run_id": 123,
  "status": "running",
  "message": "Analysis started for sandbox logs"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `agent_run_id` | integer | Agent run identifier for polling |
| `status` | string | Current analysis status |
| `message` | string | Process information |

**Error Responses**:

| Code | Scenario |
|------|----------|
| 400 | "No logs available for analysis" |
| 403 | Insufficient organization access permissions |
| 404 | Sandbox resource not found |
| 422 | Validation errors in request parameters |
| 429 | Rate limit exceeded |

**How It Works**:

1. Submit POST request with org ID and sandbox ID
2. Endpoint returns agent run ID immediately
3. Poll agent run status for analysis results
4. Processing occurs asynchronously in background

**Use Cases**:

- Troubleshooting failed sandbox deployments
- Understanding setup errors asynchronously
- Retrieving AI-generated remediation suggestions
- Monitoring sandbox health through log analysis

**Example**:

```python
from codegen import Agent
import time

agent = Agent(org_id=123, token="sk-...")

# Step 1: Start log analysis
response = agent.analyze_sandbox_logs(sandbox_id=456)

print(f"Analysis started: {response.message}")
print(f"Agent run ID: {response.agent_run_id}")

# Step 2: Poll for results
while True:
    status = agent.get_run(response.agent_run_id)

    print(f"Status: {status.status}")

    if status.status in ["completed", "failed", "cancelled"]:
        break

    time.sleep(5)

# Step 3: Check analysis results
if status.status == "completed":
    print("\n✓ Log Analysis Complete:")
    print(f"Summary: {status.summary}")
    print(f"Result: {status.result}")

    # Extract insights
    if "error" in status.result.lower():
        print("\n⚠️ Errors found in sandbox setup")
    if "solution" in status.result.lower():
        print("✓ Suggested solutions available")
else:
    print(f"\n❌ Analysis failed: {status.result}")
```

**Advanced Pattern - Automated Troubleshooting**:

```python
def troubleshoot_sandbox(org_id, sandbox_id):
    """Automatically analyze and fix sandbox issues."""

    agent = Agent(org_id=org_id, token="sk-...")

    # Analyze logs
    analysis = agent.analyze_sandbox_logs(sandbox_id=sandbox_id)

    # Wait for analysis
    while True:
        status = agent.get_run(analysis.agent_run_id)
        if status.status in ["completed", "failed"]:
            break
        time.sleep(5)

    if status.status != "completed":
        return {"success": False, "error": "Analysis failed"}

    # Parse issues from analysis
    issues = parse_sandbox_issues(status.result)

    if not issues:
        return {"success": True, "message": "No issues found"}

    # Create agent run to fix issues
    fix_run = agent.run(
        prompt=f"""
        Fix the following sandbox setup issues:

        {format_issues(issues)}

        For each issue:
        1. Identify root cause
        2. Implement fix
        3. Verify fix works
        4. Update setup commands if needed
        """,
        metadata={
            "sandbox_id": sandbox_id,
            "analysis_run_id": analysis.agent_run_id
        }
    )

    return {"success": True, "fix_run_id": fix_run.id}

# Helper functions
def parse_sandbox_issues(analysis_result):
    """Extract issues from analysis result."""
    # Implementation specific to your needs
    return []

def format_issues(issues):
    """Format issues for agent prompt."""
    return "\n".join([f"- {issue}" for issue in issues])
```

---

## Setup Commands API

### Generate Setup Commands

**Endpoint**: `POST /organizations/{org_id}/setup-commands/generate`

**Rate Limit**: 5 requests per minute

**Path Parameters**:

- `org_id` (integer, required): Organization identifier

**Request Body**:

```json
{
  "repo_id": 456,
  "prompt": "Generate setup commands for Node.js project with TypeScript",
  "trigger_source": "setup-commands"
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repo_id` | integer | Yes | Repository identifier |
| `prompt` | string/null | No | Custom instructions for generation |
| `trigger_source` | string | No | Source identifier (default: "setup-commands") |

**Response (200)**:

```json
{
  "agent_run_id": 789,
  "status": "running",
  "url": "https://codegen.com/agents/789"
}
```

**Error Responses**:

| Code | Scenario |
|------|----------|
| 400 | Invalid input parameters |
| 404 | Repository not found |
| 422 | Validation errors |
| 500 | Server-side failure |

**Functionality**:

Analyzes repository structure and generates appropriate setup commands using AI agent. Outputs installation/initialization procedures tailored to repository configuration.

**Use Cases**:

- Automated setup documentation generation
- Repository onboarding acceleration
- Environment initialization scripting
- CI/CD pipeline configuration

**Example**:

```python
from codegen import Agent
import time

agent = Agent(org_id=123, token="sk-...")

# Generate setup commands
response = agent.generate_setup_commands(
    repo_id=456,
    prompt="""
    Generate setup commands for this repository that:
    1. Install all dependencies
    2. Set up development environment
    3. Initialize database
    4. Run initial migrations
    5. Start development server

    Include commands for both macOS and Linux.
    """
)

print(f"Generation started: {response.status}")
print(f"Agent run ID: {response.agent_run_id}")
print(f"Web URL: {response.url}")

# Poll for completion
while True:
    status = agent.get_run(response.agent_run_id)

    if status.status in ["completed", "failed", "cancelled"]:
        break

    time.sleep(5)

# Extract generated commands
if status.status == "completed":
    print("\n✓ Setup Commands Generated:")
    print(status.result)

    # Save to repository
    with open(".codegen/setup.sh", "w") as f:
        f.write(status.result)

    print("\n✓ Saved to .codegen/setup.sh")
```

**Advanced Pattern - Multi-Environment Setup**:

```python
def generate_multi_env_setup(org_id, repo_id):
    """Generate setup commands for multiple environments."""

    agent = Agent(org_id=org_id, token="sk-...")

    environments = ["development", "staging", "production"]
    setup_commands = {}

    for env in environments:
        print(f"Generating setup for {env}...")

        response = agent.generate_setup_commands(
            repo_id=repo_id,
            prompt=f"""
            Generate setup commands for {env} environment:

            Requirements for {env}:
            - Environment-specific configuration
            - Appropriate security measures
            - Database connection setup
            - Service dependencies
            - Health checks

            Format output as shell script with comments.
            """
        )

        # Wait for completion
        status = wait_for_agent(agent, response.agent_run_id)

        if status.status == "completed":
            setup_commands[env] = status.result

            # Save to environment-specific file
            filename = f".codegen/setup-{env}.sh"
            with open(filename, "w") as f:
                f.write(status.result)

            print(f"✓ Saved {env} setup to {filename}")

        time.sleep(12)  # Respect rate limit (5 req/min)

    return setup_commands

def wait_for_agent(agent, run_id, timeout=300):
    """Wait for agent completion with timeout."""
    start_time = time.time()

    while time.time() - start_time < timeout:
        status = agent.get_run(run_id)

        if status.status in ["completed", "failed", "cancelled"]:
            return status

        time.sleep(5)

    raise TimeoutError(f"Agent run {run_id} timed out")
```

---

## Slack Connect API

### Generate Slack Connect Token

**Endpoint**: `POST /slack-connect/generate-token`

**Path Parameters**: None

**Request Body**:

```json
{
  "org_id": 123
}
```

**Purpose**: Generate temporary token for connecting Slack accounts to Codegen.

**Token Characteristics**:

- ⏰ **Expires in 10 minutes**
- 🔒 **Single-use only** (can only be used once)
- 💬 **Must be sent to Codegen bot via DM** using format: `Connect my account: {token}`

**Response (200)**:

```json
{
  "token": "abc123def456",
  "message": "Token generated successfully",
  "expires_in_minutes": 10
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | The generated token value |
| `message` | string | Descriptive response text |
| `expires_in_minutes` | integer | Token validity duration (always 10) |

**Error Responses**:

- **422**: Validation errors with detailed field information

**Integration Flow**:

1. **Generate Token**:

   ```python
   response = agent.generate_slack_connect_token(org_id=123)
   token = response.token
   ```

2. **Send to User**:

   ```python
   print(f"Send this to Codegen bot in Slack DM:")
   print(f"Connect my account: {token}")
   print(f"Token expires in {response.expires_in_minutes} minutes")
   ```

3. **User Authenticates**:
   - User opens Slack DM with Codegen bot
   - User sends: `Connect my account: abc123def456`
   - Bot validates token and connects account

**Example**:

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

# Generate Slack connect token
response = agent.generate_slack_connect_token(org_id=123)

print(f"✓ Token generated: {response.token}")
print(f"⏰ Expires in: {response.expires_in_minutes} minutes")
print(f"\n📝 Instructions:")
print(f"1. Open Slack and find the Codegen bot")
print(f"2. Send this message in DM:")
print(f"   Connect my account: {response.token}")
print(f"3. Wait for confirmation from bot")
```

**Automated Slack Onboarding**:

```python
import smtplib
from email.mime.text import MIMEText

def onboard_user_to_slack(org_id, user_email):
    """Automate Slack connection for new users."""

    agent = Agent(org_id=org_id, token="sk-...")

    # Generate token
    response = agent.generate_slack_connect_token(org_id=org_id)

    # Send instructions via email
    message = f"""
    Welcome to Codegen!

    To connect your Slack account:

    1. Open Slack and find the Codegen bot
    2. Send this message in a DM:

       Connect my account: {response.token}

    3. This token expires in {response.expires_in_minutes} minutes

    After connecting, you can:
    - Trigger agents with @codegen mentions
    - Receive notifications about agent runs
    - Collaborate with team members

    Questions? Reply to this email.
    """

    # Send email (implementation depends on your email service)
    send_email(
        to=user_email,
        subject="Connect Your Slack to Codegen",
        body=message
    )

    print(f"✓ Onboarding email sent to {user_email}")
    print(f"Token: {response.token} (expires in {response.expires_in_minutes} min)")

    return response.token

def send_email(to, subject, body):
    """Send email notification."""
    # Implementation specific to your email service
    pass
```

---

## Users API

### Get Current User Info

**Endpoint**: `GET /users/me`

**Rate Limit**: 60 requests per 30 seconds

**Authentication**: Requires API token via Authorization header

**Response (200)**:

```json
{
  "id": 123,
  "email": "user@example.com",
  "github_user_id": "456789",
  "github_username": "johndoe",
  "avatar_url": "https://avatars.githubusercontent.com/u/456789",
  "full_name": "John Doe",
  "role": "ADMIN",
  "is_admin": true
}
```

**User Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique user identifier (required) |
| `email` | string/null | User's email address |
| `github_user_id` | string | GitHub user ID (required) |
| `github_username` | string | GitHub username (required) |
| `avatar_url` | string/null | URL to avatar image |
| `full_name` | string/null | User's full name |
| `role` | string/null | Organization role (ADMIN, MANAGER, MEMBER) |
| `is_admin` | boolean/null | Admin status (⚠️ deprecated - use `role` field) |

**Role Values**:

- `ADMIN` - Full organization access
- `MANAGER` - Team and project management
- `MEMBER` - Standard member access

**Error Responses**:

| Code | Scenario |
|------|----------|
| 403 | Insufficient permissions |
| 422 | Invalid request parameters |
| 429 | Rate limit exceeded |

**Use Cases**:

- User identification from API tokens
- Permission validation within organizations
- Profile data retrieval for account management
- Role-based access control implementation

**Example**:

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

# Get current user info
user = agent.get_current_user()

print(f"User: {user.full_name} ({user.github_username})")
print(f"Email: {user.email}")
print(f"Role: {user.role}")
print(f"Avatar: {user.avatar_url}")

# Check permissions
if user.role == "ADMIN":
    print("✓ User has admin access")
elif user.role == "MANAGER":
    print("✓ User has manager access")
else:
    print("ℹ️ User has member access")
```

---

### Get User

**Endpoint**: `GET /organizations/{org_id}/users/{user_id}`

**Rate Limit**: 60 requests per 30 seconds

**Path Parameters**:

- `org_id` (integer, required): Organization identifier
- `user_id` (integer, required): User identifier

**Response (200)**: Same structure as Get Current User Info

**Error Responses**:

| Code | Scenario |
|------|----------|
| 403 | "You do not have access to this organization." |
| 404 | "User not found." |
| 422 | Validation errors |
| 429 | Rate limit exceeded |

**Key Distinction**:

- **Get Current User** (`/users/me`): Retrieves authenticated user's own data
- **Get User** (`/orgs/{org_id}/users/{user_id}`): Retrieves specific user's details within an organization (requires organization membership)

**Use Cases**:

- Retrieve team member profiles
- Display user information in organization dashboards
- Verify user roles/permissions within specific organization
- Populate user directories

**Example**:

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

# Get specific user
user = agent.get_user(org_id=123, user_id=456)

print(f"User: {user.full_name}")
print(f"GitHub: @{user.github_username}")
print(f"Role: {user.role}")
```

---

### Get Users (List)

**Endpoint**: `GET /organizations/{org_id}/users`

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
      "id": 123,
      "email": "user1@example.com",
      "github_user_id": "456789",
      "github_username": "johndoe",
      "avatar_url": "https://avatars.githubusercontent.com/u/456789",
      "full_name": "John Doe",
      "role": "ADMIN",
      "is_admin": true
    },
    {
      "id": 124,
      "email": "user2@example.com",
      "github_user_id": "456790",
      "github_username": "janedoe",
      "avatar_url": "https://avatars.githubusercontent.com/u/456790",
      "full_name": "Jane Doe",
      "role": "MEMBER",
      "is_admin": false
    }
  ],
  "total": 25,
  "page": 1,
  "size": 100,
  "pages": 1
}
```

**Example**:

```python
from codegen import Agent

agent = Agent(org_id=123, token="sk-...")

# Get all users
users = agent.get_users(org_id=123)

print(f"Total users: {users.total}")

# Group by role
admins = [u for u in users.items if u.role == "ADMIN"]
managers = [u for u in users.items if u.role == "MANAGER"]
members = [u for u in users.items if u.role == "MEMBER"]

print(f"\nAdmins: {len(admins)}")
for admin in admins:
    print(f"  - {admin.full_name} (@{admin.github_username})")

print(f"\nManagers: {len(managers)}")
for manager in managers:
    print(f"  - {manager.full_name} (@{manager.github_username})")

print(f"\nMembers: {len(members)}")
```

**Advanced Pattern - Team Directory**:

```python
def build_team_directory(org_id):
    """Build comprehensive team directory with stats."""

    agent = Agent(org_id=org_id, token="sk-...")

    # Get all users
    users = agent.get_users(org_id=org_id)

    directory = {
        "total_users": users.total,
        "by_role": {
            "admins": [],
            "managers": [],
            "members": []
        },
        "github_usernames": [],
        "missing_profiles": []
    }

    for user in users.items:
        # Categorize by role
        if user.role == "ADMIN":
            directory["by_role"]["admins"].append(user)
        elif user.role == "MANAGER":
            directory["by_role"]["managers"].append(user)
        else:
            directory["by_role"]["members"].append(user)

        # Collect GitHub usernames
        directory["github_usernames"].append(user.github_username)

        # Check for missing profile info
        if not user.full_name or not user.email:
            directory["missing_profiles"].append(user.github_username)

    # Generate report
    print(f"Team Directory")
    print(f"=" * 50)
    print(f"Total Users: {directory['total_users']}")
    print(f"  Admins: {len(directory['by_role']['admins'])}")
    print(f"  Managers: {len(directory['by_role']['managers'])}")
    print(f"  Members: {len(directory['by_role']['members'])}")

    if directory["missing_profiles"]:
        print(f"\n⚠️ Users with incomplete profiles:")
        for username in directory["missing_profiles"]:
            print(f"  - @{username}")

    return directory

# Execute
directory = build_team_directory(org_id=123)
```

---

## Complete Workflow Example

```python
from codegen import Agent
import time

def complete_sandbox_workflow(org_id, repo_id):
    """
    Complete workflow:
    1. Generate setup commands
    2. Create sandbox
    3. Monitor sandbox health
    4. Analyze logs if issues occur
    5. Auto-fix problems
    """

    agent = Agent(org_id=org_id, token="sk-...")

    # Step 1: Get current user
    current_user = agent.get_current_user()
    print(f"✓ Authenticated as: {current_user.full_name}")

    # Step 2: Generate setup commands
    print("\n📝 Generating setup commands...")
    setup_response = agent.generate_setup_commands(
        repo_id=repo_id,
        prompt="Generate comprehensive setup commands"
    )

    # Wait for setup commands
    setup_status = wait_for_agent(agent, setup_response.agent_run_id)

    if setup_status.status != "completed":
        print(f"❌ Setup generation failed: {setup_status.result}")
        return

    print("✓ Setup commands generated")

    # Step 3: Create agent run to test setup
    print("\n🔧 Testing setup in sandbox...")
    test_run = agent.run(
        prompt=f"""
        Execute the generated setup commands and verify:
        1. All dependencies install successfully
        2. Development environment works
        3. Tests pass

        Setup commands:
        {setup_status.result}
        """,
        repo_id=repo_id
    )

    # Monitor test run
    test_status = wait_for_agent(agent, test_run.id)

    if test_status.status == "completed":
        print("✓ Setup verified successfully")
        return {"success": True, "setup": setup_status.result}

    # Step 4: Analyze sandbox logs if failed
    print("\n🔍 Setup failed, analyzing logs...")

    # Get sandbox ID from test run metadata
    sandbox_id = test_status.metadata.get("sandbox_id")

    if sandbox_id:
        analysis = agent.analyze_sandbox_logs(sandbox_id=sandbox_id)

        # Wait for analysis
        analysis_status = wait_for_agent(agent, analysis.agent_run_id)

        if analysis_status.status == "completed":
            print("\n📊 Log Analysis Results:")
            print(analysis_status.result)

            # Step 5: Auto-fix based on analysis
            print("\n🔧 Attempting auto-fix...")
            fix_run = agent.run(
                prompt=f"""
                Fix the sandbox setup issues identified:

                Analysis:
                {analysis_status.result}

                Original Setup:
                {setup_status.result}

                Actions:
                1. Identify root causes
                2. Update setup commands
                3. Re-run setup
                4. Verify fixes
                """,
                repo_id=repo_id
            )

            fix_status = wait_for_agent(agent, fix_run.id)

            if fix_status.status == "completed":
                print("✓ Issues fixed successfully")
                return {
                    "success": True,
                    "fixed": True,
                    "analysis": analysis_status.result,
                    "fix": fix_status.result
                }

    return {"success": False, "error": test_status.result}

def wait_for_agent(agent, run_id, timeout=600):
    """Wait for agent completion with timeout."""
    start_time = time.time()

    while time.time() - start_time < timeout:
        status = agent.get_run(run_id)

        if status.status in ["completed", "failed", "cancelled"]:
            return status

        time.sleep(10)

    raise TimeoutError(f"Agent run {run_id} timed out")

# Execute workflow
result = complete_sandbox_workflow(org_id=123, repo_id=456)
```

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-01-14
**Coverage**: Sandbox, Setup Commands, Slack Connect, Users APIs
