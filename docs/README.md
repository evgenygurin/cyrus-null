# Cyrus Documentation

Полная документация по архитектуре и реализации Cyrus - интеллектуальной платформы для автоматизации разработки через Linear + Claude/Codegen.

---

## 🎯 Начните здесь

### Для быстрого понимания всей системы

**[AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md)** ⭐ **ГЛАВНЫЙ ДОКУМЕНТ ДЛЯ AI АГЕНТОВ**

- Comprehensive step-by-step guidelines for AI agents
- Codebase overview and architecture
- Development workflow and best practices
- Testing and deployment procedures
- Troubleshooting and common pitfalls

**[CODEGEN_AGENT_INSTRUCTIONS.md](./CODEGEN_AGENT_INSTRUCTIONS.md)** 🤖 **CODEGEN SPECIFIC**

- Codegen-specific instructions for AI agents
- Platform capabilities and limitations
- Integration with Linear and GitHub
- Best practices for Codegen development

---

## 📚 Документация по областям

### Codegen Integration Documentation

Документация по интеграции с платформой Codegen.com для облачного выполнения.

> **См.**: [`codegen/`](./codegen/) directory для детальной Codegen документации

**Ключевые документы в `codegen/`**:

- [capabilities-sandboxes.md](./codegen/capabilities-sandboxes.md) - Sandbox capabilities and limitations
- [settings-configuration.md](./codegen/settings-configuration.md) - Configuration management
- [api-reference.md](./codegen/api-reference.md) - API endpoints and usage
- [pull-requests-repositories.md](./codegen/pull-requests-repositories.md) - Repository and PR management
- [agent-management.md](./codegen/agent-management.md) - Agent lifecycle management
- [integrations.md](./codegen/integrations.md) - Third-party integrations overview

### Step-by-Step Guides

**[CODEGEN_STEP_BY_STEP_GUIDE.md](./CODEGEN_STEP_BY_STEP_GUIDE.md)**

- Детальное руководство по работе с Codegen
- Пошаговые инструкции для типовых задач
- Примеры использования API
- Best practices and patterns

### Linear Integration

**[LINEAR_CONFIGURATION_GUIDE.md](./LINEAR_CONFIGURATION_GUIDE.md)**

- Linear workspace configuration
- Issue routing and automation
- Webhook setup and handling
- Custom workflow configuration

**[LINEAR_IMPLEMENTATION_CHECKLIST.md](./LINEAR_IMPLEMENTATION_CHECKLIST.md)**

- Implementation checklist for Linear integration
- Required configuration steps
- Testing and validation procedures

### Refactoring Documentation

> **См.**: [`../refactor/`](../refactor/) directory для архитектурной документации

**Ключевые документы в `refactor/`**:

- `CODEGEN_ONLY_ARCHITECTURE.md` - упрощенная архитектура (рекомендуется)
- `CODEGEN_INTEGRATION_PLAN.md` - детальный plan
- `CODEGEN_ARCHITECTURE_DIAGRAMS.md` - архитектурные диаграммы
- `ORCHESTRATOR_CODEGEN_ALIGNMENT.md` - orchestrator prompt updates
- `WHY_CUSTOM_ORCHESTRATOR.md` - стратегическое обоснование
- `TEAM_BRIEFING.md` - краткий брифинг для команды

---

## 🗺️ Навигация по документации

### Для AI Агентов

1. ⭐ [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) - полное руководство
2. 🤖 [CODEGEN_AGENT_INSTRUCTIONS.md](./CODEGEN_AGENT_INSTRUCTIONS.md) - Codegen специфика
3. 📝 [CODEGEN_STEP_BY_STEP_GUIDE.md](./CODEGEN_STEP_BY_STEP_GUIDE.md) - пошаговые инструкции
4. 📊 [refactor/TEAM_BRIEFING.md](../refactor/TEAM_BRIEFING.md) - архитектурный обзор

### Для Backend Developers

1. ⭐ [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) - полная картина
2. 🔧 [refactor/CODEGEN_INTEGRATION_PLAN.md](../refactor/CODEGEN_INTEGRATION_PLAN.md) - implementation plan
3. 📐 [refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md](../refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md) - диаграммы
4. 🎯 [refactor/ORCHESTRATOR_CODEGEN_ALIGNMENT.md](../refactor/ORCHESTRATOR_CODEGEN_ALIGNMENT.md) - orchestrator changes
5. 🔌 [codegen/api-reference.md](./codegen/api-reference.md) - API reference

### Для Frontend Developers

1. 🎨 [WEB_PANEL.md](./WEB_PANEL.md) - UI/UX specs
2. 🏗️ [codegen/capabilities-sandboxes.md](./codegen/capabilities-sandboxes.md) - Platform capabilities
3. 🔌 [codegen/integrations.md](./codegen/integrations.md) - Integration points

### Для DevOps Engineers

1. ⭐ [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) (Section: Deployment) - infrastructure
2. 📐 [refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md](../refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md) - architecture diagrams
3. 🔧 [codegen/settings-configuration.md](./codegen/settings-configuration.md) - configuration management

### Для Архитекторов

1. ⭐ [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) - comprehensive architecture overview
2. 🧠 [refactor/WHY_CUSTOM_ORCHESTRATOR.md](../refactor/WHY_CUSTOM_ORCHESTRATOR.md) - strategic decisions
3. 📐 [refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md](../refactor/CODEGEN_ARCHITECTURE_DIAGRAMS.md) - all diagrams
4. 🔧 [refactor/CODEGEN_INTEGRATION_PLAN.md](../refactor/CODEGEN_INTEGRATION_PLAN.md) - integration architecture
5. 🏗️ [refactor/CODEGEN_ONLY_ARCHITECTURE.md](../refactor/CODEGEN_ONLY_ARCHITECTURE.md) - simplified architecture

---

## 📊 Статус документации

| Документ | Тип | Статус | Последнее обновление |
|----------|-----|--------|----------------------|
| **AGENT_INSTRUCTIONS.md** | Main Guide | ✅ Complete | 2025-01-14 |
| **CODEGEN_AGENT_INSTRUCTIONS.md** | Codegen Guide | ✅ Complete | 2025-01-14 |
| **CODEGEN_STEP_BY_STEP_GUIDE.md** | Tutorial | ✅ Complete | 2025-01-14 |
| LINEAR_CONFIGURATION_GUIDE.md | Configuration | ✅ Complete | 2024-11-03 |
| LINEAR_IMPLEMENTATION_CHECKLIST.md | Implementation | ✅ Complete | 2024-11-03 |
| WEB_PANEL.md | UI/UX | ✅ Complete | 2024-11-03 |
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

**Детальная схема**: См. [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) (Architecture section)

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

**Детальный roadmap**: См. [refactor/CODEGEN_ONLY_ARCHITECTURE.md](../refactor/CODEGEN_ONLY_ARCHITECTURE.md) (Roadmap section)

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
- **AGENT_INSTRUCTIONS.md**: Comprehensive step-by-step guidelines for AI agents
- **CHANGELOG.md**: История изменений проекта
- **architecture.md**: Детальная архитектура системы (если существует)

---

**Версия документации**: 2.0.0  
**Последнее обновление**: 2025-01-14  
**Статус**: ✅ Integrated & Complete
