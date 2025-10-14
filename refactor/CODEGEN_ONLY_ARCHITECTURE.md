# Пересмотр архитектуры: Codegen-Only подход

## Версия: 2.0.0
## Дата: 2025-01-08
## Статус: Рекомендуется для review

---

## 🎯 Ключевой вопрос

**Почему нам нужен локальный executor (Claude Code), если Codegen может делать всё?**

Codegen предоставляет:
- ✅ Множество моделей (Claude, GPT, Gemini, Grok)
- ✅ Встроенные MCP интеграции (Linear, GitHub, Slack, databases)
- ✅ Unified dashboard для управления
- ✅ Cost tracking и execution traces
- ✅ SOC 2 compliant infrastructure

**Вывод после анализа:** Вы правы! Гибридная архитектура может быть **преждевременной оптимизацией**.

---

## 📊 Анализ: Локальный vs Cloud-only

### Аргументы ЗА локальный executor

| Фактор | Преимущество | Реальность |
|--------|--------------|------------|
| **Скорость** | Мгновенный отклик | Но нужно измерить: сколько вызовов в фазе планирования? |
| **Стоимость** | $20/мес Claude Pro vs pay-per-use | Но нужно посчитать реальные расходы при типичной нагрузке |
| **Независимость** | Работает без интернета | Но Cyrus всё равно требует Linear/GitHub API |
| **Контроль** | Полный контроль окружения | Но Codegen даёт execution traces и logs |

### Аргументы ЗА Codegen-only

| Фактор | Преимущество | Важность |
|--------|--------------|----------|
| **Простота** | Единая архитектура, один executor | 🔥 Критично для MVP |
| **Unified Dashboard** | Всё в одном месте | 🔥 Отличный UX |
| **Встроенные интеграции** | MCP servers из коробки | 🔥 Экономия времени |
| **No Setup** | Пользователю не нужно настраивать локально | 🔥 Снижение барьера входа |
| **Multi-model** | Выбор модели под задачу | ⭐ Гибкость |
| **Managed Infra** | SOC 2, security, scaling | ⭐ Enterprise-ready |

---

## 💡 Ключевые инсайты

### Инсайт 1: "Thinking Tax" (налог на размышление)

**Вопрос:** Сколько LLM вызовов происходит в фазе планирования?

```
Сценарий А: Простая задача ("fix linting errors")
├─ Анализ issue: 1 вызов
├─ Планирование подхода: 1 вызов
└─ Выполнение: N вызовов
Итого планирование: 2 вызова × 200-500ms = 400-1000ms overhead

Сценарий Б: Сложная задача ("refactor auth system")
├─ Анализ issue: 1 вызов
├─ Декомпозиция на подзадачи: 2-3 вызова
├─ Анализ зависимостей: 1-2 вызова
├─ Планирование порядка: 1 вызов
└─ Выполнение подзадач: N вызовов
Итого планирование: 5-7 вызовов × 200-500ms = 1-3.5s overhead
```

**Критический вопрос:** Приемлема ли задержка 1-3.5 секунды для начала работы?

**Мой ответ:** Скорее всего, ДА. Пользователи ждут минуты на выполнение задач, 1-3 секунды на старт - незаметно.

### Инсайт 2: Экономика

**Пример расчёта:**

```
Предположения:
- 50 задач в день
- 5 вызовов на планирование на задачу
- $0.02 за вызов (средняя стоимость для Claude Sonnet через API)

Расчёт:
50 задач × 5 вызовов × $0.02 = $5/день = $150/месяц только на планирование

Сравнение:
- Локальный Claude Pro: $20/месяц (unlimited)
- Codegen planning overhead: $150/месяц
- Разница: $130/месяц

НО! Нужно учесть:
+ Codegen экономит время разработки интеграций
+ Codegen экономит время на инфраструктуре
+ Codegen даёт unified dashboard
+ Codegen включает cost tracking и monitoring
```

**Вывод:** Если учесть экономию времени разработки, $130/месяц overhead может быть приемлем для упрощения архитектуры.

### Инсайт 3: Парадокс простоты

```
Гибридная архитектура:
├─ Complexity: Два executor'а, синхронизация, fallback logic
├─ Код: executor-interface, адаптеры, orchestrator
└─ Конфигурация: Настройка двух систем

Codegen-only архитектура:
├─ Complexity: Управление API вызовами, rate limits, caching
├─ Код: Один executor, но нужна оптимизация API usage
└─ Конфигурация: Настройка одной системы

Где сложность меньше?
```

**Вывод:** Сложность не исчезает, она **перемещается**. Но Codegen-only проще в **начальной реализации**.

### Инсайт 4: Development Experience

```
Разработка с локальным executor:
✅ Мгновенный feedback loop
✅ Отладка без network latency
✅ Работает без интернета
❌ Нужно поддерживать две системы

Разработка с Codegen-only:
✅ Единая система для разработки и production
✅ Реальное окружение на всех этапах
❌ Latency при каждом тесте
❌ Зависимость от API availability
```

**Вывод:** Для dev experience локальный executor лучше, но это **не критично** если Codegen latency приемлема.

---

## 🎯 Рекомендация: Staged Migration (поэтапная миграция)

### Стратегия: "Начни просто, усложняй по необходимости"

```
Phase 1: Codegen-Only MVP (2-3 месяца)
├─ Цель: Валидировать core концепцию
├─ Архитектура: Единый Codegen executor для всего
├─ Преимущества: Быстрый MVP, простая архитектура
└─ Риски: Может быть медленно или дорого

↓ Сбор метрик

Phase 2: Monitor & Analyze (1-2 месяца)
├─ Метрики: Cost per task, latency, user satisfaction
├─ Анализ: Где bottlenecks? Где high costs?
├─ Решение: Нужна ли оптимизация?
└─ Триггеры для Phase 3: Cost > $200/мес ИЛИ latency > 2s ИЛИ user complaints

↓ Если нужно

Phase 3: Add Local Orchestrator (опционально)
├─ Цель: Оптимизация узких мест
├─ Архитектура: Hybrid (local planning + cloud execution)
├─ Преимущества: Оптимизировано на основе данных
└─ Scope: Только для bottlenecks, не везде
```

### Почему эта стратегия лучше?

1. **Устраняет преждевременную оптимизацию**
   - Не строим сложную архитектуру "на всякий случай"
   - Оптимизируем только доказанные проблемы

2. **Реальные данные → лучшие решения**
   - Узнаём реальные паттерны использования
   - Оптимизируем там, где это действительно нужно

3. **Faster time-to-market**
   - MVP за 2-3 месяца вместо 4-5
   - Быстрее получаем feedback от пользователей

4. **Проще для команды**
   - Меньше кода для поддержки
   - Меньше архитектурной сложности
   - Проще onboarding новых разработчиков

---

## 🏗️ Упрощённая архитектура (Codegen-Only)

### Структура пакетов

```
cyrus/
├── packages/
│   ├── core/                    # Общие типы
│   ├── codegen-executor/        # 🆕 Единственный executor
│   └── edge-worker/             # ⚡ Упрощённый - работает с одним executor'ом
```

**Что УДАЛЯЕМ:**
- ❌ `executor-interface` - не нужна абстракция для одного executor'а
- ❌ `task-orchestrator` - не нужен выбор executor'а
- ❌ `claude-runner` - не используется

**Что УПРОЩАЕТСЯ:**
- ✅ `edge-worker` - работает напрямую с `CodegenExecutor`
- ✅ `core` - меньше конфигурации, убираем strategy selection
- ✅ Конфигурация - только Codegen credentials, без выбора режимов

### Codegen Executor (единственный)

```typescript
// packages/codegen-executor/src/CodegenExecutor.ts

import { Agent } from 'codegen';

export class CodegenExecutor {
  private agent: Agent;
  private config: CodegenConfig;

  constructor(config: CodegenConfig) {
    this.agent = new Agent({
      org_id: config.orgId,
      token: config.apiToken,
    });
    this.config = config;
  }

  async execute(prompt: string, context: ExecutionContext): Promise<ExecutionResult> {
    // Build prompt with full context
    const fullPrompt = this.buildPrompt(prompt, context);

    // Execute via Codegen API
    const task = await this.agent.run({
      prompt: fullPrompt,
      model: this.selectModel(context),
      mcp_servers: this.configureMCPServers(context),
    });

    // Wait for completion
    return this.waitForCompletion(task.id);
  }

  private selectModel(context: ExecutionContext): string {
    // Smart model selection based on task type
    if (context.taskType === 'orchestrator') {
      return 'claude-3-5-sonnet'; // Fast, smart for planning
    } else if (context.taskType === 'builder') {
      return 'claude-3-opus'; // Powerful for implementation
    } else {
      return 'claude-3-5-sonnet'; // Default balanced
    }
  }

  private configureMCPServers(context: ExecutionContext): MCPServerConfig[] {
    // Codegen already has Linear, GitHub, etc. built-in
    // Just configure what's needed
    return [
      { name: 'linear', enabled: true },
      { name: 'github', enabled: true },
      // Add custom MCP servers if needed
      ...context.customMCPServers,
    ];
  }
}
```

### EdgeWorker (упрощённый)

```typescript
// packages/edge-worker/src/EdgeWorker.ts

import { CodegenExecutor } from 'cyrus-codegen-executor';

export class EdgeWorker {
  private executor: CodegenExecutor;

  constructor(config: EdgeWorkerConfig) {
    // Single executor initialization
    this.executor = new CodegenExecutor({
      orgId: config.codegen.orgId,
      apiToken: config.codegen.apiToken,
    });
  }

  async processIssue(issue: LinearIssue) {
    console.log(`Processing issue ${issue.identifier} with Codegen`);

    // Execute directly - no executor selection logic
    const result = await this.executor.execute(
      this.buildPrompt(issue),
      {
        issueId: issue.id,
        taskType: this.determineTaskType(issue),
        repositoryPath: this.getRepositoryPath(issue),
        // ... other context
      }
    );

    // Post result to Linear
    await this.postResultToLinear(result, issue);
  }

  private determineTaskType(issue: LinearIssue): TaskType {
    // Simple heuristic to determine task type
    if (issue.labels.some(l => l.name === 'Bug')) return 'debugger';
    if (issue.labels.some(l => l.name === 'Feature')) return 'builder';
    if (issue.parent) return 'builder'; // Sub-task
    return 'orchestrator'; // Parent task
  }
}
```

### Конфигурация (упрощённая)

```typescript
// packages/core/src/config-types.ts

export interface EdgeWorkerConfig {
  // Repository configuration (unchanged)
  repositories: RepositoryConfig[];

  // SIMPLIFIED: Only Codegen config, no strategy selection
  codegen: {
    enabled: true; // Always enabled in Codegen-only architecture
    orgId: string;
    apiToken: string;

    // Cost limits (optional)
    maxCostPerTask?: number;
    maxCostPerDay?: number;

    // Model preferences (optional)
    defaultModel?: 'claude-3-opus' | 'claude-3-5-sonnet' | 'gpt-4' | 'gemini-pro';
    modelByTaskType?: {
      orchestrator?: string;
      builder?: string;
      debugger?: string;
      scoper?: string;
    };
  };
}
```

**Пример конфига пользователя:**

```json
{
  "repositories": [{
    "id": "main-repo",
    "repositoryPath": "/path/to/repo",
    "linearToken": "lin_api_...",
    "allowedTools": ["Read(**)", "Edit(**)", "Bash(git:*)"]
  }],

  "codegen": {
    "enabled": true,
    "orgId": "my-org-id",
    "apiToken": "codegen_token_...",
    "maxCostPerTask": 2.0,
    "maxCostPerDay": 100.0,
    "defaultModel": "claude-3-5-sonnet"
  }
}
```

---

## 📊 Сравнение подходов

### Архитектурная сложность

| Аспект | Гибридная (v1) | Codegen-Only (v2) |
|--------|----------------|-------------------|
| **Пакеты** | 6 packages | 3 packages |
| **LOC** | ~5000 строк | ~2000 строк |
| **Конфигурация** | Сложная (стратегии, выбор) | Простая (один executor) |
| **Тестирование** | Двойное (local + cloud) | Одиночное (cloud) |
| **Deployment** | Сложный (две системы) | Простой (одна система) |

### Time-to-Market

| Milestone | Гибридная (v1) | Codegen-Only (v2) |
|-----------|----------------|-------------------|
| **MVP** | 12-17 недель | 6-8 недель |
| **Beta** | +4 недели | +2 недели |
| **Production** | ~5 месяцев | ~2.5 месяца |

### Стоимость разработки

| Фаза | Гибридная (v1) | Codegen-Only (v2) |
|------|----------------|-------------------|
| **Development** | 3-4 месяца × 2 dev | 1.5-2 месяца × 2 dev |
| **Testing** | 4 недели | 2 недели |
| **Documentation** | 2 недели | 1 неделя |
| **Total** | ~4 месяца | ~2 месяца |

### Операционная стоимость (monthly)

| Item | Гибридная (v1) | Codegen-Only (v2) |
|------|----------------|-------------------|
| **Claude Pro** | $20 (для local) | $0 (не нужен) |
| **Codegen** | ~$100 (только execution) | ~$200 (всё) |
| **Infrastructure** | $0 (local) | $0 (managed) |
| **Total** | ~$120/мес | ~$200/мес |

**Но!** Нужно учесть:
- Codegen-only: экономия времени разработки = $10-20k
- Гибридная: экономия на API calls = $80-100/мес
- **ROI:** Codegen-only окупается экономией dev time

---

## 🚀 План реализации (Codegen-Only)

### Фаза 1: Foundation (3-4 недели)

**Цель:** Базовая интеграция Codegen

**Задачи:**
1. ✅ Создать `packages/codegen-executor`
   - Установить Codegen SDK
   - Реализовать базовый `CodegenExecutor`
   - Model selection logic
   - MCP configuration

2. ✅ Упростить `packages/edge-worker`
   - Убрать абстракции executor'ов
   - Прямое использование `CodegenExecutor`
   - Task type determination

3. ✅ Обновить `packages/core`
   - Упрощённая конфигурация (только Codegen)
   - Убрать strategy selection

4. ✅ CLI команды
   - `cyrus codegen setup` - интерактивная настройка
   - `cyrus status` - показать статус Codegen
   - `cyrus stats` - статистика использования

**Deliverable:** MVP работает через Codegen

**Метрики успеха:**
- [ ] Может обрабатывать простые issues
- [ ] Cost tracking работает
- [ ] Логирование настроено
- [ ] CLI удобен для настройки

### Фаза 2: Optimization (2-3 недели)

**Цель:** Оптимизация производительности и стоимости

**Задачи:**
1. ✅ Smart model selection
   - Выбор модели на основе task type
   - Кэширование решений о моделях
   - A/B тестирование моделей

2. ✅ Prompt optimization
   - Оптимизация промптов для меньшего количества токенов
   - Кэширование контекста где возможно
   - Использование Codegen's prompt templates

3. ✅ Rate limiting & retry
   - Graceful handling API limits
   - Exponential backoff
   - Queue management

4. ✅ Cost monitoring
   - Real-time cost tracking
   - Alerts при превышении лимитов
   - Cost breakdown по repository/issue

**Deliverable:** Оптимизированная система

**Метрики успеха:**
- [ ] Latency < 2s для начала задачи
- [ ] Cost < $200/мес при 50 tasks/day
- [ ] 95%+ uptime
- [ ] < 5% failed tasks

### Фаза 3: Advanced Features (2-3 недели)

**Цель:** Production-ready features

**Задачи:**
1. ✅ Dashboard integration
   - Использование Codegen dashboard
   - Custom metrics в Codegen
   - Alerts and notifications

2. ✅ Multi-model support
   - GPT-4 для определённых задач
   - Gemini для мультимодальности
   - Claude для coding

3. ✅ Custom MCP servers
   - Интеграция custom tools
   - Repository-specific servers
   - Testing framework for MCPs

4. ✅ Advanced orchestration
   - Sub-task management через Codegen
   - Dependency tracking
   - Parallel execution optimization

**Deliverable:** Production-ready система

**Метрики успеха:**
- [ ] Все features работают
- [ ] User satisfaction > 4.5/5
- [ ] Documentation complete
- [ ] Security audit passed

### Фаза 4: Production Launch (1-2 недели)

**Цель:** Stable production release

**Задачи:**
1. ✅ Security audit
2. ✅ Performance testing
3. ✅ User documentation
4. ✅ Migration guide (from any existing system)
5. ✅ Monitoring setup
6. ✅ Support workflow

**Deliverable:** v1.0.0 release

---

## 🔄 Когда добавлять Local Executor?

### Триггеры для добавления гибридного режима:

```
IF any of:
  1. Monthly Codegen cost > $300
  2. Average planning latency > 3 seconds
  3. API rate limiting causes >5% task failures
  4. User feedback: "too slow to start"
  5. Offline mode required by customers

THEN:
  Consider adding local executor for orchestration phase
ELSE:
  Stay with Codegen-only (it's working!)
```

### Как добавить later (если нужно):

```typescript
// Phase 1: Add executor interface (abstraction layer)
interface TaskExecutor {
  execute(prompt, context): Promise<ExecutionResult>;
}

// Phase 2: Create adapters
class CodegenExecutor implements TaskExecutor { ... }
class LocalExecutor implements TaskExecutor { ... }

// Phase 3: Add orchestrator with selection logic
class TaskOrchestrator {
  selectExecutor(task): TaskExecutor {
    if (task.type === 'orchestrator') return this.localExecutor;
    return this.codegenExecutor;
  }
}

// Phase 4: Update EdgeWorker to use orchestrator
```

**Важно:** Это всё можно добавить **позже**, не нужно строить сейчас "на всякий случай".

---

## 💡 Финальная рекомендация

### ✅ Рекомендуется: Codegen-Only Architecture

**Обоснование:**

1. **Проще разработать** - меньше кода, меньше абстракций
2. **Быстрее запустить** - 2-3 месяца до MVP vs 4-5 месяцев
3. **Проще поддерживать** - единая система, меньше complexity
4. **Лучше для пользователей** - нет настройки локального окружения
5. **Enterprise-ready** - SOC 2, managed infra из коробки
6. **Валидирует концепцию** - можно быстро получить feedback

**Можно добавить local executor позже**, если данные покажут необходимость.

### 🎯 Стратегия

```
1. [NOW] Build Codegen-only MVP (2-3 месяца)
   ↓
2. [MONITOR] Collect metrics (1-2 месяца)
   ↓
3. [DECIDE] Based on data:
   - If cost/latency OK → Stay Codegen-only ✅
   - If bottlenecks → Add local executor for specific cases
```

### 📋 Updated Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **1. Foundation** | 3-4 weeks | MVP with Codegen |
| **2. Optimization** | 2-3 weeks | Optimized performance & cost |
| **3. Advanced Features** | 2-3 weeks | Production-ready |
| **4. Launch** | 1-2 weeks | v1.0.0 |
| **Total** | **8-12 weeks** | ~2-3 months |

**Сравните с гибридной:** 12-17 недель → экономия 4-5 недель!

---

## 🤝 Что делать с существующей документацией?

### Оставить как reference

- Гибридная архитектура может понадобиться позже
- Документация содержит ценные insights
- Можно использовать как "Plan B"

### Создать новый primary план

- Этот документ = primary recommendation
- Старый план = "Alternative: Hybrid Architecture"
- В README указать: "Start with Codegen-only (recommended)"

---

## 📚 Дополнительные материалы

1. **Этот документ** - primary recommendation (Codegen-only)
2. **CODEGEN_INTEGRATION_PLAN.md** - alternative (Hybrid architecture)
3. **CODEGEN_ARCHITECTURE_DIAGRAMS.md** - diagrams (применимы к обоим)

---

**Дата:** 2025-01-08  
**Версия:** 2.0.0  
**Статус:** Recommended for Team Review  
**Автор:** Architecture Analysis + User Insight

**Ключевое изменение:** Упрощение архитектуры на основе анализа реальных возможностей Codegen и принципа "не оптимизируй преждевременно".
