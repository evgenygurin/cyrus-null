# План интеграции Codegen.com в Cyrus

## Версия: 1.0.0
## Дата: 2025-01-08

---

## Оглавление
1. [Обзор текущей архитектуры](#1-обзор-текущей-архитектуры)
2. [Видение новой архитектуры](#2-видение-новой-архитектуры)
3. [Преимущества интеграции Codegen](#3-преимущества-интеграции-codegen)
4. [Архитектурные изменения](#4-архитектурные-изменения)
5. [План реализации по фазам](#5-план-реализации-по-фазам)
6. [Технические детали](#6-технические-детали)
7. [Риски и митигации](#7-риски-и-митигации)
8. [Метрики успеха](#8-метрики-успеха)

---

## 1. Обзор текущей архитектуры

### 1.1 Текущий стек

```
Linear Issue Assignment
    ↓
EdgeWorker (Orchestrator)
    ↓
ClaudeRunner (Executor)
    ↓
Claude Code SDK (Local execution)
    ↓
Git Worktrees + Linear Comments
```

**Основные компоненты:**
- **EdgeWorker** (`packages/edge-worker/`) - оркестратор, управляет сессиями
- **ClaudeRunner** (`packages/claude-runner/`) - обёртка над Claude Code SDK
- **AgentSessionManager** - управляет Linear Agent Sessions
- **ProcedureRouter** - маршрутизация по типам задач (debugger, builder, scoper, orchestrator)

### 1.2 Ограничения текущей системы

1. **Локальная привязка**: Claude Code выполняется только локально
2. **Масштабирование**: Ограничено ресурсами одной машины
3. **Изоляция**: Git worktrees на одной файловой системе
4. **Управление инфраструктурой**: Пользователь сам настраивает окружение
5. **Стоимость**: Необходима подписка Claude Pro для каждого пользователя

---

## 2. Видение новой архитектуры

### 2.1 Гибридная модель: Cyrus как Orchestrator + Codegen как Executor

```
Linear Issue Assignment
    ↓
EdgeWorker (Cyrus Orchestrator)
    ├─→ ClaudeRunner (Local) - для лёгких задач / анализа
    └─→ CodegenExecutor (Cloud) - для выполнения кода
            ↓
        Codegen Agent API
            ↓
        Isolated Sandbox + Full Context
            ↓
        PR Creation + Linear Updates
```

### 2.2 Роли компонентов

#### Cyrus (Orchestrator Role)
- **Планирование**: Анализ issue, декомпозиция на подзадачи
- **Принятие решений**: Выбор executor'а для каждой задачи
- **Валидация**: Проверка результатов выполнения
- **Координация**: Управление зависимостями между задачами
- **Коммуникация**: Взаимодействие с Linear, GitHub

#### Codegen (Executor Role)
- **Выполнение кода**: Реализация фич, фиксы багов
- **Тестирование**: Запуск тестов, проверка корректности
- **Создание PR**: Автоматическая генерация pull requests
- **Code Review**: Анализ изменений перед отправкой
- **Документация**: Генерация/обновление документации

---

## 3. Преимущества интеграции Codegen

### 3.1 Технические преимущества

| Аспект | Текущая система (Claude Code) | С интеграцией Codegen |
|--------|--------------------------------|----------------------|
| **Изоляция** | Git worktrees на локальной машине | Изолированные sandboxes в облаке |
| **Масштабирование** | Ограничено локальными ресурсами | Параллельное выполнение множества задач |
| **Инфраструктура** | Пользователь настраивает всё сам | Managed infrastructure (SOC 2) |
| **Параллелизм** | Последовательное выполнение | Неограниченное параллельное выполнение |
| **Контекст** | Ограничен локальным репозиторием | Full context с доступом к multiple repos |
| **Интеграции** | Требует настройки MCP серверов | Встроенные интеграции (GitHub, Linear, Slack, DBs) |
| **Стоимость** | Claude Pro ($20/месяц) + инфра | Pay-per-use через Codegen |

### 3.2 Бизнес-преимущества

1. **Снижение барьера входа**: Не нужно настраивать локальное окружение
2. **Улучшенная безопасность**: SOC 2 compliant, изолированные sandboxes
3. **Прозрачность**: Execution traces, cost tracking, performance metrics
4. **Гибкость**: Выбор между локальным и облачным выполнением
5. **Надёжность**: Enterprise-grade infrastructure от Codegen

---

## 4. Архитектурные изменения

### 4.1 Новая структура пакетов

```
cyrus/
├── packages/
│   ├── core/                    # Общие типы и интерфейсы
│   ├── claude-runner/           # ✅ Остаётся (локальный executor)
│   ├── codegen-executor/        # 🆕 Новый пакет - обёртка над Codegen SDK
│   ├── executor-interface/      # 🆕 Абстракция executor'а
│   ├── task-orchestrator/       # 🆕 Логика планирования и координации
│   └── edge-worker/             # ⚡ Рефакторинг - использует executor-interface
```

### 4.2 Executor Interface (абстракция)

```typescript
// packages/executor-interface/src/types.ts

export interface ExecutionContext {
  issueId: string;
  repositoryPath: string;
  baseBranch: string;
  workingDirectory: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  mcpConfig?: Record<string, any>;
  environmentVariables?: Record<string, string>;
}

export interface ExecutionResult {
  success: boolean;
  sessionId: string;
  output: string;
  changes?: FileChange[];
  pullRequestUrl?: string;
  errorMessage?: string;
  metadata?: {
    duration?: number;
    cost?: number;
    tokensUsed?: number;
  };
}

export interface TaskExecutor {
  /**
   * Execute a task with given prompt and context
   */
  execute(
    prompt: string,
    context: ExecutionContext
  ): Promise<ExecutionResult>;

  /**
   * Stream execution progress
   */
  executeStreaming(
    prompt: string,
    context: ExecutionContext,
    onProgress: (event: ExecutionEvent) => void
  ): Promise<ExecutionResult>;

  /**
   * Check if task is still running
   */
  isRunning(): boolean;

  /**
   * Stop current execution
   */
  stop(): Promise<void>;

  /**
   * Get execution status
   */
  getStatus(sessionId: string): Promise<ExecutionStatus>;
}

export type ExecutionEvent = 
  | { type: 'message', content: string }
  | { type: 'tool-use', tool: string, input: any }
  | { type: 'error', error: Error }
  | { type: 'complete', result: ExecutionResult };

export interface ExecutionStatus {
  sessionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  currentStep?: string;
}
```

### 4.3 Codegen Executor Implementation

```typescript
// packages/codegen-executor/src/CodegenExecutor.ts

import { Agent } from 'codegen';
import type { 
  TaskExecutor, 
  ExecutionContext, 
  ExecutionResult,
  ExecutionEvent 
} from 'cyrus-executor-interface';

export class CodegenExecutor implements TaskExecutor {
  private agent: Agent;
  private activeTasks: Map<string, any> = new Map();

  constructor(config: {
    orgId: string;
    apiToken: string;
    defaultTimeout?: number;
  }) {
    this.agent = new Agent({
      org_id: config.orgId,
      token: config.apiToken,
    });
  }

  async execute(
    prompt: string,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Build comprehensive prompt with context
    const fullPrompt = this.buildPrompt(prompt, context);

    // Execute task via Codegen API
    const task = await this.agent.run({ prompt: fullPrompt });
    
    // Store active task
    this.activeTasks.set(task.id, task);

    // Poll for completion
    return this.waitForCompletion(task.id, context);
  }

  async executeStreaming(
    prompt: string,
    context: ExecutionContext,
    onProgress: (event: ExecutionEvent) => void
  ): Promise<ExecutionResult> {
    const fullPrompt = this.buildPrompt(prompt, context);
    const task = await this.agent.run({ prompt: fullPrompt });

    // Poll and emit progress events
    return this.pollWithProgress(task.id, onProgress, context);
  }

  private buildPrompt(prompt: string, context: ExecutionContext): string {
    // Compose comprehensive prompt with context
    return `
Repository: ${context.repositoryPath}
Base Branch: ${context.baseBranch}
Working Directory: ${context.workingDirectory}

Task:
${prompt}

Requirements:
- Create a pull request when work is complete
- Follow existing code patterns in the repository
- Ensure all tests pass
- Update documentation if needed
${context.allowedTools ? `- Use only these tools: ${context.allowedTools.join(', ')}` : ''}
`;
  }

  private async waitForCompletion(
    taskId: string,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const task = this.activeTasks.get(taskId);
    
    // Poll for task completion
    while (task.status !== 'completed' && task.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await task.refresh();
    }

    // Parse result
    return this.parseTaskResult(task, context);
  }

  private parseTaskResult(
    task: any,
    context: ExecutionContext
  ): ExecutionResult {
    if (task.status === 'completed') {
      return {
        success: true,
        sessionId: task.id,
        output: task.result || 'Task completed successfully',
        pullRequestUrl: this.extractPullRequestUrl(task.result),
        metadata: {
          duration: task.duration_ms,
          cost: task.cost_usd,
        }
      };
    } else {
      return {
        success: false,
        sessionId: task.id,
        output: task.error || 'Task failed',
        errorMessage: task.error,
      };
    }
  }

  async stop(): Promise<void> {
    // Codegen doesn't have stop API yet, but we can track locally
    for (const [taskId, task] of this.activeTasks) {
      // Mark as stopped locally
      this.activeTasks.delete(taskId);
    }
  }

  isRunning(): boolean {
    return this.activeTasks.size > 0;
  }

  async getStatus(sessionId: string): Promise<ExecutionStatus> {
    const task = this.activeTasks.get(sessionId);
    if (!task) {
      throw new Error(`Task ${sessionId} not found`);
    }

    await task.refresh();

    return {
      sessionId,
      status: this.mapStatus(task.status),
      currentStep: task.current_step,
    };
  }

  private mapStatus(codegenStatus: string): ExecutionStatus['status'] {
    const statusMap: Record<string, ExecutionStatus['status']> = {
      'pending': 'pending',
      'running': 'running',
      'completed': 'completed',
      'failed': 'failed',
    };
    return statusMap[codegenStatus] || 'pending';
  }
}
```

### 4.4 Task Orchestrator (новый пакет)

```typescript
// packages/task-orchestrator/src/TaskOrchestrator.ts

import type { TaskExecutor } from 'cyrus-executor-interface';
import type { ClaudeRunner } from 'cyrus-claude-runner';
import type { CodegenExecutor } from 'cyrus-codegen-executor';

export interface TaskOrchestratorConfig {
  localExecutor: ClaudeRunner;
  cloudExecutor: CodegenExecutor;
  strategy: ExecutionStrategy;
}

export type ExecutionStrategy = 
  | 'local-only'      // Только локальный Claude
  | 'cloud-only'      // Только Codegen
  | 'hybrid-smart'    // Интеллектуальный выбор
  | 'hybrid-parallel' // Параллельное выполнение (orchestrator local + execution cloud)
  | 'cost-optimized'; // Оптимизация по стоимости

export class TaskOrchestrator {
  private config: TaskOrchestratorConfig;

  constructor(config: TaskOrchestratorConfig) {
    this.config = config;
  }

  /**
   * Выбрать подходящий executor для задачи
   */
  selectExecutor(task: Task): TaskExecutor {
    switch (this.config.strategy) {
      case 'local-only':
        return this.config.localExecutor;

      case 'cloud-only':
        return this.config.cloudExecutor;

      case 'hybrid-smart':
        return this.selectSmartExecutor(task);

      case 'hybrid-parallel':
        // Orchestrator локально, execution в облаке
        return task.type === 'orchestrator' 
          ? this.config.localExecutor 
          : this.config.cloudExecutor;

      case 'cost-optimized':
        return this.selectCostOptimizedExecutor(task);

      default:
        return this.config.localExecutor;
    }
  }

  /**
   * Интеллектуальный выбор executor'а на основе характеристик задачи
   */
  private selectSmartExecutor(task: Task): TaskExecutor {
    // Задачи для локального выполнения:
    // - Анализ и планирование (orchestrator)
    // - Быстрые проверки
    // - Чтение и анализ кода
    if (
      task.type === 'orchestrator' ||
      task.estimatedComplexity === 'low' ||
      task.requiresContext === 'local-only'
    ) {
      return this.config.localExecutor;
    }

    // Задачи для облачного выполнения:
    // - Реализация фич
    // - Исправление багов
    // - Написание тестов
    // - Создание PR
    if (
      task.type === 'builder' ||
      task.type === 'debugger' ||
      task.requiresIsolation ||
      task.requiresParallelExecution
    ) {
      return this.config.cloudExecutor;
    }

    // По умолчанию - локальное выполнение
    return this.config.localExecutor;
  }

  /**
   * Выбор executor'а с оптимизацией по стоимости
   */
  private selectCostOptimizedExecutor(task: Task): TaskExecutor {
    // Простые задачи - локально (бесплатно если есть Claude Pro)
    if (task.estimatedCost < 0.1) {
      return this.config.localExecutor;
    }

    // Сложные задачи - в облако (лучше изоляция и инфраструктура)
    return this.config.cloudExecutor;
  }
}

interface Task {
  id: string;
  type: 'orchestrator' | 'builder' | 'debugger' | 'scoper';
  estimatedComplexity: 'low' | 'medium' | 'high';
  estimatedCost: number;
  requiresContext: 'local-only' | 'cloud-accessible' | 'any';
  requiresIsolation: boolean;
  requiresParallelExecution: boolean;
}
```

### 4.5 EdgeWorker Refactoring

```typescript
// packages/edge-worker/src/EdgeWorker.ts (refactored)

import { TaskOrchestrator } from 'cyrus-task-orchestrator';
import { ClaudeRunner } from 'cyrus-claude-runner';
import { CodegenExecutor } from 'cyrus-codegen-executor';

export class EdgeWorker {
  private orchestrator: TaskOrchestrator;
  private localExecutor: ClaudeRunner;
  private cloudExecutor?: CodegenExecutor;

  constructor(config: EdgeWorkerConfig) {
    // Initialize local executor (always available)
    this.localExecutor = new ClaudeRunner({
      cyrusHome: config.cyrusHome,
      workingDirectory: config.workingDirectory,
      allowedTools: config.allowedTools,
    });

    // Initialize cloud executor (if Codegen credentials provided)
    if (config.codegen?.enabled) {
      this.cloudExecutor = new CodegenExecutor({
        orgId: config.codegen.orgId,
        apiToken: config.codegen.apiToken,
      });
    }

    // Initialize orchestrator
    this.orchestrator = new TaskOrchestrator({
      localExecutor: this.localExecutor,
      cloudExecutor: this.cloudExecutor!,
      strategy: config.codegen?.strategy || 'local-only',
    });
  }

  async processIssue(issue: LinearIssue) {
    // Create task from issue
    const task = this.createTaskFromIssue(issue);

    // Select executor
    const executor = this.orchestrator.selectExecutor(task);

    console.log(`Executing task ${task.id} with ${executor.constructor.name}`);

    // Execute with streaming
    const result = await executor.executeStreaming(
      task.prompt,
      task.context,
      (event) => this.handleExecutionEvent(event, issue)
    );

    // Post result to Linear
    await this.postResultToLinear(result, issue);
  }

  private handleExecutionEvent(event: ExecutionEvent, issue: LinearIssue) {
    switch (event.type) {
      case 'message':
        console.log(`[${issue.identifier}] ${event.content}`);
        break;
      
      case 'tool-use':
        console.log(`[${issue.identifier}] Tool: ${event.tool}`);
        break;

      case 'error':
        console.error(`[${issue.identifier}] Error:`, event.error);
        break;

      case 'complete':
        console.log(`[${issue.identifier}] Complete:`, event.result);
        break;
    }
  }
}
```

---

## 5. План реализации по фазам

### Фаза 1: Foundation (2-3 недели)

**Цель**: Создать базовую инфраструктуру для интеграции Codegen

**Задачи**:
1. ✅ Создать пакет `executor-interface`
   - Определить интерфейсы `TaskExecutor`, `ExecutionContext`, `ExecutionResult`
   - Написать тесты для контрактов
   - Документировать API

2. ✅ Адаптировать `ClaudeRunner` под `TaskExecutor`
   - Создать адаптер `ClaudeExecutorAdapter implements TaskExecutor`
   - Сохранить обратную совместимость
   - Покрыть тестами

3. ✅ Создать пакет `codegen-executor`
   - Установить `codegen` SDK
   - Реализовать `CodegenExecutor implements TaskExecutor`
   - Настроить аутентификацию
   - Добавить unit-тесты

4. ✅ Обновить конфигурацию
   - Добавить секцию `codegen` в `EdgeWorkerConfig`
   - Добавить выбор стратегии выполнения
   - Обновить примеры конфигов

**Критерии приёмки**:
- [ ] Интерфейсы определены и задокументированы
- [ ] ClaudeRunner работает через адаптер
- [ ] CodegenExecutor может выполнять простые задачи
- [ ] Все тесты проходят
- [ ] Конфигурация расширена

### Фаза 2: Basic Integration (2-3 недели)

**Цель**: Интегрировать Codegen в EdgeWorker с базовой логикой выбора

**Задачи**:
1. ✅ Создать `TaskOrchestrator`
   - Реализовать стратегии выбора executor'а
   - Добавить логирование решений
   - Покрыть тестами все стратегии

2. ✅ Интегрировать в `EdgeWorker`
   - Использовать `TaskOrchestrator` для выбора executor'а
   - Обработка событий от обоих executor'ов
   - Унифицированная обработка результатов

3. ✅ Добавить телеметрию
   - Логирование выбора executor'а
   - Метрики выполнения (время, стоимость)
   - Трекинг успешности

4. ✅ Обновить CLI
   - Добавить команды для настройки Codegen
   - Показывать статус executor'ов
   - Валидация конфигурации

**Критерии приёмки**:
- [ ] EdgeWorker может выполнять задачи через оба executor'а
- [ ] Выбор executor'а работает корректно
- [ ] Логирование и метрики настроены
- [ ] CLI обновлён для работы с Codegen

### Фаза 3: Smart Orchestration (3-4 недели)

**Цель**: Реализовать интеллектуальный выбор executor'а и оптимизацию

**Задачи**:
1. ✅ Анализ задач
   - Оценка сложности задачи (используя Claude локально)
   - Определение необходимых ресурсов
   - Оценка стоимости выполнения

2. ✅ Гибридный режим
   - Orchestrator (анализ, планирование) → локально
   - Execution (реализация, тестирование) → облако
   - Валидация и merge → локально

3. ✅ Оптимизация стоимости
   - Простые задачи → локально
   - Сложные задачи → облако
   - Параллельное выполнение → облако

4. ✅ Обработка ошибок
   - Fallback с облака на локальное выполнение
   - Retry логика для Codegen API
   - Graceful degradation

**Критерии приёмки**:
- [ ] Система может анализировать сложность задач
- [ ] Гибридный режим работает корректно
- [ ] Стоимость оптимизируется автоматически
- [ ] Обработка ошибок надёжна

### Фаза 4: Advanced Features (3-4 недели)

**Цель**: Добавить продвинутые возможности и оптимизации

**Задачи**:
1. ✅ Параллельное выполнение
   - Одновременное выполнение независимых задач в Codegen
   - Управление зависимостями между задачами
   - Агрегация результатов

2. ✅ Интеграция с Codegen features
   - Использование Codegen MCP серверов
   - Доступ к execution traces
   - Cost tracking и отчётность

3. ✅ Dashboard и мониторинг
   - Веб-интерфейс для мониторинга задач
   - Статистика использования executor'ов
   - Cost breakdown по задачам

4. ✅ Документация
   - Руководство по настройке Codegen
   - Best practices для выбора executor'а
   - Troubleshooting guide

**Критерии приёмки**:
- [ ] Параллельное выполнение работает
- [ ] Codegen features интегрированы
- [ ] Dashboard развёрнут и работает
- [ ] Документация полная и актуальная

### Фаза 5: Production Ready (2-3 недели)

**Цель**: Подготовка к production использованию

**Задачи**:
1. ✅ Security audit
   - Проверка хранения credentials
   - Валидация API токенов
   - Аудит изоляции задач

2. ✅ Performance testing
   - Нагрузочное тестирование
   - Benchmark local vs cloud
   - Оптимизация узких мест

3. ✅ Migration guide
   - Инструкции по миграции существующих конфигов
   - Rollback план
   - Compatibility checklist

4. ✅ Production deployment
   - CI/CD pipeline
   - Staging environment
   - Мониторинг в production

**Критерии приёмки**:
- [ ] Security audit пройден
- [ ] Performance приемлем
- [ ] Migration guide готов
- [ ] Production deployment успешен

---

## 6. Технические детали

### 6.1 Конфигурация

```typescript
// packages/core/src/config-types.ts

export interface EdgeWorkerConfig {
  // ... existing config ...
  
  // NEW: Codegen configuration
  codegen?: {
    enabled: boolean;
    orgId: string;
    apiToken: string;
    
    // Execution strategy
    strategy: 'local-only' | 'cloud-only' | 'hybrid-smart' | 'hybrid-parallel' | 'cost-optimized';
    
    // Cost limits (optional)
    maxCostPerTask?: number;
    maxCostPerDay?: number;
    
    // Features
    features?: {
      parallelExecution?: boolean;
      useMcpServers?: boolean;
      enableTracing?: boolean;
    };
  };
}
```

### 6.2 Пример конфигурации пользователя

```json
{
  "repositories": [{
    "id": "main-repo",
    "name": "Main Repository",
    "repositoryPath": "/path/to/repo",
    "baseBranch": "main",
    "linearWorkspaceId": "workspace-123",
    "linearToken": "lin_api_...",
    "allowedTools": ["Read(**)", "Edit(**)", "Bash(git:*)", "Task"]
  }],
  
  "codegen": {
    "enabled": true,
    "orgId": "my-org-id",
    "apiToken": "codegen_token_...",
    "strategy": "hybrid-smart",
    "maxCostPerTask": 1.0,
    "maxCostPerDay": 50.0,
    "features": {
      "parallelExecution": true,
      "useMcpServers": true,
      "enableTracing": true
    }
  }
}
```

### 6.3 Prompt Engineering для Codegen

Codegen требует более структурированных промптов. Пример:

```typescript
function buildCodegenPrompt(issue: LinearIssue, context: ExecutionContext): string {
  return `
# Task: ${issue.title}

## Repository Context
- Repository: ${context.repositoryPath}
- Base Branch: ${context.baseBranch}
- Working Directory: ${context.workingDirectory}

## Issue Description
${issue.description}

## Acceptance Criteria
${issue.acceptanceCriteria || 'See description above'}

## Requirements
1. Follow existing code patterns in the repository
2. Write/update tests for your changes
3. Ensure all tests pass
4. Update documentation if needed
5. Create a pull request when complete

## Constraints
${context.allowedTools ? `- Use only these tools: ${context.allowedTools.join(', ')}` : ''}
${context.disallowedTools ? `- Do NOT use: ${context.disallowedTools.join(', ')}` : ''}

## Success Criteria
- Pull request created and tests passing
- Code follows project conventions
- Documentation updated if applicable
`;
}
```

### 6.4 Обработка результатов

```typescript
async function processCodegenResult(
  result: ExecutionResult,
  issue: LinearIssue
): Promise<void> {
  if (result.success) {
    // Extract PR URL
    const prUrl = result.pullRequestUrl;
    
    // Post to Linear
    await linearClient.commentCreate({
      issueId: issue.id,
      body: `✅ **Task completed successfully**
      
Pull Request: ${prUrl}

**Changes:**
${result.output}

**Metadata:**
- Duration: ${result.metadata?.duration}ms
- Cost: $${result.metadata?.cost?.toFixed(4)}
`,
    });

    // Update issue state
    await linearClient.issueUpdate({
      id: issue.id,
      stateId: completedStateId,
    });
  } else {
    // Post error to Linear
    await linearClient.commentCreate({
      issueId: issue.id,
      body: `❌ **Task failed**

Error: ${result.errorMessage}

Please review the error and try again.`,
    });
  }
}
```

### 6.5 Мониторинг и логирование

```typescript
// packages/task-orchestrator/src/monitoring.ts

export interface ExecutionMetrics {
  taskId: string;
  executorType: 'local' | 'cloud';
  duration: number;
  cost: number;
  tokensUsed: number;
  success: boolean;
  timestamp: Date;
}

export class MetricsCollector {
  private metrics: ExecutionMetrics[] = [];

  record(metric: ExecutionMetrics) {
    this.metrics.push(metric);
    this.persistMetrics();
  }

  getStatistics(period: 'day' | 'week' | 'month') {
    const filtered = this.filterByPeriod(period);
    
    return {
      totalTasks: filtered.length,
      successRate: filtered.filter(m => m.success).length / filtered.length,
      totalCost: filtered.reduce((sum, m) => sum + m.cost, 0),
      averageDuration: filtered.reduce((sum, m) => sum + m.duration, 0) / filtered.length,
      localVsCloud: {
        local: filtered.filter(m => m.executorType === 'local').length,
        cloud: filtered.filter(m => m.executorType === 'cloud').length,
      }
    };
  }
}
```

---

## 7. Риски и митигации

### 7.1 Технические риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Codegen API недоступен | Средняя | Высокое | Fallback на локальное выполнение |
| Codegen стоит дороже чем ожидалось | Средняя | Среднее | Cost limits, мониторинг, alerts |
| Интеграция сложнее чем планировалось | Низкая | Среднее | Постепенная миграция, hybrid режим |
| Проблемы с изоляцией в Codegen | Низкая | Высокое | Тестирование security, audit |
| Производительность хуже локального | Низкая | Среднее | Benchmark, оптимизация промптов |

### 7.2 Бизнес-риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Пользователи не хотят платить за Codegen | Средняя | Среднее | Сохранить local-only режим |
| Codegen меняет pricing | Средняя | Среднее | Гибкая архитектура, multiple executors |
| Codegen закрывается | Низкая | Высокое | Executor interface - легко заменить |

### 7.3 Операционные риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Сложность настройки для пользователей | Высокая | Среднее | Хороший UX, wizard, документация |
| Проблемы с credentials management | Средняя | Высокое | Безопасное хранение, validation |
| Debugging сложнее в облаке | Средняя | Среднее | Execution traces, детальное логирование |

---

## 8. Метрики успеха

### 8.1 Технические метрики

- **Adoption rate**: % пользователей использующих Codegen executor
- **Success rate**: % успешно выполненных задач через Codegen
- **Performance**: Среднее время выполнения задач (local vs cloud)
- **Reliability**: Uptime Codegen integration
- **Cost efficiency**: Средняя стоимость задачи

### 8.2 Бизнес-метрики

- **User satisfaction**: Feedback от пользователей
- **Feature usage**: % задач выполненных в каждом режиме
- **ROI**: Стоимость vs время сэкономленное
- **Scalability**: Количество параллельных задач

### 8.3 Целевые значения (через 3 месяца после релиза)

- ✅ 40%+ пользователей используют hybrid или cloud режим
- ✅ 90%+ success rate для Codegen tasks
- ✅ Время выполнения задач сократилось на 30%
- ✅ 95%+ uptime для Codegen integration
- ✅ 4.5+/5.0 user satisfaction score

---

## 9. Дополнительные возможности (Future Work)

### 9.1 Multiple Cloud Executors

В будущем можно добавить поддержку других cloud executor'ов:

```typescript
export interface EdgeWorkerConfig {
  executors: {
    local: ClaudeRunnerConfig;
    codegen?: CodegenExecutorConfig;
    openaiAssistants?: OpenAIAssistantsConfig;  // NEW
    customExecutor?: CustomExecutorConfig;       // NEW
  };
  
  orchestrationStrategy: {
    primary: 'local' | 'codegen' | 'openai' | 'custom';
    fallback: string[];
    rules: ExecutionRule[];
  };
}
```

### 9.2 Cost Optimization ML

Использовать ML модель для предсказания стоимости и выбора оптимального executor'а:

```typescript
export class CostOptimizerML {
  async predictCost(task: Task): Promise<CostPrediction> {
    // Train on historical data
    // Predict cost for local vs cloud execution
    // Recommend optimal executor
  }
}
```

### 9.3 Advanced Parallel Execution

Более сложная логика параллелизма:

```typescript
export class DependencyGraph {
  buildGraph(tasks: Task[]): Graph;
  optimizeExecutionOrder(): Task[][];
  executeInParallel(taskGroups: Task[][]): Promise<ExecutionResult[]>;
}
```

---

## 10. Заключение

Интеграция Codegen в Cyrus позволит создать мощную гибридную систему, где:

1. **Cyrus выступает как Orchestrator**: Анализирует задачи, декомпозирует, планирует, валидирует результаты
2. **Codegen выступает как Executor**: Выполняет код в изолированных sandbox'ах с full context
3. **Claude Code остаётся для локального выполнения**: Лёгкие задачи, анализ, быстрые проверки

Это даёт:
- ✅ Лучшую масштабируемость (параллельное выполнение в облаке)
- ✅ Улучшенную изоляцию (SOC 2 compliant sandboxes)
- ✅ Гибкость (выбор между local и cloud)
- ✅ Снижение барьера входа (не нужно настраивать локальное окружение)
- ✅ Enterprise-ready инфраструктуру

При этом сохраняется:
- ✅ Возможность работать только локально (local-only режим)
- ✅ Обратная совместимость с текущей системой
- ✅ Простота миграции (постепенное включение Codegen)

**Рекомендуемая стратегия**: Начать с **hybrid-parallel** режима, где Cyrus orchestrator (анализ, планирование, валидация) работает локально, а execution (реализация фич, фиксы багов) делегируется Codegen в облако.

---

## Приложения

### A. Сравнение стоимости

#### Сценарий 1: Solo developer
- **Текущая система**: $20/мес (Claude Pro) + server costs (~$10/мес) = **$30/мес**
- **С Codegen**: $20/мес (Claude Pro для orchestration) + Codegen pay-per-use (~$50/мес при активной разработке) = **$70/мес**
- **Выгода**: Параллельное выполнение, изолированные sandboxes, managed infrastructure

#### Сценарий 2: Small team (3-5 человек)
- **Текущая система**: $100/мес (Claude Pro + servers) × 5 = **$500/мес**
- **С Codegen**: Shared Codegen org ($200-300/мес) + Claude Pro для orchestration ($100/мес) = **$300-400/мес**
- **Выгода**: Снижение стоимости за счёт shared resources + масштабируемость

#### Сценарий 3: Enterprise team (10+ человек)
- **Текущая система**: Сложно масштабировать, требует DevOps, много инфраструктуры
- **С Codegen**: Enterprise план с SOC 2 compliance, managed infrastructure, unlimited parallelism
- **Выгода**: Значительное упрощение операций, enterprise features out of the box

### B. Примеры использования

#### Пример 1: Feature Implementation (hybrid-parallel)
```
1. [Local] Orchestrator анализирует issue → создаёт подзадачи
2. [Cloud] Builder реализует UI компонент в Codegen
3. [Cloud] Builder реализует API endpoint в Codegen (parallel)
4. [Local] Orchestrator валидирует результаты
5. [Local] Orchestrator мержит изменения и создаёт PR
```

#### Пример 2: Bug Fix (cloud)
```
1. [Cloud] Debugger в Codegen:
   - Воспроизводит баг
   - Анализирует root cause
   - Пишет тесты
   - Исправляет код
   - Создаёт PR
```

#### Пример 3: Code Review (local)
```
1. [Local] Scoper анализирует PR
2. [Local] Scoper предлагает улучшения
3. [Local] Scoper документирует findings
```

### C. CLI Commands

```bash
# Настройка Codegen
cyrus codegen setup

# Проверка статуса
cyrus status
# > Local Executor: ✅ Ready
# > Cloud Executor (Codegen): ✅ Ready (Org: my-org)
# > Strategy: hybrid-smart

# Тестирование executor'а
cyrus codegen test --task "Fix bug in auth.ts"

# Статистика использования
cyrus stats --period week
# > Total tasks: 45
# > Local: 15 (33%) | Cloud: 30 (67%)
# > Success rate: 93%
# > Total cost: $23.50
# > Avg duration: 8m 32s

# Изменение стратегии
cyrus config set codegen.strategy hybrid-parallel

# Cost limits
cyrus config set codegen.maxCostPerTask 2.0
cyrus config set codegen.maxCostPerDay 100.0
```

---

**Дата создания**: 2025-01-08  
**Автор**: Claude Code Analysis  
**Версия**: 1.0.0  
**Статус**: Draft → Требуется review команды
