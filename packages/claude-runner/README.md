# cyrus-claude-runner

Claude CLI process spawning and management for Cyrus.

## Overview

This package manages the lifecycle of Claude CLI processes, including spawning, configuration, input/output handling, and process termination. It provides a clean API for running Claude Code sessions programmatically.

## Features

- **Process Management**: Spawn and manage Claude CLI processes
- **Configuration**: Set working directory, allowed tools, and MCP servers
- **Session Continuation**: Support for `--continue` flag
- **Tool Management**: Configure which tools Claude can use
- **MCP Integration**: Configure Model Context Protocol servers
- **Streaming Output**: Handle Claude's stdout/stderr streams
- **Error Handling**: Robust error handling and recovery

## Installation

```bash
pnpm install cyrus-claude-runner
```

## Usage

### Basic Example

```typescript
import { ClaudeRunner } from 'cyrus-claude-runner';

const runner = new ClaudeRunner({
  workingDirectory: '/path/to/project',
  allowedTools: ['Read(**)', 'Edit(**)', 'Bash(git:*)'],
  continueSession: false
});

// Send a prompt
await runner.sendPrompt('Fix the bug in src/app.ts');

// Listen for output
runner.on('message', (message) => {
  console.log('Claude:', message);
});

// Clean up
await runner.stop();
```

### With MCP Servers

```typescript
const runner = new ClaudeRunner({
  workingDirectory: '/path/to/project',
  mcpConfigPath: './mcp-config.json',
  allowedTools: ['Read(**)', 'Edit(**)', 'mcp__linear']
});
```

### Session Continuation

```typescript
const runner = new ClaudeRunner({
  workingDirectory: '/path/to/project',
  continueSession: true, // Uses --continue flag
  allowedTools: ['Read(**)', 'Edit(**)', 'Task']
});
```

## API Reference

### ClaudeRunner

Main class for managing Claude CLI processes.

#### Constructor Options

```typescript
interface ClaudeRunnerOptions {
  workingDirectory: string;
  allowedTools?: string[];
  mcpConfigPath?: string | string[];
  continueSession?: boolean;
  systemPrompt?: string;
}
```

#### Methods

- `async start(): Promise<void>` - Start the Claude process
- `async sendPrompt(prompt: string): Promise<void>` - Send a prompt to Claude
- `async stop(): Promise<void>` - Stop the Claude process
- `async restart(): Promise<void>` - Restart the Claude process

#### Events

- `message` - Emitted for each Claude message
- `tool_use` - Emitted when Claude uses a tool
- `error` - Emitted on errors

### Tool Configuration

Get list of available tools:

```typescript
import { getAllTools } from 'cyrus-claude-runner';

const tools = getAllTools();
console.log(tools); // ['Read(**)', 'Edit(**)', 'Bash', ...]
```

## Testing MCP Linear Integration

See [test-scripts/README.md](./test-scripts/README.md) for testing the Linear MCP integration.

```bash
cd packages/claude-runner
echo "LINEAR_API_TOKEN=your_token" > .env
pnpm build
node test-scripts/simple-claude-runner-test.js
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

- `@anthropic-ai/claude-code` - Claude CLI
- Node.js child_process for process management

## License

MIT
