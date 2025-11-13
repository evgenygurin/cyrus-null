# @cyrus/linear-webhook-client

Linear webhook event handling and processing for Cyrus.

## Overview

This package provides utilities for receiving, validating, and processing Linear webhook events. It handles webhook signature verification, payload transformation, and event type routing.

## Features

- **Webhook Validation**: Verify Linear webhook signatures
- **Event Parsing**: Parse and transform webhook payloads
- **Type Safety**: Strongly typed webhook events
- **Event Routing**: Route different webhook event types
- **Error Handling**: Robust validation and error handling

## Installation

```bash
pnpm install @cyrus/linear-webhook-client
```

## Usage

### Basic Example

```typescript
import { LinearWebhookClient } from '@cyrus/linear-webhook-client';

const client = new LinearWebhookClient({
  webhookSecret: process.env.LINEAR_WEBHOOK_SECRET
});

// Validate and parse webhook
const event = await client.parseWebhook(
  request.body,
  request.headers['linear-signature']
);

// Handle different event types
switch (event.type) {
  case 'Issue':
    if (event.action === 'create') {
      console.log('New issue:', event.data);
    }
    break;
  case 'Comment':
    console.log('New comment:', event.data);
    break;
}
```

### Express Integration

```typescript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const event = await client.parseWebhook(
      req.body,
      req.headers['linear-signature']
    );
    
    // Process event
    await handleLinearEvent(event);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Invalid webhook');
  }
});
```

## API Reference

### LinearWebhookClient

Main client class for webhook processing.

#### Constructor Options

```typescript
interface LinearWebhookClientOptions {
  webhookSecret: string;
}
```

#### Methods

- `async parseWebhook(payload: string | object, signature: string): Promise<WebhookEvent>` - Parse and validate webhook
- `verifySignature(payload: string, signature: string): boolean` - Verify webhook signature

### Event Types

```typescript
interface WebhookEvent {
  type: 'Issue' | 'Comment' | 'IssueLabel' | 'Project';
  action: 'create' | 'update' | 'remove';
  data: any;
  createdAt: string;
}
```

## Supported Webhook Events

- **Issue Events**
  - `Issue.create` - New issue created
  - `Issue.update` - Issue updated
  - `Issue.remove` - Issue deleted

- **Comment Events**
  - `Comment.create` - New comment added
  - `Comment.update` - Comment edited
  - `Comment.remove` - Comment deleted

- **Label Events**
  - `IssueLabel.create` - Label added to issue
  - `IssueLabel.remove` - Label removed from issue

- **Project Events**
  - `Project.update` - Project updated

## Security

### Webhook Signature Verification

All webhooks are verified using HMAC-SHA256 signatures:

```typescript
const isValid = client.verifySignature(
  payload,
  request.headers['linear-signature']
);

if (!isValid) {
  throw new Error('Invalid webhook signature');
}
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

## Testing

See [test/](./test/) for example webhook payloads and test cases.

## Dependencies

- `@linear/sdk` - Linear API SDK
- `crypto` - For signature verification

## License

MIT
