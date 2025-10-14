# Phase 2 Refactoring Checklist - Service Extraction

## Overview
Декомпозиция монолитного `app.ts` (2066 строк) на изолированные, тестируемые сервисы с использованием Clean Architecture и SOLID принципов.

## Status Legend
- 🔴 Not Started
- 🟡 In Progress  
- 🟢 Completed
- ⏸️ Blocked

---

## Pre-Flight Verification: Code Quality Checks 🟢

**Status:** ✅ Completed  
**Date:** January 11, 2025  
**PR:** #14 on branch `refactor/codebase-improvements`

### Completed Verification Tasks

- [x] **All Tests Passing** - 257 tests across all packages (100% success rate)
  - `apps/cli`: All tests passing
  - `packages/core`: All tests passing
  - `packages/claude-runner`: All tests passing
  - `packages/edge-worker`: All tests passing
  - `packages/linear-webhook-client`: All tests passing
  - `packages/ndjson-client`: All tests passing
  - `packages/simple-agent-runner`: All tests passing
  - `apps/proxy-worker`: All tests passing

- [x] **Biome Linter** - 151 files checked, zero issues found
  - Format: All files properly formatted
  - Lint: No lint warnings or errors
  - Organize Imports: All imports organized

- [x] **TypeScript Type Checking** - Zero type errors
  - All packages compile successfully
  - Strict type checking enabled
  - No `any` types without proper justification

- [x] **Build Verification** - All packages build successfully
  - `apps/cli`: ✅ Build successful
  - `packages/core`: ✅ Build successful
  - `packages/claude-runner`: ✅ Build successful
  - `packages/edge-worker`: ✅ Build successful
  - `packages/linear-webhook-client`: ✅ Build successful
  - `packages/ndjson-client`: ✅ Build successful
  - `packages/simple-agent-runner`: ✅ Build successful
  - `apps/proxy-worker`: ✅ Build successful

- [x] **GitHub CI Checks** - All checks passing on PR #14
  - test (18.x): ✅ Pass (38s)
  - test (20.x): ✅ Pass (44s)
  - test (22.x): ✅ Pass (40s)

### Phase 1 Foundation - Already Complete ✅

Phase 1 successfully implemented Clean Architecture foundation with:
- **21 files created** across domain, application, and infrastructure layers
- **1,101+ lines of code** with SOLID principles
- **19 comprehensive tests** with 100% coverage
- **Typed error hierarchy** (CyrusError, ConfigError, OAuthError, GitError, etc.)
- **Value Objects** (LinearToken, StripeCustomerId)
- **Domain Entities** (Repository with routing logic)
- **Services** (ConfigService with full CRUD)
- **Dependency Injection Container** with type-safe service resolution

**Key Accomplishment:** Fixed ConfigService test failure that was blocking CI - test was incorrectly using async expectation for synchronous validation method.

---

## Pre-Phase 2: Analysis & Planning

### Task 1: Dependency Mapping 🔴
**Priority: Critical** | **Estimated: 2-3 hours**

- [ ] Проанализировать `app.ts` и создать service dependency graph
- [ ] Идентифицировать все основные функции и их зависимости
- [ ] Определить порядок извлечения сервисов (топологическая сортировка)
- [ ] Документировать external API calls (Linear, Stripe, GitHub)
- [ ] Создать `docs/service-dependency-graph.md`

**Deliverable:** Граф зависимостей с четким порядком извлечения

---

## Phase 2.1: Infrastructure Layer - HTTP & Git Clients

### Task 2: Create HTTP Client Abstraction 🔴
**Priority: High** | **Estimated: 3-4 hours**

#### 2.1 Interface Design
- [ ] Создать `packages/core/src/infrastructure/http/IHttpClient.ts`
  ```typescript
  interface IHttpClient {
    get<T>(url: string, config?: RequestConfig): Promise<T>;
    post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
    put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
    delete<T>(url: string, config?: RequestConfig): Promise<T>;
  }
  ```

#### 2.2 Implementation
- [ ] Создать `packages/core/src/infrastructure/http/FetchHttpClient.ts`
- [ ] Добавить retry logic с exponential backoff
- [ ] Добавить timeout handling
- [ ] Добавить request/response logging
- [ ] Добавить error transformation (HTTP errors → domain errors)

#### 2.3 Testing
- [ ] Unit tests с mock fetch API (10+ tests)
- [ ] Test retry mechanism
- [ ] Test timeout scenarios
- [ ] Test error mapping

**Deliverable:** Полностью протестированный HTTP client abstraction

---

### Task 3: Create Git Client Abstraction 🔴  
**Priority: High** | **Estimated: 4-5 hours**

#### 3.1 Interface Design
- [ ] Создать `packages/core/src/infrastructure/git/IGitClient.ts`
  ```typescript
  interface IGitClient {
    clone(url: string, targetDir: string): Promise<void>;
    createWorktree(branch: string, path: string): Promise<void>;
    removeWorktree(path: string): Promise<void>;
    listWorktrees(): Promise<WorktreeInfo[]>;
    checkout(branch: string): Promise<void>;
    getCurrentBranch(): Promise<string>;
  }
  ```

#### 3.2 Implementation
- [ ] Создать `packages/core/src/infrastructure/git/GitClient.ts`
- [ ] Обернуть git commands в child_process exec
- [ ] Добавить proper error handling (GitError)
- [ ] Добавить command output parsing
- [ ] Добавить git status validation

#### 3.3 Testing
- [ ] Unit tests с mock child_process (15+ tests)
- [ ] Test error scenarios (invalid branch, missing repo)
- [ ] Test worktree lifecycle
- [ ] Integration test с temporary git repo (optional)

**Deliverable:** GitClient готовый к использованию в WorktreeService

---

## Phase 2.2: Application Services - OAuth & Tokens

### Task 4: Extract OAuthService 🔴
**Priority: Critical** | **Estimated: 5-6 hours**

#### 4.1 Interface Design
- [ ] Создать `packages/core/src/application/services/IOAuthService.ts`
  ```typescript
  interface IOAuthService {
    startOAuthFlow(workspaceId: string): Promise<OAuthFlowResult>;
    exchangeCodeForToken(code: string): Promise<LinearToken>;
    validateToken(token: LinearToken): Promise<boolean>;
    revokeToken(token: LinearToken): Promise<void>;
  }
  ```

#### 4.2 Domain Models
- [ ] Создать `OAuthFlowResult` type в domain/
- [ ] Использовать существующий `LinearToken` value object
- [ ] Создать `OAuthState` value object (для CSRF protection)

#### 4.3 Implementation
- [ ] Создать `apps/cli/src/application/services/OAuthService.ts`
- [ ] Inject `IHttpClient` и `IConfigService`
- [ ] Реализовать OAuth PKCE flow
- [ ] Добавить state validation для security
- [ ] Использовать `OAuthError` для error handling
- [ ] Добавить logging через `ILogger`

#### 4.4 Testing
- [ ] Mock IHttpClient для API calls (12+ tests)
- [ ] Test successful OAuth flow
- [ ] Test error scenarios (invalid code, expired state)
- [ ] Test token validation
- [ ] Test concurrent OAuth requests

#### 4.5 Integration
- [ ] Зарегистрировать в DI Container (`di/setup.ts`)
- [ ] Обновить существующие команды для использования OAuthService
- [ ] Проверить backward compatibility

**Deliverable:** OAuthService полностью изолирован от app.ts

---

### Task 5: Extract TokenRefreshService 🔴
**Priority: High** | **Estimated: 3-4 hours**

#### 5.1 Interface Design
- [ ] Создать `packages/core/src/application/services/ITokenRefreshService.ts`
  ```typescript
  interface ITokenRefreshService {
    refreshToken(workspaceId: string): Promise<LinearToken>;
    scheduleAutoRefresh(workspaceId: string, interval: number): void;
    cancelAutoRefresh(workspaceId: string): void;
  }
  ```

#### 5.2 Implementation
- [ ] Создать `apps/cli/src/application/services/TokenRefreshService.ts`
- [ ] Inject `IOAuthService` и `IConfigService`
- [ ] Реализовать refresh logic с retry
- [ ] Добавить auto-refresh scheduling (с intervals)
- [ ] Обработка edge cases (token уже valid, refresh fails)

#### 5.3 Testing
- [ ] Mock IOAuthService (10+ tests)
- [ ] Test refresh success scenario
- [ ] Test retry mechanism
- [ ] Test auto-refresh scheduling
- [ ] Test cancellation

#### 5.4 Integration
- [ ] Зарегистрировать в DI Container
- [ ] Создать `RefreshTokenCommand`
- [ ] Обновить app.ts для использования нового сервиса

**Deliverable:** TokenRefreshService готов к использованию

---

## Phase 2.3: Application Services - Subscription & Billing

### Task 6: Create Stripe Client Abstraction 🔴
**Priority: Medium** | **Estimated: 2-3 hours**

#### 6.1 Interface Design
- [ ] Создать `packages/core/src/infrastructure/stripe/IStripeClient.ts`
  ```typescript
  interface IStripeClient {
    createCheckoutSession(customerId: string, priceId: string): Promise<CheckoutSession>;
    createBillingPortalSession(customerId: string): Promise<PortalSession>;
    getSubscription(subscriptionId: string): Promise<Subscription>;
    cancelSubscription(subscriptionId: string): Promise<void>;
  }
  ```

#### 6.2 Implementation
- [ ] Создать `packages/core/src/infrastructure/stripe/StripeClient.ts`
- [ ] Использовать официальный Stripe SDK
- [ ] Обернуть в IStripeClient interface
- [ ] Добавить error mapping (Stripe errors → SubscriptionError)

#### 6.3 Testing
- [ ] Mock Stripe SDK (8+ tests)
- [ ] Test successful operations
- [ ] Test Stripe API errors
- [ ] Test idempotency keys

**Deliverable:** StripeClient готовый к использованию

---

### Task 7: Extract SubscriptionService 🔴
**Priority: High** | **Estimated: 4-5 hours**

#### 7.1 Interface Design
- [ ] Создать `packages/core/src/application/services/ISubscriptionService.ts`
  ```typescript
  interface ISubscriptionService {
    subscribe(workspaceId: string): Promise<SubscriptionResult>;
    openBillingPortal(workspaceId: string): Promise<void>;
    checkSubscriptionStatus(workspaceId: string): Promise<SubscriptionStatus>;
    cancelSubscription(workspaceId: string): Promise<void>;
  }
  ```

#### 7.2 Domain Models
- [ ] Создать `SubscriptionResult` type
- [ ] Создать `SubscriptionStatus` enum (active, canceled, past_due)
- [ ] Использовать `StripeCustomerId` value object

#### 7.3 Implementation
- [ ] Создать `apps/cli/src/application/services/SubscriptionService.ts`
- [ ] Inject `IStripeClient`, `IConfigService`, `IOAuthService`
- [ ] Реализовать subscription flow
- [ ] Обработка webhooks от Stripe (отдельный метод)
- [ ] Синхронизация subscription status с config

#### 7.4 Testing
- [ ] Mock всех dependencies (12+ tests)
- [ ] Test subscribe flow
- [ ] Test billing portal opening
- [ ] Test subscription status checks
- [ ] Test webhook handling

#### 7.5 Integration
- [ ] Зарегистрировать в DI Container
- [ ] Создать `SubscribeCommand` и `BillingCommand`
- [ ] Обновить app.ts

**Deliverable:** SubscriptionService изолирован и протестирован

---

## Phase 2.4: Application Services - Git Worktrees

### Task 8: Extract WorktreeService 🔴
**Priority: High** | **Estimated: 5-6 hours**

#### 8.1 Interface Design
- [ ] Создать `packages/core/src/application/services/IWorktreeService.ts`
  ```typescript
  interface IWorktreeService {
    createWorktree(issue: Issue, repository: RepositoryConfig): Promise<WorktreeInfo>;
    removeWorktree(worktreePath: string): Promise<void>;
    listWorktrees(repositoryPath: string): Promise<WorktreeInfo[]>;
    cleanupStaleWorktrees(repositoryPath: string, maxAge: number): Promise<void>;
  }
  ```

#### 8.2 Domain Models
- [ ] Создать `WorktreeInfo` entity в domain/entities/
  ```typescript
  class WorktreeInfo {
    constructor(
      public readonly path: string,
      public readonly branch: string,
      public readonly issueId: string,
      public readonly createdAt: Date
    ) {}
  }
  ```

#### 8.3 Implementation
- [ ] Создать `apps/cli/src/application/services/WorktreeService.ts`
- [ ] Inject `IGitClient` и `IConfigService`
- [ ] Реализовать worktree creation с naming convention
- [ ] Добавить cleanup logic для stale worktrees
- [ ] Использовать `GitError` для error handling
- [ ] Добавить proper logging

#### 8.4 Testing
- [ ] Mock IGitClient (15+ tests)
- [ ] Test worktree lifecycle
- [ ] Test branch naming conventions
- [ ] Test cleanup logic
- [ ] Test concurrent worktree operations
- [ ] Test error scenarios (disk full, permission denied)

#### 8.5 Integration
- [ ] Зарегистрировать в DI Container
- [ ] Обновить EdgeWorker для использования WorktreeService
- [ ] Тест integration с реальным git repo (optional)

**Deliverable:** WorktreeService готов к production

---

## Phase 2.5: Command Layer - CLI Commands

### Task 9: Extract Auth Commands 🔴
**Priority: High** | **Estimated: 3-4 hours**

#### 9.1 Commands to Create
- [ ] `InitCommand` - инициализация Cyrus
- [ ] `AuthCommand` - OAuth authentication
- [ ] `LogoutCommand` - revoke tokens

#### 9.2 Implementation (each command)
- [ ] Extend `BaseCommand`
- [ ] Inject необходимые сервисы через конструктор
- [ ] Реализовать `execute()` method
- [ ] Использовать `handleError()` для error handling
- [ ] Добавить user-friendly output
- [ ] Добавить progress indicators где нужно

#### 9.3 Testing (each command)
- [ ] Mock всех injected services (5+ tests per command)
- [ ] Test success scenarios
- [ ] Test error scenarios
- [ ] Test user input validation

#### 9.4 Integration
- [ ] Зарегистрировать в DI Container
- [ ] Обновить app.ts routing
- [ ] Update --help output

**Deliverable:** Auth commands изолированы

---

### Task 10: Extract Repository Management Commands 🔴
**Priority: Medium** | **Estimated: 3-4 hours**

#### 10.1 Commands to Create
- [ ] `AddRepositoryCommand` (уже существует, refactor)
- [ ] `RemoveRepositoryCommand`
- [ ] `ListRepositoriesCommand`
- [ ] `UpdateRepositoryCommand`

#### 10.2 Implementation & Testing
(Same pattern as Task 9)

**Deliverable:** Repository commands готовы

---

### Task 11: Extract Subscription Commands 🔴
**Priority: Medium** | **Estimated: 2-3 hours**

#### 11.1 Commands to Create
- [ ] `SubscribeCommand`
- [ ] `BillingCommand`
- [ ] `SetCustomerIdCommand` (уже существует частично)

#### 11.2 Implementation & Testing
(Same pattern as Task 9)

**Deliverable:** Subscription commands готовы

---

## Phase 2.6: Main Application Refactoring

### Task 12: Refactor app.ts to Orchestration Layer 🔴
**Priority: Critical** | **Estimated: 6-8 hours**

#### 12.1 Command Router
- [ ] Создать `CommandRouter` class
  ```typescript
  class CommandRouter {
    constructor(private container: Container) {}
    
    async route(args: string[]): Promise<void> {
      const commandName = args[0] || 'start';
      const command = this.resolveCommand(commandName);
      await command.execute();
    }
  }
  ```

#### 12.2 Refactor app.ts
- [ ] Убрать всю бизнес-логику (OAuth, Stripe, Git, etc.)
- [ ] Оставить только:
  - CLI argument parsing
  - DI Container setup
  - Command routing
  - Top-level error handling
- [ ] Цель: < 300 строк кода

#### 12.3 Backward Compatibility
- [ ] Убедиться что все существующие CLI команды работают
- [ ] Проверить все env variables поддерживаются
- [ ] Проверить все флаги (--cyrus-home, --env-file)

#### 12.4 Testing
- [ ] Integration tests для всех CLI команд (20+ tests)
- [ ] E2E test с real config file
- [ ] Test error scenarios
- [ ] Test --help output

**Deliverable:** app.ts < 300 строк, вся логика в сервисах

---

## Phase 2.7: Documentation & Polish

### Task 13: Update Documentation 🔴
**Priority: Medium** | **Estimated: 3-4 hours**

- [ ] Обновить `ARCHITECTURE.md` с новой структурой
- [ ] Создать `docs/SERVICES.md` с описанием всех сервисов
- [ ] Обновить `CLAUDE.md` с новыми путями
- [ ] Добавить sequence diagrams для key flows
- [ ] Обновить README с новыми примерами

---

### Task 14: Code Quality & Metrics 🔴
**Priority: Low** | **Estimated: 2-3 hours**

- [ ] Запустить biome linter на всех новых файлах
- [ ] Проверить test coverage (цель: 100% для новых сервисов)
- [ ] Добавить JSDoc комментарии к public APIs
- [ ] Проверить cyclomatic complexity (goal: < 10)
- [ ] Обновить CHANGELOG.md

---

## Phase 2.8: Final Validation

### Task 15: Integration Testing 🔴
**Priority: Critical** | **Estimated: 4-5 hours**

- [ ] E2E test: полный OAuth flow
- [ ] E2E test: создание worktree для Linear issue
- [ ] E2E test: subscription flow
- [ ] E2E test: token refresh
- [ ] Load test: 10+ concurrent operations
- [ ] Test на реальной Linear workspace (staging)

---

### Task 16: Performance Validation 🔴
**Priority: Low** | **Estimated: 2-3 hours**

- [ ] Benchmark startup time (goal: < 1s)
- [ ] Benchmark OAuth flow (goal: < 5s)
- [ ] Benchmark worktree creation (goal: < 3s)
- [ ] Memory profiling (goal: < 100MB baseline)
- [ ] Check for memory leaks in long-running process

---

## Success Criteria

### Phase 2 Complete When:
- [ ] ✅ Все 16 tasks completed
- [ ] ✅ app.ts < 300 строк
- [ ] ✅ 5+ новых сервисов с 100% test coverage
- [ ] ✅ Все existing CLI команды работают
- [ ] ✅ Zero TypeScript errors
- [ ] ✅ All CI checks pass
- [ ] ✅ Documentation updated
- [ ] ✅ Performance benchmarks met

### Metrics Target:
- **New Services:** 5-7 isolated services
- **Lines of Code Reduced:** ~1700 lines из app.ts
- **Test Coverage:** 100% для новых сервисов
- **Test Count:** 100+ новых unit/integration tests
- **Build Time:** No increase from Phase 1
- **Startup Time:** < 1 second

---

## Risk Mitigation

### Risk 1: Breaking Changes
**Mitigation:** Сохранять app.ts функциональность пока все сервисы не готовы

### Risk 2: Test Maintenance
**Mitigation:** Использовать shared test utilities, mock builders

### Risk 3: Over-Engineering
**Mitigation:** Начать с minimal viable abstractions, evolve based on needs

### Risk 4: Timeline Slip
**Mitigation:** Приоритизировать critical tasks (1-8), остальное можно отложить

---

## Timeline Estimate

**Conservative Estimate:** 50-65 hours
**Aggressive Estimate:** 35-45 hours  
**Recommended Schedule:** 2-3 weeks (part-time work)

---

## Next Immediate Action

**Start with Task 1:** Create service dependency map from app.ts
- Open `apps/cli/app.ts`
- Identify all major functions/sections
- Map their dependencies
- Create visual dependency graph
- Determine extraction order

**Command:** Let's analyze app.ts structure together!
