# 🔍 Cyrus Agent Monitoring Guide

## Быстрый Старт

```bash
# Проверить статус агента
./scripts/monitor-cyrus.sh status

# Смотреть live логи (реальное время)
./scripts/monitor-cyrus.sh live

# Показать последний лог задачи
./scripts/monitor-cyrus.sh logs

# Показать лог конкретной задачи
./scripts/monitor-cyrus.sh logs CCB-208

# Список всех задач
./scripts/monitor-cyrus.sh tasks

# Следить за конкретной задачей (обновляется каждые 2 сек)
./scripts/monitor-cyrus.sh watch CCB-208
```

---

## 📊 Где Хранятся Логи

### 1. **Readable Markdown Logs** (для людей)

```text
/Users/laptop/.cyrus/logs/CCB-XXX/session-XXXXXXXX.md
```

**Формат**: Красиво отформатированный markdown с:
- Timestamp каждого действия
- Команды, которые выполняет Claude
- Результаты tool calls
- Thinking процесс агента

**Пример**:
```markdown
## 04:52:17 - Claude Response
I'll analyze this Linear issue...

### 04:52:29 - Tool: Bash
- **command**: git status
- **description**: Check git repository status
```

### 2. **JSON Logs** (для программ)

```text
/Users/laptop/.cyrus/logs/CCB-XXX/session-XXXXXXXX.jsonl
```

**Формат**: NDJSON (newline-delimited JSON) - каждая строка = отдельное событие

**Парсинг**:
```bash
# Показать все tool calls
cat /Users/laptop/.cyrus/logs/CCB-208/session-*.jsonl | jq 'select(.type == "tool_use")'

# Показать только ошибки
cat /Users/laptop/.cyrus/logs/CCB-208/session-*.jsonl | jq 'select(.error != null)'

# Сколько токенов использовано
cat /Users/laptop/.cyrus/logs/CCB-208/session-*.jsonl | jq '.usage' | jq -s 'add'
```

### 3. **Live Stdout** (пока процесс работает)

```text
/tmp/cyrus-live.log
```

**Формат**: Прямой вывод Cyrus процесса с:
- Webhook events
- Session creation
- EdgeWorker actions
- Error messages

---

## 🎯 Типичные Сценарии Мониторинга

### **"Cyrus висит, что он делает?"**

```bash
# Вариант 1: Проверить статус
./scripts/monitor-cyrus.sh status

# Вариант 2: Посмотреть live логи
./scripts/monitor-cyrus.sh live

# Вариант 3: Проверить последнюю активность задачи
./scripts/monitor-cyrus.sh logs CCB-208
```

### **"Cyrus сломался?"**

```bash
# Проверить, запущен ли процесс
./scripts/monitor-cyrus.sh status
# Если показывает "NOT RUNNING" → нужно перезапустить

# Посмотреть последние ошибки в live log
tail -100 /tmp/cyrus-live.log | grep -i error

# Посмотреть последний лог задачи на ошибки
./scripts/monitor-cyrus.sh logs | grep -i error
```

### **"Сколько задач Cyrus обработал?"**

```bash
# Список всех задач с количеством сессий
./scripts/monitor-cyrus.sh tasks

# Вывод:
#   CCB-208: 3 sessions | Last: 2025-10-14 07:56
#   CCB-192: 5 sessions | Last: 2025-10-14 04:30
```

### **"Какие команды Cyrus выполнял?"**

```bash
# Markdown log легко читать
./scripts/monitor-cyrus.sh logs CCB-208 | less

# Или программно через jq
cat ~/.cyrus/logs/CCB-208/session-*.jsonl | \
  jq 'select(.type == "tool_use") | {tool: .tool, command: .input.command}'
```

---

## 🚨 Troubleshooting

### Проблема: "No logs found"

```bash
# Проверить, существует ли директория логов
ls /Users/laptop/.cyrus/logs/

# Проверить права доступа
ls -ld /Users/laptop/.cyrus/logs/
```

### Проблема: "Process not running"

```bash
# Перезапустить Cyrus
cd /Users/laptop/dev/cyrus-null
export LINEAR_DIRECT_WEBHOOKS=true
export LINEAR_WEBHOOK_SECRET=lin_wh_gcCjBncJGFsly6dDyow2xhCLEVHNxMsE3miEGdN1zqFC
export PROXY_URL=http://localhost:3456
export CYRUS_HOST_EXTERNAL=true
export LINEAR_CLIENT_ID=cc1c726cab2b79c2e310c016dfa5c46e
export LINEAR_CLIENT_SECRET=d9931ab6c6b0b5181dcffa6750981a2b
export CYRUS_BASE_URL=https://prepectoral-phytophagous-benton.ngrok-free.dev
node apps/cli/dist/app.js > /tmp/cyrus-live.log 2>&1 &
```

### Проблема: "Cyrus не реагирует на новые задачи"

```bash
# Проверить webhooks
tail -f /tmp/cyrus-live.log | grep "Incoming webhook"

# Если не видишь webhooks → проблема с ngrok или Linear configuration
# Если видишь webhooks но нет обработки → проверь Linear agent session creation
```

---

## 📈 Метрики и KPI

### Производительность

```bash
# Среднее время обработки задачи
for log in ~/.cyrus/logs/CCB-*/session-*.md; do
  START=$(grep "Started:" "$log" | cut -d: -f2-)
  # Calculate duration...
done

# Количество задач в час
find ~/.cyrus/logs/ -name "session-*.md" -mmin -60 | wc -l
```

### Успешность

```bash
# Задачи завершённые успешно
grep -l "All subroutines completed" ~/.cyrus/logs/*/session-*.jsonl | wc -l

# Задачи с ошибками
grep -l "error" ~/.cyrus/logs/*/session-*.jsonl | wc -l
```

### Использование ресурсов

```bash
# Использование токенов (из JSON логов)
cat ~/.cyrus/logs/CCB-*/session-*.jsonl | \
  jq -s 'map(select(.usage != null) | .usage) | add'

# Количество tool calls
cat ~/.cyrus/logs/CCB-*/session-*.jsonl | \
  jq 'select(.type == "tool_use")' | wc -l
```

---

## 🔔 Настройка Алертов (Опционально)

### macOS Terminal Notifier

```bash
# Install
brew install terminal-notifier

# Watch for errors and notify
tail -f /tmp/cyrus-live.log | while read line; do
  if echo "$line" | grep -qi "error"; then
    terminal-notifier -title "Cyrus Error" -message "$line"
  fi
done
```

### Slack Webhook (для команды)

```bash
# Add to monitor script
if grep -q "error" /tmp/cyrus-live.log; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Cyrus encountered an error"}' \
    YOUR_SLACK_WEBHOOK_URL
fi
```

---

## 📚 Дополнительные Ресурсы

- **Linear Issue Activity**: Смотри agent activity прямо в Linear UI
- **GitHub Repository**: Проверяй PR'ы созданные Cyrus
- **Sentry** (если настроено): Мониторинг ошибок в production

---

**Создано**: 2025-10-14
**Автор**: Claude + Cyrus
