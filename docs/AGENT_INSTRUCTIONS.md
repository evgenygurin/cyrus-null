# Agent Instructions for Cyrus

This document provides comprehensive step-by-step instructions for AI agents working with the Cyrus codebase. These guidelines are based on best practices from both Claude Code and Codegen platforms.

**Last Updated**: January 2025  
**Version**: 1.0.0

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Communication Style](#communication-style)
3. [Code Investigation](#code-investigation)
4. [Development Workflow](#development-workflow)
5. [Tool Usage](#tool-usage)
6. [Prompt Engineering](#prompt-engineering)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Documentation](#documentation)
10. [Integration Guidelines](#integration-guidelines)
11. [Security](#security)
12. [Performance](#performance)

---

## Core Principles

### 1. Grounded Responses

**CRITICAL**: Never speculate about code you have not opened.

- **ALWAYS** read the file before answering questions about it
- **NEVER** make claims about code before investigating
- If a user references a specific file, **MUST** read it first
- Provide grounded, hallucination-free answers

**Example**:
```
❌ BAD: "The function probably uses axios for HTTP requests"
✅ GOOD: [Read file first] "The function uses the native fetch API (line 42)"
```

### 2. Be Explicit and Clear

- Provide specific, detailed instructions
- Explain the motivation behind requests
- Help understand the broader goal
- Use precise language

**Example**:
```
❌ BAD: "Fix the authentication"
✅ GOOD: "Update the authentication middleware to support JWT tokens with RS256 algorithm, adding token expiration validation"
```

### 3. Minimal Output

**IMPORTANT**: Minimize output tokens while maintaining quality.

- Address only the specific query
- Avoid tangential information
- Keep responses under 4 lines when possible (excluding tool use/code)
- No unnecessary preamble or postamble
- Avoid phrases like:
  - "The answer is..."
  - "Here is the content..."
  - "Based on the information provided..."
  - "Here is what I will do next..."

---

## Communication Style

### Tone and Style

- **Concise, direct, and to the point**
- Explain non-trivial bash commands before running them
- Use Github-flavored markdown for formatting
- Output text communicates with user; tools complete tasks
- Never use tools as means to communicate

### When Unable to Help

- **DO NOT** explain why or what it could lead to (comes across as preachy)
- Keep response to 1-2 sentences
- Offer helpful alternatives if possible

### Emoji Usage

- Only use emojis if explicitly requested
- Avoid in all communication unless asked

### Progress Reporting

- Fact-based progress updates
- Less verbose, more conversational
- Focused on efficiency

---

## Code Investigation

### Before Answering ANY Code Question

1. **Read the relevant file(s) first**
2. **Search for related implementations**
3. **Check dependencies and imports**
4. **Understand the context**

### Investigation Checklist

```markdown
□ Read the main file mentioned
□ Check related files in the same directory
□ Search for similar patterns in codebase
□ Review test files if they exist
□ Check documentation in comments
□ Understand data flow and dependencies
```

### Tools for Investigation

- `Read` - for specific files
- `Grep` - for searching patterns
- `Glob` - for finding files by pattern
- `Task` - for complex multi-step searches

**Example**:
```javascript
// User asks: "How does the Linear integration work?"

// Step 1: Find Linear-related files
Use Glob: "**/*linear*"

// Step 2: Read main integration file
Use Read: "apps/cli/services/LinearIssueService.mjs"

// Step 3: Search for API calls
Use Grep: pattern="linear\..*\(" type="js"

// Step 4: Provide answer based on actual code
```

---

## Development Workflow

### Step-by-Step Process

#### 1. Understanding the Task

```markdown
1. Read the issue/task description completely
2. Identify affected files and components
3. Understand dependencies
4. Check for related existing implementations
5. Plan the approach
```

#### 2. Before Making Changes

```markdown
1. Read all files that will be modified
2. Run relevant tests to establish baseline
3. Check for existing patterns to follow
4. Verify no breaking changes will occur
5. Consider backward compatibility
```

#### 3. Implementation

```markdown
1. Make minimal, focused changes
2. Follow existing code patterns
3. Add appropriate error handling
4. Update types/interfaces
5. Add inline comments for complex logic
```

#### 4. Testing

```markdown
1. Run affected tests
2. Add new tests for new functionality
3. Verify no regressions
4. Test edge cases
5. Check error scenarios
```

#### 5. Documentation

```markdown
1. Update inline comments
2. Update CHANGELOG.md if user-facing
3. Update CLAUDE.md if workflow changes
4. Add/update JSDoc or TSDoc
```

### Cyrus-Specific Workflow

#### Working with Linear Issues

1. **Issue Assignment**:
   ```markdown
   - Agent is assigned to Linear issue
   - Issue automatically moves to "started" state
   - Git worktree is created for isolation
   - cyrus-setup.sh runs if exists
   ```

2. **During Development**:
   ```markdown
   - Use ClaudeRunner for execution
   - Session state maintained in packages/core/src/session/
   - Post progress updates to Linear as comments
   - Use --continue flag for conversation continuity
   ```

3. **Completion**:
   ```markdown
   - Create PR with changes
   - Link PR to Linear issue
   - Request review if needed
   - Update issue status
   ```

---

## Tool Usage

### Tool Selection Guidelines

| Task | Preferred Tool | Alternative |
|------|---------------|-------------|
| Read specific file | `Read` | - |
| Search for pattern | `Grep` | `Task` (if complex) |
| Find files by name | `Glob` | - |
| Execute commands | `Bash` | - |
| Edit existing file | `Edit` or `MultiEdit` | `Write` (only for new files) |
| Complex multi-step task | `Task` | Multiple tool calls |

### Tool Best Practices

#### Read Tool

```markdown
✅ DO:
- Read files before answering about them
- Use for understanding context
- Batch reads when possible

❌ DON'T:
- Guess file contents
- Assume structure without reading
- Read binary files
```

#### Grep Tool

```markdown
✅ DO:
- Use for pattern searches
- Specify file types with 'type' parameter
- Use output_mode="content" for code snippets
- Escape special regex characters

❌ DON'T:
- Use grep via Bash command
- Search without file type filters
- Use overly broad patterns
```

#### Edit Tool

```markdown
✅ DO:
- Read file first before editing
- Match indentation exactly
- Provide unique old_string
- Use MultiEdit for multiple changes

❌ DON'T:
- Include line numbers in strings
- Edit without reading first
- Make non-unique replacements
```

#### Bash Tool

```markdown
✅ DO:
- Explain non-trivial commands
- Use absolute paths
- Quote paths with spaces
- Use && or ; for multiple commands
- Check command output

❌ DON'T:
- Use find or grep (use Grep/Glob instead)
- Use cat, head, tail (use Read instead)
- Use cd unnecessarily
- Run interactive commands
```

---

## Prompt Engineering

### Crafting Effective Prompts

#### 1. Be Specific

```markdown
❌ BAD: "Add tests"
✅ GOOD: "Add unit tests for the ClaudeRunner.start() method covering success case, error handling, and timeout scenarios"
```

#### 2. Provide Context

```markdown
❌ BAD: "This is important"
✅ GOOD: "This validation is important because users can input malicious scripts via Linear comments, so we must sanitize all user input"
```

#### 3. Use Structured Formats

```xml
<task>
  <objective>Add Linear webhook handler</objective>
  <requirements>
    - Handle issue.assigned events
    - Validate webhook signature
    - Queue task for processing
  </requirements>
  <constraints>
    - Must complete in <5s
    - Use existing auth middleware
  </constraints>
</task>
```

#### 4. Include Examples

When requesting specific output format:

```markdown
Generate a function that returns user data.

Expected format:
```json
{
  "userId": "string",
  "email": "string",
  "roles": ["string"]
}
```

Must include error handling for missing users.
```

### Prompts for Common Tasks

#### Code Review

```markdown
Review the changes in [file] for:
1. Security vulnerabilities
2. Performance issues
3. Code style consistency
4. Error handling completeness
5. Test coverage

Provide specific line-by-line feedback.
```

#### Refactoring

```markdown
Refactor [function/file] to:
- Extract [specific logic] into separate function
- Improve naming for clarity
- Add type safety
- Maintain existing behavior
- Keep under [LOC] lines

Show before/after comparison.
```

#### Bug Investigation

```markdown
Investigate the bug where [description].

Steps:
1. Read affected files
2. Search for related error handlers
3. Check recent changes via git log
4. Identify root cause
5. Propose fix with test
```

---

## Error Handling

### Error Handling Principles

1. **Always handle errors explicitly**
2. **Provide actionable error messages**
3. **Log errors appropriately**
4. **Clean up resources in finally blocks**
5. **Don't swallow errors silently**

### Error Handling Pattern

```typescript
async function processTask(taskId: string): Promise<Result> {
  try {
    // Validate inputs
    if (!taskId) {
      throw new ValidationError('taskId is required');
    }

    // Main logic
    const result = await performOperation(taskId);
    
    return { success: true, data: result };
    
  } catch (error) {
    // Log error with context
    logger.error('Failed to process task', {
      taskId,
      error: error.message,
      stack: error.stack
    });

    // Transform error for user
    if (error instanceof ValidationError) {
      throw new UserFacingError('Invalid task ID provided');
    }
    
    // Re-throw unexpected errors
    throw error;
    
  } finally {
    // Cleanup resources
    await cleanup(taskId);
  }
}
```

### Cyrus-Specific Error Handling

#### Linear Integration Errors

```javascript
try {
  await linearClient.issues.create(data);
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Retry with exponential backoff
    await retryWithBackoff(() => linearClient.issues.create(data));
  } else if (error.code === 'AUTH_FAILED') {
    // Token expired, refresh
    await refreshLinearToken();
    return processTask(taskId);
  } else {
    // Log and notify
    logger.error('Linear API error', { error, taskId });
    throw new IntegrationError('Failed to create Linear issue');
  }
}
```

---

## Testing

### Testing Requirements

1. **Write tests for all new functionality**
2. **Ensure tests are deterministic**
3. **Use descriptive test names**
4. **Cover edge cases**
5. **Test error scenarios**

### Test Structure (Vitest)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ClaudeRunner', () => {
  describe('start()', () => {
    beforeEach(() => {
      // Setup
    });

    afterEach(() => {
      // Cleanup
    });

    it('should start Claude session with valid configuration', async () => {
      // Arrange
      const config = createValidConfig();
      const runner = new ClaudeRunner(config);

      // Act
      const result = await runner.start();

      // Assert
      expect(result.status).toBe('started');
      expect(result.sessionId).toBeDefined();
    });

    it('should throw error when configuration is invalid', async () => {
      // Arrange
      const config = createInvalidConfig();
      const runner = new ClaudeRunner(config);

      // Act & Assert
      await expect(runner.start()).rejects.toThrow('Invalid configuration');
    });

    it('should handle timeout gracefully', async () => {
      // Arrange
      const config = createConfigWithShortTimeout();
      const runner = new ClaudeRunner(config);

      // Act
      const result = await runner.start();

      // Assert
      expect(result.status).toBe('timeout');
      expect(result.error).toContain('exceeded timeout');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test:packages:run

# Run specific package tests
cd packages/claude-runner
pnpm test:run

# Watch mode during development
pnpm test

# With coverage
pnpm test:run --coverage
```

---

## Documentation

### Documentation Requirements

#### 1. Inline Comments

**When to add comments**:
- Complex algorithms
- Non-obvious business logic
- Workarounds or hacks
- Performance optimizations
- Security considerations

**Comment style**:
```typescript
// ❌ BAD: States the obvious
// Set x to 5
const x = 5;

// ✅ GOOD: Explains WHY
// Use 5 second timeout to prevent hanging on slow Linear API responses
const TIMEOUT_MS = 5000;

// ✅ GOOD: Explains complex logic
// Calculate exponential backoff: min(maxDelay, baseDelay * 2^retryCount)
// This prevents overwhelming the API during outages
const delay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));
```

#### 2. JSDoc/TSDoc

```typescript
/**
 * Starts a new Claude Code session for processing a Linear issue.
 * 
 * @param issueId - The Linear issue ID to process
 * @param options - Configuration options for the session
 * @param options.continue - Whether to continue from previous session
 * @param options.maxTurns - Maximum number of conversation turns (default: 10)
 * 
 * @returns Promise resolving to session result with status and output
 * 
 * @throws {ValidationError} If issueId is invalid
 * @throws {SessionError} If session fails to start
 * 
 * @example
 * ```typescript
 * const result = await startSession('ISSUE-123', {
 *   continue: true,
 *   maxTurns: 5
 * });
 * console.log(result.status); // 'completed'
 * ```
 */
async function startSession(
  issueId: string,
  options: SessionOptions = {}
): Promise<SessionResult>
```

#### 3. CHANGELOG.md

**Format** (following Keep a Changelog):

```markdown
## [Unreleased]

### Added
- Support for parallel task execution via Codegen integration
- Real-time session monitoring through web panel

### Changed
- Improved error messages for Linear API failures
- Updated dependency @linear/sdk to v23.0.0

### Fixed
- Session continuation bug when using --continue flag
- Memory leak in ClaudeRunner cleanup

### Removed
- Deprecated legacy authentication method
```

**Rules**:
- Focus on end-user impact
- Avoid technical implementation details
- Be concise but descriptive
- Group related changes

#### 4. CLAUDE.md

Update when:
- New common commands added
- Architecture changes
- New development workflows
- Important patterns emerge

---

## Integration Guidelines

### Linear Integration

#### Issue Processing Flow

```markdown
1. Webhook receives issue.assigned event
2. Validate webhook signature
3. Check issue is assigned to Cyrus bot
4. Create git worktree for isolation
5. Run cyrus-setup.sh if exists
6. Start Claude session with issue context
7. Process issue through ClaudeRunner
8. Post progress updates as comments
9. Create PR when complete
10. Link PR to issue
```

#### Linear API Best Practices

```typescript
// ✅ Use batch operations when possible
const issues = await linear.issues({
  filter: { assignee: { id: { eq: botUserId } } }
});

// ✅ Handle pagination
let hasMore = true;
let after = null;
while (hasMore) {
  const page = await linear.issues({
    first: 50,
    after,
    filter: { ... }
  });
  // Process page
  hasMore = page.pageInfo.hasNextPage;
  after = page.pageInfo.endCursor;
}

// ✅ Use GraphQL fragments for consistent data
const issueFragment = gql`
  fragment IssueFields on Issue {
    id
    title
    description
    state { id name type }
    assignee { id name email }
  }
`;
```

### Codegen Integration

#### Creating Agents

```typescript
// Use Codegen API to create agent runs
const agent = await codegen.agents.create({
  repository: 'owner/repo',
  task: 'Implement feature X',
  context: {
    linearIssue: issueId,
    branch: branchName
  },
  configuration: {
    model: 'claude-sonnet-4',
    maxTurns: 10,
    autoMerge: false
  }
});
```

#### Monitoring Execution

```typescript
// Stream agent execution logs
for await (const event of agent.stream()) {
  if (event.type === 'log') {
    logger.info(event.message);
  } else if (event.type === 'file_change') {
    await notifyLinear(event.file, event.diff);
  } else if (event.type === 'error') {
    await handleError(event.error);
  }
}
```

### GitHub Integration

```typescript
// Create PR with proper metadata
const pr = await github.pulls.create({
  owner,
  repo,
  title: `[Cyrus] ${issueTitle}`,
  body: `
## Changes

${changeDescription}

## Linear Issue

Closes ${linearIssueUrl}

## Test Plan

${testPlan}

---
🤖 Generated with Cyrus
  `,
  head: branchName,
  base: 'main',
  draft: false
});
```

---

## Security

### Security Principles

1. **Never commit secrets**
2. **Validate all external input**
3. **Use principle of least privilege**
4. **Keep dependencies updated**
5. **Sanitize user-provided data**

### Input Validation

```typescript
// ✅ Validate webhook signatures
function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// ✅ Sanitize Linear comment input
function sanitizeComment(comment: string): string {
  // Remove script tags
  comment = comment.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Escape HTML
  comment = escapeHtml(comment);
  
  // Limit length
  return comment.substring(0, MAX_COMMENT_LENGTH);
}
```

### Secret Management

```typescript
// ✅ Load from environment
const linearToken = process.env.LINEAR_API_TOKEN;
if (!linearToken) {
  throw new Error('LINEAR_API_TOKEN not configured');
}

// ✅ Never log secrets
logger.info('Initializing Linear client', {
  token: '***' // Redacted
});

// ✅ Clear sensitive data after use
function clearSensitiveData(obj: any) {
  delete obj.token;
  delete obj.apiKey;
  delete obj.secret;
}
```

---

## Performance

### Performance Guidelines

1. **Profile before optimizing**
2. **Batch operations when possible**
3. **Use caching strategically**
4. **Implement pagination for large datasets**
5. **Monitor memory usage**

### Optimization Patterns

#### Batching

```typescript
// ❌ BAD: N+1 queries
for (const issueId of issueIds) {
  const issue = await linear.issue(issueId);
  await processIssue(issue);
}

// ✅ GOOD: Batch fetch
const issues = await linear.issues({
  filter: { id: { in: issueIds } }
});
for (const issue of issues) {
  await processIssue(issue);
}
```

#### Caching

```typescript
// ✅ Cache expensive operations
const cache = new Map<string, CachedData>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getWithCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

#### Parallel Execution

```typescript
// ✅ Execute independent operations in parallel
const [user, issues, teams] = await Promise.all([
  linear.viewer,
  linear.issues({ filter: { ... } }),
  linear.teams()
]);
```

---

## Appendix: Quick Reference

### Common Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm build           # Build all packages
pnpm dev             # Development mode
pnpm test            # Run tests (watch)
pnpm test:run        # Run tests once
pnpm typecheck       # Type checking

# Package-specific
cd packages/claude-runner
pnpm build
pnpm test:run

# Publishing
pnpm build
cd packages/ndjson-client && pnpm publish --access public --no-git-checks
# ... (see CLAUDE.md for full order)
```

### File Locations

| Component | Path |
|-----------|------|
| Linear Integration | `apps/cli/services/LinearIssueService.mjs` |
| Claude Execution | `packages/claude-runner/src/ClaudeRunner.ts` |
| Session Management | `packages/core/src/session/` |
| Edge Worker | `packages/edge-worker/src/EdgeWorker.ts` |
| OAuth Flow | `apps/proxy/src/services/OAuthService.mjs` |

### External Resources

- [Claude Code Documentation](https://docs.claude.com/)
- [Codegen Documentation](https://docs.codegen.com/)
- [Linear API Reference](https://developers.linear.app/)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Vitest Documentation](https://vitest.dev/)

---

**End of Agent Instructions**

For project-specific guidance, always refer to `CLAUDE.md` in the repository root.
For architectural documentation, see `docs/README.md` and related files.
