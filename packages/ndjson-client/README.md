# cyrus-ndjson-client

NDJSON streaming client for proxy communication.

## Overview

This package provides a robust NDJSON (Newline Delimited JSON) streaming client for persistent HTTP connections with the Cyrus edge proxy. It handles authentication, reconnection, and bidirectional streaming of events.

## Features

- **Persistent Connections**: Long-lived HTTP connections for streaming
- **NDJSON Protocol**: Efficient line-delimited JSON streaming
- **OAuth Authentication**: Secure authentication with OAuth tokens
- **Auto Reconnection**: Automatic reconnection with exponential backoff
- **Event Streaming**: Parse and emit webhook events, heartbeats, and status updates
- **Bidirectional**: Send status updates back to the proxy
- **Error Handling**: Robust error handling and recovery

## Installation

```bash
pnpm install cyrus-ndjson-client
```

## Usage

### Basic Example

```typescript
import { NdjsonClient } from 'cyrus-ndjson-client';

const client = new NdjsonClient({
  proxyUrl: 'https://proxy.example.com',
  oauthToken: 'your-oauth-token'
});

// Listen for webhook events
client.on('webhook', (event) => {
  console.log('Received webhook:', event);
});

// Listen for heartbeats
client.on('heartbeat', () => {
  console.log('Received heartbeat');
});

// Start streaming
await client.connect();
```

### Sending Status Updates

```typescript
// Send status update back to proxy
await client.sendStatus({
  type: 'processing',
  issueId: 'issue-123',
  message: 'Processing issue...'
});
```

### Error Handling

```typescript
client.on('error', (error) => {
  console.error('Client error:', error);
});

client.on('disconnect', () => {
  console.log('Disconnected from proxy');
});

client.on('reconnect', () => {
  console.log('Reconnected to proxy');
});
```

## API Reference

### NdjsonClient

Main client class for NDJSON streaming.

#### Constructor Options

```typescript
interface NdjsonClientOptions {
  proxyUrl: string;
  oauthToken: string;
  reconnectInterval?: number; // Default: 5000ms
  maxReconnectAttempts?: number; // Default: Infinity
}
```

#### Methods

- `async connect(): Promise<void>` - Establish connection to proxy
- `async disconnect(): Promise<void>` - Close connection
- `async sendStatus(status: StatusUpdate): Promise<void>` - Send status update

#### Events

- `webhook` - Emitted for webhook events
- `heartbeat` - Emitted for heartbeat messages
- `error` - Emitted on errors
- `disconnect` - Emitted when disconnected
- `reconnect` - Emitted when reconnected

### Event Types

```typescript
interface WebhookEvent {
  type: 'issue.assigned' | 'issue.comment' | 'issue.updated';
  payload: any;
}

interface StatusUpdate {
  type: 'processing' | 'completed' | 'error';
  issueId: string;
  message: string;
}
```

## Protocol

The NDJSON protocol uses newline-delimited JSON messages:

### Incoming Messages

```json
{"type":"webhook","payload":{...}}
{"type":"heartbeat","timestamp":1234567890}
```

### Outgoing Messages

```json
{"type":"status","payload":{...}}
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
pnpm test        # Watch mode
pnpm test:run    # Run once
```

## Design Principles

- **No Internal Dependencies**: This package has no Cyrus internal dependencies
- **Stream-First**: Built for streaming data
- **Resilient**: Automatic reconnection and error recovery
- **Type Safe**: Full TypeScript support

## License

MIT
