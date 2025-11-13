# @cyrus/apollo-server

Apollo GraphQL Server for Cyrus with Linear Connectors.

## Overview

This package provides a GraphQL API layer for Linear operations using Apollo Server. It handles schema composition, Linear API authentication, and provides resolvers for Linear operations.

## Features

- Apollo Server 4 integration
- Linear SDK integration
- GraphQL schema definitions
- Linear resolvers and data sources
- Apollo Connectors support

## Installation

```bash
pnpm install @cyrus/apollo-server
```

## Usage

```typescript
import { createApolloServer } from '@cyrus/apollo-server';

const server = await createApolloServer({
  linearApiKey: process.env.LINEAR_API_KEY,
});

await server.listen({ port: 4000 });
```

## Development

```bash
# Build the package
pnpm build

# Development mode
pnpm dev

# Type checking
pnpm typecheck

# Run tests
pnpm test
```

## Dependencies

- `@apollo/server` - Apollo Server framework
- `@linear/sdk` - Linear API SDK
- `graphql` - GraphQL implementation

## License

MIT
