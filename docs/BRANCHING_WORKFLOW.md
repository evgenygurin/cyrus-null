# Branching Workflow для Cyrus

## Общие принципы

Этот документ описывает правильный workflow для работы с ветками в проекте Cyrus.

## Структура веток

```
main (production)
  └── feature/branch-name (feature branch)
  └── refactor/branch-name (refactoring branch)
  └── fix/branch-name (bugfix branch)
```

## Правильный алгоритм работы с PR

### 1. Работа с СУЩЕСТВУЮЩИМ PR

Если PR уже создан (например, PR #14), **НЕ создавайте новую ветку**. Используйте существующую:

```bash
# Шаг 1: Получить информацию о PR
gh pr view 14 --json headRefName,baseRefName

# Пример вывода:
# {"baseRefName":"main","headRefName":"refactor/codebase-improvements"}

# Шаг 2: Получить ветку PR с remote
git fetch origin refactor/codebase-improvements

# Шаг 3: Создать локальную ветку, отслеживающую remote
git checkout -b refactor/codebase-improvements origin/refactor/codebase-improvements

# Или если ветка уже существует локально:
git checkout refactor/codebase-improvements
git pull origin refactor/codebase-improvements

# Шаг 4: Внести изменения и закоммитить
git add .
git commit -m "Your commit message"

# Шаг 5: Запушить в PR
git push origin refactor/codebase-improvements
```

### 2. Создание НОВОГО PR

Если PR еще не существует:

```bash
# Шаг 1: Создать новую ветку от main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Шаг 2: Внести изменения
# ... ваши изменения ...

# Шаг 3: Закоммитить
git add .
git commit -m "feat: your feature description"

# Шаг 4: Запушить и создать PR
git push -u origin feature/your-feature-name

# Шаг 5: Создать PR через GitHub CLI
gh pr create --title "Your PR Title" --body "Description"

# Или через веб-интерфейс GitHub
```

## Naming Convention для веток

### Feature branches (новая функциональность)
```
feature/add-oauth-service
feature/implement-config-service
feature/user-authentication
```

### Refactoring branches (рефакторинг)
```
refactor/extract-services
refactor/codebase-improvements
refactor/clean-architecture
```

### Bug fix branches (исправление багов)
```
fix/oauth-token-refresh
fix/config-validation
fix/memory-leak
```

### Documentation branches
```
docs/update-architecture
docs/api-documentation
docs/contributing-guide
```

## Частые ошибки и как их избежать

### ❌ НЕПРАВИЛЬНО: Создание новой ветки для существующего PR

```bash
# НЕ ДЕЛАЙТЕ ТАК!
git checkout -b refactor-pr-14  # Создание неправильной ветки
git push origin refactor-pr-14  # Push в неправильную ветку
```

**Проблема:** PR #14 связан с веткой `refactor/codebase-improvements`, а не с `refactor-pr-14`. Ваши изменения не попадут в PR.

### ✅ ПРАВИЛЬНО: Использование существующей ветки PR

```bash
# Проверить имя ветки PR
gh pr view 14 --json headRefName

# Получить и переключиться на правильную ветку
git fetch origin refactor/codebase-improvements
git checkout -b refactor/codebase-improvements origin/refactor/codebase-improvements

# Или если ветка уже существует:
git checkout refactor/codebase-improvements
git pull origin refactor/codebase-improvements
```

## Исправление ошибок

### Если вы создали неправильную ветку

```bash
# 1. Сохранить текущие изменения
git log --oneline -1  # Запомнить SHA коммита (например, ade61e2)

# 2. Переключиться на правильную ветку
git checkout refactor/codebase-improvements

# 3. Применить коммит из неправильной ветки
git cherry-pick ade61e2

# 4. Запушить в правильную ветку
git push origin refactor/codebase-improvements

# 5. Удалить неправильную ветку
git branch -D refactor-pr-14
git push origin --delete refactor-pr-14
```

## Проверка текущего состояния

### Проверить какой PR связан с веткой
```bash
gh pr list --head refactor/codebase-improvements
```

### Проверить upstream ветки
```bash
git branch -vv
```

### Проверить граф коммитов
```bash
git log --oneline --graph --all --decorate -20
```

## Best Practices

1. **Всегда проверяйте имя ветки PR** перед началом работы
2. **Используйте `gh pr view` для получения информации о PR**
3. **Настраивайте upstream tracking** при первом push:
   ```bash
   git push -u origin branch-name
   ```
4. **Регулярно синхронизируйтесь с main**:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main  # Или git merge main
   ```
5. **Проверяйте статус перед push**:
   ```bash
   git status
   git log --oneline -5
   ```

## Автоматизация

### Alias для быстрой проверки PR

Добавьте в `~/.gitconfig`:

```ini
[alias]
    pr-checkout = "!f() { gh pr view $1 --json headRefName -q .headRefName | xargs -I {} git checkout -b {} origin/{}; }; f"
    pr-info = "!f() { gh pr view $1 --json headRefName,baseRefName,state; }; f"
```

Использование:
```bash
git pr-info 14              # Показать информацию о PR #14
git pr-checkout 14          # Переключиться на ветку PR #14
```

## Полезные команды

### Показать все ветки и их upstream
```bash
git branch -vv --all
```

### Показать отличия между локальной и remote веткой
```bash
git diff @{upstream}
```

### Показать коммиты, которые есть локально, но нет в remote
```bash
git log @{upstream}..HEAD
```

### Показать коммиты, которые есть в remote, но нет локально
```bash
git log HEAD..@{upstream}
```

---

**Последнее обновление:** October 14, 2025  
**Версия:** 1.0.0
