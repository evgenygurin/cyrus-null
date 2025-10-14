# Local Development Setup Guide for Cyrus

Полное руководство по настройке Cyrus для локальной разработки с собственным proxy-worker.

## 📋 Содержание

1. [Подготовка окружения](#подготовка-окружения)
2. [Установка зависимостей](#установка-зависимостей)
3. [Сборка проекта](#сборка-проекта)
4. [Настройка Linear OAuth приложения](#настройка-linear-oauth-приложения)
5. [Конфигурация proxy-worker](#конфигурация-proxy-worker)
6. [Конфигурация Cyrus CLI](#конфигурация-cyrus-cli)
7. [OAuth Flow](#oauth-flow)
8. [Запуск и тестирование](#запуск-и-тестирование)
9. [Troubleshooting](#troubleshooting)

---

## Подготовка окружения

### Требования

- **Node.js**: v24.9.0+
- **pnpm**: v10.13.1+
- **Claude CLI**: v2.0.9+ (установлен и настроен)
- **ngrok**: установлен и настроен с auth token
- **git**: для работы с worktrees
- **gh** (optional): для создания PR через Claude

### Проверка установки

```bash
# Проверка версий
node --version    # v24.9.0+
pnpm --version    # 10.13.1+
claude --version  # 2.0.9+
ngrok version     # любая версия
gh --version      # (опционально)

# Проверка аутентификации Claude
claude
# Выполните /cost чтобы убедиться что subscription активна
```

---

## Установка зависимостей

```bash
cd /Users/laptop/dev/cyrus-null

# Установка всех зависимостей
pnpm install
```

---

## Сборка проекта

```bash
# Сборка всех пакетов
pnpm build

# Проверка что всё собралось
ls apps/cli/dist/app.js              # должен существовать
ls apps/proxy-worker/src/index.ts    # должен существовать
ls packages/claude-runner/dist/      # должна быть заполнена
```

---

## Настройка Linear OAuth приложения

### Шаг 1: Создание OAuth приложения

1. Откройте Linear: Settings → API → OAuth Applications
2. Нажмите "Create new application"

### Шаг 2: Заполнение формы

```bash
Application name:
Cyrus Local Dev

Developer name:
[Your Name]

Developer URL:
http://localhost:8787

Description:
Local development instance of Cyrus - AI development agent for Linear

Callback URLs (каждый на отдельной строке):
http://localhost:8787/oauth/callback
https://YOUR-NGROK-URL.ngrok-free.app/callback

GitHub username:
[оставить пустым или ваш username]
```

### Шаг 3: Настройка переключателей

- ☑️ **Public**: ON
- ☑️ **Client credentials**: ON (обязательно!)
- ☑️ **Webhooks**: ON (обязательно!)

### Шаг 4: Настройка Webhooks

```text
Webhook URL:
https://YOUR-NGROK-URL.ngrok-free.app/webhook

Webhook signing secret:
[Автоматически сгенерирован Linear - скопируйте!]

Data change events (отметить):
☑️ Issues
☑️ Comments
☑️ Labels

App events:
[оставить всё пустым]
```

### Шаг 5: Сохранение credentials

После нажатия "Create" скопируйте:

- **Client ID**: `cc1c726cab2b79c2e310c016dfa5c46e` (пример)
- **Client Secret**: `d9931ab6c6b0b5181dcffa6750981a2b` (пример)
- **Webhook signing secret**: `lin_wh_gcCjBncJGFsly6dDyow2xhCLEVHNxMsE3miEGdN1zqFC` (пример)

---

## Конфигурация proxy-worker

### Создание .dev.vars файла

```bash
cd apps/proxy-worker

# Создать файл с credentials
cat > .dev.vars << 'EOF'
LINEAR_CLIENT_ID=YOUR_CLIENT_ID
LINEAR_CLIENT_SECRET=YOUR_CLIENT_SECRET
LINEAR_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
OAUTH_REDIRECT_URI=http://localhost:8787/oauth/callback
EOF
```

**⚠️ ВАЖНО**: Замените `YOUR_*` на реальные значения из Linear!

### Исправление wrangler.toml (опционально)

Если видите ошибку миграции Durable Objects:

```bash
# Откомментировать migrations в wrangler.toml
# Было:
# [[migrations]]
# tag = "v2"
# deleted_classes = ["EventStreamDurableObject"]

# Стало (закомментировано):
# # [[migrations]]
# # tag = "v2"
# # deleted_classes = ["EventStreamDurableObject"]
```

### Запуск proxy-worker

```bash
cd apps/proxy-worker
npx wrangler dev --port 8787
```

**Успешный запуск выглядит так:**

```bash
⛅️ wrangler 4.42.2
Using vars defined in .dev.vars
Your Worker has access to the following bindings:
...
⎔ Starting local server...
[wrangler:info] Ready on http://localhost:8787
```

---

## Конфигурация Cyrus CLI

### Структура конфигурации

Файл: `~/.cyrus/config.json`

```json
{
  "repositories": [
    {
      "id": "WORKSPACE_ID-TIMESTAMP",
      "name": "cyrus-null",
      "repositoryPath": "/Users/laptop/dev/cyrus-null",
      "baseBranch": "main",
      "linearWorkspaceId": "WORKSPACE_ID",
      "linearToken": "OAUTH_TOKEN_WILL_BE_HERE_AFTER_OAUTH",
      "workspaceBaseDir": "/Users/laptop/.cyrus/workspaces/cyrus-null",
      "isActive": true,
      "allowedTools": [
        "Read(**)",
        "Edit(**)",
        "Bash(git:*)",
        "Bash(gh:*)",
        "Task",
        "WebFetch",
        "WebSearch",
        "TodoRead",
        "TodoWrite",
        "NotebookRead",
        "NotebookEdit",
        "Batch"
      ],
      "labelPrompts": {
        "debugger": {
          "labels": ["Bug"]
        },
        "builder": {
          "labels": ["Feature", "Improvement"]
        },
        "scoper": {
          "labels": ["PRD"]
        },
        "orchestrator": {
          "labels": ["Orchestrator"],
          "allowedTools": "coordinator"
        }
      }
    }
  ],
  "ngrokAuthToken": "YOUR_NGROK_TOKEN",
  "ngrokDomain": "YOUR-STATIC-DOMAIN.ngrok-free.app"
}
```

**Примечание**: `ngrokDomain` - опциональное поле для платных планов ngrok со статическим доменом. Если не указан, будет использоваться динамический домен.

### Создание workspace directory

```bash
mkdir -p ~/.cyrus/workspaces/cyrus-null
```

---

## OAuth Flow

### Важно о ngrok URL

⚠️ **Проблема**: ngrok URL меняется при каждом перезапуске (бесплатный план).

**Решения:**

1. **Платный ngrok** - получить постоянный домен
2. **Обновлять Linear OAuth** - каждый раз добавлять новый callback URL
3. **Использовать localhost** - работает для OAuth, но НЕ для webhooks

### Получение текущего ngrok URL

При запуске Cyrus CLI ngrok URL отображается:

```text
🌐 Ngrok tunnel active: https://c82283292400.ngrok-free.app
```

### Обновление Linear OAuth приложения

1. Перейти в Linear: Settings → API → OAuth Applications → Your App
2. Добавить новый Callback URL: `https://NEW-NGROK-URL.ngrok-free.app/callback`
3. Сохранить изменения

### Выполнение OAuth flow

```bash
# Запустить Cyrus CLI
PROXY_URL=http://localhost:8787 node apps/cli/dist/app.js

# В отдельном терминале/браузере открыть:
open "http://localhost:8787/oauth/authorize?callback=http://localhost:8787/oauth/callback"
```

**Процесс:**

1. Browser → Linear authorization page
2. Нажать "Authorize"
3. Linear → redirect → proxy callback
4. Proxy обменяет code на OAuth token
5. Token сохранится в KV storage + вернется в CLI
6. CLI сохранит token в `~/.cyrus/config.json`

---

## Запуск и тестирование

### Dev режим (TypeScript watch)

Запускает hot-reload для всех пакетов:

```bash
# В корне проекта
pnpm --filter './packages/**' --filter './apps/cli' --parallel dev
```

### Запуск proxy-worker

```bash
cd apps/proxy-worker
npx wrangler dev --port 8787
```

### Запуск Cyrus CLI

```bash
# С локальным proxy
PROXY_URL=http://localhost:8787 node apps/cli/dist/app.js

# Cyrus запустится и:
# - Подключится к proxy
# - Запустит ngrok tunnel
# - Зарегистрирует webhook в Linear
# - Начнет мониторить issues
```

### Проверка подключения

```bash
# Проверка Linear tokens
node apps/cli/dist/app.js check-tokens

# Должно показать:
# cyrus-null (...): ✅ Valid
```

### Тестирование

1. **Создать issue в Linear** в вашем workspace
2. **Назначить issue на себя** (пользователь с OAuth token)
3. **Добавить метку** (Bug/Feature/PRD)
4. **Cyrus должен**:
   - Получить webhook
   - Создать git worktree
   - Запустить Claude Code session
   - Отправить результат комментарием в Linear

---

## Troubleshooting

### Проблема: "Invalid redirect_uri parameter"

**Причина**: redirect_uri в proxy не совпадает с Linear OAuth app.

**Решение**:

```bash
# Проверить .dev.vars
cat apps/proxy-worker/.dev.vars | grep OAUTH_REDIRECT_URI

# Должно быть:
OAUTH_REDIRECT_URI=http://localhost:8787/oauth/callback

# Если нужен ngrok callback, обновить и перезапустить:
OAUTH_REDIRECT_URI=https://YOUR-NGROK-URL.ngrok-free.app/callback
```

### Проблема: "Failed to validate token: 400"

**Причина**: Personal API token используется вместо OAuth token.

**Решение**: Выполнить OAuth flow для получения OAuth токена.

### Проблема: "Linear authentication failed"

**Причина**: OAuth token устарел или невалиден.

**Решение**:

```bash
# Обновить token
node apps/cli/dist/app.js refresh-token
```

### Проблема: ngrok URL меняется

**Временное решение**: Обновлять Linear OAuth app при каждом изменении.

**Постоянное решение**:

- Платный ngrok с постоянным доменом
- Использовать Cyrus Pro (managed proxy)

### Проблема: "Cannot apply deleted_classes migration"

**Причина**: Wrangler пытается применить миграцию несуществующего Durable Object.

**Решение**: Закомментировать migrations в `wrangler.toml`:

```toml
# [[migrations]]
# tag = "v2"
# deleted_classes = ["EventStreamDurableObject"]
```

### Проблема: TypeScript ошибки при pnpm dev

**Причина**: Пакеты не собраны.

**Решение**:

```bash
# Сначала собрать все пакеты
pnpm build

# Затем запустить dev режим
pnpm dev
```

---

## Полезные команды

```bash
# Проверка здоровья проекта
pnpm build           # Собрать все
pnpm test            # Запустить тесты
pnpm typecheck       # Проверить типы
pnpm lint            # Линтинг

# Cyrus CLI
node apps/cli/dist/app.js                    # Запуск
node apps/cli/dist/app.js check-tokens       # Проверка токенов
node apps/cli/dist/app.js refresh-token      # Обновить токен
node apps/cli/dist/app.js add-repository     # Добавить репозиторий
node apps/cli/dist/app.js --help             # Справка

# Логи
tail -f ~/.cyrus/logs/cyrus-YYYY-MM-DD.log   # Логи Cyrus
```

---

## Архитектура

```bash
┌─────────────────────────────────────────────────────┐
│                    Linear Issues                     │
│              (webhooks on assignment)                │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP POST
                       ↓
┌─────────────────────────────────────────────────────┐
│              ngrok → localhost:8787                  │
│            (apps/proxy-worker)                       │
│  - OAuth flow                                        │
│  - Webhook validation                                │
│  - Edge worker registration                          │
└──────────────────────┬──────────────────────────────┘
                       │ NDJSON stream
                       ↓
┌─────────────────────────────────────────────────────┐
│              Cyrus CLI (apps/cli)                    │
│           EdgeWorker + SessionManager                │
│  - Receives webhooks via NDJSON                      │
│  - Creates git worktrees                             │
│  - Manages Claude sessions                           │
└──────────────────────┬──────────────────────────────┘
                       │ spawns
                       ↓
┌─────────────────────────────────────────────────────┐
│         Claude Code (packages/claude-runner)         │
│  - Executes in git worktree                          │
│  - Uses allowed tools                                │
│  - Follows prompt template                           │
│  - Streams events back                               │
└──────────────────────┬──────────────────────────────┘
                       │ results
                       ↓
┌─────────────────────────────────────────────────────┐
│                 Back to Linear                       │
│              (comment with results)                  │
└─────────────────────────────────────────────────────┘
```

---

## Label Routing

Cyrus автоматически выбирает режим работы по метке issue:

| Метка | Режим | Описание |
|-------|-------|----------|
| Bug | debugger | Систематическое исследование проблемы |
| Feature, Improvement | builder | Реализация функциональности |
| PRD | scoper | Анализ требований и планирование |
| Orchestrator | orchestrator | Координация без редактирования кода |

---

## Следующие шаги

После успешной настройки:

1. **Создать CLAUDE.md** в репозитории для контекста проекта
2. **Настроить cyrus-setup.sh** для автоматической инициализации worktrees
3. **Настроить MCP серверы** для дополнительных инструментов
4. **Настроить GitHub Actions** для CI/CD

---

## Дополнительные ресурсы

- [Cyrus Documentation](https://github.com/ceedaragents/cyrus)
- [Linear API](https://linear.app/developers)
- [Claude Code Docs](https://docs.anthropic.com/claude-code)
- [ngrok Documentation](https://ngrok.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

---

**Дата создания**: 2025-10-14
**Версия Cyrus**: 0.1.57
**Автор**: Claude Code Session
