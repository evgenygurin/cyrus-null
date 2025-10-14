# Refactoring Plan: Cyrus Architecture Optimization

## Цель
Привести кодовую базу к современным стандартам ООП, SOLID, DRY, KISS с использованием паттернов GoF.

## Текущие проблемы

### 1. apps/cli/app.ts (2067 строк - God Object Anti-pattern)
**Проблемы:**
- Класс `EdgeApp` делает слишком много: OAuth, конфигурация, git worktrees, подписка, биллинг
- Процедурный код в глобальной области (команды)
- Хардкод строк и магические числа
- Нарушение Single Responsibility Principle (SRP)
- Дублирование кода в разных командах
- Плохая тестируемость

**Решение:**
```
apps/cli/
├── src/
│   ├── domain/                  # Domain Layer (Entities)
│   │   ├── config/
│   │   │   ├── EdgeConfig.ts
│   │   │   └── RepositoryConfig.ts
│   │   └── workspace/
│   │       └── Workspace.ts
│   ├── application/             # Application Layer (Use Cases)
│   │   ├── commands/
│   │   │   ├── Command.ts       # Command pattern interface
│   │   │   ├── StartCommand.ts
│   │   │   ├── CheckTokensCommand.ts
│   │   │   ├── RefreshTokenCommand.ts
│   │   │   ├── AddRepositoryCommand.ts
│   │   │   ├── BillingCommand.ts
│   │   │   └── SetCustomerIdCommand.ts
│   │   └── services/
│   │       ├── ConfigService.ts
│   │       ├── OAuthService.ts
│   │       ├── SubscriptionService.ts
│   │       └── WorktreeService.ts
│   ├── infrastructure/          # Infrastructure Layer
│   │   ├── git/
│   │   │   └── GitWorktreeManager.ts
│   │   ├── storage/
│   │   │   ├── ConfigStorage.ts
│   │   │   └── FileSystemStorage.ts
│   │   └── http/
│   │       ├── HttpClient.ts
│   │       └── StripeApiClient.ts
│   ├── presentation/            # Presentation Layer
│   │   ├── cli/
│   │   │   ├── CLI.ts           # Main CLI router
│   │   │   ├── PromptService.ts # User interaction
│   │   │   └── OutputFormatter.ts
│   │   └── validators/
│   │       └── InputValidator.ts
│   └── di/                      # Dependency Injection
│       └── Container.ts         # IoC Container
└── app.ts                       # Entry point (композиция)
```

### 2. packages/claude-runner/src/ClaudeRunner.ts (880 строк)
**Проблемы:**
- Смешивание логирования, управления сессией, потоковой передачи
- Отсутствие инкапсуляции состояния
- Сложная инициализация
- Нарушение SRP

**Решение:**
```
packages/claude-runner/src/
├── domain/
│   ├── Session.ts              # Session entity
│   ├── Message.ts              # Message value object
│   └── StreamingPrompt.ts      # Streaming state
├── application/
│   ├── SessionManager.ts       # Session lifecycle
│   ├── MessageProcessor.ts     # Message handling
│   └── EnvironmentLoader.ts    # Env configuration
├── infrastructure/
│   ├── logging/
│   │   ├── ILogger.ts          # Logger interface
│   │   ├── FileLogger.ts       # File-based logging
│   │   ├── JsonLogger.ts       # JSON structured logs
│   │   └── MarkdownLogger.ts   # Human-readable logs
│   └── mcp/
│       └── McpConfigLoader.ts  # MCP configuration
└── ClaudeRunner.ts             # Facade (simplified API)
```

### 3. packages/edge-worker/src/EdgeWorker.ts
**Проблемы:**
- Управление множеством репозиториев в одном классе
- Смешивание транспортного слоя с бизнес-логикой
- Сложная логика маршрутизации

**Решение:**
```
packages/edge-worker/src/
├── domain/
│   ├── Repository.ts
│   ├── Issue.ts
│   └── Session.ts
├── application/
│   ├── IssueRouter.ts          # Strategy pattern для роутинга
│   ├── SessionOrchestrator.ts  # Управление сессиями
│   └── WorkspaceProvider.ts    # Factory для workspace
├── infrastructure/
│   ├── transport/
│   │   ├── ITransport.ts
│   │   ├── NdjsonTransport.ts
│   │   └── WebhookTransport.ts
│   └── procedures/
│       ├── IProcedure.ts
│       └── ProcedureExecutor.ts # Chain of Responsibility
└── EdgeWorker.ts               # Facade
```

### 4. packages/core - Missing Clear Boundaries
**Проблемы:**
- Смешение типов, констант, бизнес-логики
- Нет четкого разделения слоев

**Решение:**
```
packages/core/src/
├── domain/                     # Pure domain logic
│   ├── entities/
│   ├── value-objects/
│   └── repositories/           # Repository interfaces
├── types/                      # Shared types только
│   ├── config-types.ts
│   ├── webhook-types.ts
│   └── index.ts
└── constants.ts                # Только константы
```

## Принципы рефакторинга

### 1. SOLID Principles

#### Single Responsibility Principle (SRP)
- Каждый класс имеет одну причину для изменения
- Разделение на слои: Domain, Application, Infrastructure, Presentation
- Use Case классы для каждой операции

#### Open/Closed Principle (OCP)
- Интерфейсы для расширяемости без модификации
- Strategy pattern для различных режимов (debugger, builder, scoper)
- Plugin architecture для MCP серверов

#### Liskov Substitution Principle (LSP)
- Базовые классы/интерфейсы взаимозаменяемы
- Command interface для всех команд CLI
- Transport interface для различных транспортов

#### Interface Segregation Principle (ISP)
- Маленькие, специфичные интерфейсы
- Клиенты не зависят от неиспользуемых методов

#### Dependency Inversion Principle (DIP)
- Зависимость от абстракций, не от конкретики
- IoC Container для управления зависимостями
- Constructor injection

### 2. DRY (Don't Repeat Yourself)
- Извлечение общей логики в сервисы
- Утилитарные функции в отдельные модули
- Композиция вместо дублирования

### 3. KISS (Keep It Simple, Stupid)
- Простые, понятные имена
- Малые функции (до 20-30 строк)
- Явная логика вместо хитрых трюков
- Удаление избыточных абстракций

### 4. GoF Patterns

#### Creational Patterns
- **Factory Method**: Создание Workspace, Session, Config
- **Builder**: Конфигурирование сложных объектов (EdgeWorker, ClaudeRunner)
- **Singleton**: ConfigService, HttpClient с пулом соединений

#### Structural Patterns
- **Facade**: Упрощенные API для ClaudeRunner, EdgeWorker
- **Adapter**: Адаптация Linear SDK, Claude SDK
- **Composite**: Иерархия команд, процедур
- **Decorator**: Логирование, метрики, ретраи

#### Behavioral Patterns
- **Command**: CLI команды
- **Strategy**: Routing strategies, Prompt modes
- **Observer**: Event-driven architecture (уже есть EventEmitter)
- **Chain of Responsibility**: Procedure execution, Error handling
- **Template Method**: Base command с хуками

## Этапы реализации

### Phase 1: Foundation (Неделя 1)
1. Создать структуру папок
2. Выделить Domain entities и Value Objects
3. Создать базовые интерфейсы и абстракции
4. Настроить DI Container

### Phase 2: CLI Refactoring (Неделя 2)
1. Реализовать Command pattern для CLI команд
2. Выделить ConfigService, OAuthService, SubscriptionService
3. Рефакторить EdgeApp в CLI + Use Cases
4. Написать unit тесты для команд

### Phase 3: ClaudeRunner Refactoring (Неделя 3)
1. Выделить SessionManager, MessageProcessor
2. Создать систему логирования (Strategy pattern)
3. Рефакторить StreamingPrompt в отдельный модуль
4. Написать интеграционные тесты

### Phase 4: EdgeWorker Refactoring (Неделя 4)
1. Выделить IssueRouter с различными стратегиями
2. Создать SessionOrchestrator
3. Рефакторить транспортный слой
4. Написать E2E тесты

### Phase 5: Core Package Cleanup (Неделя 5)
1. Реорганизовать структуру пакета
2. Выделить domain layer
3. Обновить экспорты
4. Обновить зависимости в других пакетах

### Phase 6: Integration & Testing (Неделя 6)
1. Интеграция всех изменений
2. Полное покрытие тестами
3. Обновление документации
4. Performance testing

## Правила написания кода

### 1. Именование
- **Классы**: PascalCase, существительные (UserService, ConfigManager)
- **Интерфейсы**: PascalCase с префиксом I (ILogger, ICommand)
- **Методы**: camelCase, глаголы (getConfig, validateToken)
- **Переменные**: camelCase, описательные имена
- **Константы**: UPPER_SNAKE_CASE
- **Приватные поля**: prefix с _ (опционально)

### 2. Функции
- Максимум 20-30 строк
- Одна задача на функцию
- Максимум 3-4 параметра (иначе использовать объект options)
- Раннее возвращение для edge cases

### 3. Классы
- Максимум 200-300 строк
- Публичные методы в начале, приватные в конце
- Инициализация в конструкторе минимальна
- Избегать наследования >2 уровней

### 4. Комментарии
- Код должен быть самодокументируемым
- Комментарии только для сложной бизнес-логики
- JSDoc для публичных API
- TODO только с issue номером

### 5. Обработка ошибок
- Специфичные Error классы (ConfigError, OAuthError)
- Try-catch на границах систем
- Логирование ошибок с контекстом
- Не глушить ошибки (no empty catch)

### 6. Async/Await
- Предпочитать async/await вместо .then()
- Promise.all для параллельных операций
- Обработка ошибок через try-catch
- Таймауты для всех внешних вызовов

### 7. TypeScript
- Strict mode включен
- Явные типы для публичных API
- Избегать any (использовать unknown)
- Использовать union types, type guards
- Readonly для immutable data

## Критерии успеха

### Метрики качества
- [ ] Все классы < 300 строк
- [ ] Все методы < 30 строк
- [ ] Cyclomatic complexity < 10
- [ ] Test coverage > 80%
- [ ] 0 TypeScript errors
- [ ] 0 linting warnings
- [ ] 0 code duplication (DRY violations)

### Архитектурные метрики
- [ ] Clear layer separation (Domain, Application, Infrastructure, Presentation)
- [ ] All dependencies point inward (Dependency Inversion)
- [ ] All public APIs have interfaces
- [ ] No circular dependencies
- [ ] All hardcoded values moved to config

### Performance
- [ ] Startup time < 2s
- [ ] Memory usage stable (no leaks)
- [ ] Response time for commands < 500ms
- [ ] Graceful shutdown < 1s

## Инструменты

### Статический анализ
- TypeScript strict mode
- Biome (already configured)
- ts-morph для AST анализа
- madge для dependency visualization

### Тестирование
- Vitest для unit/integration тестов
- Playwright для E2E (если нужно)
- Mock Service Worker для HTTP mocks

### Refactoring Tools
- VS Code refactoring tools
- TypeScript Language Server
- Automated rename/extract

## Риски и митигация

### Риск 1: Breaking Changes
**Митигация**: Facade pattern сохраняет старые API, постепенная миграция

### Риск 2: Regression Bugs
**Митигация**: Extensive test coverage перед рефакторингом

### Риск 3: Time Overrun
**Митигация**: Поэтапная реализация, каждая фаза может быть задеплоена

### Риск 4: Over-engineering
**Митигация**: Pragmatic approach, добавление абстракций только при необходимости

## Следующие шаги

1. Ревью плана с командой
2. Создание веток для каждой фазы
3. Написание базовых тестов для текущего кода (regression safety)
4. Начало Phase 1: Foundation
