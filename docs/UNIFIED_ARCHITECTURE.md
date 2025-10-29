# Cyrus: Unified Architecture

## Интегрированная архитектура с Control Panel и Codegen Executor

**Версия**: 2.0.0  
**Дата**: 2025-01-14  
**Статус**: Integrated Architecture

---

## Обзор

Данный документ описывает **единую архитектуру Cyrus**, объединяющую:

1. **Web Control Panel** (Next.js 15) - веб-интерфейс для управления и мониторинга
2. **Codegen Cloud Executor** - облачное выполнение задач через Codegen.com
3. **Hybrid Execution Model** - гибкий выбор между локальным и облачным выполнением

---

## Архитектурные Слои

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: User Interface                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Next.js 15 Control Panel (Vercel)                │  │
│  │  • Dashboard с метриками агентов                         │  │
│  │  • Управление репозиториями                              │  │
│  │  • Real-time мониторинг задач (SSE)                      │  │
│  │  • Cost tracking и analytics                             │  │
│  │  • Конфигурация Codegen executor'ов                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                          REST API
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LAYER 2: Orchestration Backend                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Next.js API Routes + Server Actions              │  │
│  │  • Repository management API                             │  │
│  │  • Agent configuration API                               │  │
│  │  • Task monitoring endpoints                             │  │
│  │  • SSE streams для real-time updates                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────┴───────────────────────────────┐  │
│  │           PostgreSQL Database (Vercel Postgres)          │  │
│  │  • Repositories (config, credentials, status)            │  │
│  │  • AgentSessions (task tracking, history)                │  │
│  │  • ExecutionMetrics (cost, duration, success rate)       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                         Webhook/NDJSON
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 3: Edge Proxy (Cloudflare)               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Cloudflare Worker (proxy-worker)            │  │
│  │  • OAuth handling (Linear, GitHub)                       │  │
│  │  • Webhook routing от Linear                             │  │
│  │  • Event streaming (NDJSON)                              │  │
│  │  • Load balancing между edge workers                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                       NDJSON Stream
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 LAYER 4: Task Orchestration                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    EdgeWorker                            │  │
│  │  • Linear event processing                               │  │
│  │  • Session management (AgentSessionManager)              │  │
│  │  • Task orchestration (TaskOrchestrator)                 │  │
│  │  • Executor selection (local vs cloud)                   │  │
│  │  • Procedure routing (orchestrator/builder/debugger)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
┌───────────────────────────┐     ┌────────────────────────────┐
│  LAYER 5A: Local Executor │     │ LAYER 5B: Cloud Executor   │
│                           │     │                            │
│  ┌──────────────────────┐│     │ ┌────────────────────────┐ │
│  │   ClaudeRunner       ││     │ │  CodegenExecutor       │ │
│  │  • Local execution   ││     │ │  • Codegen API calls   │ │
│  │  • Git worktrees     ││     │ │  • Isolated sandboxes  │ │
│  │  • Claude Code SDK   ││     │ │  • Parallel execution  │ │
│  │  • Fast iteration    ││     │ │  • Full repo context   │ │
│  │  • Zero cloud cost   ││     │ │  • SOC 2 compliance    │ │
│  └──────────────────────┘│     │ └────────────────────────┘ │
└───────────────────────────┘     └────────────────────────────┘
            │                                   │
            │                                   ▼
            │                     ┌────────────────────────────┐
            │                     │  Codegen Infrastructure    │
            │                     │  • Agent sandboxes         │
            │                     │  • Git operations          │
            │                     │  • PR creation             │
            │                     │  • Verification execution  │
            │                     └────────────────────────────┘
            │                                   │
            └───────────────┬───────────────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │   Git Repository    │
                  │   (GitHub/GitLab)   │
                  └─────────────────────┘
```

---

## Ключевые Компоненты

### 1. Next.js Control Panel (Layer 1)

**Назначение**: Web UI для управления Cyrus агентами, мониторинга задач и аналитики.

**Технологии**:

- Next.js 15 (App Router, React 19, React Compiler)
- Tailwind CSS + shadcn/ui components
- Server Components для оптимизации производительности
- Server-Sent Events (SSE) для real-time обновлений

**Основные страницы**:

```
/                          → Dashboard (overview всех агентов)
/repositories              → Список и управление репозиториями
/repositories/[id]         → Детали репозитория, активные сессии
/repositories/[id]/config  → Конфигурация агента (Codegen setup)
/sessions                  → История всех сессий
/sessions/[id]             → Детали конкретной сессии, логи
/analytics                 → Cost tracking, метрики, графики
/settings                  → OAuth setup, уведомления
```

**Ключевые функции**:

- Real-time статус агентов (online/offline/working)
- Live stream логов выполнения задач
- Cost breakdown по задачам и репозиториям
- Executor selection configuration (local/cloud/hybrid)
- Webhook management (Linear, GitHub)

### 2. Next.js Backend API (Layer 2)

**Назначение**: REST API и Server Actions для управления данными.

**Endpoints**:

```typescript
// Repository Management
GET    /api/repositories                // Список репозиториев
POST   /api/repositories                // Добавить репозиторий
GET    /api/repositories/[id]           // Детали
PATCH  /api/repositories/[id]           // Обновить config
DELETE /api/repositories/[id]           // Удалить

// Agent Sessions
GET    /api/sessions                    // Список сессий
GET    /api/sessions/[id]               // Детали сессии
GET    /api/sessions/[id]/logs          // SSE stream логов
POST   /api/sessions/[id]/feedback      // Отправить feedback агенту

// Codegen Integration
POST   /api/codegen/setup               // Настроить Codegen credentials
POST   /api/codegen/test                // Тестировать подключение
GET    /api/codegen/cost-report         // Cost breakdown

// Analytics
GET    /api/analytics/metrics           // Aggregated metrics
GET    /api/analytics/cost-trends       // Cost trends over time
```

**Server Actions**:

```typescript
// packages/control-panel/src/app/actions/
- createRepository(data)
- updateExecutorConfig(repoId, config)
- triggerManualExecution(issueId)
- retryFailedSession(sessionId)
```

**Database Schema** (PostgreSQL via Prisma):

```prisma
model Repository {
  id                String   @id @default(cuid())
  name              String
  path              String
  baseBranch        String   @default("main")
  linearWorkspaceId String
  linearToken       String   @encrypted
  githubToken       String?  @encrypted
  
  // Codegen configuration
  codegenEnabled    Boolean  @default(false)
  codegenOrgId      String?
  codegenToken      String?  @encrypted
  executionStrategy String   @default("local-only") // local-only | cloud-only | hybrid-smart
  maxCostPerTask    Float?
  maxCostPerDay     Float?
  
  // Relations
  sessions          AgentSession[]
  metrics           ExecutionMetric[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model AgentSession {
  id                String   @id @default(cuid())
  repositoryId      String
  repository        Repository @relation(fields: [repositoryId], references: [id])
  
  linearIssueId     String
  linearIssueTitle  String
  agentType         String   // orchestrator | builder | debugger | scoper
  executorType      String   // local | cloud
  
  status            String   // pending | running | completed | failed
  startedAt         DateTime?
  completedAt       DateTime?
  
  // Codegen-specific
  codegenSessionId  String?  @unique
  workspacePath     String?
  
  // Results
  verificationPassed Boolean?
  pullRequestUrl    String?
  errorMessage      String?
  
  // Metrics
  duration          Int?     // seconds
  cost              Float?   // USD
  tokensUsed        Int?
  
  // Relations
  metrics           ExecutionMetric[]
  logs              SessionLog[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model ExecutionMetric {
  id               String   @id @default(cuid())
  repositoryId     String
  repository       Repository @relation(fields: [repositoryId], references: [id])
  sessionId        String
  session          AgentSession @relation(fields: [sessionId], references: [id])
  
  metricType       String   // duration | cost | tokens | success_rate
  value            Float
  timestamp        DateTime @default(now())
  
  metadata         Json?    // Additional context
}

model SessionLog {
  id          String   @id @default(cuid())
  sessionId   String
  session     AgentSession @relation(fields: [sessionId], references: [id])
  
  level       String   // info | warning | error | debug
  message     String
  metadata    Json?
  timestamp   DateTime @default(now())
}
```

### 3. Cloudflare Edge Proxy (Layer 3)

**Назначение**: Обработка OAuth, webhooks и роутинг событий.

**Функции** (без изменений из существующей архитектуры):

- Linear OAuth flow
- GitHub OAuth flow
- Webhook ingestion от Linear
- NDJSON event streaming к EdgeWorker'ам
- Load balancing между несколькими worker'ами

### 4. EdgeWorker + TaskOrchestrator (Layer 4)

**Назначение**: Оркестрация выполнения задач, выбор executor'а.

**Обновления для Codegen интеграции**:

```typescript
// packages/edge-worker/src/EdgeWorker.ts

export class EdgeWorker {
  private orchestrator: TaskOrchestrator;
  private localExecutor: ClaudeRunner;
  private cloudExecutor?: CodegenExecutor;
  private controlPanelClient: ControlPanelClient; // NEW

  constructor(config: EdgeWorkerConfig) {
    // Initialize executors
    this.localExecutor = new ClaudeRunner({ ... });
    
    if (config.codegen?.enabled) {
      this.cloudExecutor = new CodegenExecutor({
        orgId: config.codegen.orgId,
        apiToken: config.codegen.apiToken,
      });
    }

    // Initialize orchestrator
    this.orchestrator = new TaskOrchestrator({
      localExecutor: this.localExecutor,
      cloudExecutor: this.cloudExecutor,
      strategy: config.codegen?.strategy || 'local-only',
    });

    // NEW: Initialize Control Panel client
    this.controlPanelClient = new ControlPanelClient({
      apiUrl: config.controlPanelUrl,
      apiKey: config.controlPanelApiKey,
    });
  }

  async processIssue(issue: LinearIssue) {
    // Create task from issue
    const task = this.createTaskFromIssue(issue);

    // Select executor (local vs cloud)
    const executor = this.orchestrator.selectExecutor(task);

    console.log(`[${issue.identifier}] Executing with ${executor.constructor.name}`);

    // NEW: Create session in Control Panel database
    const session = await this.controlPanelClient.createSession({
      repositoryId: this.config.repositoryId,
      linearIssueId: issue.id,
      linearIssueTitle: issue.title,
      agentType: task.type,
      executorType: executor === this.localExecutor ? 'local' : 'cloud',
      status: 'running',
    });

    try {
      // Execute with streaming
      const result = await executor.executeStreaming(
        task.prompt,
        task.context,
        (event) => this.handleExecutionEvent(event, session.id)
      );

      // NEW: Update session with result
      await this.controlPanelClient.updateSession(session.id, {
        status: result.success ? 'completed' : 'failed',
        completedAt: new Date(),
        verificationPassed: result.success,
        pullRequestUrl: result.pullRequestUrl,
        errorMessage: result.errorMessage,
        duration: result.metadata?.duration,
        cost: result.metadata?.cost,
        tokensUsed: result.metadata?.tokensUsed,
      });

      // Post result to Linear
      await this.postResultToLinear(result, issue);

    } catch (error) {
      // NEW: Update session with error
      await this.controlPanelClient.updateSession(session.id, {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error.message,
      });
      throw error;
    }
  }

  private async handleExecutionEvent(event: ExecutionEvent, sessionId: string) {
    // NEW: Stream logs to Control Panel (SSE)
    await this.controlPanelClient.appendLog(sessionId, {
      level: this.getLogLevel(event.type),
      message: this.formatEventMessage(event),
      metadata: event,
    });

    // Existing logging
    switch (event.type) {
      case 'message':
        console.log(`[Session ${sessionId}] ${event.content}`);
        break;
      case 'tool-use':
        console.log(`[Session ${sessionId}] Tool: ${event.tool}`);
        break;
      case 'error':
        console.error(`[Session ${sessionId}] Error:`, event.error);
        break;
    }
  }
}
```

**TaskOrchestrator** (без изменений - см. `refactor/CODEGEN_INTEGRATION_PLAN.md`):

- Интерфейс `TaskExecutor`
- Стратегии выбора: `local-only`, `cloud-only`, `hybrid-smart`, `hybrid-parallel`, `cost-optimized`
- Логика анализа сложности задач
- Cost estimation и tracking

### 5A. Local Executor (Layer 5A)

**ClaudeRunner** (без изменений):

- Локальное выполнение через Claude Code SDK
- Git worktrees для изоляции
- Быстрые итерации
- Нулевая облачная стоимость
- Используется для: orchestration, analysis, validation, quick checks

### 5B. Cloud Executor (Layer 5B)

**CodegenExecutor** (новый пакет):

- Интеграция с Codegen API
- Изолированные sandboxes (SOC 2 compliant)
- Параллельное выполнение множества задач
- Full repository context
- Автоматическое создание PR
- Используется для: feature implementation, bug fixes, testing

**Ключевые методы**:

```typescript
// packages/codegen-executor/src/CodegenExecutor.ts

export class CodegenExecutor implements TaskExecutor {
  async execute(prompt: string, context: ExecutionContext): Promise<ExecutionResult> {
    // 1. Create Codegen agent session
    const task = await this.agent.run({
      prompt: this.buildPrompt(prompt, context),
      repository: context.repositoryPath,
      baseBranch: context.baseBranch,
    });

    // 2. Poll for completion
    return this.waitForCompletion(task.id, context);
  }

  async executeStreaming(
    prompt: string,
    context: ExecutionContext,
    onProgress: (event: ExecutionEvent) => void
  ): Promise<ExecutionResult> {
    const task = await this.agent.run({ ... });

    // Poll and emit events
    return this.pollWithProgress(task.id, onProgress, context);
  }

  private async waitForCompletion(taskId: string): Promise<ExecutionResult> {
    // Poll Codegen API until task completes
    while (task.status !== 'completed' && task.status !== 'failed') {
      await sleep(5000);
      await task.refresh();
    }

    return this.parseTaskResult(task);
  }

  private parseTaskResult(task: CodegenTask): ExecutionResult {
    return {
      success: task.status === 'completed',
      sessionId: task.id,
      output: task.result || 'Task completed',
      pullRequestUrl: this.extractPullRequestUrl(task.result),
      metadata: {
        duration: task.duration_ms,
        cost: task.cost_usd,
        tokensUsed: task.tokens_used,
      }
    };
  }
}
```

---

## Execution Flow (Unified)

### Сценарий: Feature Implementation (Hybrid Mode)

```
1. [Linear] Issue assigned to Cyrus agent
   └─→ Webhook sent to Cloudflare proxy

2. [Cloudflare] Proxy routes event via NDJSON stream
   └─→ EdgeWorker receives event

3. [EdgeWorker] Creates task, analyzes complexity
   ├─→ [Control Panel DB] Create AgentSession record (status: pending)
   └─→ [TaskOrchestrator] Selects executor based on task type

4A. [Orchestrator Task - LOCAL] 
    ├─→ ClaudeRunner analyzes issue locally
    ├─→ Creates sub-issues in Linear
    ├─→ [Control Panel] Update session (status: running, executorType: local)
    └─→ Returns orchestration plan

4B. [Builder/Debugger Tasks - CLOUD]
    ├─→ CodegenExecutor creates Codegen session
    ├─→ [Control Panel] Create AgentSession for each sub-issue (executorType: cloud)
    ├─→ [Codegen] Executes in isolated sandbox
    ├─→ [Control Panel] Stream logs via SSE to UI
    ├─→ [Codegen] Creates PR when complete
    └─→ Returns execution result

5. [EdgeWorker - LOCAL] Verification
   ├─→ ClaudeRunner validates results locally
   ├─→ Merges PR if validation passes
   ├─→ [Control Panel] Update session (status: completed, metrics)
   └─→ Posts results to Linear

6. [Control Panel UI] Real-time updates
   ├─→ Dashboard shows task completion
   ├─→ Cost updated in analytics
   └─→ Notification sent (optional)
```

---

## Key Integrations

### Control Panel ↔ EdgeWorker

**Communication Method**: REST API + Database

**Data Flow**:

```
EdgeWorker → Control Panel:
- Create session records (POST /api/sessions)
- Update session status (PATCH /api/sessions/[id])
- Append logs (POST /api/sessions/[id]/logs)
- Record metrics (POST /api/metrics)

Control Panel → EdgeWorker:
- Manual task trigger (POST /api/sessions → webhook to EdgeWorker)
- Configuration updates (via database, polled by EdgeWorker)
- Feedback to running sessions (POST /api/sessions/[id]/feedback)
```

**Implementation**:

```typescript
// packages/control-panel-client/src/ControlPanelClient.ts

export class ControlPanelClient {
  constructor(config: { apiUrl: string; apiKey: string }) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  async createSession(data: CreateSessionData): Promise<AgentSession> {
    return this.post('/api/sessions', data);
  }

  async updateSession(id: string, data: UpdateSessionData): Promise<void> {
    return this.patch(`/api/sessions/${id}`, data);
  }

  async appendLog(sessionId: string, log: SessionLogData): Promise<void> {
    return this.post(`/api/sessions/${sessionId}/logs`, log);
  }

  async recordMetric(metric: MetricData): Promise<void> {
    return this.post('/api/metrics', metric);
  }
}
```

### Control Panel ↔ Codegen

**Communication Method**: Через CodegenExecutor (EdgeWorker вызывает Codegen API)

**Control Panel отображает**:

- Codegen session IDs
- Workspace paths (если accessible)
- Cost per session
- Verification results

**Не нужно прямое подключение** Control Panel → Codegen API (всё идёт через EdgeWorker).

---

## Configuration Management

### User Configuration Flow

```
1. User opens Control Panel → /settings
2. Navigates to Codegen Setup
3. Enters credentials:
   - Organization ID
   - API Token
4. Selects execution strategy:
   - local-only (default)
   - cloud-only
   - hybrid-smart (recommended)
   - hybrid-parallel
   - cost-optimized
5. Sets cost limits (optional):
   - Max cost per task: $1.00
   - Max cost per day: $50.00
6. Saves configuration
7. Control Panel:
   - Encrypts sensitive data
   - Stores in PostgreSQL (Repository table)
   - Triggers EdgeWorker config reload (via webhook or polling)
8. EdgeWorker:
   - Reads updated config from database
   - Initializes CodegenExecutor with new credentials
   - Updates TaskOrchestrator strategy
```

### Configuration Schema

```typescript
// packages/core/src/config-types.ts

export interface RepositoryConfig {
  id: string;
  name: string;
  repositoryPath: string;
  baseBranch: string;
  linearWorkspaceId: string;
  linearToken: string; // encrypted
  githubToken?: string; // encrypted

  // Codegen configuration
  codegen?: {
    enabled: boolean;
    orgId: string;
    apiToken: string; // encrypted
    strategy: 'local-only' | 'cloud-only' | 'hybrid-smart' | 'hybrid-parallel' | 'cost-optimized';
    maxCostPerTask?: number;
    maxCostPerDay?: number;
    features?: {
      parallelExecution?: boolean;
      useMcpServers?: boolean;
      enableTracing?: boolean;
    };
  };

  // Control Panel integration
  controlPanel?: {
    enabled: boolean;
    apiUrl: string;
    apiKey: string; // encrypted
  };
}
```

---

## Deployment Architecture

### Infrastructure Stack

```
┌──────────────────────────────────────────────────────────┐
│                     Production Stack                      │
└──────────────────────────────────────────────────────────┘

┌────────────────────┐
│  Vercel (Frontend) │
│  • Next.js 15 app  │
│  • Static assets   │
│  • API routes      │
│  • SSE endpoints   │
└──────────┬─────────┘
           │
           ├──→ ┌─────────────────────┐
           │    │ Vercel Postgres     │
           │    │ • Repositories      │
           │    │ • AgentSessions     │
           │    │ • ExecutionMetrics  │
           │    │ • SessionLogs       │
           │    └─────────────────────┘
           │
           └──→ ┌─────────────────────┐
                │ Vercel Blob Storage │
                │ • Session logs      │
                │ • Verification imgs │
                │ • Cost reports      │
                └─────────────────────┘

┌────────────────────┐
│ Cloudflare Workers │
│ • proxy-worker     │
│ • OAuth handling   │
│ • Webhook routing  │
└──────────┬─────────┘
           │
           └──→ ┌─────────────────────┐
                │ Cloudflare KV       │
                │ • OAuth tokens      │
                │ • Session cache     │
                └─────────────────────┘

┌────────────────────┐
│  User's Machine    │
│  • EdgeWorker CLI  │
│  • ClaudeRunner    │
│  • Git worktrees   │
└────────────────────┘

┌────────────────────┐
│  Codegen.com       │
│  • Agent sandboxes │
│  • Task execution  │
│  • PR creation     │
└────────────────────┘
```

### Environment Variables

```bash
# Control Panel (Vercel)
NEXT_PUBLIC_APP_URL=https://cyrus-panel.vercel.app
DATABASE_URL=postgres://...
BLOB_READ_WRITE_TOKEN=...

LINEAR_OAUTH_CLIENT_ID=...
LINEAR_OAUTH_CLIENT_SECRET=...
GITHUB_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_SECRET=...

PROXY_WEBHOOK_SECRET=...  # For EdgeWorker communication

# EdgeWorker (User's Machine)
CYRUS_CONFIG_PATH=~/.cyrus/config.json
CONTROL_PANEL_URL=https://cyrus-panel.vercel.app
CONTROL_PANEL_API_KEY=...

# Codegen (via EdgeWorker)
CODEGEN_ORG_ID=...
CODEGEN_API_TOKEN=...
```

---

## Cost Model

### Estimated Costs (Monthly)

**Control Panel Infrastructure**:

- Vercel Hobby: $0 (для personal use)
- Vercel Pro: $20/месяц (для teams)
- Vercel Postgres: $0-20/месяц (зависит от usage)
- Vercel Blob: $0.15/GB storage + $0.20/GB bandwidth

**EdgeWorker (User's Machine)**:

- $0 (runs locally)

**Executors**:

- Local (ClaudeRunner): $0 (требует Claude Pro $20/месяц)
- Cloud (Codegen): Pay-per-use (~$0.50-2.00 per task)

**Total Monthly Cost Examples**:

| Scenario | Control Panel | Executors | Total |
|----------|---------------|-----------|-------|
| Solo dev (local-only) | $0-20 Vercel | $20 Claude Pro | $20-40 |
| Solo dev (hybrid) | $0-20 Vercel | $20 + $50 Codegen | $70-90 |
| Small team (5 people) | $20 Vercel Pro | Shared Codegen $200 | $220 |
| Enterprise | $20 + $50 DB/Blob | Enterprise Codegen | Custom |

---

## Security Considerations

### Data Encryption

**At Rest**:

- PostgreSQL: All sensitive fields encrypted (tokens, API keys)
- Vercel Blob: Encrypted by default
- Local config: `~/.cyrus/config.json` encrypted

**In Transit**:

- TLS 1.3 для всех HTTP connections
- Websockets (SSE) over HTTPS
- Git operations over SSH

### Authentication & Authorization

**Control Panel**:

- OAuth 2.0 (Linear, GitHub)
- Session cookies (httpOnly, secure, sameSite)
- API keys для EdgeWorker communication (stored encrypted)

**EdgeWorker**:

- Linear API tokens (scoped permissions)
- GitHub tokens (scoped to specific repos)
- Codegen API tokens (scoped to org)

**Isolation**:

- Codegen sandboxes: Isolated containers (SOC 2 compliant)
- Git worktrees: Separate directories per issue
- Database: Row-level security policies (RLS) в Postgres

### Audit Logging

Все действия логируются:

- Session creation/updates
- Configuration changes
- Cost spending
- Failed verifications
- Security events (failed auth, rate limiting)

---

## Monitoring & Observability

### Metrics Collected

**System Metrics**:

- EdgeWorker status (online/offline/working)
- Executor availability (local/cloud)
- Active sessions count
- Queue depth

**Performance Metrics**:

- Task duration (avg, p50, p95, p99)
- Verification success rate
- PR creation rate
- Error rate

**Cost Metrics**:

- Cost per task (local vs cloud)
- Daily/weekly/monthly spending
- Cost per repository
- Cost per agent type (orchestrator/builder/debugger)

**User Experience Metrics**:

- Time to first response
- Time to completion
- User satisfaction (via feedback)

### Alerts

```typescript
// Alert conditions
interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  action: 'email' | 'slack' | 'webhook';
}

// Example alerts
const alerts: AlertRule[] = [
  {
    name: 'High Cost Alert',
    condition: 'daily_cost > maxCostPerDay',
    threshold: 0.9, // 90% of limit
    action: 'email',
  },
  {
    name: 'Low Success Rate',
    condition: 'success_rate < 0.8',
    threshold: 0.8,
    action: 'slack',
  },
  {
    name: 'EdgeWorker Offline',
    condition: 'worker_status === "offline"',
    threshold: 1,
    action: 'webhook',
  },
];
```

### Dashboards

**Main Dashboard** (`/`):

- Active agents count
- Running tasks (real-time)
- Success rate (last 24h)
- Total cost (last 24h)
- Recent activity feed

**Analytics Dashboard** (`/analytics`):

- Cost trends (line chart)
- Executor usage (pie chart: local vs cloud)
- Task duration distribution (histogram)
- Success rate by agent type (bar chart)

**Repository Dashboard** (`/repositories/[id]`):

- Repository-specific metrics
- Active sessions
- Cost per repository
- Recent PRs created

---

## Migration Path

### For Existing Cyrus Users

**Phase 1: Add Control Panel (Optional)**

```bash
1. User continues using CLI: `cyrus` (nothing changes)
2. User deploys Control Panel to Vercel (optional)
3. User configures EdgeWorker to report to Control Panel:
   ~/.cyrus/config.json:
   {
     "controlPanel": {
       "enabled": true,
       "apiUrl": "https://my-cyrus-panel.vercel.app",
       "apiKey": "generated-api-key"
     }
   }
4. EdgeWorker starts sending metrics to Control Panel
5. User can now monitor via web UI (but CLI still works)
```

**Phase 2: Enable Codegen (Optional)**

```bash
1. User opens Control Panel → /repositories/[id]/config
2. Enables Codegen:
   - Enter Codegen org ID
   - Enter Codegen API token
   - Select strategy: hybrid-smart
3. Saves config
4. EdgeWorker reads new config from database
5. Next task will use Codegen if appropriate
6. User can monitor cost in /analytics
```

**Phase 3: Full Adoption**

```bash
1. User is now using:
   - Control Panel for monitoring
   - Hybrid execution (local + cloud)
   - Cost tracking
   - Real-time logs
2. Can switch strategies anytime via Control Panel UI
3. Can disable Codegen anytime (falls back to local)
```

### Backward Compatibility

**100% backward compatible**:

- ✅ CLI works without Control Panel
- ✅ Local-only mode works without Codegen
- ✅ All existing configs supported
- ✅ No breaking changes

---

## Roadmap

### Phase 1: Foundation (Q1 2025)

- ✅ Next.js Control Panel deployment
- ✅ PostgreSQL schema and API
- ✅ EdgeWorker → Control Panel integration
- ✅ Basic monitoring dashboard

### Phase 2: Codegen Integration (Q2 2025)

- ✅ CodegenExecutor implementation
- ✅ TaskOrchestrator with hybrid strategies
- ✅ Cost tracking and analytics
- ✅ Control Panel Codegen configuration UI

### Phase 3: Advanced Features (Q3 2025)

- ⏳ Parallel execution (multiple Codegen sessions)
- ⏳ Advanced analytics (ML-based cost prediction)
- ⏳ Custom alert rules
- ⏳ Slack/Discord integrations

### Phase 4: Enterprise (Q4 2025)

- ⏳ Multi-tenant support
- ⏳ Team management (RBAC)
- ⏳ Audit logs and compliance
- ⏳ Enterprise SSO

---

## Appendix

### A. Package Structure

```
cyrus/
├── apps/
│   ├── cli/                    # CLI application (existing)
│   ├── control-panel/          # NEW: Next.js web UI
│   └── proxy/                  # Cloudflare proxy (existing)
│
├── packages/
│   ├── core/                   # Shared types (existing)
│   ├── claude-runner/          # Local executor (existing)
│   ├── codegen-executor/       # NEW: Cloud executor
│   ├── executor-interface/     # NEW: Unified executor interface
│   ├── task-orchestrator/      # NEW: Orchestration logic
│   ├── control-panel-client/   # NEW: API client for EdgeWorker
│   ├── edge-worker/            # Orchestrator (updated)
│   └── ndjson-client/          # NDJSON streaming (existing)
```

### B. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15, React 19, Tailwind CSS, shadcn/ui | Control Panel UI |
| Backend API | Next.js API Routes, Server Actions | REST API |
| Database | PostgreSQL (Vercel Postgres), Prisma ORM | Data persistence |
| Real-time | Server-Sent Events (SSE) | Live logs streaming |
| Authentication | OAuth 2.0 (Linear, GitHub) | User auth |
| Proxy | Cloudflare Workers | Webhook routing |
| Orchestration | EdgeWorker (TypeScript) | Task management |
| Local Executor | Claude Code SDK | Local execution |
| Cloud Executor | Codegen API | Cloud execution |
| Monitoring | Custom metrics + Vercel Analytics | Observability |

### C. API Reference

См. полный API reference в:

- `docs/CONTROL_PANEL_ARCHITECTURE.md` (Database schema, API endpoints)
- `refactor/CODEGEN_INTEGRATION_PLAN.md` (Executor interface, TaskOrchestrator)

---

**Document Version**: 2.0.0  
**Last Updated**: 2025-01-14  
**Status**: Integrated Architecture - Ready for Implementation  
**Authors**: Claude Code Integration Team
