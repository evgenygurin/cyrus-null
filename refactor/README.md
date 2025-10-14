# Refactoring Plans for Cyrus

Эта директория содержит планы по рефакторингу и расширению функциональности Cyrus.

> **⚠️ ВАЖНО**: Эта документация была интегрирована с документацией Control Panel.  
> **См. объединенную архитектуру**: [`docs/UNIFIED_ARCHITECTURE.md`](../docs/UNIFIED_ARCHITECTURE.md)  
> **См. отчет об интеграции**: [`docs/INTEGRATION_SUMMARY.md`](../docs/INTEGRATION_SUMMARY.md)

## 📄 Документы

### Интеграция Codegen.com

План интеграции Codegen.com для трансформации Cyrus в интеллектуальную оркестрационную платформу.

#### ⭐ Рекомендуемый подход: Codegen-Only

1. **[CODEGEN_ONLY_ARCHITECTURE.md](./CODEGEN_ONLY_ARCHITECTURE.md)** (⭐⭐⭐ **НАЧНИТЕ ЗДЕСЬ!**)
   - **Рекомендуемый план** на основе анализа возможностей Codegen
   - Упрощённая архитектура: единый executor
   - Staged migration: начать с Codegen-only, усложнять по необходимости
   - Быстрее (2-3 месяца vs 4-5), проще, меньше кода
   - Ответ на вопрос: "Зачем локальный executor если Codegen может всё?"

#### Альтернативный подход: Hybrid Architecture

2. **[CODEGEN_INTEGRATION_SUMMARY.md](./CODEGEN_INTEGRATION_SUMMARY.md)**
   - Краткое резюме гибридной архитектуры (10-15 минут)
   - Local executor (Claude) + Cloud executor (Codegen)
   - Сравнение подходов и стоимости

3. **[CODEGEN_INTEGRATION_PLAN.md](./CODEGEN_INTEGRATION_PLAN.md)**
   - Детальный план гибридной архитектуры (80+ страниц)
   - Технические спецификации
   - Примеры кода для обоих executor'ов
   - План по фазам (5 фаз, 12-17 недель)
   - Можно использовать как "Plan B" если Codegen-only не подойдёт

4. **[CODEGEN_ARCHITECTURE_DIAGRAMS.md](./CODEGEN_ARCHITECTURE_DIAGRAMS.md)**
   - 12 архитектурных диаграмм
   - Применимы к обоим подходам
   - Визуализация текущей и целевой архитектуры

5. **[TEAM_BRIEFING.md](./TEAM_BRIEFING.md)**
   - Брифинг для команды (на основе гибридной архитектуры)
   - Timeline и action items

#### Стратегический контекст

6. **[WHY_CUSTOM_ORCHESTRATOR.md](./WHY_CUSTOM_ORCHESTRATOR.md)**
   - Ответ на вопрос: "Зачем свой оркестратор, если есть готовые решения?"
   - Бизнес-кейс для разработки Cyrus
   - Автономность и проактивность (24/7 агент)
   - Multi-tenant SaaS архитектура для коммерциализации
   - White-label возможности

7. **[ORCHESTRATOR_CODEGEN_ALIGNMENT.md](./ORCHESTRATOR_CODEGEN_ALIGNMENT.md)** ⚙️
   - Технический анализ текущего orchestrator prompt
   - Какие изменения нужны для Codegen integration
   - Спецификация 5 новых MCP tools для Codegen
   - Обновлённый execution workflow
   - Implementation plan (3-4 недели)

---

## 🎯 Ключевая идея Codegen Integration

### Рекомендуемый подход: Codegen-Only (упрощённо)

```
Cyrus = Orchestrator (координация, управление workflow)
Codegen = Unified Executor (всё: планирование + выполнение)
  ├─ Multi-model support (Claude, GPT, Gemini, Grok)
  ├─ Built-in MCP servers (Linear, GitHub, Slack, DBs)
  ├─ Unified dashboard
  └─ SOC 2 infrastructure
```

**Почему проще:**
- ✅ Единая система вместо двух
- ✅ Меньше кода (3 пакета vs 6)
- ✅ Быстрее разработка (2-3 месяца vs 4-5)
- ✅ Проще для пользователей (нет локальной настройки)
- ✅ Все интеграции из коробки

### Альтернативный подход: Hybrid (если понадобится)

```
Cyrus = Orchestrator (мозг, планирование, координация)
Codegen = Cloud Executor (руки, выполнение в облаке)
Claude Code = Local Executor (для лёгких задач и планирования)
```

**Когда нужно:**
- Если стоимость Codegen > $300/мес
- Если latency > 3 секунды
- Если нужен offline режим
- На основе реальных метрик, не "на всякий случай"

---

## 📊 Timeline

### Codegen-Only (Рекомендуется)

**Длительность:** 8-12 недель (~2-3 месяца)

- **Фаза 1:** Foundation (3-4 недели) - MVP с Codegen
- **Фаза 2:** Optimization (2-3 недели) - производительность и cost
- **Фаза 3:** Advanced Features (2-3 недели) - production-ready
- **Фаза 4:** Launch (1-2 недели) - релиз v1.0.0

**Экономия:** 4-5 недель по сравнению с гибридной архитектурой

### Hybrid Architecture (Альтернатива)

**Длительность:** 12-17 недель (~4-5 месяцев)

- **Фаза 1:** Foundation (2-3 недели)
- **Фаза 2:** Basic Integration (2-3 недели)
- **Фаза 3:** Smart Orchestration (3-4 недели)
- **Фаза 4:** Advanced Features (3-4 недели)
- **Фаза 5:** Production Ready (2-3 недели)

**Целевой релиз:** v0.2.0

---

## 🚀 Быстрый старт

### Для принятия решения (15-20 минут)

1. **Прочитайте** [CODEGEN_ONLY_ARCHITECTURE.md](./CODEGEN_ONLY_ARCHITECTURE.md) ⭐ **НАЧНИТЕ ЗДЕСЬ**
   - Почему Codegen-only проще и быстрее
   - Анализ: нужен ли локальный executor?
   - Staged migration стратегия

2. **Если нужны детали**, изучите альтернативный подход:
   - [CODEGEN_INTEGRATION_SUMMARY.md](./CODEGEN_INTEGRATION_SUMMARY.md) - краткое резюме hybrid
   - [CODEGEN_INTEGRATION_PLAN.md](./CODEGEN_INTEGRATION_PLAN.md) - полный план hybrid

3. **Для визуализации:**
   - [CODEGEN_ARCHITECTURE_DIAGRAMS.md](./CODEGEN_ARCHITECTURE_DIAGRAMS.md) - диаграммы

### Рекомендация

**Начните с Codegen-only** (простота + скорость), добавляйте local executor **только если** данные покажут необходимость (высокая стоимость или latency).

---

## 🤝 Contributing

Если у вас есть вопросы, предложения или комментарии по плану:

1. Откройте issue в репозитории
2. Добавьте комментарии в документы через PR
3. Обсудите в Linear/Slack

---

## 📝 Статус документов

| Документ | Статус | Дата обновления |
|----------|--------|-----------------|
| **CODEGEN_ONLY_ARCHITECTURE.md** | ✅ **Recommended** | 2025-01-08 |
| WHY_CUSTOM_ORCHESTRATOR.md | ✅ Strategic Vision | 2025-01-08 |
| **ORCHESTRATOR_CODEGEN_ALIGNMENT.md** | ✅ **Technical Analysis** | 2025-01-08 |
| CODEGEN_INTEGRATION_SUMMARY.md | ✅ Alternative (Hybrid) | 2025-01-08 |
| CODEGEN_INTEGRATION_PLAN.md | ✅ Alternative (Hybrid) | 2025-01-08 |
| CODEGEN_ARCHITECTURE_DIAGRAMS.md | ✅ Ready for Review | 2025-01-08 |
| TEAM_BRIEFING.md | ✅ Ready for Review | 2025-01-08 |

---

**Дата создания:** 2025-01-08  
**Версия:** 2.0.0 (updated with Codegen-only recommendation)  
**Статус:** Ready for Team Review
