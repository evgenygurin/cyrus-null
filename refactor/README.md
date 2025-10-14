# Refactoring Plans for Cyrus

Эта директория содержит планы по рефакторингу и расширению функциональности Cyrus.

## 📄 Документы

### Интеграция Codegen.com

Полный план интеграции Codegen.com в качестве облачного исполнителя (executor) для Cyrus:

1. **[CODEGEN_INTEGRATION_SUMMARY.md](./CODEGEN_INTEGRATION_SUMMARY.md)** (⭐ Начните здесь!)
   - Краткое резюме (10-15 минут чтения)
   - Ключевые идеи и преимущества
   - Сравнение стоимости
   - FAQ и рекомендации

2. **[CODEGEN_INTEGRATION_PLAN.md](./CODEGEN_INTEGRATION_PLAN.md)**
   - Детальный план реализации (80+ страниц)
   - Технические спецификации
   - Примеры кода
   - План по фазам (5 фаз, 12-17 недель)
   - Риски и митигации
   - Метрики успеха

3. **[CODEGEN_ARCHITECTURE_DIAGRAMS.md](./CODEGEN_ARCHITECTURE_DIAGRAMS.md)**
   - 12 архитектурных диаграмм
   - Визуализация текущей и целевой архитектуры
   - Data flow диаграммы
   - Примеры использования

### Другие планы

- **VERCEL_MIGRATION_PLAN.md** (если существует)
  - План миграции на Vercel

## 🎯 Ключевая идея Codegen Integration

Превратить Cyrus из монолитного агента в **интеллектуальную оркестрационную платформу**:

```
Cyrus = Orchestrator (мозг, планирование, координация)
Codegen = Executor (руки, выполнение в облаке)
Claude Code = Local Executor (для лёгких задач)
```

### Преимущества

- ✅ **Параллельное выполнение** - неограниченное количество задач одновременно
- ✅ **Изоляция** - SOC 2 compliant sandboxes для каждой задачи
- ✅ **Масштабируемость** - managed infrastructure от Codegen
- ✅ **Гибкость** - выбор между local и cloud execution
- ✅ **Обратная совместимость** - 100% работает как раньше по умолчанию

### Стратегии выполнения

| Стратегия | Описание |
|-----------|----------|
| `local-only` | Только локально (текущее поведение) |
| `cloud-only` | Всё через Codegen |
| `hybrid-smart` | Интеллектуальный выбор executor'а |
| `hybrid-parallel` | Orchestration локально, execution в облаке (рекомендуется) |
| `cost-optimized` | Оптимизация по стоимости |

## 📊 Timeline

**Планируемая длительность:** 12-17 недель (~3-4 месяца)

- **Фаза 1:** Foundation (2-3 недели)
- **Фаза 2:** Basic Integration (2-3 недели)
- **Фаза 3:** Smart Orchestration (3-4 недели)
- **Фаза 4:** Advanced Features (3-4 недели)
- **Фаза 5:** Production Ready (2-3 недели)

**Целевой релиз:** v0.2.0

## 🚀 Быстрый старт

1. Прочитайте [CODEGEN_INTEGRATION_SUMMARY.md](./CODEGEN_INTEGRATION_SUMMARY.md) для общего понимания
2. Изучите диаграммы в [CODEGEN_ARCHITECTURE_DIAGRAMS.md](./CODEGEN_ARCHITECTURE_DIAGRAMS.md)
3. Погрузитесь в детали в [CODEGEN_INTEGRATION_PLAN.md](./CODEGEN_INTEGRATION_PLAN.md)

## 🤝 Contributing

Если у вас есть вопросы, предложения или комментарии по плану:

1. Откройте issue в репозитории
2. Добавьте комментарии в документы через PR
3. Обсудите в Linear/Slack

## 📝 Статус документов

| Документ | Статус | Дата обновления |
|----------|--------|-----------------|
| CODEGEN_INTEGRATION_SUMMARY.md | ✅ Ready for Review | 2025-01-08 |
| CODEGEN_INTEGRATION_PLAN.md | ✅ Ready for Review | 2025-01-08 |
| CODEGEN_ARCHITECTURE_DIAGRAMS.md | ✅ Ready for Review | 2025-01-08 |

---

**Дата создания:** 2025-01-08  
**Версия:** 1.0.0
