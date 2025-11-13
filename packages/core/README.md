# cyrus-core

Core business logic and domain models for Cyrus.

## Overview

This package contains the core domain entities, session management, and shared TypeScript types used across all Cyrus packages.

## Features

- **Session Management**: Track and manage Claude Code sessions
- **Domain Models**: Core entities (Session, Issue, Workspace, Comment)
- **Type Definitions**: Shared TypeScript interfaces and types
- **Session Persistence**: Save and retrieve session state

## Key Exports

### Session

Represents a Claude Code session with metadata and state:

```typescript
import { Session } from 'cyrus-core';

const session = new Session({
  issueId: 'issue-123',
  workspaceId: 'workspace-456',
  repositoryPath: '/path/to/repo'
});
```

### SessionManager

Manages multiple active sessions:

```typescript
import { SessionManager } from 'cyrus-core';

const manager = new SessionManager();
await manager.createSession({ issueId, workspaceId });
const session = manager.getSession(sessionId);
```

### Domain Models

- `Issue` - Linear issue representation
- `Workspace` - Working directory model
- `Comment` - Issue comment model

## Installation

```bash
pnpm install cyrus-core
```

## Development

```bash
# Build the package
pnpm build

# Development mode (TypeScript watch)
pnpm dev

# Type checking
pnpm typecheck

# Run tests
pnpm test        # Watch mode
pnpm test:run    # Run once
```

## Design Principles

- **No External Dependencies**: Core package has no internal Cyrus dependencies
- **Type Safety**: Full TypeScript support with exported types
- **Immutability**: Core entities follow immutable patterns where appropriate
- **Testability**: All functionality can be tested in isolation

## License

MIT
