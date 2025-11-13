# Cyrus Documentation

Полная документация по архитектуре и реализации Cyrus - интеллектуальной платформы для автоматизации разработки через Linear + Claude/Codegen.

---

## 🎯 Начните здесь

### Для быстрого старта

**[quick-reference.md](./quick-reference.md)** 🚀 **QUICK REFERENCE**

- Common commands and operations
- Configuration examples
- Troubleshooting guide
- Key file locations
- Development workflow

### Для быстрого понимания всей системы

**[UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md)** ⭐ **ГЛАВНЫЙ ДОКУМЕНТ**

- Полная архитектура: Control Panel + Codegen Integration
- 5 архитектурных слоев
- Integration points между всеми компонентами
- Deployment strategy
- Configuration management
- Security & cost model

**[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** 📋 **ОТЧЕТ ОБ ИНТЕГРАЦИИ**

- Как объединены Control Panel и Codegen документация
- Анализ противоречий (спойлер: их нет!)
- Mapping исходных документов
- Рекомендации по использованию документации

---

## 📚 Документация по областям

### Control Panel (Next.js Web UI)

Документация по веб-интерфейсу для управления и мониторинга Cyrus агентов.

1. **[CONTROL_PANEL_ARCHITECTURE.md](./CONTROL_PANEL_ARCHITECTURE.md)**
   - Next.js 15 architecture
   - PostgreSQL database schema
   - REST API specification
   - Server-Sent Events (SSE) для real-time updates
   - Deployment на Vercel

2. **[CONTROL_PANEL_IMPLEMENTATION.md](./CONTROL_PANEL_IMPLEMENTATION.md)**
   - Implementation roadmap (6 фаз, 10-12 недель)
   - Project structure
   - Setup instructions
   - Database migrations
   - Testing strategy

3. **[CONTROL_PANEL_UI_SPECS.md](./CONTROL_PANEL_UI_SPECS.md)**
   - UI/UX спецификации
   - Component library (shadcn/ui)
   - Page wireframes
   - Responsive design
   - Accessibility guidelines

### Codegen Integration (Cloud Executor)

Документация по интеграции облачного выполнения через Codegen.com.

> **См.**: [`refactor/`](../refactor/) directory для детальной Codegen документации

**Ключевые документы в `refactor/`**:

- `CODEGEN_ONLY_ARCHITECTURE.md` - упрощенная архитектура (рекомендуется)
- `CODEGEN_INTEGRATION_PLAN.md` - детальный plan (1125+ строк)
- `CODEGEN_ARCHITECTURE_DIAGRAMS.md` - 12 архитектурных диаграмм
- `ORCHESTRATOR_CODEGEN_ALIGNMENT.md` - orchestrator prompt updates
- `WHY_CUSTOM_ORCHESTRATOR.md` - стратегическое обоснование

---

## 🗺️ Навигация по документации

### Для Product Managers

1. 🚀 [quick-reference.md](./quick-reference.md) - quick start guide
2. ⭐ [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) - общее видение
3. 📋 [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) - что было объединено и почему
4. 🎨 [CONTROL_PANEL_UI_SPECS.md](./CONTROL_PANEL_UI_SPECS.md) - UI/UX
5. 📊 [refactor/TEAM_BRIEFING.md](../refactor/TEAM_BRIEFING.md) - краткий брифинг

### Для Backend Developers

1. 🚀 [quick-reference.md](./quick-reference.md) - common commands & troubleshooting
2. ⭐ [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) - полная картина
3. 🔧 [refactor/CODEGEN_INTEGRATION_PLAN.md](../refactor/CODEGEN_INTEGRATION_PLAN.md) - implementation plan
4. 📐 [refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md](../refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md) - диаграммы
5. 🎯 [refactor/ORCHESTRATOR_CODEGEN_ALIGNMENT.md](../refactor/ORCHESTRATOR_CODEGEN_ALIGNMENT.md) - orchestrator changes
6. 🗄️ [CONTROL_PANEL_ARCHITECTURE.md](./CONTROL_PANEL_ARCHITECTURE.md) (Section: Database) - schema

### Для Frontend Developers

1. 🚀 [quick-reference.md](./quick-reference.md) - quick start & commands
2. 🎨 [CONTROL_PANEL_UI_SPECS.md](./CONTROL_PANEL_UI_SPECS.md) - UI/UX specs
3. 🏗️ [CONTROL_PANEL_ARCHITECTURE.md](./CONTROL_PANEL_ARCHITECTURE.md) - Next.js architecture
4. 📝 [CONTROL_PANEL_IMPLEMENTATION.md](./CONTROL_PANEL_IMPLEMENTATION.md) - implementation guide
5. ⭐ [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) (Section 1-2) - UI layer overview

### Для DevOps Engineers

1. ⭐ [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) (Section: Deployment) - infrastructure
2. 🚀 [CONTROL_PANEL_ARCHITECTURE.md](./CONTROL_PANEL_ARCHITECTURE.md) (Section: Deployment) - Vercel setup
3. 📐 [refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md](../refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md) (Diagram 9) - config flow

### Для Архитекторов

1. ⭐ [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md) - unified view
2. 🧠 [refactor/WHY_CUSTOM_ORCHESTRATOR.md](../refactor/WHY_CUSTOM_ORCHESTRATOR.md) - strategic decisions
3. 📐 [refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md](../refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md) - all diagrams
4. 🏗️ [CONTROL_PANEL_ARCHITECTURE.md](./CONTROL_PANEL_ARCHITECTURE.md) - frontend architecture
5. 🔧 [refactor/CODEGEN_INTEGRATION_PLAN.md](../refactor/CODEGEN_INTEGRATION_PLAN.md) - backend architecture
6. 📋 [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) - integration analysis

---

## 📊 Статус документации

| Документ | Тип | Статус | Последнее обновление |
|----------|-----|--------|----------------------|
| **UNIFIED_ARCHITECTURE.md** | Architecture | ✅ Complete | 2025-01-14 |
| **INTEGRATION_SUMMARY.md** | Analysis | ✅ Complete | 2025-01-14 |
| CONTROL_PANEL_ARCHITECTURE.md | Architecture | ✅ Complete | 2024-12-XX |
| CONTROL_PANEL_IMPLEMENTATION.md | Implementation | ✅ Complete | 2024-12-XX |
| CONTROL_PANEL_UI_SPECS.md | UI/UX | ✅ Complete | 2024-12-XX |
| refactor/CODEGEN_ONLY_ARCHITECTURE.md | Architecture | ✅ Recommended | 2025-01-08 |
| refactor/CODEGEN_INTEGRATION_PLAN.md | Implementation | ✅ Alternative | 2025-01-08 |
| refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md | Visualization | ✅ Complete | 2025-01-08 |
| refactor/ORCHESTRATOR_CODEGEN_ALIGNMENT.md | Technical | ✅ Complete | 2025-01-08 |
| refactor/WHY_CUSTOM_ORCHESTRATOR.md | Strategic | ✅ Complete | 2025-01-08 |

**Легенда**:

- ✅ Complete - готово к использованию
- 🔄 In Progress - в разработке
- 📋 Draft - черновик

---

## 🏗️ Архитектурный обзор

### Высокоуровневая схема

```
┌─────────────────────────────────────────────────┐
│         Layer 1: User Interface                 │
│         Next.js 15 Control Panel                │
│         (Vercel Deployment)                     │
└─────────────────────┬───────────────────────────┘
                      │ REST API
                      ▼
┌─────────────────────────────────────────────────┐
│         Layer 2: Backend & Data                 │
│         Next.js API + PostgreSQL                │
└─────────────────────┬───────────────────────────┘
                      │ Webhooks
                      ▼
┌─────────────────────────────────────────────────┐
│         Layer 3: Edge Proxy                     │
│         Cloudflare Workers                      │
└─────────────────────┬───────────────────────────┘
                      │ NDJSON Stream
                      ▼
┌─────────────────────────────────────────────────┐
│         Layer 4: Orchestration                  │
│         EdgeWorker + TaskOrchestrator           │
└─────────────────────┬───────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌────────────────────┐  ┌─────────────────────┐
│  Layer 5A: Local   │  │  Layer 5B: Cloud    │
│  ClaudeRunner      │  │  CodegenExecutor    │
│  (Local execution) │  │  (Cloud execution)  │
└────────────────────┘  └─────────────────────┘
```

**Детальная схема**: См. [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md#архитектурные-слои)

---

## 🚀 Roadmap

### Completed ✅

- [x] Control Panel architecture design
- [x] Codegen integration planning
- [x] Documentation integration (устранение противоречий)
- [x] Unified architecture document

### In Progress 🔄

- [ ] Control Panel implementation (Phase 1-2)
- [ ] Codegen executor implementation
- [ ] TaskOrchestrator with strategies

### Planned 📋

- [ ] Parallel execution (Codegen)
- [ ] Advanced analytics & cost prediction
- [ ] Multi-tenant support
- [ ] Enterprise features

**Детальный roadmap**: См. [UNIFIED_ARCHITECTURE.md](./UNIFIED_ARCHITECTURE.md#roadmap)

---

## 🤝 Contributing

Хотите улучшить документацию?

1. **Нашли ошибку?** → Откройте issue
2. **Есть предложение?** → Создайте PR с изменениями
3. **Нужны разъяснения?** → Обсудите в Linear/Slack

### Guidelines

- Следуйте существующей структуре документов
- Обновляйте таблицы статуса при изменении документов
- Добавляйте диаграммы где возможно (ASCII art приветствуется)
- Включайте примеры кода для технических секций
- Указывайте дату обновления и версию

---

## 📞 Контакты

- **Linear Workspace**: [Ссылка на workspace]
- **GitHub Repository**: <https://github.com/evgenygurin/cyrus-null>
- **Documentation Issues**: Используйте GitHub Issues с label `documentation`

---

## 📖 Дополнительные ресурсы

### External Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Vercel Platform](https://vercel.com/docs)
- [Codegen API](https://codegen.com/docs)
- [Linear API](https://developers.linear.app/)
- [Claude Code](https://claude.ai/code)

### Related Files

- **Root CLAUDE.md**: Инструкции для Claude Code при работе с кодом
- **CHANGELOG.md**: История изменений проекта
- **architecture.md**: Детальная архитектура системы (если существует)

---

**Версия документации**: 2.0.0  
**Последнее обновление**: 2025-01-14  
**Статус**: ✅ Integrated & Complete
