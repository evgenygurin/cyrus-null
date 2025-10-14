# Team Briefing: Codegen Integration

**Дата:** 2025-01-08  
**Для:** Development Team  
**От:** Architecture Analysis  
**Тема:** План интеграции Codegen.com в Cyrus

---

## 🎯 TL;DR

Предлагается превратить Cyrus из монолитного агента в **интеллектуальную оркестрационную платформу**, где:

- **Cyrus = Orchestrator** (планирование, координация, валидация)
- **Codegen = Cloud Executor** (выполнение в изолированных sandboxes)
- **Claude Code = Local Executor** (быстрые задачи, анализ)

**Результат:**
- 🚀 2x+ быстрее (параллельное выполнение)
- 🔒 SOC 2 compliant изоляция
- 📈 Неограниченная масштабируемость
- 🔄 100% обратная совместимость

---

## 📋 Что нужно знать

### 1. Проблема, которую решаем

**Текущие ограничения:**
- Последовательное выполнение (1 issue за раз на машину)
- Ограничено ресурсами одной машины
- Пользователь настраивает всё сам (инфраструктура, окружение)
- Нет изоляции между задачами (git worktrees на одной FS)

**Запрос:**
> "Тоесть мы используем Codgen в качестве исполнителя, а Cyrus выступает тут как руководитель/оркестратор"

### 2. Решение

**Архитектурное разделение ролей:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Linear Issue Assigned                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Cyrus Orchestrator   │
              │  • Analyze issue       │
              │  • Break into tasks    │
              │  • Select executor     │
              │  • Validate results    │
              └────────┬───────────────┘
                       │
       ┌───────────────┴────────────────┐
       │                                │
       ▼                                ▼
┌──────────────┐              ┌──────────────────┐
│   Local      │              │     Cloud        │
│  (Claude)    │              │   (Codegen)      │
│              │              │                  │
│ • Fast       │              │ • Isolated       │
│ • Free       │              │ • Parallel       │
│ • Control    │              │ • Scalable       │
└──────────────┘              └──────────────────┘
```

**Ключевая абстракция - TaskExecutor:**
```typescript
interface TaskExecutor {
  execute(prompt: string, context: ExecutionContext): Promise<ExecutionResult>;
  executeStreaming(...): Promise<ExecutionResult>;
  isRunning(): boolean;
  stop(): Promise<void>;
}

// Реализации:
- ClaudeExecutorAdapter (local)
- CodegenExecutor (cloud)
- [Future] OpenAIAssistantsExecutor, CustomExecutor, ...
```

---

## 🏗️ Изменения в архитектуре

### Новые пакеты

```
cyrus/
├── packages/
│   ├── executor-interface/      # 🆕 Абстракция executor'а
│   ├── codegen-executor/        # 🆕 Codegen SDK wrapper
│   ├── task-orchestrator/       # 🆕 Логика выбора executor'а
│   ├── claude-runner/           # ⚡ Адаптируется под interface
│   └── edge-worker/             # ⚡ Использует orchestrator
```

### Изменения в существующих пакетах

**edge-worker:**
- Добавляется `TaskOrchestrator` для выбора executor'а
- Обработка событий от обоих executor'ов унифицируется
- Конфигурация расширяется секцией `codegen`

**claude-runner:**
- Создаётся `ClaudeExecutorAdapter implements TaskExecutor`
- Сохраняется полная обратная совместимость
- Текущее API не меняется

**core:**
- Добавляются типы для конфигурации Codegen
- Расширяется `EdgeWorkerConfig`

---

## 📅 Timeline

**Общая длительность:** 12-17 недель (~3-4 месяца)

| Фаза | Длительность | Deliverable |
|------|--------------|-------------|
| **1. Foundation** | 2-3 недели | Базовая инфраструктура, Codegen может выполнять простые задачи |
| **2. Basic Integration** | 2-3 недели | EdgeWorker использует оба executor'а |
| **3. Smart Orchestration** | 3-4 недели | Интеллектуальный выбор executor'а |
| **4. Advanced Features** | 3-4 недели | Параллелизм, мониторинг, dashboard |
| **5. Production Ready** | 2-3 недели | Security audit, тестирование, релиз |

**Целевая версия:** v0.2.0

---

## 💰 Бизнес-кейс

### Сравнение стоимости

**Solo developer:**
- Current: $30/мес (Claude Pro + server)
- With Codegen: $70/мес
- **ROI:** 2x faster execution, managed infrastructure

**Small team (5 people):**
- Current: $500/мес (5 × setup)
- With Codegen: $300-400/мес (shared org)
- **Savings:** 20-40%

**Enterprise (10+ people):**
- Current: High complexity (DevOps, infra management)
- With Codegen: Low complexity, SOC 2 compliant, unlimited scale

### Преимущества

| Аспект | Текущее | С Codegen |
|--------|---------|-----------|
| **Execution** | Последовательно | Параллельно (unlimited) |
| **Isolation** | Git worktrees | SOC 2 sandboxes |
| **Setup** | User manages all | Managed infrastructure |
| **Scalability** | Limited by machine | Unlimited |
| **Security** | Good | Enterprise (SOC 2) |

---

## 🔧 Технические детали

### Executor Selection Logic

```typescript
class TaskOrchestrator {
  selectExecutor(task: Task): TaskExecutor {
    switch (this.strategy) {
      case 'local-only':
        return this.localExecutor;
        
      case 'cloud-only':
        return this.cloudExecutor;
        
      case 'hybrid-smart':
        // Orchestrator tasks → local
        if (task.type === 'orchestrator') return this.localExecutor;
        
        // Execution tasks → cloud
        if (task.type === 'builder' || task.type === 'debugger')
          return this.cloudExecutor;
          
        // Default: local
        return this.localExecutor;
        
      case 'hybrid-parallel':
        // Orchestration local, execution cloud
        return task.type === 'orchestrator' 
          ? this.localExecutor 
          : this.cloudExecutor;
    }
  }
}
```

### Configuration

```typescript
// Existing config (работает как раньше)
{
  "repositories": [{
    "id": "main",
    "repositoryPath": "/path/to/repo",
    "linearToken": "lin_api_...",
    "allowedTools": ["Read(**)", "Edit(**)", "Bash(git:*)"]
  }]
}

// New config (опционально)
{
  "repositories": [...],
  "codegen": {
    "enabled": true,
    "orgId": "my-org-id",
    "apiToken": "codegen_token_...",
    "strategy": "hybrid-smart",
    "maxCostPerTask": 1.0,
    "maxCostPerDay": 50.0
  }
}
```

### Стратегии выполнения

| Стратегия | Когда использовать | Кейсы |
|-----------|-------------------|-------|
| `local-only` | По умолчанию, как сейчас | Всё работает как раньше |
| `cloud-only` | Максимальная изоляция | Security-sensitive tasks |
| `hybrid-smart` | Интеллектуальный выбор | Recommended для большинства |
| `hybrid-parallel` | **Рекомендуется** | Orchestration local, execution cloud |
| `cost-optimized` | Оптимизация бюджета | Cost-conscious environments |

---

## 🚧 Что нужно сделать

### Фаза 1: Foundation (первая итерация)

**Ответственные:** Backend team  
**Длительность:** 2-3 недели

**Задачи:**
1. ✅ Создать `packages/executor-interface`
   - Определить интерфейсы
   - Написать тесты
   - Документация

2. ✅ Создать `packages/codegen-executor`
   - Установить Codegen SDK
   - Реализовать `CodegenExecutor`
   - Unit-тесты

3. ✅ Адаптировать `packages/claude-runner`
   - Создать `ClaudeExecutorAdapter`
   - Сохранить обратную совместимость
   - Тесты

4. ✅ Обновить `packages/core`
   - Расширить типы конфигурации
   - Добавить `codegen` секцию

**Критерии приёмки:**
- [ ] Интерфейсы определены и задокументированы
- [ ] ClaudeRunner работает через адаптер
- [ ] CodegenExecutor может выполнять простые задачи
- [ ] Все тесты проходят
- [ ] Конфигурация расширена

### Review points

1. **После Фазы 1:** Demo Codegen executor
2. **После Фазы 2:** Demo EdgeWorker с двумя executor'ами
3. **После Фазы 3:** Demo интеллектуального выбора
4. **После Фазы 4:** Beta тестирование с пользователями
5. **После Фазы 5:** Production release

---

## ❓ FAQ для команды

**Q: Это breaking changes?**  
A: Нет. 100% обратная совместимость. По умолчанию работает как раньше (`local-only`).

**Q: Что если Codegen недоступен?**  
A: Automatic fallback на локальное выполнение. Система продолжает работать.

**Q: Нужны новые dependencies?**  
A: Да, добавляется `codegen` npm package (официальный SDK от Codegen).

**Q: Как тестировать Codegen executor?**  
A: Mock interface в unit-тестах. Integration тесты с реальным Codegen API (test account).

**Q: Какие метрики отслеживаем?**  
A: 
- Adoption rate (% пользователей на cloud)
- Success rate (% успешных задач)
- Performance (время выполнения)
- Cost (стоимость на задачу)
- User satisfaction

**Q: Что с security review?**  
A: Security audit в Фазе 5. Codegen уже SOC 2 compliant.

**Q: Rollback plan?**  
A: Откатываемся на `local-only` режим. Всё работает как раньше.

---

## 📚 Документация

**Обязательно к прочтению:**
1. **[CODEGEN_INTEGRATION_SUMMARY.md](./CODEGEN_INTEGRATION_SUMMARY.md)** (15 минут) - Начните здесь
2. **[CODEGEN_ARCHITECTURE_DIAGRAMS.md](./CODEGEN_ARCHITECTURE_DIAGRAMS.md)** (30 минут) - Визуализация

**Детали по необходимости:**
3. **[CODEGEN_INTEGRATION_PLAN.md](./CODEGEN_INTEGRATION_PLAN.md)** (полный план, 80+ страниц)

---

## 🎬 Next Steps

### Немедленно (эта неделя)

1. ✅ **Team review:** Прочитать summary и диаграммы
2. ⏳ **Обсуждение:** Sync meeting для вопросов и feedback
3. ⏳ **Approve план:** Если всё OK, начинаем Фазу 1

### Через 1-2 недели

4. ⏳ **Spike:** Prototype `executor-interface` и `CodegenExecutor`
5. ⏳ **Tech debt:** Refactor current code для лучшей интеграции

### Через 3-4 недели

6. ⏳ **Начало Фазы 1:** Foundation implementation
7. ⏳ **Weekly demos:** Показываем прогресс команде

---

## 🙋 Вопросы?

- **Technical questions:** Открыть issue с тегом `codegen-integration`
- **Architecture discussion:** Sync meeting (schedule via Linear)
- **General feedback:** Комментарии в документах через PR

---

## ✅ Action Items

### For Team Lead
- [ ] Schedule team sync для обсуждения плана
- [ ] Approve начало работ (Фаза 1)
- [ ] Allocate resources (2-3 developers)

### For Backend Team
- [ ] Прочитать CODEGEN_INTEGRATION_SUMMARY.md
- [ ] Изучить диаграммы
- [ ] Подготовить вопросы к sync meeting
- [ ] Spike: попробовать Codegen SDK локально

### For DevOps
- [ ] Review security implications
- [ ] Plan monitoring infrastructure
- [ ] Prepare test Codegen account

### For Product
- [ ] Review business case
- [ ] Plan user communication
- [ ] Prepare pricing strategy (if needed)

---

**Deadline для feedback:** 2025-01-15 (1 неделя)  
**Planned start date:** 2025-01-20 (Фаза 1)

---

**Status:** 🟡 Awaiting Team Review  
**Priority:** High  
**Impact:** Large (architectural change)  
**Risk:** Medium (well-planned, backward compatible)
