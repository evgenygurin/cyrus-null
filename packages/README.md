# Cyrus Packages

This directory contains the core packages that make up the Cyrus monorepo. Each package has a specific scope of concerns and well-defined responsibilities.

## Package Overview

### @cyrus/apollo-server
**Scope**: GraphQL Apollo Server integration for Linear API

**Responsibilities**:
- Provide GraphQL API layer for Linear operations
- Handle Apollo Server federation and schema composition
- Manage Linear API authentication and authorization
- Enable GraphQL-based Linear operations

**Key Exports**:
- Apollo Server configuration
- GraphQL schema definitions
- Linear resolvers and data sources

### @cyrus/core
**Scope**: Core domain models and business logic entities

**Responsibilities**:
- Define core business entities (Session, Issue, Workspace, Comment)
- Manage session lifecycle and state
- Provide shared TypeScript types and interfaces
- Handle session persistence and retrieval

**Key Exports**:
- `Session` - Represents a Claude coding session
- `SessionManager` - Manages multiple active sessions
- `Issue` - Linear issue model
- `Workspace` - Working directory model
- `Comment` - Issue comment model

### @cyrus/claude-runner
**Scope**: Manage Claude CLI process lifecycle

**Responsibilities**:
- Spawn and manage Claude CLI processes
- Handle process arguments and environment setup
- Send prompts and input to Claude
- Kill/restart processes as needed
- Configure allowed tools and working directory
- Handle --continue flag for session continuation

**Key Exports**:
- `ClaudeRunner` - Main process manager
- `getAllTools()` - List available Claude tools
- Process configuration types

### @cyrus/linear-webhook-client
**Scope**: Linear webhook event handling and processing

**Responsibilities**:
- Receive and parse Linear webhook events
- Validate webhook signatures
- Transform webhook payloads into typed events
- Handle various Linear webhook event types

**Key Exports**:
- `LinearWebhookClient` - Main webhook handler
- Webhook event types and interfaces
- Webhook validation utilities

### @cyrus/ndjson-client
**Scope**: NDJSON streaming communication with edge proxy

**Responsibilities**:
- Establish persistent HTTP connections for NDJSON streaming
- Handle authentication with OAuth tokens
- Parse incoming NDJSON events (webhooks, heartbeats)
- Send status updates back to proxy
- Manage reconnection and error handling
- Emit events for webhook data

**Key Exports**:
- `NdjsonClient` - Main client class
- `WebhookEvent` - Webhook event types
- `StatusUpdate` - Status update types
- Configuration interfaces

### @cyrus/simple-agent-runner
**Scope**: Simplified agent runner for basic use cases

**Responsibilities**:
- Provide a simplified API for running agent tasks
- Abstract away complex orchestration logic
- Support basic agent workflows
- Easy integration for simple use cases

**Key Exports**:
- `SimpleAgentRunner` - Simplified runner class
- Basic configuration interfaces
- Common agent patterns

### @cyrus/edge-worker
**Scope**: Orchestrate Linear webhooks, Claude processing, and API responses

**Responsibilities**:
- Connect to edge proxy via NDJSON streaming
- Process Linear webhook events (issue assignment, comments)
- Manage Claude sessions for each issue
- Post responses back to Linear via API
- Handle multiple repository/workspace configurations
- Coordinate between all other packages

**Key Exports**:
- `EdgeWorker` - Main orchestrator class
- `RepositoryConfig` - Repository configuration
- `EdgeWorkerConfig` - Full configuration interface
- Event types and handlers

## Package Dependencies

```
@cyrus/edge-worker
  ├── @cyrus/core (Session, SessionManager)
  ├── @cyrus/claude-runner (ClaudeRunner)
  ├── @cyrus/ndjson-client (NdjsonClient)
  ├── @cyrus/simple-agent-runner (SimpleAgentRunner)
  └── @linear/sdk (Linear API)

@cyrus/simple-agent-runner
  └── @cyrus/claude-runner (ClaudeRunner)

@cyrus/claude-runner
  └── (external dependencies only)

@cyrus/linear-webhook-client
  └── @linear/sdk (Linear API)

@cyrus/ndjson-client
  └── (no internal dependencies)

@cyrus/apollo-server
  ├── @linear/sdk (Linear API)
  └── @apollo/server

@cyrus/core
  └── (no internal dependencies)
```

## Design Principles

1. **Single Responsibility**: Each package has one clear purpose
2. **Minimal Dependencies**: Packages depend only on what they need
3. **Type Safety**: All packages export TypeScript types
4. **Event-Driven**: Packages communicate via events where appropriate
5. **Testable**: Each package can be tested in isolation
6. **Reusable**: Packages can be used independently in different contexts

## Usage in Apps

- **CLI App** (`apps/cli`): Uses all packages to provide a command-line interface
- **Proxy Worker** (`apps/proxy-worker`): Cloudflare Worker handling OAuth and webhooks
- **Web Panel** (`apps/web-panel`): Next.js control panel for monitoring and management
- **Future Apps**: Can pick and choose packages based on needs