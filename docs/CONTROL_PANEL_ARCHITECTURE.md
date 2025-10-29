# Cyrus Control Panel - Architecture & Design

## Оглавление

- [Обзор](#обзор)
- [Архитектура решения](#архитектура-решения)
- [Технический стек](#технический-стек)
- [Основные функциональные модули](#основные-функциональные-модули)
- [UI/UX Дизайн](#uiux-дизайн)
- [API & Интеграции](#api--интеграции)
- [Безопасность](#безопасность)
- [Deployment & Infrastructure](#deployment--infrastructure)
- [Roadmap](#roadmap)

---

## Обзор

**Cyrus Control Panel** - это современная веб-панель управления для Cyrus AI Agent, предоставляющая централизованный интерфейс для:

- Мониторинга активных сессий Claude
- Управления репозиториями и Linear workspace
- Просмотра истории и аналитики работы агента
- Настройки конфигурации и инструментов
- Управления подпиской и биллингом

### Целевая аудитория

- DevOps инженеры, настраивающие Cyrus для команд
- Разработчики, использующие Cyrus для автоматизации
- Менеджеры проектов, мониторящие прогресс задач
- Администраторы, управляющие доступом и настройками

---

## Архитектура решения

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│                     (Next.js 15 App)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Next.js 15 App Router (SSR/RSC)                │   │
│  │  • Server Components для начального рендеринга            │   │
│  │  • Client Components для интерактивности                 │   │
│  │  • API Routes для бэкенд логики                          │   │
│  │  • Server Actions для mutations                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────┬────────────────────┬──────────────────────┬────────────────┘
     │                    │                      │
     │                    │                      │
┌────▼────────┐  ┌────────▼─────────┐  ┌────────▼──────────┐
│   Vercel    │  │   Cloudflare     │  │  External APIs    │
│  Postgres   │  │   Workers KV     │  │                   │
│  (Neon)     │  │  (Cache/State)   │  │  • Linear API     │
│             │  │                  │  │  • Stripe API     │
│  • Users    │  │  • Sessions      │  │  • GitHub API     │
│  • Repos    │  │  • Real-time     │  │  • Anthropic API  │
│  • Issues   │  │    data          │  │                   │
│  • Logs     │  │  • Webhooks      │  └───────────────────┘
└─────────────┘  └──────────────────┘
     ↑
     │ WebSocket (optional)
     │
┌────┴──────────────────────────────────────────────────────────┐
│              Cyrus CLI / Edge Worker                          │
│         (Running on user's machine/server)                    │
│                                                               │
│  • Connects to proxy-worker                                   │
│  • Executes Claude sessions                                   │
│  • Reports status via REST API                                │
│  • Streams events to control panel                            │
└───────────────────────────────────────────────────────────────┘
```

### Модули и их взаимодействие

```
Control Panel App
│
├── 📱 Frontend Layer (Next.js 15 + React 19)
│   ├── App Router Pages
│   │   ├── / - Dashboard
│   │   ├── /sessions - Active Sessions
│   │   ├── /repositories - Repository Management
│   │   ├── /history - Execution History
│   │   ├── /settings - Configuration
│   │   └── /billing - Subscription Management
│   │
│   ├── UI Components (shadcn/ui + Radix)
│   │   ├── SessionMonitor
│   │   ├── IssueCard
│   │   ├── RepositoryList
│   │   ├── ConfigEditor
│   │   └── AnalyticsCharts
│   │
│   └── State Management
│       ├── React Query (server state)
│       ├── Zustand (client state)
│       └── Server Actions (mutations)
│
├── 🔌 API Layer (Next.js API Routes)
│   ├── /api/sessions
│   │   ├── GET /active
│   │   ├── GET /:id
│   │   └── POST /:id/kill
│   │
│   ├── /api/repositories
│   │   ├── GET /list
│   │   ├── POST /create
│   │   ├── PUT /:id
│   │   └── DELETE /:id
│   │
│   ├── /api/webhooks
│   │   ├── POST /linear
│   │   └── POST /stripe
│   │
│   ├── /api/auth
│   │   ├── /login
│   │   ├── /logout
│   │   └── /callback
│   │
│   └── /api/analytics
│       ├── GET /overview
│       └── GET /sessions/stats
│
├── 💾 Data Layer
│   ├── PostgreSQL (Vercel Postgres)
│   │   ├── users
│   │   ├── repositories
│   │   ├── sessions
│   │   ├── issues
│   │   └── execution_logs
│   │
│   ├── Cloudflare KV (Cache)
│   │   ├── active_sessions
│   │   ├── user_preferences
│   │   └── webhook_queue
│   │
│   └── Prisma ORM
│       └── Type-safe database access
│
└── 🔧 Integration Layer
    ├── Linear SDK
    ├── Stripe SDK
    ├── GitHub API
    └── Cyrus CLI Communication
```

---

## Технический стек

### Frontend

| Технология | Версия | Назначение | Обоснование |
|------------|--------|------------|-------------|
| **Next.js** | 15.x | React Framework | • App Router с Server Components<br>• Built-in API routes<br>• Оптимизация производительности<br>• SEO из коробки |
| **React** | 19.x | UI Library | • Новейшие features (Server Components, Actions)<br>• Экосистема и поддержка<br>• Concurrent rendering |
| **TypeScript** | 5.x | Type System | • Type safety<br>• Better DX<br>• Снижение багов в рантайме |
| **Tailwind CSS** | 4.x | Styling | • Utility-first подход<br>• Быстрая разработка<br>• Минимальный bundle size<br>• Кастомизация через конфиг |
| **shadcn/ui** | Latest | UI Components | • Готовые компоненты на Radix UI<br>• Доступность из коробки<br>• Полная кастомизация<br>• Copy-paste approach |
| **Radix UI** | Latest | Primitives | • Accessibility<br>• Unstyled components<br>• Keyboard navigation<br>• Focus management |
| **Lucide React** | Latest | Icons | • Современные иконки<br>• Tree-shakeable<br>• Consistent design |

### State Management

| Технология | Назначение | Обоснование |
|------------|------------|-------------|
| **TanStack Query** (React Query) | Server State | • Автоматический кеш<br>• Оптимистичные обновления<br>• Background refetch<br>• Devtools |
| **Zustand** | Client State | • Минималистичный API<br>• Без boilerplate<br>• TypeScript first<br>• <1kb размер |
| **Server Actions** | Mutations | • Built-in в Next.js 15<br>• Type-safe API<br>• Прогрессивное улучшение |

### Backend & API

| Технология | Назначение | Обоснование |
|------------|------------|-------------|
| **Next.js API Routes** | Backend API | • Co-located с фронтендом<br>• Serverless<br>• TypeScript end-to-end |
| **Prisma** | ORM | • Type-safe queries<br>• Auto-generated types<br>• Миграции<br>• Studio для отладки |
| **Zod** | Validation | • Type-safe validation<br>• Schema inference<br>• Интеграция с TypeScript |

### Database & Storage

| Технология | Назначение | Обоснование |
|------------|------------|-------------|
| **Vercel Postgres** (Neon) | Primary Database | • Serverless PostgreSQL<br>• Auto-scaling<br>• Интеграция с Vercel<br>• Бесплатный tier |
| **Cloudflare KV** | Cache/Sessions | • Edge storage<br>• Low latency<br>• Бесплатный tier<br>• Global распространение |
| **Vercel Blob** | File Storage | • S3-compatible<br>• CDN интеграция<br>• Простой API |

### Real-time Communication

| Технология | Назначение | Обоснование |
|------------|------------|-------------|
| **Server-Sent Events (SSE)** | Live Updates | • Нативная поддержка в браузере<br>• Односторонняя связь (подходит для нашего кейса)<br>• Автоматические reconnects |
| **Polling** (Fallback) | Updates | • Простая реализация<br>• Работает везде<br>• Контролируемая нагрузка |

### Authentication & Authorization

| Технология | Назначение | Обоснование |
|------------|------------|-------------|
| **NextAuth.js** v5 (Auth.js) | Authentication | • Built-in providers<br>• Session management<br>• Type-safe<br>• Edge-ready |
| **Linear OAuth** | Linear Integration | • Existing OAuth flow<br>• Переиспользование токенов |
| **RBAC** | Authorization | • Roles: Admin, User, Viewer<br>• Granular permissions |

### Developer Experience

| Технология | Назначение | Обоснование |
|------------|------------|-------------|
| **Turbopack** | Bundler | • Быстрый HMR<br>• Встроен в Next.js<br>• Rust-based |
| **Biome** | Linting/Formatting | • Быстрее Prettier+ESLint<br>• Единый инструмент<br>• Rust-based |
| **Vitest** | Testing | • Vite-powered<br>• Jest-compatible<br>• Fast |

---

## Основные функциональные модули

### 1. Dashboard (Главная панель)

**Назначение:** Обзор текущего состояния всех агентов и активных сессий

**Основные элементы:**

- **Статус агентов** - список всех настроенных Cyrus CLI инстансов с их статусом (online/offline)
- **Активные сессии** - real-time список работающих Claude сессий с:
  - Issue identifier и title
  - Текущий статус (thinking, executing tool, waiting)
  - Время работы
  - Прогресс (если доступен)
  - Repository name
- **Статистика за сегодня**
  - Количество обработанных issues
  - Успешных/failed sessions
  - Среднее время выполнения
  - Использование API (токенов Claude)
- **Recent Activity** - лента последних событий
  - Новые комментарии от агента в Linear
  - Created PRs
  - Errors/warnings

**Технические детали:**

```typescript
// Components
<Dashboard>
  <StatsOverview stats={dailyStats} />
  <ActiveAgents agents={connectedAgents} />
  <ActiveSessions sessions={liveSessions} />
  <ActivityFeed events={recentEvents} />
</Dashboard>

// Data fetching (Server Component)
async function getDashboardData() {
  const [agents, sessions, stats, events] = await Promise.all([
    getConnectedAgents(),
    getActiveSessions(),
    getDailyStats(),
    getRecentEvents(24) // last 24h
  ])
  return { agents, sessions, stats, events }
}

// Real-time updates (Client Component)
function useSessionUpdates() {
  const { data, mutate } = useSWR('/api/sessions/active')
  
  useEffect(() => {
    const eventSource = new EventSource('/api/sessions/stream')
    eventSource.onmessage = (e) => {
      const update = JSON.parse(e.data)
      mutate(current => updateSession(current, update), false)
    }
    return () => eventSource.close()
  }, [])
  
  return data
}
```

### 2. Sessions Manager (Управление сессиями)

**Назначение:** Детальный мониторинг и управление Claude сессиями

**Основные функции:**

- **Просмотр активных сессий**
  - Список всех running сессий
  - Фильтры по repository, status, duration
  - Sorting options
- **Session Details** - детальная информация:
  - Full Linear issue context
  - Claude conversation history
  - Tool usage log
  - Console output (stdout/stderr)
  - File changes (git diff preview)
- **Session Controls**
  - Pause/Resume (если поддерживается)
  - Kill session (force stop)
  - Add comment (inject user message)
  - View in Linear (external link)

**UI Components:**

```
┌─────────────────────────────────────────────────────────┐
│ Active Sessions                    [Filter] [Sort ▼]    │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟢 CYR-123: Fix authentication bug                   │ │
│ │ Repository: backend-api  •  Duration: 5m 23s        │ │
│ │ Status: Executing bash command                       │ │
│ │ [View Details] [Stop] [Open in Linear]              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟡 CYR-124: Add user profile feature                │ │
│ │ Repository: frontend-app  •  Duration: 12m 45s      │ │
│ │ Status: Thinking...                                  │ │
│ │ [View Details] [Stop] [Open in Linear]              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Data Model:**

```typescript
interface Session {
  id: string
  issueId: string
  issueIdentifier: string // "CYR-123"
  issueTitle: string
  repositoryId: string
  repositoryName: string
  status: 'starting' | 'active' | 'paused' | 'completed' | 'failed'
  startedAt: Date
  endedAt?: Date
  claudeVersion: string
  workspace: {
    path: string
    branch: string
  }
  events: SessionEvent[]
  toolUsage: ToolUsageStats
  metrics: {
    inputTokens: number
    outputTokens: number
    thinkingTokens: number
    duration: number
  }
}

interface SessionEvent {
  timestamp: Date
  type: 'message' | 'tool_use' | 'error' | 'status_change'
  content: string
  metadata?: Record<string, any>
}
```

### 3. Repository Management (Управление репозиториями)

**Назначение:** Настройка и управление репозиториями, подключенными к Cyrus

**Основные функции:**

- **List Repositories**
  - All configured repositories
  - Status indicators (active/inactive)
  - Linear workspace associations
  - Team/project routing rules
- **Add Repository**
  - Wizard-style form
  - Git repository path validation
  - Linear OAuth integration
  - Allowed tools configuration
  - Label prompts setup (debugger/builder/scoper)
- **Edit Repository**
  - Update configuration
  - Manage allowed tools
  - Configure MCP servers
  - Setup scripts (cyrus-setup.sh)
  - Routing rules (teamKeys, projectKeys, routingLabels)
- **Repository Details**
  - Active sessions count
  - Recent issues processed
  - Success rate metrics
  - Configuration preview

**Configuration Editor:**

```typescript
interface RepositoryConfig {
  id: string
  name: string
  repositoryPath: string
  baseBranch: string
  linearWorkspaceId: string
  linearWorkspaceName: string
  linearToken: string // encrypted
  workspaceBaseDir: string
  isActive: boolean
  
  // Security
  allowedTools: string[]
  mcpConfigPath?: string | string[]
  
  // Routing
  teamKeys?: string[]
  projectKeys?: string[]
  routingLabels?: string[]
  
  // Prompts
  labelPrompts?: {
    debugger?: LabelPromptConfig
    builder?: LabelPromptConfig
    scoper?: LabelPromptConfig
    orchestrator?: LabelPromptConfig
  }
  
  // Scripts
  setupScript?: string
  
  // Stats
  totalIssuesProcessed: number
  successRate: number
  lastActiveAt?: Date
}

interface LabelPromptConfig {
  labels: string[]
  allowedTools?: string[] | 'readOnly' | 'safe' | 'all' | 'coordinator'
}
```

### 4. History & Analytics (История и аналитика)

**Назначение:** Просмотр истории выполнения и аналитика использования

**Основные разделы:**

#### 4.1. Execution History

- **Timeline view** - хронология всех выполненных сессий
- **Filters:**
  - Date range
  - Repository
  - Status (success/failed)
  - Issue labels
- **Session replay** - просмотр записи выполнения
- **Logs export** - скачивание логов

#### 4.2. Analytics Dashboard

- **Charts & Metrics:**
  - Issues processed over time (line chart)
  - Success rate trends (area chart)
  - Average session duration (bar chart)
  - Tool usage distribution (pie chart)
  - Token consumption (line chart)
  - Most active repositories (bar chart)
- **Insights:**
  - Peak usage hours
  - Common failure patterns
  - Performance bottlenecks
  - Cost projections

**Visualizations:**

```typescript
// Using Recharts (lightweight, React-native)
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={sessionData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="successful" stroke="#22c55e" />
    <Line type="monotone" dataKey="failed" stroke="#ef4444" />
  </LineChart>
</ResponsiveContainer>
```

### 5. Settings (Настройки)

**Назначение:** Конфигурация глобальных настроек Cyrus

**Разделы:**

#### 5.1. General Settings

- **User Profile**
  - Name, email
  - Avatar
  - Timezone
- **Preferences**
  - Theme (light/dark/auto)
  - Language (EN/RU)
  - Notifications settings
  - Default view preferences

#### 5.2. Cyrus Agent Configuration

- **Global Settings**
  - Default proxy URL
  - Server port
  - Host configuration (external/localhost)
- **Model Configuration**
  - Default Claude model
  - Fallback model
  - Custom model parameters
- **Feature Flags**
  - Enable continuation
  - Enable token limit handling
  - Enable attachment download
- **Prompt Defaults**
  - Default allowed tools per prompt type
  - Custom prompt templates

#### 5.3. Integrations

- **Linear**
  - Connected workspaces
  - OAuth tokens management
  - Webhook configuration
- **GitHub**
  - Connected accounts
  - PR automation settings
- **Stripe** (Pro plan)
  - Subscription status
  - Billing information
  - Invoice history
- **Anthropic**
  - API key management
  - Usage monitoring

#### 5.4. Security

- **Access Control**
  - User roles (Admin/User/Viewer)
  - API keys management
  - Webhook secrets
- **Audit Log**
  - Configuration changes
  - User actions
  - Security events

### 6. Billing & Subscription (Pro Plan)

**Назначение:** Управление подпиской и биллингом (для Cyrus Pro)

**Функции:**

- **Subscription Overview**
  - Current plan (Free/Pro)
  - Billing cycle
  - Next payment date
  - Payment method
- **Usage Tracking**
  - API calls per month
  - Active repositories count
  - Storage used
  - Support tickets
- **Billing Management**
  - Update payment method
  - View invoices
  - Download receipts
  - Cancel subscription
- **Upgrade/Downgrade**
  - Plan comparison
  - Feature unlocking
  - Instant upgrade
  - Proration handling

**Stripe Integration:**

```typescript
// Server Action for creating checkout session
async function createCheckoutSession(planId: string) {
  'use server'
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: planId,
      quantity: 1,
    }],
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/billing`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
    }
  })
  
  return { url: session.url }
}

// Client Component
function UpgradeButton() {
  const [loading, setLoading] = useState(false)
  
  async function handleUpgrade() {
    setLoading(true)
    const { url } = await createCheckoutSession('price_...')
    window.location.href = url
  }
  
  return (
    <Button onClick={handleUpgrade} disabled={loading}>
      {loading ? 'Processing...' : 'Upgrade to Pro'}
    </Button>
  )
}
```

---

## UI/UX Дизайн

### Design System

**Цветовая палитра:**

```css
/* Light mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;
--popover: 0 0% 100%;
--popover-foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--primary-foreground: 210 40% 98%;
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 221.2 83.2% 53.3%;
--radius: 0.5rem;

/* Status colors */
--success: 142.1 76.2% 36.3%;
--warning: 47.9 95.8% 53.1%;
--error: 0 84.2% 60.2%;
--info: 217.2 91.2% 59.8%;

/* Session states */
--session-active: 142.1 76.2% 36.3%;
--session-thinking: 47.9 95.8% 53.1%;
--session-failed: 0 84.2% 60.2%;
--session-completed: 221.2 83.2% 53.3%;
```

**Typography:**

```css
/* Font family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

**Spacing System:**

```css
/* Based on 4px base unit */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Top Navigation)                                    │
│  [Logo] [Search] [Notifications] [User Menu]               │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Sidebar │           Main Content Area                      │
│          │                                                  │
│  • Dashboard                                                │
│  • Sessions                                                 │
│  • Repos   │  Dynamic content based on selected page       │
│  • History │                                                │
│  • Settings│                                                │
│  • Billing │                                                │
│            │                                                │
│  [Agent]   │                                                │
│  Status    │                                                │
│  🟢 Online │                                                │
│            │                                                │
└────────────┴─────────────────────────────────────────────────┘
```

**Responsive Breakpoints:**

```typescript
const breakpoints = {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}

// Mobile: Stack layout, collapsible sidebar
// Tablet: Side-by-side with narrow sidebar
// Desktop: Full layout with expanded sidebar
```

### Component Library (shadcn/ui)

**Используемые компоненты:**

- `Button` - Кнопки с вариантами (default, outline, ghost, destructive)
- `Card` - Контейнеры для группировки контента
- `Dialog` - Модальные окна
- `Dropdown Menu` - Выпадающие меню
- `Form` - Формы с валидацией
- `Input` - Текстовые поля
- `Select` - Селекторы
- `Table` - Таблицы с сортировкой и фильтрацией
- `Tabs` - Вкладки
- `Toast` - Уведомления
- `Tooltip` - Всплывающие подсказки
- `Badge` - Бейджи для статусов
- `Separator` - Разделители
- `Skeleton` - Loading states
- `Command` - Command palette (⌘K)
- `Sheet` - Slide-over panels

**Custom Components:**

```typescript
// SessionCard - карточка активной сессии
<SessionCard
  session={session}
  onStop={() => stopSession(session.id)}
  onViewDetails={() => router.push(`/sessions/${session.id}`)}
/>

// RepositoryCard - карточка репозитория
<RepositoryCard
  repository={repo}
  onEdit={() => openEditDialog(repo.id)}
  onToggle={() => toggleRepository(repo.id)}
/>

// ActivityItem - элемент ленты активности
<ActivityItem
  event={event}
  icon={<CircleIcon />}
  timestamp={event.timestamp}
/>

// MetricCard - карточка метрики
<MetricCard
  label="Issues Processed"
  value={42}
  trend="+12%"
  icon={<TrendingUpIcon />}
/>
```

### Animations & Transitions

```typescript
// Using Framer Motion for smooth animations
import { motion } from 'framer-motion'

// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// List animations (stagger)
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Session status pulse (active sessions)
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
  className="status-indicator"
/>
```

---

## API & Интеграции

### REST API Endpoints

#### Sessions API

```typescript
// GET /api/sessions/active
// Response: { sessions: Session[] }
export async function GET(request: Request) {
  const sessions = await getActiveSessions()
  return NextResponse.json({ sessions })
}

// GET /api/sessions/:id
// Response: { session: Session }
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession(params.id)
  return NextResponse.json({ session })
}

// POST /api/sessions/:id/stop
// Request: {}
// Response: { success: boolean }
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  await stopSession(params.id)
  return NextResponse.json({ success: true })
}

// POST /api/sessions/:id/comment
// Request: { message: string }
// Response: { success: boolean }
export async function POST(request: Request) {
  const { message } = await request.json()
  await addSessionComment(params.id, message)
  return NextResponse.json({ success: true })
}
```

#### Repositories API

```typescript
// GET /api/repositories
// Response: { repositories: Repository[] }

// POST /api/repositories
// Request: RepositoryConfig
// Response: { repository: Repository }

// PUT /api/repositories/:id
// Request: Partial<RepositoryConfig>
// Response: { repository: Repository }

// DELETE /api/repositories/:id
// Response: { success: boolean }

// GET /api/repositories/:id/stats
// Response: { stats: RepositoryStats }
```

#### Analytics API

```typescript
// GET /api/analytics/overview
// Query: ?from=2024-01-01&to=2024-12-31
// Response: {
//   totalSessions: number
//   successRate: number
//   avgDuration: number
//   tokenUsage: TokenUsage
//   topRepositories: RepoStats[]
// }

// GET /api/analytics/sessions/timeline
// Query: ?period=7d|30d|90d
// Response: {
//   data: { date: string, count: number }[]
// }
```

#### Webhooks API

```typescript
// POST /api/webhooks/linear
// Signature verification: X-Linear-Signature
// Payload: LinearWebhookEvent
export async function POST(request: Request) {
  const signature = request.headers.get('x-linear-signature')
  const payload = await request.json()
  
  // Verify signature
  if (!verifyLinearSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  // Process webhook
  await processLinearWebhook(payload)
  
  return NextResponse.json({ received: true })
}

// POST /api/webhooks/stripe
// Similar for Stripe webhooks
```

### Real-time Updates

#### Server-Sent Events (SSE)

```typescript
// app/api/sessions/stream/route.ts
export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      // Subscribe to session updates
      const unsubscribe = subscribeToSessionUpdates((update) => {
        const data = encoder.encode(`data: ${JSON.stringify(update)}\n\n`)
        controller.enqueue(data)
      })
      
      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'))
      }, 30000)
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unsubscribe()
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

// Client usage
function useSessionStream() {
  const [sessions, setSessions] = useState([])
  
  useEffect(() => {
    const eventSource = new EventSource('/api/sessions/stream')
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data)
      setSessions(prev => applyUpdate(prev, update))
    }
    
    eventSource.onerror = () => {
      // Reconnect logic
      eventSource.close()
      // Retry after delay...
    }
    
    return () => eventSource.close()
  }, [])
  
  return sessions
}
```

### External Integrations

#### Linear API Integration

```typescript
import { LinearClient } from '@linear/sdk'

class LinearService {
  private client: LinearClient
  
  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey })
  }
  
  async getIssue(issueId: string) {
    return this.client.issue(issueId)
  }
  
  async addComment(issueId: string, body: string) {
    return this.client.createComment({
      issueId,
      body,
    })
  }
  
  async updateIssue(issueId: string, update: IssueUpdate) {
    return this.client.updateIssue(issueId, update)
  }
  
  async listIssues(filters: IssueFilter) {
    return this.client.issues(filters)
  }
}
```

#### Stripe Integration

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCustomer(email: string) {
  return stripe.customers.create({ email })
}

export async function createSubscription(
  customerId: string,
  priceId: string
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
  })
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}
```

#### Cyrus CLI Communication

```typescript
// Control Panel → Cyrus CLI communication

// REST endpoint on Cyrus CLI
// POST http://localhost:3456/api/status
// Response: { status: 'online', version: '0.1.57', sessions: [...] }

// WebSocket for bidirectional communication (optional)
class CyrusCliClient {
  private ws: WebSocket
  
  connect(agentUrl: string) {
    this.ws = new WebSocket(agentUrl)
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleMessage(message)
    }
  }
  
  sendCommand(command: string, payload: any) {
    this.ws.send(JSON.stringify({ command, payload }))
  }
  
  private handleMessage(message: any) {
    switch (message.type) {
      case 'session_update':
        // Update session state
        break
      case 'log':
        // Display log message
        break
      // ...
    }
  }
}
```

---

## Безопасность

### Authentication & Authorization

#### Authentication Flow

```typescript
// Using NextAuth.js v5

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }

// auth.config.ts
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials)
        
        if (!parsedCredentials.success) return null
        
        const user = await verifyUser(
          parsedCredentials.data.email,
          parsedCredentials.data.password
        )
        
        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig
```

#### Role-Based Access Control (RBAC)

```typescript
enum Role {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

const permissions = {
  [Role.ADMIN]: [
    'sessions:read',
    'sessions:write',
    'sessions:kill',
    'repositories:read',
    'repositories:write',
    'repositories:delete',
    'settings:read',
    'settings:write',
    'users:manage',
  ],
  [Role.USER]: [
    'sessions:read',
    'sessions:write',
    'sessions:kill',
    'repositories:read',
    'repositories:write',
    'settings:read',
  ],
  [Role.VIEWER]: [
    'sessions:read',
    'repositories:read',
  ],
}

// Middleware for protected routes
export async function middleware(request: NextRequest) {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  const requiredPermission = getRequiredPermission(request.pathname)
  const hasPermission = permissions[session.user.role].includes(requiredPermission)
  
  if (!hasPermission) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  return NextResponse.next()
}

// Usage in API routes
export async function DELETE(request: Request) {
  const session = await getServerSession()
  
  if (!hasPermission(session, 'repositories:delete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // ... proceed with deletion
}
```

### Data Security

#### Encryption

```typescript
// Encrypt sensitive data (tokens, API keys)
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  
  const iv = Buffer.from(ivHex!, 'hex')
  const authTag = Buffer.from(authTagHex!, 'hex')
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted!, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Usage
const encryptedToken = encrypt(linearToken)
await prisma.repository.create({
  data: {
    // ...
    linearToken: encryptedToken,
  }
})
```

#### API Key Management

```typescript
// Generate API keys for programmatic access
import { randomBytes } from 'crypto'

export function generateApiKey(): string {
  const prefix = 'cyrus_'
  const key = randomBytes(32).toString('hex')
  return `${prefix}${key}`
}

// Hash API keys before storing
import { hash, compare } from 'bcrypt'

export async function hashApiKey(apiKey: string): Promise<string> {
  return hash(apiKey, 10)
}

export async function verifyApiKey(
  apiKey: string,
  hashedKey: string
): Promise<boolean> {
  return compare(apiKey, hashedKey)
}

// API key authentication middleware
export async function authenticateApiKey(request: Request) {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    throw new Error('API key required')
  }
  
  const keyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { user: true }
  })
  
  if (!keyRecord || !keyRecord.isActive) {
    throw new Error('Invalid API key')
  }
  
  // Update last used
  await prisma.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() }
  })
  
  return keyRecord.user
}
```

### Webhook Security

#### Signature Verification

```typescript
// Verify Linear webhook signatures
import { createHmac } from 'crypto'

export function verifyLinearSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === expectedSignature
}

// Verify Stripe webhook signatures
import Stripe from 'stripe'

export function verifyStripeSignature(
  payload: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

// Usage in webhook handler
export async function POST(request: Request) {
  const signature = request.headers.get('x-linear-signature')
  const payload = await request.text()
  
  if (!signature || !verifyLinearSignature(payload, signature, process.env.LINEAR_WEBHOOK_SECRET!)) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }
  
  // Process webhook
  const event = JSON.parse(payload)
  await handleWebhook(event)
  
  return NextResponse.json({ received: true })
}
```

### Rate Limiting

```typescript
// Using Upstash Redis for rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})

// Apply to API routes
export async function POST(request: Request) {
  const identifier = getClientIp(request) // or user ID
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Process request
}
```

---

## Deployment & Infrastructure

### Vercel Deployment

#### Project Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

#### Environment Variables

```bash
# Vercel Dashboard → Settings → Environment Variables

# Database
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://control.cyrus.com"

# Linear
LINEAR_CLIENT_ID="..."
LINEAR_CLIENT_SECRET="..."
LINEAR_WEBHOOK_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_..."

# Encryption
ENCRYPTION_KEY="..." # 64 hex characters

# Cloudflare
CF_ACCOUNT_ID="..."
CF_KV_NAMESPACE_ID="..."
CF_KV_API_TOKEN="..."

# API Keys
ANTHROPIC_API_KEY="..."

# Optional
SENTRY_DSN="..."
POSTHOG_API_KEY="..."
```

#### vercel.json Configuration

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/webhooks/linear",
      "destination": "/api/webhooks/linear"
    }
  ]
}
```

### Database Setup (Vercel Postgres)

#### Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  passwordHash  String
  role          Role           @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  repositories  Repository[]
  apiKeys       ApiKey[]
  sessions      Session[]
}

enum Role {
  ADMIN
  USER
  VIEWER
}

model Repository {
  id                   String   @id @default(cuid())
  name                 String
  repositoryPath       String
  baseBranch           String   @default("main")
  linearWorkspaceId    String
  linearWorkspaceName  String?
  linearToken          String   // encrypted
  workspaceBaseDir     String
  isActive             Boolean  @default(true)
  allowedTools         Json     // string[]
  mcpConfigPath        Json?    // string | string[]
  teamKeys             Json?    // string[]
  projectKeys          Json?    // string[]
  routingLabels        Json?    // string[]
  labelPrompts         Json?    // LabelPromptConfig
  setupScript          String?
  totalIssuesProcessed Int      @default(0)
  successRate          Float    @default(0)
  lastActiveAt         DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  userId               String
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions             Session[]
  
  @@index([userId])
  @@index([linearWorkspaceId])
}

model Session {
  id               String          @id @default(cuid())
  issueId          String
  issueIdentifier  String
  issueTitle       String
  issueUrl         String?
  status           SessionStatus   @default(STARTING)
  startedAt        DateTime        @default(now())
  endedAt          DateTime?
  claudeVersion    String?
  workspacePath    String
  workspaceBranch  String
  exitCode         Int?
  inputTokens      Int             @default(0)
  outputTokens     Int             @default(0)
  thinkingTokens   Int             @default(0)
  duration         Int?            // seconds
  errorMessage     String?
  repositoryId     String
  repository       Repository      @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  userId           String
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  events           SessionEvent[]
  
  @@index([repositoryId])
  @@index([userId])
  @@index([issueId])
  @@index([status])
  @@index([startedAt])
}

enum SessionStatus {
  STARTING
  ACTIVE
  PAUSED
  COMPLETED
  FAILED
}

model SessionEvent {
  id        String   @id @default(cuid())
  type      String   // 'message' | 'tool_use' | 'error' | 'status_change'
  content   String   @db.Text
  metadata  Json?
  timestamp DateTime @default(now())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([sessionId])
  @@index([timestamp])
}

model ApiKey {
  id          String    @id @default(cuid())
  name        String
  keyHash     String    @unique
  isActive    Boolean   @default(true)
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

#### Migrations

```bash
# Create migration
pnpm prisma migrate dev --name init

# Apply to production
pnpm prisma migrate deploy

# Generate client
pnpm prisma generate

# Seed database (optional)
pnpm prisma db seed
```

### Cloudflare KV (Cache)

```typescript
// lib/kv.ts
import { KvNamespace } from '@cloudflare/workers-types'

interface CloudflareEnv {
  SESSIONS_KV: KvNamespace
}

// Edge API route with KV access
export const runtime = 'edge'

export async function GET(request: Request) {
  const env = process.env as unknown as CloudflareEnv
  const sessions = await env.SESSIONS_KV.get('active_sessions', 'json')
  
  return NextResponse.json({ sessions })
}

// Set with expiration
await env.SESSIONS_KV.put(
  'active_sessions',
  JSON.stringify(sessions),
  { expirationTtl: 60 } // 1 minute
)
```

### Monitoring & Observability

#### Sentry (Error Tracking)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization']
    }
    return event
  },
})

// Usage
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

#### PostHog (Analytics)

```typescript
// lib/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
    })
  }
}

// Track events
posthog.capture('session_started', {
  repository: repo.name,
  issue_id: issue.id,
})
```

#### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### CI/CD Pipeline

#### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Cost Optimization

#### Бесплатные/дешевые tier на старте

| Сервис | Free Tier | Ограничения | Стоимость после |
|--------|-----------|-------------|-----------------|
| **Vercel** | Hobby Plan | 100GB bandwidth/month | $20/month Pro |
| **Vercel Postgres** (Neon) | 0.5GB storage | 512MB RAM | $20/month |
| **Cloudflare KV** | 100k reads/day | 1k writes/day | $0.50/million reads |
| **Stripe** | Free | 2.9% + $0.30/transaction | Same |
| **Sentry** | 5k errors/month | 1 user | $26/month |
| **PostHog** | 1M events/month | - | $0.000225/event |

**Оптимизация:**

- Использовать edge functions для read-heavy операций (снижает DB load)
- Кешировать в KV агрессивно (TTL 1-5 минут для dashboard data)
- Использовать ISR (Incremental Static Regeneration) для статических страниц
- Lazy load компонентов и route-based code splitting

---

## Roadmap

### Phase 1: MVP (2-3 недели)

**Цель:** Базовый функционал для мониторинга и управления

- [x] Анализ требований и дизайн архитектуры
- [ ] Настройка проекта и инфраструктуры
  - Next.js 15 app с Turbopack
  - Vercel Postgres setup
  - Prisma schema и migrations
  - Cloudflare KV setup
- [ ] Authentication & Authorization
  - NextAuth.js integration
  - Linear OAuth flow
  - RBAC implementation
- [ ] Core UI Components
  - Layout (header, sidebar)
  - Dashboard page
  - Sessions list
  - Repository list
- [ ] Basic API
  - Sessions endpoints
  - Repositories endpoints
  - Webhooks (Linear, Stripe)
- [ ] Real-time updates
  - SSE implementation
  - Session status polling fallback

**Deliverables:**

- Работающий dashboard с real-time мониторингом сессий
- Управление репозиториями (CRUD)
- Linear OAuth интеграция

### Phase 2: Advanced Features (2-3 недели)

**Цель:** Продвинутые возможности управления и аналитика

- [ ] Session Management
  - Detailed session view
  - Console output streaming
  - Stop/kill session
  - Add comments to running session
- [ ] History & Analytics
  - Execution history
  - Analytics dashboard с charts
  - Export functionality
- [ ] Advanced Configuration
  - Allowed tools editor
  - MCP servers configuration
  - Label prompts setup
  - Routing rules (teams/projects/labels)
- [ ] Settings
  - User profile
  - Global configurations
  - API keys management
  - Integrations

**Deliverables:**

- Полнофункциональная панель управления
- Детальная аналитика
- Продвинутые настройки конфигурации

### Phase 3: Pro Features & Polish (2 недели)

**Цель:** Monetization и улучшение UX

- [ ] Billing Integration
  - Stripe checkout
  - Subscription management
  - Usage tracking
  - Invoice generation
- [ ] Enhanced UX
  - Command palette (⌘K)
  - Keyboard shortcuts
  - Dark/light theme
  - Internationalization (EN/RU)
- [ ] Advanced Monitoring
  - Error tracking (Sentry)
  - Analytics (PostHog)
  - Performance monitoring
  - Alerting (email/Slack)
- [ ] Documentation
  - User guide
  - API documentation
  - Video tutorials

**Deliverables:**

- Production-ready control panel
- Stripe billing integration
- Polished UX с animations
- Complete documentation

### Phase 4: Mobile & Extensions (будущее)

**Потенциальные возможности:**

- **Mobile App** (React Native / Capacitor)
  - iOS/Android приложение
  - Push notifications
  - Mobile-optimized UI
- **VS Code Extension**
  - Cyrus integration в IDE
  - Inline issue tracking
  - Session management from editor
- **Slack/Discord Bot**
  - Notifications в team chat
  - Commands для управления
  - Status updates
- **Advanced AI Features**
  - Automatic issue routing
  - Smart prompt suggestions
  - Performance optimization recommendations
  - Predictive analytics

---

## Дополнительные технические решения

### Code Quality

```bash
# Biome configuration
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### Testing Strategy

```typescript
// Vitest + Testing Library
import { render, screen, waitFor } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import { SessionCard } from '@/components/SessionCard'

describe('SessionCard', () => {
  test('renders session information', () => {
    const session = mockSession()
    render(<SessionCard session={session} />)
    
    expect(screen.getByText(session.issueIdentifier)).toBeInTheDocument()
    expect(screen.getByText(session.issueTitle)).toBeInTheDocument()
  })
  
  test('calls onStop when stop button clicked', async () => {
    const onStop = vi.fn()
    render(<SessionCard session={mockSession()} onStop={onStop} />)
    
    const stopButton = screen.getByRole('button', { name: /stop/i })
    stopButton.click()
    
    await waitFor(() => {
      expect(onStop).toHaveBeenCalled()
    })
  })
})

// E2E с Playwright
import { test, expect } from '@playwright/test'

test('user can view active sessions', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sessions')
  
  await expect(page.locator('[data-testid="session-list"]')).toBeVisible()
  await expect(page.locator('[data-testid="session-card"]')).toHaveCount(2)
})
```

### Performance Optimizations

```typescript
// Image optimization
import Image from 'next/image'

<Image
  src="/avatar.png"
  alt="User avatar"
  width={40}
  height={40}
  priority // for above-the-fold images
/>

// Font optimization
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Dynamic imports
const SessionDetails = dynamic(() => import('./SessionDetails'), {
  loading: () => <Skeleton />,
  ssr: false, // client-only component
})

// Memoization
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const computed = useMemo(() => heavyComputation(data), [data])
  
  return <div>{computed}</div>
})

// Debouncing
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

function SearchInput() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  
  useEffect(() => {
    performSearch(debouncedSearch)
  }, [debouncedSearch])
  
  return <Input value={search} onChange={(e) => setSearch(e.target.value)} />
}
```

---

## Заключение

Данная архитектура предоставляет:

✅ **Современный стек** - Next.js 15, React 19, TypeScript 5, Tailwind v4
✅ **Эффективность** - Server Components, Edge Functions, aggressive caching
✅ **Простота** - shadcn/ui, Prisma, Server Actions
✅ **Низкая стоимость** - Бесплатные tiers на старте, serverless infrastructure
✅ **Масштабируемость** - Edge network, PostgreSQL, KV cache
✅ **Безопасность** - NextAuth, RBAC, encryption, webhook verification
✅ **Developer Experience** - TypeScript, Turbopack, Biome, type-safe APIs

**Следующие шаги:**

1. Утверждение архитектуры
2. Setup инфраструктуры (Vercel, Postgres, KV)
3. Начало разработки MVP (Phase 1)

---

*Документ создан: 2025-01-14*
*Автор: Claude Code Session*
*Версия: 1.0*
