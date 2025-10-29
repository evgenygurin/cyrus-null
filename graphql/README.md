# GraphQL Setup with Apollo Connectors

This directory contains the GraphQL infrastructure for the Cyrus project, using Apollo Connectors to integrate with the Linear API.

## Architecture

```bash
graphql/
├── schemas/
│   └── linear-connector.graphql  # Apollo Connectors schema for Linear API
├── tests/
│   └── linear.connector.yaml     # Test cases for Linear connectors
└── README.md                     # This file
```

## Features

- **Apollo Connectors**: Declarative HTTP-to-GraphQL mapping for Linear API
- **Type-safe schema**: Fully typed GraphQL schema with TypeScript support
- **Entity resolution**: Automatic entity resolution across types
- **Batching support**: Built-in support for batch requests to reduce API calls
- **Error handling**: Comprehensive error handling with custom messages

## Available Operations

### Queries

- `me`: Get current authenticated user
- `myIssues`: Get issues assigned to the authenticated user
- `issue(id)`: Get a specific issue by ID
- `teams`: Get all teams
- `issueComments(issueId)`: Get comments for an issue

### Mutations

- `createIssue`: Create a new Linear issue
- `addComment`: Add a comment to an issue
- `updateIssueState`: Change the state of an issue

## Setup

### 1. Install Dependencies

```bash
# From the project root
pnpm install

# Install Rover CLI (Apollo's tool)
curl -sSL https://rover.apollo.dev/nix/latest | sh
```

### 2. Set Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Add your Linear API token:

```env
LINEAR_API_TOKEN=lin_api_YOUR_TOKEN_HERE
```

### 3. Run Apollo Server (Standalone)

```bash
# From packages/apollo-server
pnpm dev
```

The server will start at `http://localhost:4000`

### 4. Run with Apollo Router (Recommended for Production)

```bash
# From project root
rover dev --supergraph-config supergraph.yaml --router-config router.yaml
```

This starts the Apollo Router with connector support at `http://localhost:4000`

## Testing Connectors

### Run Connector Tests

```bash
# Test the Linear connector schema
rover connector test --schema graphql/schemas/linear-connector.graphql --test-file graphql/tests/linear.connector.yaml
```

### Execute a Specific Connector

```bash
# Execute the "me" query
rover connector run --schema graphql/schemas/linear-connector.graphql -c "Query.me" -v "{}"

# Execute "myIssues" with arguments
rover connector run --schema graphql/schemas/linear-connector.graphql -c "Query.myIssues" -v '{"$args": {"first": 10}}'
```

## Development Workflow

1. **Modify Schema**: Edit `graphql/schemas/linear-connector.graphql`
2. **Validate Composition**:
   ```bash
   rover supergraph compose --config supergraph.yaml
   ```
3. **Test Connectors**:
   ```bash
   rover connector test
   ```
4. **Run Locally**:
   ```bash
   rover dev
   ```

## Schema Structure

The Linear connector schema includes:

### Core Types
- `User`: Linear user with profile information
- `Team`: Linear team with key and description
- `Issue`: Complete issue with state, assignee, labels
- `Comment`: Issue comments with user association
- `WorkflowState`: Issue workflow states
- `Project`: Linear projects
- `IssueLabel`: Issue labels with colors

### Entity Resolution
Types are automatically resolved as entities using `@connect` directives, enabling:
- Automatic data fetching when referenced
- Cross-type relationships
- Efficient batching of requests

## Troubleshooting

### Common Issues

1. **"MISSING_ENTITY_CONNECTOR" error**
   - Ensure all entity types have proper `@connect` directives
   - Check that entity stubs only include key fields

2. **"ELV2 license must be accepted" error**
   - For local development, use `rover dev` instead of composition
   - This is normal for Enterprise features

3. **Authentication errors**
   - Verify LINEAR_API_TOKEN is set correctly
   - Check token permissions in Linear settings

### Debug Commands

```bash
# Check schema validity
rover graph check ./graphql/schemas/linear-connector.graphql

# View composed schema
rover supergraph compose --config supergraph.yaml

# Test specific connector
rover connector run --schema graphql/schemas/linear-connector.graphql -c "Query.me" -v "{}" --log trace
```

## Best Practices

1. **Use Entity Stubs**: When referencing entities, only include key fields
2. **Batch Requests**: Use `$batch` for entity resolvers to avoid N+1 queries
3. **Error Handling**: Define custom error messages using the `errors` field
4. **Type Safety**: Always validate schema changes with `rover supergraph compose`
5. **Testing**: Write comprehensive tests for all connectors

## Resources

- [Apollo Connectors Documentation](https://www.apollographql.com/docs/graphos/connectors/)
- [Linear API Documentation](https://developers.linear.app/docs/graphql/overview)
- [Apollo Router Documentation](https://www.apollographql.com/docs/router/)
- [Federation 2 Documentation](https://www.apollographql.com/docs/federation/)

## Integration with Cyrus

The GraphQL layer provides a unified interface for the Cyrus agent to interact with Linear:

1. **Issue Processing**: Fetch and update issues assigned to the agent
2. **Comment Management**: Read and post comments on issues
3. **State Transitions**: Automatically move issues through workflow states
4. **Team Coordination**: Access team and project information

The Apollo Connectors approach eliminates the need for custom resolvers, providing:
- Declarative API mapping
- Automatic type generation
- Built-in error handling
- Performance optimization through batching
