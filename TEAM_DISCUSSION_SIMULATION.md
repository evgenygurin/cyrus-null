# Team Discussion Simulation: Refactoring Plan Review

This document simulates a comprehensive team discussion about the refactoring plan, with different team members providing perspectives through GitHub PR comments. In a real scenario, these would be invoked using `@codegen-sh` mentions in PR comments.

---

## 💬 Comment Thread 1: Architecture Review

### 👤 Software Architect (@codegen-sh as Alex Chen)

**Initial Review Comment:**

I've reviewed the proposed Clean Architecture approach in `REFACTORING_PLAN.md`. Overall, I'm supportive of the direction, but I have some concerns and suggestions:

**✅ What I Like:**
- The 4-layer separation is textbook Clean Architecture - this will significantly improve maintainability
- Dependency Inversion is crucial here - our current tight coupling between EdgeApp and infrastructure is a major pain point
- The Facade pattern for backward compatibility is smart - we can migrate incrementally without breaking existing integrations

**⚠️ Concerns:**
1. **Domain Layer Complexity**: The proposed `RepositoryEntity` in Phase 1 includes routing logic (`canHandleTeam`, `canHandleProject`). This feels like business logic bleeding into the domain. Should we extract routing to a separate service in the Application layer?

2. **DI Container**: The simple IoC container in `apps/cli/src/di/Container.ts` doesn't support scoped lifetimes or async resolution properly. Consider using a mature library like `tsyringe` or `inversify` instead of rolling our own.

3. **Event System**: We're heavily relying on EventEmitter throughout. Should we formalize this into an Event Bus pattern with typed events? Current approach makes it hard to track event flow.

**📋 Recommendations:**
- Add architecture decision records (ADRs) for major patterns
- Consider CQRS pattern for complex operations (especially in EdgeWorker)
- Document cross-cutting concerns (logging, monitoring, error handling)

**Question for @codegen-sh**: Can you analyze the current EventEmitter usage patterns and suggest whether we should migrate to a formal Event Bus architecture?

---

### 🤖 @codegen-sh Response (Analysis)

**EventEmitter Usage Analysis:**

Based on analysis of the codebase, here are the current EventEmitter patterns:

**Current Usage:**
```typescript
// ClaudeRunner (15 event types)
emit('message', message)
emit('text', text)
emit('tool-use', name, input)
emit('error', error)
emit('complete', messages)

// EdgeWorker (8 event types)
emit('session-started', session)
emit('session-completed', session)
emit('issue-assigned', issue)
```

**Problems Identified:**
1. No type safety - event names are strings
2. No centralized event registry
3. Difficult to trace event flow
4. No event versioning or schema validation
5. Can't easily add middleware (logging, monitoring)

**Recommendation: Implement Typed Event Bus**

```typescript
// Domain events
interface DomainEvent {
  type: string;
  timestamp: number;
  aggregateId: string;
  payload: unknown;
}

class SessionStartedEvent implements DomainEvent {
  readonly type = 'session.started';
  constructor(
    public readonly timestamp: number,
    public readonly aggregateId: string,
    public readonly payload: { sessionId: string; issueId: string }
  ) {}
}

// Event Bus with middleware support
class EventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();
  private middleware: Array<(event: DomainEvent) => Promise<void>> = [];

  on<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>
  ): void {
    const type = new eventType(0, '', {} as any).type;
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler as any);
  }

  async emit(event: DomainEvent): Promise<void> {
    // Run middleware
    for (const mw of this.middleware) {
      await mw(event);
    }
    
    // Execute handlers
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(h => h(event)));
  }
}
```

**Migration Strategy:**
- Phase 3: Implement Event Bus alongside existing EventEmitter
- Phase 4: Migrate critical paths to Event Bus
- Phase 5: Complete migration and remove EventEmitter

**Estimated Effort:** +1 week (add to Phase 3)

---

## 💬 Comment Thread 2: Testing Strategy

### 👤 Senior Developer (@codegen-sh as Maria Rodriguez)

**Testing Concerns:**

The plan targets 80% test coverage, which is great, but I'm worried about **how** we achieve that. Looking at `PHASE_1_IMPLEMENTATION.md`, I see unit test examples, but:

**🚨 Missing Test Strategy:**

1. **Integration Tests**: ClaudeRunner interacts with external Claude SDK - how do we test this without hitting real APIs?
2. **E2E Tests**: Git worktree operations, OAuth flows - these need real git repos and OAuth servers
3. **Contract Tests**: EdgeWorker communicates with proxy via NDJSON/webhooks - how do we ensure contract compatibility?
4. **Performance Tests**: No mention of performance testing or benchmarking

**💡 Proposed Test Strategy:**

```typescript
// 1. Contract Testing with Pact
describe('EdgeWorker <-> Proxy Contract', () => {
  it('should handle webhook payload according to contract', async () => {
    await provider
      .uponReceiving('issue assigned webhook')
      .withRequest({
        method: 'POST',
        path: '/webhook',
        body: {
          action: 'IssueAssignedPayload',
          data: like({ issueId: 'ISS-123' })
        }
      })
      .willRespondWith({
        status: 200,
        body: { success: true }
      });
  });
});

// 2. Integration Tests with Test Containers
describe('ClaudeRunner Integration', () => {
  let mockClaudeServer: GenericContainer;

  beforeAll(async () => {
    mockClaudeServer = await new GenericContainer('mock-claude-sdk')
      .withExposedPorts(8080)
      .start();
  });

  it('should handle streaming responses', async () => {
    const runner = new ClaudeRunner({
      apiEndpoint: `http://localhost:${mockClaudeServer.getMappedPort(8080)}`
    });
    // ... test implementation
  });
});

// 3. E2E Tests with Real Git Operations
describe('Git Worktree E2E', () => {
  let testRepo: TemporaryGitRepository;

  beforeEach(async () => {
    testRepo = await createTestGitRepo();
  });

  it('should create worktree and checkout branch', async () => {
    const workspace = await workspaceService.createWorktree({
      issue: { id: 'TEST-1', branchName: 'test-branch' },
      repository: testRepo.config
    });
    
    expect(workspace.path).toExist();
    expect(await gitBranch(workspace.path)).toBe('test-branch');
  });
});
```

**📊 Coverage Goals by Layer:**
- Domain Layer: **100%** (pure logic, easy to test)
- Application Layer: **90%** (business logic, mocked dependencies)
- Infrastructure Layer: **70%** (integration tests, some manual testing)
- Presentation Layer: **60%** (CLI interactions, mostly manual)

**Question for @codegen-sh**: Can you recommend testing frameworks and patterns for mocking the Claude SDK and Linear SDK effectively?

---

### 🤖 @codegen-sh Response (Testing Recommendations)

**Testing Framework Recommendations:**

**1. Mocking Claude SDK**

```typescript
// Use MSW (Mock Service Worker) for HTTP interception
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const claudeServer = setupServer(
  http.post('https://api.anthropic.com/v1/messages', ({ request }) => {
    return HttpResponse.json({
      id: 'msg_01',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'Test response' }],
      model: 'claude-3-sonnet',
      stop_reason: 'end_turn'
    });
  })
);

// In tests
beforeAll(() => claudeServer.listen());
afterEach(() => claudeServer.resetHandlers());
afterAll(() => claudeServer.close());
```

**2. Mocking Linear SDK**

```typescript
// Create test doubles for Linear SDK
class MockLinearClient {
  private mockData = new Map<string, any>();

  async issueGet(id: string) {
    return this.mockData.get(id) || {
      id,
      title: 'Mock Issue',
      description: 'Mock Description',
      state: { name: 'In Progress' }
    };
  }

  // Helper to seed test data
  seedIssue(id: string, data: Partial<Issue>) {
    this.mockData.set(id, { id, ...data });
  }
}

// Use dependency injection to swap implementations
const container = new Container();
container.register('LinearClient', () => new MockLinearClient());
```

**3. Recommended Testing Libraries**

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",           // Fast unit test runner
    "msw": "^2.0.0",               // API mocking
    "@testcontainers/node": "^10.0.0",  // Integration testing
    "pact": "^13.0.0",             // Contract testing
    "@faker-js/faker": "^8.0.0",   // Test data generation
    "nock": "^13.0.0",             // HTTP mocking (alternative to MSW)
    "sinon": "^17.0.0",            // Spies, stubs, mocks
    "playwright": "^1.40.0"        // E2E testing (if needed)
  }
}
```

**4. Test Data Builders Pattern**

```typescript
// Fluent API for creating test data
class IssueBuilder {
  private issue: Partial<Issue> = {
    id: 'TEST-1',
    title: 'Test Issue',
    state: { name: 'Todo', type: 'unstarted' }
  };

  withId(id: string): this {
    this.issue.id = id;
    return this;
  }

  withLabels(...labels: string[]): this {
    this.issue.labels = labels.map(name => ({ name }));
    return this;
  }

  inProgress(): this {
    this.issue.state = { name: 'In Progress', type: 'started' };
    return this;
  }

  build(): Issue {
    return this.issue as Issue;
  }
}

// Usage in tests
const issue = new IssueBuilder()
  .withId('ISS-123')
  .withLabels('Bug', 'High Priority')
  .inProgress()
  .build();
```

**5. Snapshot Testing for Prompts**

```typescript
import { describe, it, expect } from 'vitest';

describe('Prompt Templates', () => {
  it('should generate consistent debugger prompt', () => {
    const prompt = generateDebuggerPrompt({
      issue: testIssue,
      workspace: testWorkspace,
      history: []
    });

    // Snapshot testing for complex strings
    expect(prompt).toMatchSnapshot();
  });
});
```

**Estimated Setup Time:** 3-4 days (add to Phase 1)

---

## 💬 Comment Thread 3: Performance and Scalability

### 👤 DevOps Engineer (@codegen-sh as James Park)

**Performance and Deployment Concerns:**

Looking at the refactoring plan, I don't see much discussion about performance implications and deployment strategy. Some concerns:

**🔥 Hot Path Performance:**

1. **DI Container Overhead**: Resolving dependencies on every request could add latency. Have we benchmarked?
2. **Event Bus**: Async event handling could introduce race conditions. What's the concurrency model?
3. **Logging**: The proposed logging system (3 loggers via Composite pattern) could bottleneck on high-throughput scenarios

**📈 Scalability Questions:**

1. **State Management**: PersistenceManager uses JSON file storage. What happens when we have 1000+ active sessions?
2. **Memory Leaks**: All these event listeners and observers - do we have cleanup strategies?
3. **Graceful Shutdown**: How do we ensure in-flight sessions complete during deployment?

**🚀 Deployment Strategy:**

```typescript
// Proposed: Blue-Green Deployment Support
class GracefulShutdown {
  private isShuttingDown = false;
  private activeSessions = new Set<string>();

  async handleShutdown(signal: NodeJS.Signals): Promise<void> {
    console.log(`Received ${signal}, starting graceful shutdown...`);
    this.isShuttingDown = true;

    // Stop accepting new sessions
    await this.stopAcceptingNewSessions();

    // Wait for active sessions with timeout
    await this.waitForActiveSessions(60000); // 60s timeout

    // Force cleanup remaining sessions
    await this.forceCleanupSessions();

    process.exit(0);
  }

  private async waitForActiveSessions(timeout: number): Promise<void> {
    const start = Date.now();
    while (this.activeSessions.size > 0) {
      if (Date.now() - start > timeout) {
        console.warn(`Timeout waiting for ${this.activeSessions.size} sessions`);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

**📊 Performance Benchmarks Needed:**

```typescript
// Before/After Performance Tests
describe('Performance Benchmarks', () => {
  it('should resolve dependencies in <1ms', async () => {
    const start = performance.now();
    const service = container.resolve('ConfigService');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1);
  });

  it('should handle 100 concurrent events', async () => {
    const events = Array.from({ length: 100 }, (_, i) => 
      new SessionStartedEvent(Date.now(), `session-${i}`, {})
    );

    const start = performance.now();
    await Promise.all(events.map(e => eventBus.emit(e)));
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000); // <1s for 100 events
  });
});
```

**Question for @codegen-sh**: What's the expected concurrent session load? Can you help design a load testing strategy?

---

### 🤖 @codegen-sh Response (Performance Analysis)

**Concurrent Session Load Analysis:**

Based on typical usage patterns for Linear bots:

**Expected Load Profile:**
- **Small teams** (5-10 developers): 1-3 concurrent sessions
- **Medium teams** (20-50 developers): 5-10 concurrent sessions  
- **Large teams** (100+ developers): 15-25 concurrent sessions

**Current Architecture Issues:**

```typescript
// Problem 1: Synchronous file I/O in hot path
async saveEdgeWorkerState(state: SerializableEdgeWorkerState): Promise<void> {
  await writeFile(stateFile, JSON.stringify(state, null, 2), 'utf8');
  // Blocks on every state change!
}

// Problem 2: No connection pooling for HTTP clients
// Each session creates new HTTP clients
```

**Recommended Performance Optimizations:**

**1. Debounced State Persistence**

```typescript
class DebouncedPersistence {
  private pendingWrites = new Map<string, any>();
  private writeTimer: NodeJS.Timeout | null = null;

  async save(key: string, data: any): Promise<void> {
    this.pendingWrites.set(key, data);

    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    this.writeTimer = setTimeout(() => this.flush(), 1000);
  }

  private async flush(): Promise<void> {
    const entries = Array.from(this.pendingWrites.entries());
    this.pendingWrites.clear();

    await Promise.all(
      entries.map(([key, data]) => this.writeToFile(key, data))
    );
  }
}
```

**2. Connection Pool for HTTP Clients**

```typescript
class HttpClientPool {
  private static instance: HttpClientPool;
  private clients = new Map<string, HttpClient>();
  private maxPoolSize = 10;

  getClient(baseUrl: string): HttpClient {
    if (!this.clients.has(baseUrl)) {
      if (this.clients.size >= this.maxPoolSize) {
        // Evict least recently used
        const oldestKey = this.clients.keys().next().value;
        this.clients.delete(oldestKey);
      }
      this.clients.set(baseUrl, new HttpClient(baseUrl));
    }
    return this.clients.get(baseUrl)!;
  }
}
```

**3. Load Testing Strategy**

```typescript
// Using Artillery for load testing
// artillery.yml
config:
  target: 'http://localhost:3456'
  phases:
    - duration: 60
      arrivalRate: 5  # 5 new sessions per second
      name: 'Warm up'
    - duration: 120
      arrivalRate: 20 # 20 new sessions per second
      name: 'Sustained load'
    - duration: 60
      arrivalRate: 50 # 50 new sessions per second
      name: 'Spike test'

scenarios:
  - name: 'Issue Assignment Flow'
    flow:
      - post:
          url: '/webhook'
          json:
            action: 'IssueAssignedPayload'
            data:
              issueId: '{{ $randomString() }}'
```

**Performance Targets:**

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Session startup | ~3s | <1s | P0 |
| State persistence | Sync | Async (batched) | P0 |
| Memory per session | ~150MB | <50MB | P1 |
| Max concurrent sessions | ~10 | 50+ | P1 |
| Event processing latency | ~100ms | <10ms | P2 |

**Recommendation**: Add Phase 0 (Performance Baseline) before starting refactoring.

---

## 💬 Comment Thread 4: Migration Risk Assessment

### 👤 QA Lead (@codegen-sh as Sarah Johnson)

**Testing the Migration:**

The Facade pattern for backward compatibility is good, but how do we **verify** nothing breaks during migration? I'm concerned about:

**🧪 Test Coverage Gaps:**

1. **Regression Tests**: Current test coverage is 30%. Before refactoring, we should achieve 60%+ on critical paths
2. **Integration Tests**: No mention of testing against real Linear/Claude APIs in staging
3. **User Acceptance Testing**: Who validates that Cyrus behavior remains consistent?

**📋 Proposed Testing Checklist:**

**Pre-Refactoring (Phase 0):**
```markdown
- [ ] Document all current behaviors (expected outputs for given inputs)
- [ ] Create comprehensive regression test suite
- [ ] Baseline performance metrics
- [ ] Identify all integration points (Linear, GitHub, Claude)
- [ ] Create test environments for each integration
```

**During Refactoring (Each Phase):**
```markdown
- [ ] All existing tests pass
- [ ] New unit tests for refactored code (>80% coverage)
- [ ] Integration tests for new architecture layers
- [ ] Performance benchmarks show no regression
- [ ] Manual testing of critical workflows
```

**Post-Refactoring (Phase 6):**
```markdown
- [ ] Full regression suite passes
- [ ] Performance metrics meet targets
- [ ] Load testing in staging
- [ ] Beta testing with pilot users
- [ ] Rollback plan documented and tested
```

**🔄 Rollback Strategy:**

```typescript
// Feature flags for gradual rollout
class FeatureFlags {
  private flags = new Map<string, boolean>();

  isEnabled(feature: string): boolean {
    return this.flags.get(feature) ?? false;
  }

  // Usage in code
  async createSession(issue: Issue) {
    if (featureFlags.isEnabled('new-session-manager')) {
      return this.newSessionManager.create(issue);
    }
    return this.legacySessionManager.create(issue);
  }
}
```

**Question for @codegen-sh**: Can you generate a comprehensive test scenario matrix covering all critical user workflows?

---

### 🤖 @codegen-sh Response (Test Scenario Matrix)

**Critical User Workflows - Test Scenario Matrix:**

| Workflow | Scenario | Input | Expected Output | Priority |
|----------|----------|-------|-----------------|----------|
| **Issue Assignment** | New issue assigned to Cyrus | Linear issue with description | Session created, branch created, initial response posted | P0 |
| | Issue re-assigned while working | Assignment changes during session | Current session stops gracefully, new session starts | P0 |
| | Issue assigned with labels | Issue has "Bug" label | Debugger mode activated, read-only tools | P0 |
| **Comment Handling** | User adds comment to active session | Comment with additional requirements | New message added to streaming prompt | P0 |
| | User adds comment to completed session | Comment on closed issue | New session created with full history | P1 |
| | Multiple rapid comments | 3 comments in 10 seconds | All comments queued and processed | P1 |
| **Git Operations** | Create branch for new issue | Issue ISS-123 | Branch `issue/ISS-123` created from base branch | P0 |
| | Create sub-issue branch | Parent: ISS-100, Sub: ISS-101 | Branch created from parent branch, not base | P1 |
| | Workspace cleanup | Session completes | Worktree removed, branch preserved | P1 |
| **OAuth/Auth** | Fresh start with no token | No Linear token configured | OAuth flow initiated, browser opens | P0 |
| | Expired token | Token expires during session | Graceful error, instructions to refresh | P1 |
| | Multiple repositories | 3 repos with different tokens | Each repo uses correct token | P1 |
| **Error Handling** | Claude API failure | Anthropic API returns 500 | Error logged, user notified, session marked failed | P0 |
| | Git operation failure | Repo is locked/corrupted | Clear error message, session stops | P1 |
| | Network interruption | Connection lost mid-session | Session paused, reconnection attempted | P2 |
| **Session Continuity** | Cyrus restarts during session | Process killed and restarted | Sessions restored from persistence | P0 |
| | Comment thread continuation | Multiple comments in thread | Each comment sees full thread history | P0 |
| | Parent-child sessions | Orchestrator creates sub-issues | Child sessions properly linked | P1 |

**Automated Test Implementation:**

```typescript
// E2E Test Example
describe('Critical User Workflows', () => {
  describe('Issue Assignment Flow', () => {
    it('should handle new issue assignment end-to-end', async () => {
      // 1. Setup
      const testIssue = await createTestIssue({
        title: 'Implement login page',
        description: 'Create a new login page with email/password',
        assignee: 'cyrus-bot'
      });

      // 2. Trigger webhook
      await simulateLinearWebhook({
        action: 'Issue.update',
        data: { issueId: testIssue.id }
      });

      // 3. Wait for session to start
      await waitFor(() => {
        const session = getActiveSession(testIssue.id);
        expect(session).toBeDefined();
        expect(session.status).toBe('running');
      }, { timeout: 5000 });

      // 4. Verify git branch created
      const branches = await listGitBranches();
      expect(branches).toContain(`issue/${testIssue.identifier}`);

      // 5. Verify initial response posted
      const comments = await testIssue.comments();
      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].body).toContain('Getting started');

      // 6. Cleanup
      await testIssue.delete();
    });
  });
});
```

**Performance Baseline Tests:**

```typescript
describe('Performance Baselines', () => {
  it('should maintain current startup time', async () => {
    const times = [];
    
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      await edgeWorker.start();
      await edgeWorker.stop();
      times.push(performance.now() - start);
    }

    const avg = times.reduce((a, b) => a + b) / times.length;
    expect(avg).toBeLessThan(3000); // Current: ~3s
  });
});
```

---

## 💬 Comment Thread 5: Documentation and Onboarding

### 👤 Tech Lead (@codegen-sh as David Kim)

**Developer Experience Concerns:**

Great work on the refactoring plan! However, I'm thinking about **developer experience** during and after the transition:

**📚 Documentation Needs:**

1. **Architecture Decision Records (ADRs)**: Why did we choose each pattern?
2. **Migration Guide**: How do contributors update existing features?
3. **Code Examples**: Real-world examples of new patterns in action
4. **Troubleshooting Guide**: Common issues during migration

**👥 Team Onboarding:**

The new architecture is significantly more complex. How do we ensure:
- Junior developers can still contribute?
- Existing contributors understand the new patterns?
- New hires can get up to speed quickly?

**💡 Proposed Documentation Structure:**

```
docs/
├── architecture/
│   ├── overview.md
│   ├── decisions/          # ADRs
│   │   ├── 001-clean-architecture.md
│   │   ├── 002-di-container.md
│   │   ├── 003-event-bus.md
│   │   └── 004-testing-strategy.md
│   ├── layers/
│   │   ├── domain.md
│   │   ├── application.md
│   │   ├── infrastructure.md
│   │   └── presentation.md
│   └── patterns/
│       ├── command.md
│       ├── strategy.md
│       ├── factory.md
│       └── facade.md
├── guides/
│   ├── getting-started.md
│   ├── contributing.md
│   ├── testing-guide.md
│   └── troubleshooting.md
├── examples/
│   ├── adding-new-command.md
│   ├── creating-new-service.md
│   ├── adding-mcp-integration.md
│   └── writing-tests.md
└── migration/
    ├── phase-1-guide.md
    ├── phase-2-guide.md
    └── breaking-changes.md
```

**🎓 Developer Training Plan:**

```markdown
## Week 1: Architecture Fundamentals
- [ ] Watch: "Clean Architecture Principles" (1 hour)
- [ ] Read: SOLID principles in TypeScript
- [ ] Workshop: Hands-on with DI Container

## Week 2: Domain-Driven Design
- [ ] Read: Domain entities vs Value Objects
- [ ] Workshop: Designing aggregates
- [ ] Exercise: Refactor one feature using DDD

## Week 3: Testing Strategies
- [ ] Read: Testing patterns for each layer
- [ ] Workshop: Writing effective unit tests
- [ ] Exercise: Achieve 80% coverage on one module

## Week 4: Migration Workflow
- [ ] Read: Migration guide for each phase
- [ ] Pair programming: Migrate a small feature
- [ ] Review: Code review best practices for new architecture
```

**Question for @codegen-sh**: Can you help create an "Architecture Overview" diagram showing all layers, patterns, and their interactions?

---

### 🤖 @codegen-sh Response (Architecture Diagram)

**Comprehensive Architecture Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     CLI      │  │  Validators  │  │  Formatters  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌─────────────────────────────┼─────────────────────────────────────┐
│                     APPLICATION LAYER                             │
│                             │                                      │
│  ┌──────────────────────────▼──────────────────────────┐         │
│  │              Command Bus                             │         │
│  │  (Command Pattern - Invokes Use Cases)              │         │
│  └──────┬───────────────────────────────────┬──────────┘         │
│         │                                    │                    │
│  ┌──────▼──────────┐              ┌─────────▼────────┐          │
│  │  Use Cases /    │              │    Services      │          │
│  │  Commands       │◄─────────────┤                  │          │
│  │                 │              │  - ConfigService │          │
│  │ - StartCommand  │              │  - OAuthService  │          │
│  │ - AddRepoCmd    │              │  - WorkspaceServ │          │
│  └────────┬────────┘              └──────────────────┘          │
│           │                                                       │
└───────────┼───────────────────────────────────────────────────────┘
            │
            │ (depends on abstractions)
            │
┌───────────▼───────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                                 │
│                     (Pure Business Logic)                          │
│                                                                     │
│  ┌─────────────────┐         ┌──────────────────┐                │
│  │    Entities     │         │  Value Objects   │                │
│  │                 │         │                  │                │
│  │ - Repository    │         │ - LinearToken    │                │
│  │ - Issue         │         │ - CustomerId     │                │
│  │ - Session       │         │ - Email          │                │
│  │ - Workspace     │         └──────────────────┘                │
│  └─────────────────┘                                               │
│                                                                     │
│  ┌─────────────────────────────────────────┐                      │
│  │         Repository Interfaces            │                      │
│  │    (Dependency Inversion Principle)     │                      │
│  │                                         │                      │
│  │  - IConfigRepository                    │                      │
│  │  - ISessionRepository                   │                      │
│  │  - IWorkspaceRepository                 │                      │
│  └─────────────────────────────────────────┘                      │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ (implementations)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                              │
│                                                                       │
│  ┌───────────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │   Persistence     │  │   External   │  │   Utilities    │      │
│  │                   │  │   Services   │  │                │      │
│  │ - FileStorage    │  │ - HttpClient │  │ - Logger       │      │
│  │ - JsonPersist    │  │ - StripeAPI  │  │ - EventBus     │      │
│  │ - StateManager   │  │ - LinearAPI  │  │ - Metrics      │      │
│  └───────────────────┘  └──────────────┘  └────────────────┘      │
│                                                                       │
│  ┌───────────────────────────────────────────────────────┐         │
│  │                  Git Operations                        │         │
│  │                                                         │         │
│  │  - GitWorktreeManager (executes git commands)         │         │
│  │  - BranchService (manages branches)                   │         │
│  └───────────────────────────────────────────────────────┘         │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

                    CROSS-CUTTING CONCERNS
┌───────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐     │
│  │   Logging      │  │  Error Handling │  │   Monitoring     │     │
│  │   (Decorator)  │  │  (Chain of Resp)│  │   (Observer)     │     │
│  └────────────────┘  └─────────────────┘  └──────────────────┘     │
│                                                                        │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐     │
│  │ DI Container   │  │   Event Bus     │  │  Feature Flags   │     │
│  │ (Singleton)    │  │   (Mediator)    │  │  (Strategy)      │     │
│  └────────────────┘  └─────────────────┘  └──────────────────┘     │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘

                        DESIGN PATTERNS APPLIED
┌───────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Creational:        Structural:          Behavioral:                  │
│  • Factory          • Facade             • Command                    │
│  • Builder          • Adapter            • Strategy                   │
│  • Singleton        • Composite          • Observer                   │
│                     • Decorator          • Chain of Resp              │
│                                          • Template Method            │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘

                      DATA FLOW EXAMPLE
┌───────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  User runs: cyrus start                                               │
│       │                                                                │
│       ├─► CLI parses command ─────────────────────► Presentation     │
│       │                                                                │
│       ├─► Container.resolve('StartCommand') ───────► Application     │
│       │                                                                │
│       ├─► StartCommand.execute() ──────────────────► Application     │
│       │      │                                                         │
│       │      ├─► ConfigService.load() ─────────────► Application     │
│       │      │      │                                                  │
│       │      │      └─► FileStorage.read() ────────► Infrastructure  │
│       │      │                                                         │
│       │      ├─► EdgeWorker.start() ────────────────► Application     │
│       │      │      │                                                  │
│       │      │      ├─► Repository entities ────────► Domain         │
│       │      │      │                                                  │
│       │      │      └─► NdjsonClient.connect() ─────► Infrastructure │
│       │      │                                                         │
│       │      └─► EventBus.emit('worker-started') ──► Cross-Cutting   │
│       │                                                                │
│       └─► Output to console ─────────────────────────► Presentation  │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

**Key Architectural Principles:**

1. **Dependency Rule**: Dependencies point INWARD
   - Presentation → Application → Domain ← Infrastructure
   - Domain has NO dependencies on outer layers

2. **Separation of Concerns**: Each layer has specific responsibilities
   - Presentation: User interaction
   - Application: Business workflows
   - Domain: Business rules
   - Infrastructure: Technical details

3. **Dependency Inversion**: Domain defines interfaces, Infrastructure implements
   - `IConfigRepository` (Domain) ← `FileConfigRepository` (Infrastructure)

4. **Testability**: Each layer can be tested in isolation
   - Mock outer layers when testing inner layers
   - Domain layer is 100% unit testable (pure logic)

---

## 📊 Summary of Team Discussion

### Key Decisions Made:

1. ✅ **Adopt Clean Architecture** - Team consensus on 4-layer approach
2. ✅ **Implement Event Bus** - Replace EventEmitter in Phase 3 (+1 week)
3. ✅ **Add Phase 0** - Performance baseline and regression tests (before Phase 1)
4. ✅ **Use Feature Flags** - For gradual rollout and safe rollback
5. ✅ **Comprehensive Testing** - 80% coverage target with contract tests
6. ✅ **Developer Training** - 4-week onboarding program for new architecture

### Action Items:

| Owner | Task | Deadline |
|-------|------|----------|
| Alex (Architect) | Create ADRs for major patterns | Week 1 |
| Maria (Senior Dev) | Set up MSW and test infrastructure | Week 1 |
| James (DevOps) | Implement performance baseline tests | Week 1 |
| Sarah (QA) | Create test scenario matrix | Week 1 |
| David (Tech Lead) | Write developer onboarding guide | Week 2 |
| @codegen-sh | Generate detailed code examples | Week 1 |

### Timeline Adjustment:

- **Phase 0**: Performance Baseline (NEW) - 1 week
- **Phase 1**: Foundation - 1 week
- **Phase 2**: CLI Refactoring - 2 weeks
- **Phase 3**: ClaudeRunner + Event Bus - 2 weeks (was 1 week)
- **Phase 4**: EdgeWorker - 2 weeks
- **Phase 5**: Core Package - 1 week
- **Phase 6**: Integration - 2 weeks

**Total: 11 weeks** (was 6 weeks)

### Risk Mitigation:

- Feature flags for all major changes
- Weekly progress reviews
- Rollback plan documented
- Beta testing with pilot users

---

## 🎯 Next Steps

1. **Approve this PR** to merge refactoring documentation
2. **Create Phase 0 branch** for baseline performance tests
3. **Schedule kickoff meeting** for Week 1 (Day 1)
4. **Assign action items** to team members

---

**Note**: This is a simulated team discussion. In a real scenario, each section would be invoked using `@codegen-sh` mentions in GitHub PR comments, with the agent responding as different team members to provide diverse perspectives.
