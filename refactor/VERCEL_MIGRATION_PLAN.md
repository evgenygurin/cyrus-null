# 🚀 ПОЛНЫЙ АНАЛИЗ: CYRUS НА VERCEL С NATIVE РЕШЕНИЯМИ

## 📊 EXECUTIVE SUMMARY

**Вердикт**: Проект Cyrus **ПОЛНОСТЬЮ СОВМЕСТИМ** с Vercel при использовании современного стека 2025 года!

**Ключевые открытия**:

- ✅ **Прокси НЕ НУЖЕН** - Vercel автоматически предоставляет HTTPS домен
- ✅ **Long-running Claude sessions** - решается через Inngest/QStash
- ✅ **Rate Limiting** - встроенная интеграция с Upstash
- ✅ **OAuth/Webhooks** - Edge Functions с ultra-low latency
- ✅ **Secrets Management** - Sensitive Environment Variables (2025)
- ✅ **Monitoring** - Vercel Drains + OpenTelemetry

---

## 🎯 ВАШ КЛЮЧЕВОЙ INSIGHT ПРАВИЛЬНЫЙ

> "нам прокси тогда не понадобится, если при деплое на vercel у нас будет домен с https"

**Абсолютно верно!** Vercel автоматически:

- Выделяет домен: `your-project.vercel.app`
- Генерирует SSL сертификат (Let's Encrypt)
- Обновляет сертификат автоматически (за 14-30 дней до истечения)
- Поддерживает custom domains с instant SSL

**Текущая архитектура**:

```text
Linear → ngrok tunnel → localhost:3456 → Cyrus CLI
```

**Новая архитектура на Vercel**:

```text
Linear → https://cyrus.vercel.app/webhook → Edge Function → Background Job → Claude Session
```

**Преимущества**:

- ❌ Нет ngrok (больше не нужен)
- ❌ Нет локального сервера
- ✅ Автоматический HTTPS
- ✅ Global CDN (< 50ms latency)
- ✅ Auto-scaling

---

## 💎 CLAUDE CODE БЕЗ API КЛЮЧА: MAX ПОДПИСКА

### Революционное Открытие: Предсказуемая Стоимость

**Ключевое изменение 2025**: Claude Code теперь работает **БЕЗ API КЛЮЧА** через подписку MAX!

**Проблема с API ключами**:

- Непредсказуемые расходы (pay-per-token)
- Риск превышения бюджета при длительных сессиях
- Необходимость мониторинга расходов в реальном времени
- Сложность планирования бюджета

**Решение через MAX подписку**:

- ✅ **Фиксированная стоимость**: $100 или $200/месяц (no surprises)
- ✅ **Без API ключей**: используется аутентификация через claude.ai аккаунт
- ✅ **Щедрые лимиты**: 225-900 сообщений каждые 5 часов
- ✅ **Автоматическое переключение моделей**: Sonnet ↔ Opus при приближении к лимиту

### Доступные Планы MAX

#### 5x Pro Plan ($100/месяц)

- **Лимиты**: ~225 сообщений каждые 5 часов
- **Модели**: Sonnet 4 + ограниченный доступ к Opus 4
- **Переключение**: Автоматически на 20% лимита
- **Use case**: Малые команды, умеренное использование

#### 20x Pro Plan ($200/месяц)

- **Лимиты**: ~900 сообщений каждые 5 часов
- **Модели**: Полный доступ к Sonnet 4 и Opus 4
- **Переключение**: Автоматически на 50% лимита
- **Use case**: Production deployment, интенсивное использование

### Настройка БЕЗ API Ключа

#### Шаг 1: Подписка MAX

```bash
# Оформить подписку на claude.ai
https://claude.ai/upgrade

# Выбрать план:
# - 5x Pro ($100/месяц) для умеренного использования
# - 20x Pro ($200/месяц) для production
```

#### Шаг 2: Аутентификация Claude Code

**ВАЖНО**: Удалить API ключ из окружения!

```bash
# Выход из текущей сессии
claude logout

# Вход ТОЛЬКО через MAX подписку (без Console credentials)
claude login
# Следуйте инструкциям в браузере
# НЕ добавляйте Claude Console credentials!
```

#### Шаг 3: Проверка Конфигурации

```bash
# Убедитесь, что переменная окружения НЕ установлена
unset ANTHROPIC_API_KEY

# Проверка в bash/zsh
echo $ANTHROPIC_API_KEY  # Должно быть пусто

# Проверка статуса
claude status
# Должно показать: "Authenticated via Claude subscription"
```

#### Шаг 4: Настройка Vercel Environment

```bash
# НЕ добавлять ANTHROPIC_API_KEY в Vercel!
# Вместо этого настроить аутентификацию через подписку:

# В Vercel Function или Inngest Job:
# Claude CLI будет использовать сохраненную аутентификацию
```

### Избежание Случайных API Расходов

**Критически важно**: Если переменная `ANTHROPIC_API_KEY` установлена, Claude Code будет использовать API вместо подписки!

**Checklist защиты**:

```bash
# 1. Удалить из shell конфигурации
# Проверить ~/.zshrc, ~/.bashrc, ~/.bash_profile
grep -r "ANTHROPIC_API_KEY" ~/.*rc ~/.*profile

# 2. Удалить из .env файлов
find . -name ".env*" -exec grep -l "ANTHROPIC_API_KEY" {} \;

# 3. Удалить из Vercel environment
vercel env rm ANTHROPIC_API_KEY --yes

# 4. Удалить из GitHub Secrets
gh secret list | grep ANTHROPIC

# 5. Настроить pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
if grep -r "ANTHROPIC_API_KEY" .; then
  echo "❌ ANTHROPIC_API_KEY found! Use MAX subscription instead"
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

### Мониторинг Использования

```bash
# Проверка оставшегося лимита
claude status
# Output:
# Plan: Max 20x Pro
# Usage: 127/900 messages (14%)
# Reset: in 3h 42m

# В коде можно добавить проверку перед запуском сессии
```

### Настройка для Production

#### Vercel Function с MAX подпиской

```typescript
// api/claude-session.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: Request) {
  // ВАЖНО: ANTHROPIC_API_KEY НЕ должен быть установлен!
  if (process.env.ANTHROPIC_API_KEY) {
    throw new Error('Remove ANTHROPIC_API_KEY to use MAX subscription');
  }

  // Claude Code будет использовать сохраненную аутентификацию
  const { stdout, stderr } = await execAsync('claude --continue /path/to/project');

  return Response.json({ output: stdout });
}
```

#### Inngest Job с MAX подпиской

```typescript
// jobs/claude-session.ts
import { inngest } from './client';

export const processClaudeSession = inngest.createFunction(
  { id: 'process-claude-session' },
  { event: 'linear.issue.assigned' },
  async ({ event, step }) => {
    // Проверка, что API ключ НЕ установлен
    await step.run('validate-auth', async () => {
      if (process.env.ANTHROPIC_API_KEY) {
        throw new Error('Remove ANTHROPIC_API_KEY - using MAX subscription');
      }
    });

    // Запуск Claude Code через подписку
    const result = await step.run('claude-session', {
      timeout: '3h'
    }, async () => {
      const runner = new ClaudeRunner({
        issueId: event.data.issueId,
        // API ключ НЕ передается - используется MAX подписка
      });
      return await runner.start();
    });

    return result;
  }
);
```

### Лимиты и Планирование

#### Расчет Лимитов

**5x Pro ($100/месяц)**:

- 225 сообщений / 5 часов = 45 сообщений/час
- 1080 сообщений/день (24 часа)
- 32,400 сообщений/месяц

**20x Pro ($200/месяц)**:

- 900 сообщений / 5 часов = 180 сообщений/час
- 4320 сообщений/день
- 129,600 сообщений/месяц

#### Практические Сценарии

**Средняя Claude сессия по Linear issue**:

- ~20-50 сообщений на issue
- ~10-30 минут работы
- ~5-10 tool calls

**5x Pro plan подходит для**:

- До 650 issues/месяц (225 msg *6 resets/day* 30 days / 30 msg avg)
- 1-2 активных разработчика
- Non-production или staging окружение

**20x Pro plan подходит для**:

- До 2600 issues/месяц (900 msg *6 resets/day* 30 days / 30 msg avg)
- 3-10 активных разработчиков
- Production окружение с высокой нагрузкой

### Сравнение: MAX Подписка vs API Key

| Аспект | MAX Подписка | API Key |
|--------|--------------|---------|
| **Стоимость** | $100-200/месяц (fixed) | $0.003-0.015/1K tokens (variable) |
| **Предсказуемость** | ✅ Полная | ❌ Зависит от использования |
| **Лимиты** | 225-900 msg/5h | Rate limits (RPM/TPM) |
| **Настройка** | `claude login` (1 команда) | API key management |
| **Безопасность** | ✅ Нет ключей для кражи | ⚠️ Нужно хранить секретно |
| **Мониторинг** | `claude status` | Отдельный billing dashboard |
| **Подходит для** | Production (предсказуемо) | Pay-as-you-go (переменная нагрузка) |

### Рекомендации

**Используйте MAX подписку если**:

- ✅ Нужна предсказуемая стоимость
- ✅ Production deployment
- ✅ Умеренная/высокая нагрузка (десятки issues/день)
- ✅ Хотите избежать surprise bills

**Используйте API key если**:

- ⚠️ Очень низкая нагрузка (< 5 issues/день)
- ⚠️ Спайковая нагрузка (редкие всплески)
- ⚠️ Автоматизация требует programmatic access
- ⚠️ Нужны специфичные API features

**Для Cyrus рекомендуется**: **MAX 5x Pro ($100/месяц)** для старта, переход на 20x Pro при масштабировании.

---

## 🏗️ СОВРЕМЕННАЯ АРХИТЕКТУРА (2025)

### Компоненты на Vercel

#### 1. **Edge Functions** (OAuth + Webhooks)

- **Технология**: Vercel Edge Runtime (V8-based)
- **Latency**: 50-200ms cold start (vs 50-500ms Serverless)
- **Use case**: OAuth flow, webhook receiver
- **Локация**: `api/oauth/[...].ts`, `api/webhook.ts`

**Код**:

```typescript
// api/oauth/authorize.ts (Edge Function)
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const callback = searchParams.get('callback');

  // Validate callback (whitelist)
  if (!isAllowedCallback(callback)) {
    return new Response('Invalid callback', { status: 400 });
  }

  // Generate state для CSRF protection
  const state = crypto.randomUUID();
  await kv.set(`oauth:state:${state}`, {
    callback,
    createdAt: Date.now()
  }, { ex: 600 }); // 10 min TTL

  // Redirect to Linear OAuth
  const authUrl = new URL('https://linear.app/oauth/authorize');
  authUrl.searchParams.set('client_id', process.env.LINEAR_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', `${req.url}/callback`);
  authUrl.searchParams.set('state', state);

  return Response.redirect(authUrl.toString());
}
```

#### 2. **Serverless Functions** (Heavy Processing)

- **Технология**: Node.js 20.x runtime
- **Timeout**: До 300 seconds (5 min) на Pro plan
- **Use case**: Token exchange, workspace metadata fetch
- **Локация**: `api/oauth/callback.ts`

**Код**:

```typescript
// api/oauth/callback.ts (Serverless)
export const config = { maxDuration: 60 };

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Verify state
  const stateData = await kv.get(`oauth:state:${state}`);
  if (!stateData) {
    return new Response('Invalid state', { status: 400 });
  }

  // Exchange code for token (может занять 5-10s)
  const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    body: JSON.stringify({ code, ... })
  });

  // Store encrypted token in Postgres
  await db.oauthTokens.create({
    workspaceId,
    accessToken: await encrypt(token),
    ...
  });

  // Trigger background job для session initialization
  await client.publishJSON({
    topic: 'session.initialize',
    body: { workspaceId, issueId }
  });

  return Response.redirect(stateData.callback);
}
```

#### 3. **Background Jobs** (Claude Sessions)

**Технология**: Inngest (рекомендуется) или QStash

**Inngest Integration**:

```typescript
// api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { processClaudeSession } from "@/jobs/claude-session";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processClaudeSession],
});
```

**Claude Session Job**:

```typescript
// jobs/claude-session.ts
import { inngest } from "@/lib/inngest";
import { ClaudeRunner } from "cyrus-claude-runner";

export const processClaudeSession = inngest.createFunction(
  {
    id: "process-claude-session",
    retries: 3
  },
  { event: "linear.issue.assigned" },
  async ({ event, step }) => {
    const { issueId, workspaceId, repositoryId } = event.data;

    // Step 1: Fetch issue details (30s timeout)
    const issue = await step.run('fetch-issue', async () => {
      return await linearClient.issue(issueId);
    });

    // Step 2: Create git worktree (60s timeout)
    const worktree = await step.run('create-worktree', async () => {
      // Здесь может быть вызов external worker API
      // или использование GitHub Actions workflow dispatch
      return await createWorktreeViaGitHubActions(repositoryId, issue);
    });

    // Step 3: Run Claude session (до нескольких часов!)
    const result = await step.run('claude-session', {
      timeout: '3h' // Inngest поддерживает долгие таймауты
    }, async () => {
      const runner = new ClaudeRunner({
        workspaceDir: worktree.path,
        issueId,
        ...
      });

      // Streaming responses back to Linear
      runner.on('message', async (msg) => {
        await step.sendEvent('claude-message', { msg });
      });

      return await runner.start();
    });

    // Step 4: Post результаты в Linear (30s)
    await step.run('post-results', async () => {
      await linearClient.commentCreate({
        issueId,
        body: result.summary
      });
    });

    // Step 5: Cleanup (опционально)
    await step.run('cleanup', async () => {
      await cleanupWorktree(worktree.id);
    });
  }
);
```

**Почему Inngest?**

- ✅ Нативная интеграция с Vercel
- ✅ Поддержка долгих timeout (часы/дни)
- ✅ Automatic retries with backoff
- ✅ Step-based orchestration
- ✅ Parallel execution (`Promise.all`)
- ✅ Sleep/pause (`step.sleep(duration)`)
- ✅ Built-in observability

**Альтернатива: QStash (Upstash)**

```typescript
// api/jobs/claude-session.ts
import { verifySignature } from '@upstash/qstash/nextjs';

async function handler(req: Request) {
  const { issueId } = await req.json();

  // Запускаем Claude session (до 5 min в одной функции)
  // Для долгих sessions - разбиваем на steps через QStash
  const runner = new ClaudeRunner({ issueId });
  await runner.start();

  return new Response('OK');
}

export default verifySignature(handler);
```

---

## 💾 STORAGE ARCHITECTURE

### 1. **Vercel KV** (Redis) - Session State & Cache

**Powered by**: Upstash Redis

**Use cases**:

- OAuth state (CSRF tokens)
- Rate limiting counters
- Active session registry
- Cache для Linear API responses

**Код**:

```typescript
import { kv } from '@vercel/kv';

// OAuth state
await kv.set(`oauth:state:${state}`, { callback, createdAt }, { ex: 600 });

// Rate limiting
const requests = await kv.incr(`rate:${ip}:${minute}`);
await kv.expire(`rate:${ip}:${minute}`, 60);

if (requests > 10) {
  return new Response('Rate limited', { status: 429 });
}

// Session registry
await kv.zadd('sessions:active', {
  score: Date.now(),
  member: sessionId
});
```

**Pricing**:

- Free: 30k requests/month
- Pro: $20/month → 500k requests

### 2. **Neon Postgres** - Persistent Data

**Use cases**:

- OAuth tokens (encrypted)
- Repository configurations
- Issue-session mappings
- Audit logs
- Workspace metadata

**Schema**:

```sql
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL UNIQUE,
  access_token_encrypted TEXT NOT NULL, -- AES-256-GCM encrypted
  refresh_token_encrypted TEXT,
  iv TEXT NOT NULL, -- Initialization vector для AES
  expires_at TIMESTAMPTZ NOT NULL,
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_email TEXT,
  workspace_name TEXT,
  INDEX idx_workspace (workspace_id)
);

CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  repository_path TEXT NOT NULL,
  base_branch TEXT DEFAULT 'main',
  is_active BOOLEAN DEFAULT TRUE,
  allowed_tools JSONB,
  label_prompts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (workspace_id) REFERENCES oauth_tokens(workspace_id)
);

CREATE TABLE claude_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id TEXT NOT NULL,
  repository_id UUID NOT NULL,
  session_id TEXT NOT NULL, -- Claude SDK session ID
  status TEXT NOT NULL, -- running, completed, failed
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  logs_path TEXT,
  FOREIGN KEY (repository_id) REFERENCES repositories(id),
  INDEX idx_issue (issue_id),
  INDEX idx_status (status)
);
```

**Serverless Connection**:

```typescript
import { neon } from '@neondatabase/serverless';

// HTTP mode (fastest для single queries)
const sql = neon(process.env.DATABASE_URL);
const result = await sql`SELECT * FROM oauth_tokens WHERE workspace_id = ${workspaceId}`;

// WebSocket mode (для transactions)
import { Pool } from '@neondatabase/serverless';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
  await client.query('COMMIT');
} finally {
  client.release();
}
```

**Pricing**:

- Free: 0.5GB storage, 512MB compute
- Launch: $19/month → 10GB storage, 2GB compute
- Scale: $69/month → 50GB storage, 8GB compute

### 3. **Vercel Edge Config** - Global Configuration

**Use cases**:

- Feature flags
- Rate limit configs
- Allowed callback URLs whitelist
- API keys для external services

**Код**:

```typescript
import { get } from '@vercel/edge-config';

// Ultra-low latency read (< 10ms globally)
const allowedCallbacks = await get('allowed_oauth_callbacks');
const rateLimitConfig = await get('rate_limits');

if (!allowedCallbacks.includes(callbackUrl)) {
  return new Response('Forbidden', { status: 403 });
}
```

**Pricing**: $10/month (unlimited reads, 1000 updates/month)

### 4. **Vercel Blob** - File Storage

**Use cases**:

- Session logs (markdown files)
- Git patch files
- Generated artifacts

**Код**:

```typescript
import { put } from '@vercel/blob';

const blob = await put(`sessions/${sessionId}/log.md`, logContent, {
  access: 'public',
  contentType: 'text/markdown',
});

// Public URL: https://xyz.public.blob.vercel-storage.com/sessions/...
```

**Pricing**: $0.15/GB storage + $0.30/GB bandwidth

---

## 🔒 SECURITY BEST PRACTICES (2025)

### 1. **Rate Limiting** (Upstash + Edge Middleware)

**Middleware**:

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true, // Track analytics
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/webhook', '/api/oauth/:path*'],
};
```

**Advanced: Multiple Tiers**:

```typescript
// Разные лимиты для OAuth vs webhooks
const oauthLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

const webhookLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // Выше для webhooks
});

// Идентификация по workspace ID вместо IP
const workspaceId = extractWorkspaceId(request);
const { success } = await webhookLimiter.limit(`webhook:${workspaceId}`);
```

### 2. **OAuth Security**

**Callback URL Whitelist**:

```typescript
// Edge Config или environment variable
const ALLOWED_CALLBACKS = [
  'http://localhost:3456/callback', // Local dev
  'https://cyrus.vercel.app/callback', // Production
  /^https:\/\/[a-z0-9-]+\.vercel\.app\/callback$/, // Preview deployments
];

function validateCallback(url: string): boolean {
  return ALLOWED_CALLBACKS.some(pattern => {
    if (typeof pattern === 'string') return url === pattern;
    return pattern.test(url);
  });
}
```

**CSRF Protection**:

```typescript
// State parameter с TTL
const state = crypto.randomUUID();
await kv.set(`oauth:state:${state}`, {
  callback,
  createdAt: Date.now(),
  nonce: crypto.randomUUID(), // Additional entropy
}, { ex: 600 }); // 10 minutes

// При callback - verify и delete immediately
const stateData = await kv.get(`oauth:state:${state}`);
await kv.del(`oauth:state:${state}`); // Prevent replay

if (!stateData || Date.now() - stateData.createdAt > 600000) {
  return new Response('Expired state', { status: 400 });
}
```

### 3. **Webhook Security**

**Signature Verification**:

```typescript
// api/webhook.ts
import { createHmac, timingSafeEqual } from 'crypto';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const signature = req.headers.get('linear-signature');
  const timestamp = req.headers.get('linear-delivery');
  const body = await req.text();

  // Validate timestamp (защита от replay)
  const webhookAge = Date.now() - parseInt(timestamp) * 1000;
  if (webhookAge > 5 * 60 * 1000) { // 5 minutes
    return new Response('Webhook too old', { status: 400 });
  }

  // Verify HMAC
  const expectedSignature = createHmac('sha256', process.env.LINEAR_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  // Timing-safe comparison
  if (!timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Process webhook...
}
```

**Replay Attack Protection**:

```typescript
// Храним webhook IDs в KV
const webhookId = webhook.webhookId;
const exists = await kv.get(`webhook:${webhookId}`);

if (exists) {
  console.log('Duplicate webhook, ignoring');
  return new Response('Duplicate', { status: 200 });
}

await kv.set(`webhook:${webhookId}`, true, { ex: 86400 }); // 24h TTL
```

### 4. **Secrets Management**

**Sensitive Environment Variables** (2025):

```bash
# Via Vercel CLI
vercel env add LINEAR_CLIENT_SECRET --type encrypted --sensitive
vercel env add LINEAR_WEBHOOK_SECRET --type encrypted --sensitive
vercel env add ENCRYPTION_KEY --type encrypted --sensitive

# ANTHROPIC_API_KEY - ТОЛЬКО если используете API (не рекомендуется)
# Для MAX подписки ($100-200/месяц) - НЕ добавляйте эту переменную
# vercel env add ANTHROPIC_API_KEY --type encrypted --sensitive
```

**Encryption Utility**:

```typescript
// lib/crypto.ts
import { webcrypto } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');

export async function encrypt(text: string): Promise<{ encrypted: string; iv: string }> {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await webcrypto.subtle.importKey(
    'raw',
    ENCRYPTION_KEY,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await webcrypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(text)
  );

  return {
    encrypted: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

export async function decrypt(encrypted: string, ivStr: string): Promise<string> {
  const key = await webcrypto.subtle.importKey(
    'raw',
    ENCRYPTION_KEY,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const iv = Buffer.from(ivStr, 'base64');
  const decrypted = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    Buffer.from(encrypted, 'base64')
  );

  return new TextDecoder().decode(decrypted);
}
```

### 5. **Input Validation**

**Zod Schema**:

```typescript
import { z } from 'zod';

const OAuthCallbackSchema = z.object({
  code: z.string().min(10),
  state: z.string().uuid(),
});

const WebhookPayloadSchema = z.object({
  type: z.literal('AppUserNotification'),
  action: z.enum(['issueAssignedToYou', 'issueNewComment', ...]),
  organizationId: z.string().uuid(),
  notification: z.object({
    issueId: z.string().uuid(),
    issue: z.object({
      id: z.string(),
      title: z.string(),
      identifier: z.string(),
    }),
  }),
});

// В handler
try {
  const payload = WebhookPayloadSchema.parse(JSON.parse(body));
  // ... process
} catch (error) {
  return new Response('Invalid payload', { status: 400 });
}
```

---

## 📊 MONITORING & OBSERVABILITY

### 1. **Vercel Drains** (2025)

**Unified export для всех данных**:

```typescript
// vercel.json
{
  "drains": [
    {
      "name": "Datadog",
      "type": "datadog",
      "apiKey": "$DATADOG_API_KEY",
      "site": "datadoghq.com",
      "sources": ["logs", "traces", "metrics"]
    },
    {
      "name": "Sentry",
      "type": "sentry",
      "dsn": "$SENTRY_DSN",
      "sources": ["errors", "traces"]
    }
  ]
}
```

### 2. **OpenTelemetry Integration**

```typescript
// instrumentation.ts (Next.js)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./instrumentation.edge');
  }
}

// instrumentation.node.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'https://api.honeycomb.io/v1/traces',
    headers: {
      'x-honeycomb-team': process.env.HONEYCOMB_API_KEY,
    },
  }),
  serviceName: 'cyrus-api',
});

sdk.start();
```

### 3. **Custom Logging**

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['token', 'secret', 'authorization', 'password'],
    censor: '[REDACTED]'
  },
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty'
  } : undefined,
});

// Usage
logger.info({ workspaceId, issueId }, 'Starting Claude session');
logger.error({ err, workspaceId }, 'Session failed');
```

### 4. **Metrics Dashboard**

```typescript
// api/metrics.ts (Internal endpoint)
import { kv } from '@vercel/kv';
import { sql } from '@vercel/postgres';

export default async function handler() {
  const [
    activeSessionsCount,
    totalSessions,
    avgSessionDuration,
    rateLimitHits,
  ] = await Promise.all([
    kv.zcard('sessions:active'),
    sql`SELECT COUNT(*) FROM claude_sessions`,
    sql`SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))
        FROM claude_sessions WHERE status = 'completed'`,
    kv.get('metrics:rate_limit_hits:today'),
  ]);

  return Response.json({
    activeSessions: activeSessionsCount,
    totalSessions: totalSessions.rows[0].count,
    avgDurationSeconds: avgSessionDuration.rows[0].avg,
    rateLimitHits: rateLimitHits || 0,
  });
}
```

---

## 💰 COST ESTIMATION

### Current (Self-hosted + ngrok)

- Cloudflare Workers Free: $0
- ngrok Free: $0
- Local electricity: ~$5/month
- **Total: ~$5/month**

### Option 1: Vercel + Claude Code MAX Подписка (Рекомендовано)

- **Vercel Pro**: $20/month
  - Serverless: 1000 GB-hours included
  - Edge: Unlimited
  - Bandwidth: 1TB included

- **Claude Code MAX 5x Pro**: $100/month
  - 225 сообщений/5h (32,400/месяц)
  - Sonnet 4 + ограниченный Opus 4
  - Предсказуемая стоимость
  - **БЕЗ API КЛЮЧА** (нет риска overspend)

- **Neon Postgres Launch**: $19/month
  - 10GB storage
  - 2GB compute
  - Serverless connection pooling

- **Upstash Redis (KV)**: $10/month
  - 1M requests/month
  - 1GB storage

- **Inngest**: $0-20/month
  - Free: 100k function runs
  - Pro: $20 → 1M runs

- **Monitoring (Optional)**:
  - Datadog: $15/host/month
  - Sentry: $26/month (team)
  - Або Vercel native monitoring: included

**Total: $149-189/month** с фиксированной стоимостью Claude

**Преимущества**:

- ✅ Предсказуемая стоимость (no surprises)
- ✅ Нет риска превышения бюджета
- ✅ Простая настройка (claude login)
- ✅ Безопаснее (нет API ключей для кражи)

### Option 2: Vercel + Anthropic API (Pay-as-you-go)

- **Vercel Pro**: $20/month
- **Neon Postgres Launch**: $19/month
- **Upstash Redis (KV)**: $10/month
- **Inngest**: $0-20/month
- **Anthropic API**: Переменная стоимость
  - Claude Sonnet 4: $3/1M input tokens, $15/1M output tokens
  - Средний issue: ~50K tokens → $0.15-0.75
  - 100 issues/месяц: $15-75 (зависит от сложности)
  - **Риск**: может достичь $200-500 при intensive use

**Total: $49-89/month** + переменная стоимость API ($15-500/месяц)

**Недостатки**:

- ⚠️ Непредсказуемая стоимость API
- ⚠️ Риск surprise bills при длительных сессиях
- ⚠️ Необходимость monitoring расходов
- ⚠️ Нужно хранить API ключ безопасно

### Option 3: Hybrid (Vercel + MAX 20x Pro для масштабирования)

Для production с высокой нагрузкой:

- **Vercel Pro**: $20/month
- **Claude Code MAX 20x Pro**: $200/month
  - 900 сообщений/5h (129,600/месяц)
  - Полный доступ к Opus 4
  - Подходит для 3-10 разработчиков
- **Neon Postgres Scale**: $69/month (больше compute)
- **Upstash Redis Pro**: $10/month
- **Inngest Pro**: $20/month
- **Monitoring**: $15-26/month

**Total: $334-345/month** для enterprise-grade deployment

### Рекомендации по Выбору

| Сценарий | Рекомендация | Причина |
|----------|--------------|---------|
| **Старт / MVP** | MAX 5x Pro ($149/месяц) | Предсказуемо, достаточно для начала |
| **Production (средняя нагрузка)** | MAX 5x Pro ($149/месяц) | Оптимальное соотношение цена/качество |
| **Production (высокая нагрузка)** | MAX 20x Pro ($334/месяц) | Нужна стабильность и высокие лимиты |
| **Редкое использование** | API Pay-as-you-go ($49+API) | Может быть дешевле при < 50 issues/месяц |
| **Нестабильная нагрузка** | Начать с MAX 5x, мониторить | Можно upgrade на 20x при необходимости |

**Вердикт для Cyrus**: **MAX 5x Pro ($149/месяц)** - золотая середина для production с предсказуемой стоимостью.

### Cost Optimization Tips

1. **Edge Functions для hot paths**:
   - OAuth/webhook endpoints
   - 9x cheaper холодного старту

2. **HTTP mode для Postgres** (single queries):

   ```typescript
   const sql = neon(DATABASE_URL); // Швидше і дешевше
   ```

3. **Vercel Edge Config для static data**:
   - Feature flags, configs
   - Замість Postgres queries

4. **Upstash QStash замість Inngest** (дешевше):
   - Free: 500 requests/day
   - Pro: $10/month → 100k requests

---

## 🚀 MIGRATION PLAN

### Phase 1: Foundation (Week 1)

**1.1 Setup Vercel Project**

```bash
vercel link
vercel env pull .env.local
```

**1.2 Setup Storage**

```bash
# Postgres
vercel postgres create cyrus-db

# KV (Redis)
vercel kv create cyrus-kv

# Edge Config
vercel edge-config create cyrus-config
```

**1.3 Setup Secrets**

```bash
vercel env add LINEAR_CLIENT_ID
vercel env add LINEAR_CLIENT_SECRET --sensitive
vercel env add LINEAR_WEBHOOK_SECRET --sensitive
vercel env add ENCRYPTION_KEY --sensitive

# ANTHROPIC_API_KEY - ОПЦИОНАЛЬНО (только если используете API вместо MAX подписки)
# Если используете Claude Code MAX подписку ($100-200/месяц):
# - НЕ добавляйте ANTHROPIC_API_KEY
# - Используйте 'claude login' для аутентификации через подписку
# - Это предотвратит случайные API расходы

# Если используете Anthropic API (pay-as-you-go):
# vercel env add ANTHROPIC_API_KEY --sensitive

# Рекомендуется: MAX подписка для предсказуемой стоимости
```

**1.4 Setup Claude Code Authentication (Рекомендовано: MAX Подписка)**

**Вариант A: Claude Code MAX Подписка (Рекомендовано)**

```bash
# Шаг 1: Оформить подписку на https://claude.ai/upgrade
# Выбрать: 5x Pro ($100/месяц) или 20x Pro ($200/месяц)

# Шаг 2: Установить Claude Code CLI (если еще не установлен)
npm install -g @anthropic-ai/claude-code

# Шаг 3: ВАЖНО - удалить API ключ из окружения
unset ANTHROPIC_API_KEY
# Проверить, что удален из всех конфигов shell
grep -r "ANTHROPIC_API_KEY" ~/.zshrc ~/.bashrc ~/.bash_profile

# Шаг 4: Выйти из текущей сессии Claude Code
claude logout

# Шаг 5: Войти через подписку MAX
claude login
# Следуйте инструкциям в браузере
# НЕ добавляйте Claude Console credentials!
# Используйте ТОЛЬКО аутентификацию через claude.ai аккаунт

# Шаг 6: Проверить статус
claude status
# Output должен показать: "Authenticated via Claude subscription"
# Plan: Max 5x Pro (или 20x Pro)
# Usage: X/225 messages (или X/900)

# Шаг 7: Тестовая сессия
claude "test prompt"
# Должно работать без ANTHROPIC_API_KEY
```

**Вариант B: Anthropic API (Не рекомендуется для production)**

```bash
# Только если по какой-то причине не используете MAX подписку
# Получить API ключ: https://console.anthropic.com/settings/keys
vercel env add ANTHROPIC_API_KEY --sensitive

# В коде будет использоваться process.env.ANTHROPIC_API_KEY
# ВАЖНО: Это приведет к непредсказуемым расходам!
```

**Checklist для MAX подписки**:

- [ ] Подписка MAX оформлена (5x или 20x Pro)
- [ ] Claude Code CLI установлен
- [ ] ANTHROPIC_API_KEY удален из всех .env файлов
- [ ] ANTHROPIC_API_KEY удален из shell конфигов
- [ ] `claude logout` выполнен
- [ ] `claude login` выполнен (БЕЗ Console credentials)
- [ ] `claude status` показывает аутентификацию через подписку
- [ ] Тестовая команда `claude "test"` работает
- [ ] ANTHROPIC_API_KEY НЕ добавлен в Vercel environment variables

**Преимущества MAX подписки**:

- ✅ Фиксированная стоимость $100-200/месяц
- ✅ Нет риска surprise bills
- ✅ Простая настройка (одна команда)
- ✅ Безопаснее (нет API ключей для кражи)
- ✅ Мониторинг через `claude status`

### Phase 2: Core API (Week 2)

**2.1 OAuth Flow**

- [ ] `api/oauth/authorize.ts` (Edge)
- [ ] `api/oauth/callback.ts` (Serverless)
- [ ] Callback URL whitelist в Edge Config
- [ ] Token encryption в Postgres

**2.2 Webhook Receiver**

- [ ] `api/webhook.ts` (Edge)
- [ ] HMAC verification
- [ ] Replay protection
- [ ] Rate limiting middleware

**2.3 Database Schema**

```bash
psql $DATABASE_URL -f migrations/001_initial.sql
```

### Phase 3: Background Jobs (Week 3)

**3.1 Inngest Setup**

```bash
npm install inngest
vercel env add INNGEST_SIGNING_KEY
vercel env add INNGEST_EVENT_KEY
```

**3.2 Job Functions**

- [ ] `jobs/claude-session.ts`
- [ ] `jobs/git-worktree.ts` (via GitHub Actions API)
- [ ] `jobs/cleanup.ts`

**3.3 Testing**

```bash
npx inngest-cli dev # Local testing
```

### Phase 4: Security & Monitoring (Week 4)

**4.1 Security Hardening**

- [ ] Rate limiting middleware
- [ ] OAuth callback validation
- [ ] Webhook replay protection
- [ ] Input validation (Zod)

**4.2 Monitoring Setup**

- [ ] Vercel Drains → Datadog
- [ ] Sentry error tracking
- [ ] Custom metrics endpoint
- [ ] Uptime monitoring (UptimeRobot/Better Uptime)

**4.3 Load Testing**

```bash
k6 run load-tests/webhook-stress.js
```

### Phase 5: Migration & Rollout (Week 5)

**5.1 Parallel Run**

- [ ] Run Vercel + existing Cloudflare Worker
- [ ] 10% traffic to Vercel (via Linear webhook testing)
- [ ] Compare metrics

**5.2 Full Cutover**

- [ ] Update Linear webhook URL → `https://cyrus.vercel.app/webhook`
- [ ] Update OAuth redirect URI → `https://cyrus.vercel.app/oauth/callback`
- [ ] Monitor for 48h

**5.3 Decommission**

- [ ] Turn off local Cyrus CLI
- [ ] Remove ngrok
- [ ] Archive Cloudflare Worker

---

## 🎯 АРХИТЕКТУРНЫЕ РЕШЕНИЯ ДЛЯ SPECIFIC USE CASES

### Git Worktree Management

**Problem**: Vercel Functions ephemeral, git worktrees потребують persistent filesystem.

**Solution 1: GitHub Actions Workflow Dispatch**

```typescript
// jobs/create-worktree.ts (Inngest)
const result = await step.run('dispatch-workflow', async () => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const workflow = await octokit.actions.createWorkflowDispatch({
    owner: 'your-org',
    repo: 'your-repo',
    workflow_id: 'create-worktree.yml',
    ref: 'main',
    inputs: {
      issueId: issue.id,
      branchName: issue.branchName,
    }
  });

  // Poll для completion
  return await pollWorkflowCompletion(workflow.id);
});
```

**GitHub Actions Workflow**:

```yaml
# .github/workflows/create-worktree.yml
name: Create Git Worktree
on:
  workflow_dispatch:
    inputs:
      issueId:
        required: true
      branchName:
        required: true

jobs:
  create-worktree:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create worktree
        run: |
          git worktree add .worktrees/${{ inputs.branchName }} -b ${{ inputs.branchName }}
      - name: Setup Claude authentication
        run: |
          # Для MAX подписки: используйте 'claude login' вместо API ключа
          # claude login (требует интерактивной аутентификации)

          # Для API (не рекомендуется): используйте переменную окружения
          # echo "ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}" >> $GITHUB_ENV

      - name: Run Claude session
        run: |
          cd .worktrees/${{ inputs.branchName }}
          # Claude Code будет использовать сохраненную аутентификацию MAX подписки
          # или ANTHROPIC_API_KEY если установлен (не рекомендуется)
          npx cyrus process --issue ${{ inputs.issueId }}
```

**Solution 2: Persistent VPS Worker (Hybrid)**

- Vercel Functions для HTTP (OAuth, webhooks)
- Small VPS (Fly.io/Railway $5/month) для git operations
- Communication via Redis queue

```typescript
// Vercel pushes jobs to Redis
await kv.rpush('worktree:queue', JSON.stringify({
  issueId,
  repositoryId,
  branchName,
}));

// VPS worker polls Redis
while (true) {
  const job = await kv.blpop('worktree:queue', 30);
  if (job) {
    await processWorktreeJob(JSON.parse(job[1]));
  }
}
```

### Claude Streaming Responses

**Problem**: Claude sessions можуть тривати години, потрібно streaming updates в Linear.

**Solution: Inngest Step Events**

```typescript
export const processClaudeSession = inngest.createFunction(
  { id: "claude-session" },
  { event: "linear.issue.assigned" },
  async ({ event, step }) => {
    const runner = new ClaudeRunner({ issueId: event.data.issueId });

    // Stream messages до Linear через step events
    runner.on('message', async (message) => {
      await step.sendEvent('claude.message', {
        name: 'claude.message',
        data: { issueId: event.data.issueId, message }
      });
    });

    // Окремий function слухає events та постить в Linear
    return await runner.start();
  }
);

// Окремий function для posting
export const postClaudeMessage = inngest.createFunction(
  { id: "post-claude-message" },
  { event: "claude.message" },
  async ({ event }) => {
    await linearClient.commentCreate({
      issueId: event.data.issueId,
      body: `**Claude**: ${event.data.message}`
    });
  }
);
```

### Multi-Repository Support

**Storage**:

```sql
-- Зберігаємо metadata в Postgres
CREATE TABLE repositories (
  id UUID PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  base_branch TEXT DEFAULT 'main',
  worker_endpoint TEXT, -- Для hybrid architecture
  UNIQUE(workspace_id, github_owner, github_repo)
);

CREATE TABLE active_sessions (
  id UUID PRIMARY KEY,
  repository_id UUID NOT NULL,
  issue_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  workflow_run_id TEXT, -- GitHub Actions run ID
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (repository_id) REFERENCES repositories(id)
);
```

---

## 🔍 VERCEL ALTERNATIVES COMPARISON

| Feature | Vercel + Inngest | Cloudflare Workers + DO | Railway/Render |
|---------|------------------|-------------------------|----------------|
| **Setup Complexity** | Low | Medium | Very Low |
| **Cost (100k req/mo)** | $49 | $5 | $5-25 |
| **Max Duration** | Hours (Inngest) | 30s (CF), Hours (DO) | Unlimited |
| **HTTPS** | Auto | Auto | Auto |
| **Storage** | Postgres/KV | KV/D1/DO | Postgres |
| **Observability** | Excellent (Drains) | Basic | Good |
| **Scalability** | Auto | Excellent | Manual |
| **DX** | Excellent | Good | Excellent |

**Рекомендация**: Vercel + Inngest для production-grade SaaS.

---

## ✅ FINAL CHECKLIST

### Pre-Deployment

- [ ] Ротировать все secrets (Linear token з git history!)
- [ ] Setup Vercel project з environment variables
- [ ] Create Postgres schema
- [ ] Setup KV для rate limiting
- [ ] Setup Edge Config для whitelists
- [ ] Configure Inngest integration
- [ ] Write integration tests

### Security

- [ ] OAuth callback URL whitelist
- [ ] Webhook HMAC verification
- [ ] Replay attack protection
- [ ] Rate limiting (10 req/min OAuth, 100 req/min webhooks)
- [ ] Input validation (Zod schemas)
- [ ] Sensitive environment variables
- [ ] Token encryption at rest

### Monitoring

- [ ] Vercel Drains → Datadog/Sentry
- [ ] Custom metrics endpoint
- [ ] Uptime monitoring
- [ ] Error alerting (Slack/PagerDuty)
- [ ] Cost alerts (Vercel dashboard)

### Testing

- [ ] Unit tests (Vitest)
- [ ] Integration tests (OAuth flow, webhooks)
- [ ] Load testing (k6, 1000 concurrent webhooks)
- [ ] Security testing (OWASP ZAP)

### Documentation

- [ ] API documentation
- [ ] Deployment runbook
- [ ] Incident response playbook
- [ ] Cost optimization guide

---

## 📚 RECOMMENDED RESOURCES

### Vercel Official

- [Vercel Functions Limits](https://vercel.com/docs/functions/limits)
- [Vercel Storage Overview](https://vercel.com/docs/storage)
- [Edge Functions Best Practices](https://vercel.com/docs/functions/edge-functions)
- [Sensitive Environment Variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables)

### Integrations

- [Inngest + Vercel Guide](https://www.inngest.com/docs/deploy/vercel)
- [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver)
- [Vercel AI SDK + Claude](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic)

### Security

- [OWASP OAuth 2.0 Security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Security_Cheat_Sheet.html)
- [Webhook Security Best Practices](https://hookdeck.com/webhooks/guides/webhook-security-prevent-vulnerabilities)

---

## 🎉 ВИСНОВОК

**Vercel з modern stack 2025 року - ІДЕАЛЬНА платформа для Cyrus**:

✅ **Не потрібен прокси** - автоматичний HTTPS з Let's Encrypt
✅ **Long-running tasks** - вирішується через Inngest/QStash
✅ **Global performance** - Edge Functions з < 50ms latency
✅ **Вбудована безпека** - Rate limiting, Sensitive env vars, OpenTelemetry
✅ **Scalability** - Auto-scaling до millions requests
✅ **DX** - Найкращий developer experience на ринку

**Єдиний trade-off**: Git worktrees потребують або GitHub Actions, або невеликий VPS worker ($5/mo).

**Рекомендована архітектура**: Vercel (API) + Inngest (Jobs) + GitHub Actions (Git ops) = Production-ready SaaS за $49/month.
