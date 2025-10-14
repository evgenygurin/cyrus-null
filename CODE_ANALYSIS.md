# Code Analysis: Architectural Issues and Anti-patterns

## Executive Summary

Проанализировав кодовую базу Cyrus, выявлены следующие основные проблемы:

1. **God Object Anti-pattern**: `EdgeApp` класс (2067 строк) делает слишком много
2. **Hardcoded Values**: Магические числа и строки по всему коду
3. **Poor Layer Separation**: Бизнес-логика смешана с инфраструктурой
4. **Code Duplication**: Повторяющаяся логика в разных местах
5. **Weak Typing**: Использование `any`, отсутствие явных типов
6. **Testing Gaps**: Недостаточное покрытие тестами критичных компонентов

## Detailed Analysis

### 1. apps/cli/app.ts - God Object (2067 lines)

#### Violations:

##### Single Responsibility Principle
Класс `EdgeApp` отвечает за:
- OAuth authentication (lines 342-396)
- Configuration management (lines 185-229)
- Git worktree management (lines 1328-1610)
- Subscription validation (lines 668-765)
- CLI interaction (lines 234-336)
- Edge worker orchestration (lines 478-663)
- Setup scripts execution (lines 1227-1323)
- Repository setup wizard (lines 234-337)

**Impact**: Изменение любой из этих областей требует модификации огромного класса, высокий риск регрессий.

##### Hardcoded Values
```typescript
// Line 280-293 - Hardcoded allowed tools
const allowedTools = [
    "Read(**)",
    "Edit(**)",
    "Bash(git:*)",
    // ... etc
];

// Line 296-310 - Hardcoded label prompts
const labelPrompts = {
    debugger: { labels: ["Bug"] },
    // ... etc
};

// Line 512 - Magic number
serverPort: process.env.CYRUS_SERVER_PORT ? parseInt(process.env.CYRUS_SERVER_PORT, 10) : 3456,

// Line 1299 - Magic number  
timeout: 5 * 60 * 1000, // 5 minute timeout
```

**Problems**:
- Невозможно переконфигурировать без изменения кода
- Дублирование в тестах
- Нет центрального места для констант

##### Code Duplication

**OAuth Flow** (lines 342-396 vs 1742-1802):
```typescript
// Similar OAuth setup logic repeated in:
// 1. startOAuthFlow() - line 342
// 2. refreshTokenCommand() - line 1742
// 3. addRepositoryCommand() - line 1876

// Both create temp servers, handle callbacks, open browsers
```

**Token Validation** (lines 1632-1660 vs 1678-1684):
```typescript
// checkLinearToken() duplicates validation logic
async function checkLinearToken(token: string): Promise<{ valid: boolean; error?: string }> {
    // Fetch to Linear API
}

// Similar validation in EdgeWorker connection
```

**Config Loading/Saving** (lines 185-229):
```typescript
// loadEdgeConfig() and saveEdgeConfig() could be in dedicated ConfigService
loadEdgeConfig(): EdgeConfig { /* ... */ }
saveEdgeConfig(config: EdgeConfig): void { /* ... */ }
```

##### Poor Error Handling
```typescript
// Line 196 - Generic error swallowing
} catch (e) {
    console.error("Failed to load edge config:", (e as Error).message);
}

// Line 1450 - Silent failure
} catch (e) {
    console.warn("Warning: git fetch failed, proceeding with local branch:", (e as Error).message);
    hasRemote = false;
}
```

**Problems**:
- Потеря контекста ошибки
- Нет разделения на recoverable/non-recoverable ошибки
- Сложно дебажить

##### Testing Challenges
```typescript
// Невозможно изолированно протестировать:
// - OAuth flow (зависит от network, browser)
// - Git operations (зависит от file system, git)
// - Subscription validation (зависит от external API)

// Пример непроверяемого кода:
async createGitWorktree(issue: Issue, repository: RepositoryConfig): Promise<Workspace> {
    // 282 lines of complex git logic mixed with filesystem operations
    // No clear separation of concerns
    // Hard to mock dependencies
}
```

##### Recommended Refactoring

```typescript
// Before (simplified):
class EdgeApp {
    async start() {
        // 1000+ lines of mixed concerns
    }
    
    async startOAuthFlow() { /* ... */ }
    async createGitWorktree() { /* ... */ }
    async validateSubscription() { /* ... */ }
    // ... 20 more methods
}

// After:
class EdgeApp {
    constructor(
        private configService: ConfigService,
        private workspaceService: WorkspaceService,
        private subscriptionService: SubscriptionService
    ) {}
    
    async start() {
        const config = await this.configService.load();
        if (config.needsSetup) {
            await this.runSetup();
        }
        await this.startWorker(config);
    }
}

// Separated services:
class ConfigService {
    load(): Promise<EdgeConfig>
    save(config: EdgeConfig): Promise<void>
    migrate(): Promise<void>
}

class WorkspaceService {
    createWorktree(issue: Issue, repo: Repository): Promise<Workspace>
    cleanupWorktree(workspace: Workspace): Promise<void>
}

class SubscriptionService {
    validate(customerId: string): Promise<SubscriptionStatus>
    openBillingPortal(customerId: string): Promise<void>
}
```

### 2. packages/claude-runner/src/ClaudeRunner.ts

#### Issues:

##### Mixed Concerns (880 lines)
```typescript
export class ClaudeRunner extends EventEmitter {
    // Session management (lines 173-525)
    async start(prompt: string): Promise<ClaudeSessionInfo>
    async startStreaming(initialPrompt?: string): Promise<ClaudeSessionInfo>
    
    // Logging (lines 700-878)
    private setupLogging(): void
    private writeReadableLogEntry(message: SDKMessage): void
    
    // Environment management (lines 672-696)
    private loadRepositoryEnv(workingDirectory: string): void
    
    // Message processing (lines 630-666)
    private processMessage(message: SDKMessage): void
    
    // Configuration (lines 278-416)
    // Complex MCP config merging
    // Environment variable handling
    // Tool configuration
}
```

**Problem**: Каждое изменение в любой из этих областей требует модификации центрального класса.

##### Logging System Issues

```typescript
// Lines 701-773 - Complex logging setup
private setupLogging(): void {
    // Creating directory structure
    // Managing multiple log streams
    // Writing metadata
    // Handling session ID changes
}

// Lines 778-878 - 100 lines of formatting logic
private writeReadableLogEntry(message: SDKMessage): void {
    switch (message.type) {
        case "assistant": // 52 lines
        case "user": // 18 lines
        case "result": // 18 lines
    }
}
```

**Problems**:
- Логирование не тестируется изолированно
- Невозможно поменять формат без модификации основного класса
- Нарушение Open/Closed Principle

##### Recommended Refactoring

```typescript
// Current:
class ClaudeRunner {
    private setupLogging() { /* 73 lines */ }
    private writeReadableLogEntry() { /* 100 lines */ }
    private loadRepositoryEnv() { /* 25 lines */ }
    private processMessage() { /* 37 lines */ }
    async start() { /* 318 lines */ }
}

// Refactored:

// Logger Strategy Pattern
interface ILogger {
    log(entry: LogEntry): Promise<void>;
    close(): Promise<void>;
}

class JsonLogger implements ILogger {
    async log(entry: LogEntry) {
        this.stream.write(JSON.stringify(entry) + '\n');
    }
}

class MarkdownLogger implements ILogger {
    async log(entry: LogEntry) {
        const formatted = this.formatter.format(entry);
        this.stream.write(formatted);
    }
}

class CompositeLogger implements ILogger {
    constructor(private loggers: ILogger[]) {}
    
    async log(entry: LogEntry) {
        await Promise.all(
            this.loggers.map(logger => logger.log(entry))
        );
    }
}

// Simplified ClaudeRunner
class ClaudeRunner {
    constructor(
        private config: ClaudeRunnerConfig,
        private sessionManager: SessionManager,
        private logger: ILogger
    ) {}
    
    async start(prompt: string) {
        const session = await this.sessionManager.create(this.config);
        await this.logger.log({ type: 'session-start', session });
        
        for await (const message of session.run(prompt)) {
            await this.logger.log({ type: 'message', message });
            this.emit('message', message);
        }
        
        return session.info;
    }
}
```

### 3. packages/edge-worker/src/EdgeWorker.ts

#### Issues:

##### Complex State Management
```typescript
// Multiple maps for state tracking
private repositoryManagers = new Map<string, AgentSessionManager>();
private ndjsonClients = new Map<string, NdjsonClient>();
private issueSessions = new Map<string, CyrusAgentSession>();
private activeTokens = new Set<string>();
private reconnectTimeouts = new Map<string, NodeJS.Timeout>();
```

**Problems**:
- Сложно следить за жизненным циклом
- Потенциальные memory leaks
- Трудно тестировать

##### Routing Logic Duplication
```typescript
// Lines 400-600 - Complex routing logic scattered across methods
private async handleWebhookPayload() {
    // Team-based routing
    if (repository.teamKeys) { /* ... */ }
    
    // Project-based routing  
    if (repository.projectKeys) { /* ... */ }
    
    // Label-based routing
    if (repository.routingLabels) { /* ... */ }
    
    // Prompt-based routing
    if (repository.labelPrompts) { /* ... */ }
}

// Similar routing logic in:
// - handleIssueAssigned
// - handleIssueUpdated
// - handleCommentCreated
```

**Solution**: Strategy Pattern для роутинга

```typescript
interface IRoutingStrategy {
    canHandle(issue: Issue, repository: Repository): boolean;
    route(issue: Issue): Promise<RepositoryMatch>;
}

class TeamBasedRouting implements IRoutingStrategy {
    canHandle(issue: Issue, repository: Repository): boolean {
        return repository.teamKeys?.includes(issue.team.key) ?? false;
    }
}

class LabelBasedRouting implements IRoutingStrategy {
    canHandle(issue: Issue, repository: Repository): boolean {
        return issue.labels.some(label => 
            repository.routingLabels?.includes(label.name)
        );
    }
}

class RoutingChain {
    constructor(private strategies: IRoutingStrategy[]) {}
    
    async route(issue: Issue, repositories: Repository[]): Promise<RepositoryMatch | null> {
        for (const repo of repositories) {
            for (const strategy of this.strategies) {
                if (strategy.canHandle(issue, repo)) {
                    return strategy.route(issue);
                }
            }
        }
        return null;
    }
}
```

### 4. Cross-Cutting Issues

#### Configuration Management

**Problem**: Configuration scattered across multiple places

```typescript
// apps/cli/app.ts
const config = this.loadEdgeConfig(); // Line 190

// packages/edge-worker/src/EdgeWorker.ts  
this.config = config; // Line 50

// packages/claude-runner/src/ClaudeRunner.ts
this.config = config; // Line 160

// Each has different validation, defaults, merging logic
```

**Solution**: Centralized Configuration Management

```typescript
// packages/core/src/config/ConfigManager.ts
class ConfigManager {
    private static instance: ConfigManager;
    private config: EdgeConfig;
    private validators: Map<string, Validator>;
    
    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    
    async load(path: string): Promise<EdgeConfig> {
        const raw = await fs.readFile(path, 'utf8');
        const parsed = JSON.parse(raw);
        return this.validate(parsed);
    }
    
    private validate(config: unknown): EdgeConfig {
        // Centralized validation using Zod or similar
        const result = EdgeConfigSchema.parse(config);
        return result;
    }
}
```

#### Error Handling

**Problem**: Inconsistent error handling

```typescript
// Example 1: Swallow errors
catch (e) {
    console.error("Error:", e);
}

// Example 2: Throw generic Error
throw new Error("Failed to load config");

// Example 3: Return null on error
catch {
    return null;
}
```

**Solution**: Typed Error Hierarchy

```typescript
// packages/core/src/errors/BaseError.ts
abstract class CyrusError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

class ConfigError extends CyrusError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'CONFIG_ERROR', context);
    }
}

class OAuthError extends CyrusError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'OAUTH_ERROR', context);
    }
}

class GitError extends CyrusError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'GIT_ERROR', context);
    }
}

// Usage:
try {
    await configService.load();
} catch (error) {
    if (error instanceof ConfigError) {
        // Handle config-specific error
        logger.error('Config error', error.context);
    } else if (error instanceof GitError) {
        // Handle git-specific error
        logger.error('Git error', error.context);
    } else {
        // Unknown error
        throw error;
    }
}
```

#### Testing Gaps

**Current Test Coverage**:
- apps/cli: ~5% (only 2 test files)
- packages/claude-runner: ~30%
- packages/edge-worker: ~60%
- packages/core: ~40%

**Missing Tests**:
1. Integration tests for OAuth flow
2. E2E tests for complete workflows
3. Unit tests for edge cases
4. Performance tests for memory/CPU usage

**Recommendation**: Target 80%+ coverage with focus on:
1. Business-critical paths (OAuth, Session Management, Git Operations)
2. Error handling scenarios
3. Edge cases and boundary conditions

## Code Metrics

### Complexity Analysis

**Cyclomatic Complexity** (threshold: 10):
- `EdgeApp.start()`: **25** ❌
- `EdgeApp.createGitWorktree()`: **18** ❌  
- `ClaudeRunner.start()`: **22** ❌
- `EdgeWorker.handleWebhookPayload()`: **20** ❌

**Method Length** (threshold: 30 lines):
- `EdgeApp.start()`: **360 lines** ❌
- `EdgeApp.createGitWorktree()`: **282 lines** ❌
- `ClaudeRunner.start()`: **318 lines** ❌

**Class Size** (threshold: 300 lines):
- `EdgeApp`: **2067 lines** ❌
- `ClaudeRunner`: **880 lines** ❌
- `EdgeWorker`: **1200+ lines** ❌

### Duplication Report

**High-priority duplications**:
1. OAuth flow logic: 3 instances (~150 lines each)
2. Config loading/saving: 4 instances (~50 lines each)
3. Token validation: 3 instances (~30 lines each)
4. Error handling patterns: 50+ instances
5. Readline prompt creation: 10+ instances

## Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|---------|---------|----------|
| EdgeApp God Object | High | High | P0 |
| Config Management | High | Medium | P0 |
| Error Handling | High | Medium | P1 |
| ClaudeRunner Refactor | Medium | Medium | P1 |
| EdgeWorker Routing | Medium | Low | P2 |
| Test Coverage | High | High | P2 |
| Code Duplication | Low | Low | P3 |

## Conclusion

Кодовая база Cyrus требует значительного рефакторинга для:
1. Улучшения поддерживаемости
2. Увеличения тестируемости
3. Снижения когнитивной нагрузки
4. Упрощения онбординга новых разработчиков
5. Подготовки к масштабированию

Рекомендуется начать с Phase 1 (Foundation) из REFACTORING_PLAN.md, создав базовую архитектуру и постепенно мигрируя существующий код.
