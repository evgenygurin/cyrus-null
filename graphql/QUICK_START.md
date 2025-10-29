# GraphQL Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20+
- pnpm installed
- Linear API token

### Step 1: Install Dependencies

```bash
# From project root
pnpm install

# Install Rover CLI (one-time setup)
curl -sSL https://rover.apollo.dev/nix/latest | sh
export PATH="$HOME/.rover/bin:$PATH"
```

### Step 2: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your Linear API token:
# LINEAR_API_TOKEN=lin_api_YOUR_TOKEN_HERE
```

### Step 3: Start GraphQL Server

Choose one of these options:

#### Option A: Apollo Server (Simple)
```bash
cd packages/apollo-server
pnpm dev
# Server ready at http://localhost:4000
```

#### Option B: Apollo Router with Connectors (Production-like)
```bash
# From project root
rover dev --supergraph-config supergraph.yaml --router-config router.yaml
# Router ready at http://localhost:4000
```

### Step 4: Test Your Setup

Open http://localhost:4000 in your browser and run this query:

```graphql
query GetMe {
  me {
    id
    name
    email
    displayName
  }
}
```

## 📝 Example Queries

### Get Your Assigned Issues
```graphql
query MyIssues {
  myIssues(first: 10, includeArchived: false) {
    id
    identifier
    title
    state {
      name
      type
    }
    priority
    priorityLabel
  }
}
```

### Get Issue Details
```graphql
query GetIssue($id: ID!) {
  issue(id: $id) {
    id
    identifier
    title
    description
    assignee {
      name
      email
    }
    team {
      name
      key
    }
  }
}
```

### Create New Issue
```graphql
mutation CreateIssue($input: CreateIssueInput!) {
  createIssue(input: $input) {
    id
    identifier
    title
    state {
      name
    }
  }
}

# Variables:
{
  "input": {
    "title": "New feature request",
    "description": "Add dark mode support",
    "teamId": "team-id-here",
    "priority": 2
  }
}
```

### Add Comment to Issue
```graphql
mutation AddComment($issueId: ID!, $body: String!) {
  addComment(issueId: $issueId, body: $body) {
    id
    body
    user {
      name
    }
    createdAt
  }
}

# Variables:
{
  "issueId": "issue-id-here",
  "body": "This is my comment"
}
```

## 🧪 Test Connectors

```bash
# Run all connector tests
rover connector test

# Test specific connector
rover connector run --schema graphql/schemas/linear-connector.graphql \
  -c "Query.me" \
  -v "{}"
```

## 🔍 Debug Tips

1. **Check Linear API Token**: Ensure it's set in `.env`
2. **Verify Rover Installation**: Run `rover --version`
3. **View Logs**: Add `--log trace` to rover commands
4. **Test API Directly**: Use Linear's GraphQL playground at https://api.linear.app/graphql

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the [Linear API docs](https://developers.linear.app/docs/graphql/overview)
- Learn about [Apollo Connectors](https://www.apollographql.com/docs/graphos/connectors/)
- Set up [Apollo Studio](https://studio.apollographql.com/) for monitoring

## 💡 Pro Tips

- Use GraphQL variables for dynamic queries
- Enable introspection in development for auto-complete
- Test connectors before deploying
- Use batching to reduce API calls
- Monitor performance with Apollo Studio

---

**Need help?** Check the [troubleshooting section](./README.md#troubleshooting) or open an issue.
