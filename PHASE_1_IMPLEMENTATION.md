# Phase 1: Foundation - Implementation Guide

## Цель Phase 1
Создать базовую архитектурную структуру без breaking changes, которая позволит постепенную миграцию существующего кода.

## 1. Создание структуры папок

### 1.1 Core Package Restructure

```bash
mkdir -p packages/core/src/domain/{entities,value-objects,repositories}
mkdir -p packages/core/src/application/{services,use-cases}
mkdir -p packages/core/src/infrastructure/{persistence,http}
mkdir -p packages/core/src/errors
```

### 1.2 CLI Package Restructure

```bash
mkdir -p apps/cli/src/domain/{config,workspace}
mkdir -p apps/cli/src/application/{commands,services}
mkdir -p apps/cli/src/infrastructure/{git,storage,http}
mkdir -p apps/cli/src/presentation/{cli,validators}
mkdir -p apps/cli/src/di
```

### 1.3 ClaudeRunner Package Restructure

```bash
mkdir -p packages/claude-runner/src/domain
mkdir -p packages/claude-runner/src/application
mkdir -p packages/claude-runner/src/infrastructure/{logging,mcp}
```

## 2. Domain Layer - Core Entities

### 2.1 packages/core/src/errors/CyrusError.ts

```typescript
export abstract class CyrusError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            stack: this.stack,
        };
    }
}

export class ConfigError extends CyrusError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'CONFIG_ERROR', context);
    }
}

export class OAuthError extends CyrusError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'OAUTH_ERROR', context);
    }
}

export class GitError extends CyrusError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'GIT_ERROR', context);
    }
}

export class SubscriptionError extends CyrusError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'SUBSCRIPTION_ERROR', context);
    }
}

export class ValidationError extends CyrusError {
    constructor(message: string, public readonly errors: Record<string, string[]>) {
        super(message, 'VALIDATION_ERROR', { errors });
    }
}
```

### 2.2 packages/core/src/domain/value-objects/Token.ts

```typescript
import { ValidationError } from '../../errors/CyrusError.js';

export class LinearToken {
    private constructor(private readonly value: string) {}

    static create(token: string): LinearToken {
        if (!token.startsWith('lin_oauth_')) {
            throw new ValidationError('Invalid Linear token format', {
                token: ['Token must start with "lin_oauth_"']
            });
        }
        return new LinearToken(token);
    }

    toString(): string {
        return this.value;
    }

    equals(other: LinearToken): boolean {
        return this.value === other.value;
    }

    mask(): string {
        return `...${this.value.slice(-4)}`;
    }
}

export class StripeCustomerId {
    private constructor(private readonly value: string) {}

    static create(customerId: string): StripeCustomerId {
        if (!customerId.startsWith('cus_')) {
            throw new ValidationError('Invalid Stripe customer ID format', {
                customerId: ['Customer ID must start with "cus_"']
            });
        }
        return new StripeCustomerId(customerId);
    }

    toString(): string {
        return this.value;
    }

    equals(other: StripeCustomerId): boolean {
        return this.value === other.value;
    }
}
```

### 2.3 packages/core/src/domain/entities/Repository.ts

```typescript
export interface RepositoryId {
    value: string;
}

export interface Repository {
    id: RepositoryId;
    name: string;
    path: string;
    baseBranch: string;
    workspaceBaseDir: string;
    linearWorkspaceId: string;
    linearToken: string;
    isActive: boolean;
    
    allowedTools?: string[];
    disallowedTools?: string[];
    allowedDirectories?: string[];
    mcpConfigPath?: string | string[];
    
    routingConfig?: {
        teamKeys?: string[];
        projectKeys?: string[];
        routingLabels?: string[];
    };
}

export class RepositoryEntity implements Repository {
    constructor(
        public readonly id: RepositoryId,
        public readonly name: string,
        public readonly path: string,
        public readonly baseBranch: string,
        public readonly workspaceBaseDir: string,
        public readonly linearWorkspaceId: string,
        public readonly linearToken: string,
        public isActive: boolean,
        public readonly config?: {
            allowedTools?: string[];
            disallowedTools?: string[];
            allowedDirectories?: string[];
            mcpConfigPath?: string | string[];
            routingConfig?: {
                teamKeys?: string[];
                projectKeys?: string[];
                routingLabels?: string[];
            };
        }
    ) {}

    static create(params: {
        id: string;
        name: string;
        path: string;
        baseBranch: string;
        workspaceBaseDir: string;
        linearWorkspaceId: string;
        linearToken: string;
        isActive?: boolean;
        config?: Repository['config'];
    }): RepositoryEntity {
        return new RepositoryEntity(
            { value: params.id },
            params.name,
            params.path,
            params.baseBranch,
            params.workspaceBaseDir,
            params.linearWorkspaceId,
            params.linearToken,
            params.isActive ?? true,
            params.config
        );
    }

    canHandleTeam(teamKey: string): boolean {
        return this.config?.routingConfig?.teamKeys?.includes(teamKey) ?? false;
    }

    canHandleProject(projectKey: string): boolean {
        return this.config?.routingConfig?.projectKeys?.includes(projectKey) ?? false;
    }

    canHandleLabel(label: string): boolean {
        return this.config?.routingConfig?.routingLabels?.includes(label) ?? false;
    }

    activate(): void {
        this.isActive = true;
    }

    deactivate(): void {
        this.isActive = false;
    }
}
```

## 3. Application Layer - Services

### 3.1 packages/core/src/application/services/IConfigService.ts

```typescript
import type { EdgeConfig, RepositoryConfig } from '../../config-types.js';

export interface IConfigService {
    load(): Promise<EdgeConfig>;
    save(config: EdgeConfig): Promise<void>;
    validate(config: unknown): EdgeConfig;
    addRepository(repository: RepositoryConfig): Promise<void>;
    removeRepository(repositoryId: string): Promise<void>;
    updateRepository(repositoryId: string, updates: Partial<RepositoryConfig>): Promise<void>;
}
```

### 3.2 apps/cli/src/application/services/ConfigService.ts

```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { EdgeConfig, RepositoryConfig } from 'cyrus-core';
import { ConfigError } from 'cyrus-core';
import type { IConfigService } from './IConfigService.js';

export class ConfigService implements IConfigService {
    constructor(private readonly configPath: string) {}

    async load(): Promise<EdgeConfig> {
        if (!existsSync(this.configPath)) {
            return { repositories: [] };
        }

        try {
            const content = readFileSync(this.configPath, 'utf-8');
            const config = JSON.parse(content);
            return this.validate(config);
        } catch (error) {
            throw new ConfigError('Failed to load configuration', {
                path: this.configPath,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    async save(config: EdgeConfig): Promise<void> {
        try {
            const validConfig = this.validate(config);
            const configDir = dirname(this.configPath);

            if (!existsSync(configDir)) {
                mkdirSync(configDir, { recursive: true });
            }

            writeFileSync(this.configPath, JSON.stringify(validConfig, null, 2));
        } catch (error) {
            throw new ConfigError('Failed to save configuration', {
                path: this.configPath,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    validate(config: unknown): EdgeConfig {
        if (!config || typeof config !== 'object') {
            throw new ConfigError('Invalid configuration: must be an object');
        }

        const edgeConfig = config as EdgeConfig;

        if (!Array.isArray(edgeConfig.repositories)) {
            throw new ConfigError('Invalid configuration: repositories must be an array');
        }

        for (const repo of edgeConfig.repositories) {
            this.validateRepository(repo);
        }

        return edgeConfig;
    }

    private validateRepository(repo: RepositoryConfig): void {
        const required = ['id', 'name', 'repositoryPath', 'baseBranch', 
                         'linearWorkspaceId', 'linearToken', 'workspaceBaseDir'];
        
        for (const field of required) {
            if (!(field in repo)) {
                throw new ConfigError(`Invalid repository: missing field "${field}"`, {
                    repository: repo.name,
                });
            }
        }
    }

    async addRepository(repository: RepositoryConfig): Promise<void> {
        const config = await this.load();
        
        const exists = config.repositories.some(r => r.id === repository.id);
        if (exists) {
            throw new ConfigError('Repository already exists', {
                repositoryId: repository.id,
            });
        }

        config.repositories.push(repository);
        await this.save(config);
    }

    async removeRepository(repositoryId: string): Promise<void> {
        const config = await this.load();
        config.repositories = config.repositories.filter(r => r.id !== repositoryId);
        await this.save(config);
    }

    async updateRepository(
        repositoryId: string,
        updates: Partial<RepositoryConfig>
    ): Promise<void> {
        const config = await this.load();
        
        const index = config.repositories.findIndex(r => r.id === repositoryId);
        if (index === -1) {
            throw new ConfigError('Repository not found', { repositoryId });
        }

        config.repositories[index] = {
            ...config.repositories[index],
            ...updates,
        };

        await this.save(config);
    }
}
```

### 3.3 apps/cli/src/application/commands/ICommand.ts

```typescript
export interface ICommand {
    execute(): Promise<void>;
}

export abstract class BaseCommand implements ICommand {
    abstract execute(): Promise<void>;

    protected async handleError(error: unknown): Promise<void> {
        if (error instanceof Error) {
            console.error(`❌ ${error.message}`);
            if (process.env.DEBUG) {
                console.error(error.stack);
            }
        } else {
            console.error('❌ An unknown error occurred');
        }
        process.exit(1);
    }
}
```

### 3.4 apps/cli/src/application/commands/CheckTokensCommand.ts

```typescript
import type { IConfigService } from '../services/IConfigService.js';
import { BaseCommand } from './ICommand.js';

export class CheckTokensCommand extends BaseCommand {
    constructor(private readonly configService: IConfigService) {
        super();
    }

    async execute(): Promise<void> {
        try {
            const config = await this.configService.load();

            if (config.repositories.length === 0) {
                console.log('No repositories configured');
                return;
            }

            console.log('Checking Linear tokens...\n');

            for (const repo of config.repositories) {
                process.stdout.write(`${repo.name} (${repo.linearWorkspaceName}): `);
                const result = await this.checkToken(repo.linearToken);

                if (result.valid) {
                    console.log('✅ Valid');
                } else {
                    console.log(`❌ Invalid - ${result.error}`);
                }
            }
        } catch (error) {
            await this.handleError(error);
        }
    }

    private async checkToken(token: string): Promise<{ valid: boolean; error?: string }> {
        try {
            const response = await fetch('https://api.linear.app/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({
                    query: '{ viewer { id email name } }',
                }),
            });

            const data = await response.json() as any;

            if (data.errors) {
                return {
                    valid: false,
                    error: data.errors[0]?.message || 'Unknown error',
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
```

## 4. Infrastructure Layer

### 4.1 packages/claude-runner/src/infrastructure/logging/ILogger.ts

```typescript
export interface LogEntry {
    type: string;
    timestamp: string;
    data: unknown;
}

export interface ILogger {
    log(entry: LogEntry): Promise<void>;
    close(): Promise<void>;
}
```

### 4.2 packages/claude-runner/src/infrastructure/logging/JsonLogger.ts

```typescript
import { createWriteStream, type WriteStream } from 'node:fs';
import type { ILogger, LogEntry } from './ILogger.js';

export class JsonLogger implements ILogger {
    private stream: WriteStream;

    constructor(private readonly filePath: string) {
        this.stream = createWriteStream(filePath, { flags: 'a' });
    }

    async log(entry: LogEntry): Promise<void> {
        return new Promise((resolve, reject) => {
            const line = JSON.stringify(entry) + '\n';
            this.stream.write(line, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            this.stream.end(() => resolve());
        });
    }
}
```

### 4.3 packages/claude-runner/src/infrastructure/logging/CompositeLogger.ts

```typescript
import type { ILogger, LogEntry } from './ILogger.js';

export class CompositeLogger implements ILogger {
    constructor(private readonly loggers: ILogger[]) {}

    async log(entry: LogEntry): Promise<void> {
        await Promise.all(
            this.loggers.map(logger => logger.log(entry))
        );
    }

    async close(): Promise<void> {
        await Promise.all(
            this.loggers.map(logger => logger.close())
        );
    }
}
```

## 5. Constants and Configuration

### 5.1 packages/core/src/constants/defaults.ts

```typescript
export const DEFAULT_CONFIG = {
    SERVER_PORT: 3456,
    BASE_BRANCH: 'main',
    SETUP_SCRIPT_TIMEOUT_MS: 5 * 60 * 1000,
    OAUTH_TIMEOUT_MS: 2 * 60 * 1000,
} as const;

export const DEFAULT_ALLOWED_TOOLS = [
    'Read(**)',
    'Edit(**)',
    'Bash(git:*)',
    'Bash(gh:*)',
    'Task',
    'WebFetch',
    'WebSearch',
    'TodoRead',
    'TodoWrite',
    'NotebookRead',
    'NotebookEdit',
    'Batch',
] as const;

export const DEFAULT_LABEL_PROMPTS = {
    debugger: {
        labels: ['Bug'],
    },
    builder: {
        labels: ['Feature', 'Improvement'],
    },
    scoper: {
        labels: ['PRD'],
    },
    orchestrator: {
        labels: ['Orchestrator'],
        allowedTools: 'coordinator' as const,
    },
} as const;

export const TOOL_PRESETS = {
    readOnly: [
        'Read(**)',
        'WebFetch',
        'WebSearch',
        'TodoRead',
        'NotebookRead',
        'Task',
        'Batch',
    ],
    safe: [
        'Read(**)',
        'Edit(**)',
        'WebFetch',
        'WebSearch',
        'TodoRead',
        'TodoWrite',
        'NotebookRead',
        'NotebookEdit',
        'Task',
        'Batch',
    ],
    all: [
        'Read(**)',
        'Edit(**)',
        'Bash',
        'WebFetch',
        'WebSearch',
        'TodoRead',
        'TodoWrite',
        'NotebookRead',
        'NotebookEdit',
        'Task',
        'Batch',
    ],
} as const;
```

### 5.2 packages/core/src/constants/messages.ts

```typescript
export const MESSAGES = {
    OAUTH: {
        SUCCESS: '✅ Linear connected successfully!',
        FAILED: '❌ OAuth flow failed',
        BROWSER_OPEN_FAILED: '⚠️  Failed to open browser automatically',
        WAITING: 'Waiting for OAuth callback...',
    },
    CONFIG: {
        MIGRATED: '📦 Migrated configuration from {from} to {to}',
        MIGRATION_FAILED: '⚠️  Failed to migrate config',
        LOAD_FAILED: '❌ Failed to load configuration',
        SAVE_FAILED: '❌ Failed to save configuration',
    },
    SUBSCRIPTION: {
        VALIDATING: '🔐 Validating subscription...',
        ACTIVE: '✅ Subscription active',
        INVALID: '❌ Subscription Invalid',
        EXPIRED: 'Your subscription has expired or been cancelled',
    },
    REPOSITORY: {
        SETUP_START: '📁 Repository Setup',
        SETUP_SUCCESS: '✅ Repository configured successfully!',
        SETUP_FAILED: '❌ Repository setup failed',
    },
    GIT: {
        WORKTREE_EXISTS: 'Worktree already exists at {path}, using existing',
        WORKTREE_CREATED: 'Created git worktree at {path}',
        FETCH_FAILED: '⚠️  git fetch failed, proceeding with local branch',
    },
} as const;

export function formatMessage(template: string, values: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || '');
}
```

## 6. Dependency Injection Container

### 6.1 apps/cli/src/di/Container.ts

```typescript
type Factory<T> = () => T;
type AsyncFactory<T> = () => Promise<T>;

export class Container {
    private singletons = new Map<string, unknown>();
    private factories = new Map<string, Factory<unknown> | AsyncFactory<unknown>>();

    register<T>(key: string, factory: Factory<T> | AsyncFactory<T>): void {
        this.factories.set(key, factory);
    }

    registerSingleton<T>(key: string, factory: Factory<T> | AsyncFactory<T>): void {
        this.register(key, () => {
            if (!this.singletons.has(key)) {
                const instance = factory();
                if (instance instanceof Promise) {
                    throw new Error('Async factories not supported for singletons. Use async resolve() instead.');
                }
                this.singletons.set(key, instance);
            }
            return this.singletons.get(key) as T;
        });
    }

    resolve<T>(key: string): T {
        const factory = this.factories.get(key);
        if (!factory) {
            throw new Error(`No factory registered for key: ${key}`);
        }
        const result = factory();
        if (result instanceof Promise) {
            throw new Error(`Factory for ${key} is async. Use resolveAsync() instead.`);
        }
        return result as T;
    }

    async resolveAsync<T>(key: string): Promise<T> {
        const factory = this.factories.get(key);
        if (!factory) {
            throw new Error(`No factory registered for key: ${key}`);
        }
        return await factory() as T;
    }

    clear(): void {
        this.singletons.clear();
        this.factories.clear();
    }
}
```

### 6.2 apps/cli/src/di/setup.ts

```typescript
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { ConfigService } from '../application/services/ConfigService.js';
import { CheckTokensCommand } from '../application/commands/CheckTokensCommand.js';
import { Container } from './Container.js';

export function setupContainer(cyrusHome?: string): Container {
    const container = new Container();

    // Configuration
    const configPath = resolve(cyrusHome || homedir(), '.cyrus', 'config.json');
    
    container.registerSingleton('ConfigService', () => new ConfigService(configPath));

    // Commands
    container.register('CheckTokensCommand', () => {
        const configService = container.resolve<ConfigService>('ConfigService');
        return new CheckTokensCommand(configService);
    });

    // Add more commands here...

    return container;
}
```

## 7. Integration with Existing Code

### 7.1 Facade Pattern для обратной совместимости

```typescript
// apps/cli/src/legacy/EdgeAppFacade.ts
import { EdgeApp } from '../app.js'; // existing class
import type { Container } from '../di/Container.js';

/**
 * Facade для постепенной миграции EdgeApp
 * Делегирует вызовы новым сервисам, где доступно
 */
export class EdgeAppFacade {
    private legacyApp: EdgeApp;

    constructor(
        cyrusHome: string,
        private container: Container
    ) {
        this.legacyApp = new EdgeApp(cyrusHome);
    }

    // Новая реализация через DI
    async checkTokens(): Promise<void> {
        const command = this.container.resolve('CheckTokensCommand');
        await command.execute();
    }

    // Пока делегируем старой реализации
    async start(): Promise<void> {
        return this.legacyApp.start();
    }

    // Постепенно заменяем методы...
}
```

## 8. Testing

### 8.1 Unit Test Example

```typescript
// apps/cli/src/application/services/__tests__/ConfigService.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '../ConfigService.js';
import type { EdgeConfig } from 'cyrus-core';

describe('ConfigService', () => {
    let tempDir: string;
    let configService: ConfigService;

    beforeEach(() => {
        tempDir = mkdtempSync(join(tmpdir(), 'cyrus-test-'));
        const configPath = join(tempDir, 'config.json');
        configService = new ConfigService(configPath);
    });

    afterEach(() => {
        rmSync(tempDir, { recursive: true, force: true });
    });

    it('should create default config when file does not exist', async () => {
        const config = await configService.load();
        expect(config).toEqual({ repositories: [] });
    });

    it('should save and load config', async () => {
        const testConfig: EdgeConfig = {
            repositories: [{
                id: 'test-1',
                name: 'test-repo',
                repositoryPath: '/path/to/repo',
                baseBranch: 'main',
                linearWorkspaceId: 'ws-123',
                linearToken: 'lin_oauth_test',
                workspaceBaseDir: '/path/to/workspace',
                isActive: true,
            }],
        };

        await configService.save(testConfig);
        const loaded = await configService.load();
        
        expect(loaded).toEqual(testConfig);
    });

    it('should throw error for invalid config', async () => {
        await expect(
            configService.validate({ invalid: true })
        ).rejects.toThrow('Invalid configuration');
    });
});
```

## 9. Migration Strategy

### Порядок миграции:

1. **Week 1: Setup Foundation**
   - [ ] Create folder structure
   - [ ] Implement error classes
   - [ ] Create basic interfaces
   - [ ] Setup DI container
   - [ ] Write constants

2. **Week 2: Extract Services**
   - [ ] ConfigService
   - [ ] Logger implementations
   - [ ] Value objects (Token, CustomerId)
   - [ ] Domain entities (Repository)

3. **Week 3: Commands Pattern**
   - [ ] CheckTokensCommand
   - [ ] AddRepositoryCommand
   - [ ] RefreshTokenCommand

4. **Week 4: Integration**
   - [ ] Facade для EdgeApp
   - [ ] Update entry point to use DI
   - [ ] Run integration tests

5. **Week 5: Documentation & Cleanup**
   - [ ] Update README with new architecture
   - [ ] Add architecture diagrams
   - [ ] Remove deprecated code

## 10. Success Metrics

- [ ] All new code has >80% test coverage
- [ ] No new TypeScript errors
- [ ] Existing functionality works (regression tests pass)
- [ ] Build time < 10s
- [ ] Startup time < 2s
- [ ] Code duplication reduced by 30%

## Next Steps

После завершения Phase 1:
1. Review и получение фидбека
2. Merge в main branch
3. Начало Phase 2: CLI Refactoring
