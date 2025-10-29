# Service Dependency Graph - app.ts Analysis

**Date:** January 14, 2025  
**Version:** 1.0  
**File Analyzed:** `apps/cli/app.ts` (2067 lines)

## Executive Summary

The `app.ts` file is a monolithic 2067-line application that combines:
- CLI command routing
- OAuth flow handling
- Stripe subscription management
- Git worktree operations
- EdgeWorker orchestration
- HTTP-based token validation

This document provides a comprehensive dependency map to guide the extraction of services following Clean Architecture principles.

---

## 1. High-Level Function Map

### 1.1 Main Application Class: `EdgeApp`

The `EdgeApp` class (lines 113-1629) is the core of the application with these responsibilities:

#### Configuration Management
- `getEdgeConfigPath()` (line 126) - Returns `~/.cyrus/config.json` path
- `getLegacyEdgeConfigPath()` (line 133) - Returns legacy `.edge-config.json` path
- `migrateConfigIfNeeded()` (line 140) - Migrates from legacy to new config location
- `loadEdgeConfig()` (line 185) - Loads and parses config, strips promptTemplatePath
- `saveEdgeConfig()` (line 219) - Saves config to `~/.cyrus/config.json`

#### Interactive Setup
- `setupRepositoryWizard()` (lines 234-337) - Interactive CLI wizard for repository setup
  - Prompts: repository path, name, base branch
  - Creates repository configuration object
  - Sets default allowedTools and labelPrompts

#### OAuth Flow (Complex - High Priority for Extraction)
- `startOAuthFlow()` (lines 342-396) - Starts OAuth authorization flow
  - **External Dependency:** Opens browser with `open` package
  - **External API:** Calls `${proxyUrl}/oauth/authorize`
  - **Internal:** Uses SharedApplicationServer to receive callback
  - **Returns:** `LinearCredentials` (linearToken, linearWorkspaceId, linearWorkspaceName)

#### Ngrok Configuration
- `getNgrokAuthToken()` (lines 401-473) - Prompts user for ngrok auth token
  - Checks `CYRUS_HOST_EXTERNAL` environment variable
  - Saves token to config

#### EdgeWorker Management
- `startEdgeWorker()` (lines 478-663) - Starts EdgeWorker with configuration
  - **Complex Handler:** `createWorkspace` callback (line 521)
  - **Complex Handler:** `onOAuthCallback` callback (line 527)
  - **Dependencies:** EdgeWorker, SharedApplicationServer

#### Subscription Management (Stripe - High Priority for Extraction)
- `checkSubscriptionStatus()` (lines 668-699) - Validates subscription with Cyrus API
  - **External API:** `https://www.atcyrus.com/api/subscription-status`
  - **HTTP Method:** GET with customerId query param
- `validateCustomerId()` (line 704) - Validates customer ID format (must start with "cus_")
- `handleSubscriptionFailure()` (lines 715-740) - Displays error message and exits
- `validateAndHandleSubscription()` (lines 745-765) - Validates subscription and handles failure

#### User Interaction
- `askQuestion()` (lines 770-782) - Prompts user for input via readline

#### Main Application Flow
- `start()` (lines 787-1146) - Main application entry point
  - Validates subscription for default proxy
  - Handles initial setup wizard
  - Configures repositories
  - Starts EdgeWorker
  - Sets up signal handlers (SIGINT, SIGTERM, uncaughtException, unhandledRejection)

#### Git Operations (Complex - High Priority for Extraction)
- `branchExists()` (lines 1151-1177) - Checks if branch exists locally or remotely
  - **External Dependency:** Executes `git rev-parse` and `git ls-remote`
- `createGitWorktree()` (lines 1328-1610) - Creates git worktree for an issue
  - **Complex Logic:** Parent issue branch detection
  - **External Dependency:** Executes multiple git commands
  - **Setup Scripts:** Runs global and repository setup scripts

#### Setup Script Execution
- `runSetupScript()` (lines 1228-1323) - Executes setup scripts with proper error handling
  - Supports: `.sh`, `.ps1`, `.cmd`, `.bat`
  - Cross-platform (Windows, Unix)
  - Timeout: 5 minutes

#### Event Handling
- `setupEventHandlers()` (lines 1182-1223) - Sets up EdgeWorker event handlers
  - Events: session:started, session:ended, connected, disconnected, error

#### Shutdown
- `shutdown()` (lines 1615-1628) - Graceful shutdown

### 1.2 Helper Functions (Global Scope)

#### Token Validation
- `checkLinearToken()` (lines 1632-1660) - Validates Linear token via GraphQL API
  - **External API:** `https://api.linear.app/graphql`
  - **Query:** `{ viewer { id email name } }`
  - **Returns:** `{ valid: boolean, error?: string }`

### 1.3 CLI Commands

#### check-tokens Command
- `checkTokensCommand()` (lines 1663-1686)
  - Loads config
  - Validates each repository's Linear token
  - **External Dependency:** `checkLinearToken()`

#### refresh-token Command
- `refreshTokenCommand()` (lines 1689-1842)
  - Shows token status for all repositories
  - Prompts user for which token to refresh
  - **Complex Logic:** Starts temporary HTTP server to receive OAuth callback
  - **External Dependency:** `open` package, `checkLinearToken()`
  - **Updates:** All repositories that share the same token

#### add-repository Command
- `addRepositoryCommand()` (lines 1845-1909)
  - Reuses existing Linear credentials if available
  - Otherwise, starts OAuth flow
  - Calls `setupRepositoryWizard()`
  - Saves updated config

#### set-customer-id Command
- `setCustomerIdCommand()` (lines 1912-1961)
  - Validates customer ID format
  - **External Dependency:** `validateAndHandleSubscription()`
  - Saves customer ID to config

#### billing Command
- `billingCommand()` (lines 1964-2015)
  - Checks if customer ID exists
  - Opens Stripe billing portal in browser
  - **External Dependency:** `open` package
  - **URL:** `https://www.atcyrus.com/billing/${customerId}`

---

## 2. Dependency Graph

### 2.1 External Dependencies

#### Node.js Built-ins
```
fs: copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync
node:http: createServer
node:os: homedir
node:path: basename, dirname, resolve, join
node:readline: createInterface
node:url: fileURLToPath
node:child_process: execSync
```

#### npm Packages
```
@linear/sdk: Issue (type)
cyrus-core: DEFAULT_PROXY_URL, EdgeConfig, EdgeWorkerConfig, RepositoryConfig
cyrus-edge-worker: EdgeWorker, SharedApplicationServer
dotenv: config
open: open() - Opens URLs in default browser
```

#### External APIs
```
1. Cyrus API (Stripe proxy)
   - GET https://www.atcyrus.com/api/subscription-status
   - Response: { hasActiveSubscription, status, requiresPayment, isReturningCustomer }

2. Linear GraphQL API
   - POST https://api.linear.app/graphql
   - Query: { viewer { id email name } }
   - Authorization header: Linear token

3. Proxy OAuth API
   - GET ${proxyUrl}/oauth/authorize?callback=${callbackUrl}
   - Returns: linearToken, linearWorkspaceId, linearWorkspaceName
```

### 2.2 Internal Service Boundaries

#### Service 1: ConfigService (Already Exists ✅)
**Location:** `packages/core/src/application/services/ConfigService.ts`  
**Status:** Phase 1 Complete  
**Used by:** All services

#### Service 2: OAuthService (To Extract)
**Current Location:** `app.ts` lines 342-396, 1689-1842  
**Dependencies:**
- `IHttpClient` (to create)
- `IConfigService` (exists)
- `open` package
- `node:http` (temporary server for callback)

**Methods to Extract:**
```typescript
startOAuthFlow(proxyUrl: string): Promise<LinearCredentials>
exchangeCodeForToken(code: string): Promise<LinearToken>
validateToken(token: LinearToken): Promise<boolean>
revokeToken(token: LinearToken): Promise<void>
```

**External APIs:**
- `${proxyUrl}/oauth/authorize`
- Linear GraphQL API (for validation)

#### Service 3: SubscriptionService (To Extract)
**Current Location:** `app.ts` lines 668-765  
**Dependencies:**
- `IHttpClient` (to create)
- `IConfigService` (exists)
- `StripeCustomerId` value object (exists)

**Methods to Extract:**
```typescript
checkSubscriptionStatus(customerId: string): Promise<SubscriptionStatus>
validateCustomerId(customerId: string): void
handleSubscriptionFailure(status: SubscriptionStatus): never
validateAndHandleSubscription(customerId: string): Promise<void>
```

**External APIs:**
- `https://www.atcyrus.com/api/subscription-status`

#### Service 4: WorktreeService (To Extract)
**Current Location:** `app.ts` lines 1151-1610  
**Dependencies:**
- `IGitClient` (to create)
- `IConfigService` (exists)
- `node:child_process` (wrapped by GitClient)

**Methods to Extract:**
```typescript
createWorktree(issue: Issue, repository: RepositoryConfig): Promise<WorktreeInfo>
removeWorktree(worktreePath: string): Promise<void>
listWorktrees(repositoryPath: string): Promise<WorktreeInfo[]>
cleanupStaleWorktrees(repositoryPath: string, maxAge: number): Promise<void>
branchExists(branchName: string, repoPath: string): Promise<boolean>
```

**Complex Logic:**
- Parent issue branch detection (lines 1401-1439)
- Remote vs local branch preference (lines 1460-1520)
- Setup script execution (lines 1535-1594)

#### Service 5: SetupScriptService (To Extract - Optional)
**Current Location:** `app.ts` lines 1228-1323  
**Dependencies:**
- `node:child_process` (execSync)
- `node:fs` (existsSync, statSync)
- `node:os` (homedir)

**Methods to Extract:**
```typescript
runSetupScript(scriptPath: string, scriptType: string, workspacePath: string, issue: Issue): Promise<void>
findSetupScript(repositoryPath: string): Promise<string | null>
```

#### Service 6: HttpClient (To Create)
**Location:** `packages/core/src/infrastructure/http/`  
**Purpose:** Abstract HTTP requests  
**Used by:**
- OAuthService
- SubscriptionService
- TokenValidationService

**Interface:**
```typescript
interface IHttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}
```

**Features:**
- Retry logic with exponential backoff
- Timeout handling
- Error transformation (HTTP errors → domain errors)

#### Service 7: GitClient (To Create)
**Location:** `packages/core/src/infrastructure/git/`  
**Purpose:** Abstract git CLI operations  
**Used by:**
- WorktreeService

**Interface:**
```typescript
interface IGitClient {
  clone(url: string, targetDir: string): Promise<void>;
  createWorktree(branch: string, path: string): Promise<void>;
  removeWorktree(path: string): Promise<void>;
  listWorktrees(): Promise<WorktreeInfo[]>;
  checkout(branch: string): Promise<void>;
  getCurrentBranch(): Promise<string>;
  branchExists(branchName: string): Promise<boolean>;
  fetch(remote: string): Promise<void>;
}
```

---

## 3. Service Extraction Order (Topological Sort)

### Phase 1: Infrastructure Layer (Week 1)

**Priority 1: HttpClient (Critical)**
- **No dependencies** on other services
- **Blocks:** OAuthService, SubscriptionService
- **Complexity:** Medium
- **Estimated time:** 3-4 hours

**Priority 2: GitClient (Critical)**
- **No dependencies** on other services
- **Blocks:** WorktreeService
- **Complexity:** High (git command complexity)
- **Estimated time:** 4-5 hours

### Phase 2: Application Services - Authentication (Week 1-2)

**Priority 3: OAuthService (Critical)**
- **Dependencies:** HttpClient, ConfigService
- **Blocks:** TokenRefreshService, SubscriptionService setup
- **Complexity:** High (OAuth flow, browser opening, callback server)
- **Estimated time:** 5-6 hours
- **Used in commands:** `start`, `refresh-token`, `add-repository`

**Priority 4: TokenRefreshService (High)**
- **Dependencies:** OAuthService, ConfigService
- **Blocks:** Nothing (can be done in parallel with others)
- **Complexity:** Medium
- **Estimated time:** 3-4 hours
- **Used in commands:** `refresh-token`

### Phase 3: Application Services - Billing (Week 2)

**Priority 5: SubscriptionService (High)**
- **Dependencies:** HttpClient, ConfigService
- **Blocks:** Nothing (can be done in parallel)
- **Complexity:** Medium
- **Estimated time:** 4-5 hours
- **Used in commands:** `start`, `set-customer-id`, `billing`

### Phase 4: Application Services - Git (Week 2-3)

**Priority 6: SetupScriptService (Medium - Optional)**
- **Dependencies:** ConfigService
- **Blocks:** WorktreeService
- **Complexity:** Low
- **Estimated time:** 2-3 hours
- **Note:** Can be integrated directly into WorktreeService

**Priority 7: WorktreeService (Critical)**
- **Dependencies:** GitClient, SetupScriptService (optional), ConfigService
- **Blocks:** Nothing
- **Complexity:** Very High (complex branching logic, parent detection)
- **Estimated time:** 5-6 hours
- **Used in:** EdgeWorker `createWorkspace` handler

### Phase 5: Command Layer (Week 3)

**Priority 8: Extract CLI Commands (High)**
- **Dependencies:** All services above
- **Blocks:** app.ts refactoring
- **Complexity:** Low-Medium per command
- **Estimated time:** 3-4 hours total

Commands to extract:
1. `CheckTokensCommand` - Uses OAuthService
2. `RefreshTokenCommand` - Uses OAuthService, ConfigService
3. `AddRepositoryCommand` - Uses OAuthService, ConfigService
4. `SetCustomerIdCommand` - Uses SubscriptionService, ConfigService
5. `BillingCommand` - Uses SubscriptionService, ConfigService
6. `StartCommand` (main) - Uses all services

### Phase 6: Main Application (Week 3)

**Priority 9: Refactor app.ts to Orchestration Layer (Critical)**
- **Dependencies:** All services and commands above
- **Goal:** Reduce app.ts to < 300 lines
- **Complexity:** High (integration and routing)
- **Estimated time:** 6-8 hours

---

## 4. Data Flow Diagram

### 4.1 OAuth Flow

```
User → CLI Command (start/refresh-token/add-repository)
  ↓
EdgeApp.startOAuthFlow(proxyUrl)
  ↓
Opens browser → ${proxyUrl}/oauth/authorize?callback=${callbackUrl}
  ↓
User authorizes in Linear
  ↓
Proxy redirects → http://localhost:3456/callback?token=lin_oauth_xxx...
  ↓
SharedApplicationServer receives callback
  ↓
Extracts token, validates it
  ↓
Returns LinearCredentials to EdgeApp
  ↓
Saves to config.json
```

**To Extract:**
1. Browser opening → remains in command (UI concern)
2. HTTP callback server → extract to OAuthService
3. Token validation → extract to OAuthService
4. Token persistence → use ConfigService

### 4.2 Subscription Validation Flow

```
User starts app with default proxy
  ↓
EdgeApp checks if customer ID exists
  ↓
EdgeApp.validateAndHandleSubscription(customerId)
  ↓
EdgeApp.checkSubscriptionStatus(customerId)
  ↓
HTTP GET → https://www.atcyrus.com/api/subscription-status?customerId=cus_xxx
  ↓
Returns { hasActiveSubscription, status, requiresPayment, isReturningCustomer }
  ↓
If requiresPayment: EdgeApp.handleSubscriptionFailure() → exits
  ↓
Otherwise: continues startup
```

**To Extract:**
1. HTTP request → extract to HttpClient
2. Validation logic → extract to SubscriptionService
3. Error handling → use SubscriptionError from domain layer

### 4.3 Worktree Creation Flow

```
EdgeWorker receives issue assignment
  ↓
Calls createWorkspace handler
  ↓
EdgeApp.createGitWorktree(issue, repository)
  ↓
1. Verify git repository (git rev-parse --git-dir)
2. Sanitize branch name (remove backticks)
3. Check if worktree already exists
4. Check if branch exists (git rev-parse --verify)
5. Check for parent issue
   ↓
   If parent exists:
     ↓
     Check if parent branch exists
     ↓
     If yes: use parent branch as base
     ↓
     If no: use repository.baseBranch
6. Fetch latest changes (git fetch origin)
7. Determine worktree command:
   - If creating new branch: check remote vs local
   - If existing branch: just checkout
8. Execute git worktree add
9. Run global setup script (if configured)
10. Run repository setup script (if exists)
  ↓
Returns { path, isGitWorktree }
```

**To Extract:**
1. Git commands → extract to GitClient
2. Parent detection → WorktreeService business logic
3. Setup scripts → SetupScriptService (or inline in WorktreeService)

---

## 5. Critical Dependencies Matrix

| Service | Depends On | Blocks | External APIs | Complexity |
|---------|-----------|--------|---------------|-----------|
| **HttpClient** | None | OAuthService, SubscriptionService | None (infrastructure) | Medium |
| **GitClient** | None | WorktreeService | None (infrastructure) | High |
| **OAuthService** | HttpClient, ConfigService | TokenRefreshService | Proxy OAuth, Linear API | High |
| **SubscriptionService** | HttpClient, ConfigService | None | Cyrus Subscription API | Medium |
| **TokenRefreshService** | OAuthService, ConfigService | None | Same as OAuthService | Medium |
| **SetupScriptService** | ConfigService | WorktreeService | None | Low |
| **WorktreeService** | GitClient, SetupScriptService, ConfigService | None | None | Very High |
| **CLI Commands** | All of the above | app.ts refactoring | None | Low-Medium |
| **app.ts refactor** | All of the above | None | None | High |

---

## 6. Risky Areas & Mitigation

### 6.1 OAuth Flow Complexity
**Risk:** Multiple failure points (browser, callback server, token validation)  
**Mitigation:**
- Comprehensive error handling
- Retry logic in HttpClient
- Clear error messages to user
- Mock IHttpClient in tests

### 6.2 Git Worktree Parent Detection
**Risk:** Complex branching logic with remote vs local checks  
**Mitigation:**
- Extract to small, testable methods in WorktreeService
- Mock IGitClient for all git operations
- Test matrix: parent branch exists remotely/locally/not at all

### 6.3 Setup Script Execution
**Risk:** Cross-platform differences (Windows, Unix, shell types)  
**Mitigation:**
- Comprehensive path handling
- Timeout protection (5 minutes)
- Continue on failure (don't block worktree creation)

### 6.4 HTTP Client Retry Logic
**Risk:** Could make app feel slow or unresponsive  
**Mitigation:**
- Exponential backoff with max retries (3)
- User feedback ("Retrying...")
- Configurable timeouts

---

## 7. Recommended Extraction Sequence

### Week 1: Infrastructure Foundation
1. **HttpClient** (3-4h) - Foundation for all HTTP services
2. **GitClient** (4-5h) - Foundation for WorktreeService
3. **OAuthService** (5-6h) - Critical for authentication

**Deliverable:** 3 services with 100% test coverage

### Week 2: Application Services
4. **TokenRefreshService** (3-4h) - Builds on OAuthService
5. **SubscriptionService** (4-5h) - Parallel with above
6. **SetupScriptService** (2-3h) - Simple, prepares for WorktreeService
7. **WorktreeService** (5-6h) - Most complex service

**Deliverable:** 4 more services with 100% test coverage

### Week 3: Command Layer & Integration
8. **Extract CLI Commands** (3-4h) - Thin wrappers
9. **Refactor app.ts** (6-8h) - Orchestration layer
10. **Integration Testing** (4-5h) - E2E scenarios
11. **Documentation** (3-4h) - Update all docs

**Deliverable:** app.ts < 300 lines, all commands extracted, full integration

---

## 8. Success Metrics

### Code Metrics
- **app.ts reduced:** From 2067 lines → < 300 lines (85% reduction)
- **Services created:** 7 new services
- **Test coverage:** 100% for all new services
- **New tests:** 100+ unit/integration tests

### Quality Metrics
- **Cyclomatic complexity:** < 10 per method
- **Coupling:** Loose (all dependencies via interfaces)
- **Cohesion:** High (single responsibility per service)

### Performance Metrics
- **Startup time:** < 1 second (no regression)
- **OAuth flow:** < 5 seconds
- **Worktree creation:** < 3 seconds

---

## 9. Next Immediate Actions

1. ✅ **Task 1 Complete:** Dependency mapping done
2. 🟡 **Task 2 Next:** Create HttpClient abstraction
   - Location: `packages/core/src/infrastructure/http/`
   - Files: `IHttpClient.ts`, `FetchHttpClient.ts`, `FetchHttpClient.test.ts`
   - Estimated: 3-4 hours

---

**Document Status:** ✅ Complete  
**Review Status:** Pending team review  
**Next Update:** After Task 2 (HttpClient) completion
