# Cyrus Control Panel - UI/UX Specifications

## Оглавление

- [Design Principles](#design-principles)
- [Layout Specifications](#layout-specifications)
- [Page Wireframes](#page-wireframes)
- [Component Library](#component-library)
- [Interactions & States](#interactions--states)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Animation Guidelines](#animation-guidelines)

---

## Design Principles

### 1. Clarity First

- **Information Hierarchy** - Важная информация должна быть заметной
- **Visual Weight** - Использовать размер, цвет, и позиционирование для направления внимания
- **Minimal Cognitive Load** - Не перегружать пользователя информацией

### 2. Consistent & Predictable

- **Design System** - Единый язык дизайна по всему приложению
- **Patterns** - Повторяющиеся паттерны взаимодействия
- **Expectations** - Элементы ведут себя ожидаемо

### 3. Performance-Oriented

- **Fast Load** - Skeleton screens, progressive loading
- **Real-time Feel** - Optimistic updates, instant feedback
- **Smooth Animations** - 60fps, hardware-accelerated

### 4. Accessible by Default

- **WCAG 2.1 Level AA** - Соответствие стандартам
- **Keyboard Navigation** - Полная поддержка клавиатуры
- **Screen Readers** - Semantic HTML, ARIA labels

---

## Layout Specifications

### Global Layout Structure

```
┌───────────────────────────────────────────────────────────┐
│  Header (h: 64px)                                         │
│  ┌────────┬──────────────────┬────────────┬─────────────┐ │
│  │  Logo  │  Search (⌘K)     │  Notifs    │  User Menu  │ │
│  └────────┴──────────────────┴────────────┴─────────────┘ │
├─────────┬─────────────────────────────────────────────────┤
│         │                                                 │
│ Sidebar │           Main Content Area                     │
│ (240px) │           (min-width: 640px)                    │
│         │                                                 │
│  Nav    │  ┌─────────────────────────────────────────┐   │
│  Items  │  │  Page Header                            │   │
│         │  │  (Breadcrumbs, Title, Actions)          │   │
│ ▸ Dash  │  ├─────────────────────────────────────────┤   │
│ ▸ Sess  │  │                                         │   │
│ ▸ Repos │  │  Content                                │   │
│ ▸ Hist  │  │  (Dynamic based on page)                │   │
│ ▸ Set   │  │                                         │   │
│ ▸ Bill  │  │                                         │   │
│         │  └─────────────────────────────────────────┘   │
│ ─────── │                                                 │
│ Agent   │                                                 │
│ Status  │                                                 │
│ 🟢 Onl  │                                                 │
│         │                                                 │
└─────────┴─────────────────────────────────────────────────┘
```

### Spacing & Grid

```typescript
// 8px base unit grid system
const spacing = {
  xs: '4px',    // 0.5 unit
  sm: '8px',    // 1 unit
  md: '16px',   // 2 units
  lg: '24px',   // 3 units
  xl: '32px',   // 4 units
  '2xl': '48px', // 6 units
  '3xl': '64px', // 8 units
}

// Container widths
const containers = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Layout constraints
const layout = {
  headerHeight: '64px',
  sidebarWidth: '240px',
  sidebarCollapsedWidth: '64px',
  contentMaxWidth: '1440px',
  contentPadding: '24px',
}
```

---

## Page Wireframes

### 1. Dashboard Page

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                [Refresh] [⚙️]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Quick Stats                                             │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ 42       │ 38       │ 4        │ 8m 23s   │             │
│  │ Issues   │ Success  │ Failed   │ Avg Time │             │
│  │ Today    │          │          │          │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│                                                             │
│  🤖 Active Agents (2)                         [Add Agent]   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 MacBook Pro • v0.1.57 • Online • 2 sessions      │   │
│  │ 🟢 Ubuntu Server • v0.1.57 • Online • 1 session    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚡ Active Sessions (3)                     [View All →]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 CYR-123: Fix auth bug                            │   │
│  │ backend-api • 5m 23s • Executing bash              │   │
│  │ [Details] [Stop] [Linear →]                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟡 CYR-124: Add user profile                       │   │
│  │ frontend-app • 12m 45s • Thinking...               │   │
│  │ [Details] [Stop] [Linear →]                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟢 CYR-125: Update docs                            │   │
│  │ docs-repo • 3m 10s • Tool: edit                    │   │
│  │ [Details] [Stop] [Linear →]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📰 Recent Activity                          [View All →]   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ CYR-120: Completed • PR created #456 • 2m ago    │   │
│  │ 💬 CYR-119: Comment posted • 5m ago                │   │
│  │ ✗ CYR-118: Failed • Error in build • 8m ago       │   │
│  │ 🚀 CYR-117: PR merged • 15m ago                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Sessions Page

```
┌─────────────────────────────────────────────────────────────┐
│  Sessions                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tabs: [Active] [History] [All]                            │
│                                                             │
│  Filters: [Repository ▼] [Status ▼] [Date Range ▼]        │
│  Sort by: [Duration ▼]                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Session Card                                         │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Header                                          │ │   │
│  │ │ 🟢 CYR-123: Fix authentication bug              │ │   │
│  │ │ Status: Active • Duration: 5m 23s              │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Meta Info                                       │ │   │
│  │ │ Repository: backend-api                         │ │   │
│  │ │ Branch: CYR-123-fix-auth-bug                   │ │   │
│  │ │ Started: 2024-01-14 14:23:15                   │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Current Status                                  │ │   │
│  │ │ ⚙️ Executing: bash command (git diff)          │ │   │
│  │ │ Progress: ████░░░░░░ 40%                       │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Metrics                                         │ │   │
│  │ │ Input: 1.2k tokens • Output: 3.4k tokens       │ │   │
│  │ │ Tools: 8 used • Thinking: 234 tokens           │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Actions                                         │ │   │
│  │ │ [View Details] [View Logs] [Stop] [Linear →]  │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  (More session cards...)                                    │
│                                                             │
│  Pagination: [←] 1 2 3 ... 10 [→]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Session Details Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Session Details                                        [×] │
│  CYR-123: Fix authentication bug                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tabs: [Overview] [Console] [Files] [Timeline]             │
│                                                             │
│  ─────────────── Overview Tab ───────────────              │
│                                                             │
│  📋 Issue Info                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title: Fix authentication bug                       │   │
│  │ Status: In Progress                                 │   │
│  │ Priority: High                                      │   │
│  │ Assignee: @cyrus-bot                                │   │
│  │ Labels: [Bug] [Backend] [Auth]                     │   │
│  │ [Open in Linear →]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🤖 Session Info                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Repository: backend-api                             │   │
│  │ Branch: CYR-123-fix-auth-bug                       │   │
│  │ Workspace: ~/.cyrus/workspaces/CYR-123             │   │
│  │ Claude: v2.0.9                                      │   │
│  │ Model: claude-3-5-sonnet-20241022                  │   │
│  │ Started: 2024-01-14 14:23:15                       │   │
│  │ Duration: 5m 23s (running)                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📊 Metrics                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tokens:                                             │   │
│  │   Input: 1,234  Output: 3,456  Thinking: 234      │   │
│  │   Total: 4,924 (~$0.023)                           │   │
│  │                                                     │   │
│  │ Tools Used: (8 total)                               │   │
│  │   • bash (3×) • read (2×) • edit (2×) • grep (1×)  │   │
│  │                                                     │   │
│  │ Exit Code: - (still running)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────── Console Tab ───────────────               │
│  (When selected)                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Filter: All ▼] [Search...] [Auto-scroll: On]      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 14:23:15 [INFO] Starting session for CYR-123...    │   │
│  │ 14:23:16 [INFO] Created worktree at ~/.cyrus/...   │   │
│  │ 14:23:20 [CLAUDE] Analyzing issue requirements...  │   │
│  │ 14:24:05 [TOOL] bash: git diff HEAD~1              │   │
│  │ 14:24:06 [OUTPUT] diff --git a/src/auth.ts...     │   │
│  │ 14:25:12 [CLAUDE] I found the authentication...    │   │
│  │ 14:26:30 [TOOL] edit: src/auth/jwt.ts             │   │
│  │ 14:27:45 [TOOL] bash: npm test                     │   │
│  │ 14:28:50 [OUTPUT] ✓ All tests passing             │   │
│  │ > _                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Actions: [Stop Session] [Add Comment] [Download Logs]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Repositories Page

```
┌─────────────────────────────────────────────────────────────┐
│  Repositories                              [+ Add Repository]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filters: [Status ▼] [Workspace ▼] [Search...]             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Repository Card                                      │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Header                                          │ │   │
│  │ │ 🟢 backend-api                    [⚙️] [Toggle] │ │   │
│  │ │ Active • Last activity: 2m ago                 │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Info                                            │ │   │
│  │ │ Path: /Users/me/projects/backend-api           │ │   │
│  │ │ Branch: main                                    │ │   │
│  │ │ Workspace: backend-prod                         │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Routing                                         │ │   │
│  │ │ Teams: [BACKEND] [API]                         │ │   │
│  │ │ Labels: [backend] [api] [infrastructure]       │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Label Prompts                                   │ │   │
│  │ │ 🐛 Bug → debugger                              │ │   │
│  │ │ ✨ Feature → builder                           │ │   │
│  │ │ 📝 PRD → scoper                                │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Stats                                           │ │   │
│  │ │ Issues: 42 total • Success: 90% • Avg: 8m     │ │   │
│  │ │ Active sessions: 2                             │ │   │
│  │ ├─────────────────────────────────────────────────┤ │   │
│  │ │ Actions                                         │ │   │
│  │ │ [Edit] [View Sessions] [Test Linear Token]    │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  (More repository cards...)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5. Repository Edit Form

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Repository: backend-api                           [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tabs: [General] [Security] [Routing] [Prompts] [Advanced] │
│                                                             │
│  ─────────────── General Tab ───────────────               │
│                                                             │
│  Basic Information                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name *                                              │   │
│  │ [backend-api                                     ]  │   │
│  │                                                     │   │
│  │ Repository Path *                                   │   │
│  │ [/Users/me/projects/backend-api              ]  │   │
│  │ [Browse...]                                         │   │
│  │                                                     │   │
│  │ Base Branch *                                       │   │
│  │ [main                                            ]  │   │
│  │                                                     │   │
│  │ Workspace Directory *                               │   │
│  │ [~/.cyrus/workspaces/backend-api              ]  │   │
│  │ ℹ️ Where git worktrees will be created            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Linear Integration                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Workspace                                           │   │
│  │ [Backend Team ▼                                  ]  │   │
│  │                                                     │   │
│  │ OAuth Token                                         │   │
│  │ [••••••••••••••••••••••••••••••••••••••]        │   │
│  │ [Refresh Token] [Test Connection]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────── Security Tab ───────────────              │
│  (When selected)                                            │
│                                                             │
│  Allowed Tools                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Preset: [Custom ▼]                                  │   │
│  │                                                     │   │
│  │ Selected Tools: (8)                                 │   │
│  │ ☑ Read(**) - Read any file                        │   │
│  │ ☑ Edit(**) - Edit any file                        │   │
│  │ ☑ Bash(git:*) - Git commands only                 │   │
│  │ ☑ Bash(gh:*) - GitHub CLI commands                │   │
│  │ ☑ Task - Task management                          │   │
│  │ ☑ WebFetch - Fetch web content                    │   │
│  │ ☑ WebSearch - Search the web                      │   │
│  │ ☑ TodoWrite - Write todos                         │   │
│  │ ☐ Bash - Full bash access (dangerous)             │   │
│  │                                                     │   │
│  │ [+ Add Custom Tool Pattern]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  MCP Servers                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Config Path(s)                                      │   │
│  │ [./mcp-config.json                               ]  │   │
│  │ [+ Add Another Path]                                │   │
│  │                                                     │   │
│  │ ℹ️ Multiple configs will be merged                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Actions: [Cancel] [Save Changes]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6. History & Analytics Page

```
┌─────────────────────────────────────────────────────────────┐
│  History & Analytics                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Date Range: [Last 7 days ▼] [Jan 8 - Jan 14]             │
│  Filters: [Repository ▼] [Status ▼] [Label ▼]              │
│                                                             │
│  📊 Overview                                                │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ 156      │ 90%      │ 9m 23s   │ $4.23    │             │
│  │ Total    │ Success  │ Avg Time │ API Cost │             │
│  │ Sessions │ Rate     │          │          │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│                                                             │
│  📈 Sessions Over Time                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       Line Chart                                    │   │
│  │  30 │                                ╱╲              │   │
│  │     │                          ╱╲   ╱  ╲             │   │
│  │  20 │                    ╱╲   ╱  ╲╱    ╲            │   │
│  │     │              ╱╲   ╱  ╲╱            ╲           │   │
│  │  10 │        ╱╲   ╱  ╲╱                  ╲          │   │
│  │     │  ╱╲   ╱  ╲╱                          ╲        │   │
│  │   0 └────────────────────────────────────────       │   │
│  │      Mon Tue Wed Thu Fri Sat Sun                    │   │
│  │                                                     │   │
│  │      Legend: ── Successful ── Failed               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🔧 Tool Usage Distribution                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       Pie Chart                                     │   │
│  │          _____                                      │   │
│  │       ,─'     '─,      bash: 45%                   │   │
│  │      ╱ bash  45% ╲     read: 25%                   │   │
│  │     │             │    edit: 20%                    │   │
│  │     │    read     │    task: 10%                    │   │
│  │      ╲ 25%  edit ╱                                  │   │
│  │       '─,_20%_,─'                                   │   │
│  │          task                                       │   │
│  │           10%                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 Session History                             [Export CSV] │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Date       │ Issue     │ Repo     │ Status │ Time   │   │
│  ├────────────┼───────────┼──────────┼────────┼────────┤   │
│  │ Jan 14 14h │ CYR-123   │ backend  │ ✓      │ 5m 23s │   │
│  │ Jan 14 13h │ CYR-122   │ frontend │ ✗      │ 2m 10s │   │
│  │ Jan 14 12h │ CYR-121   │ backend  │ ✓      │ 8m 45s │   │
│  │ Jan 14 11h │ CYR-120   │ docs     │ ✓      │ 3m 30s │   │
│  │ ...        │ ...       │ ...      │ ...    │ ...    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Pagination: [←] 1 2 3 ... 10 [→]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7. Settings Page

```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tabs: [Profile] [Agent] [Integrations] [Security]         │
│                                                             │
│  ─────────────── Profile Tab ───────────────               │
│                                                             │
│  Personal Information                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Avatar                                              │   │
│  │ [  👤  ] [Upload]                                   │   │
│  │                                                     │   │
│  │ Name                                                │   │
│  │ [John Doe                                        ]  │   │
│  │                                                     │   │
│  │ Email                                               │   │
│  │ [john@example.com                                ]  │   │
│  │                                                     │   │
│  │ Timezone                                            │   │
│  │ [UTC+03:00 Moscow                                ]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Preferences                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Theme                                               │   │
│  │ ○ Light  ● Dark  ○ Auto                            │   │
│  │                                                     │   │
│  │ Language                                            │   │
│  │ [English ▼]                                         │   │
│  │                                                     │   │
│  │ Notifications                                       │   │
│  │ ☑ Email notifications                              │   │
│  │ ☑ Session completion alerts                        │   │
│  │ ☐ Weekly summary reports                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────── Agent Tab ───────────────                 │
│  (When selected)                                            │
│                                                             │
│  Global Configuration                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Default Proxy URL                                   │   │
│  │ [https://proxy.atcyrus.com                       ]  │   │
│  │                                                     │   │
│  │ Server Port                                         │   │
│  │ [3456                                            ]  │   │
│  │                                                     │   │
│  │ Server Host                                         │   │
│  │ ○ localhost  ● 0.0.0.0 (external)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Model Configuration                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Default Model                                       │   │
│  │ [claude-3-5-sonnet-20241022 ▼                    ]  │   │
│  │                                                     │   │
│  │ Fallback Model                                      │   │
│  │ [claude-3-5-haiku-20241022 ▼                     ]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Actions: [Cancel] [Save Changes]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8. Billing Page (Pro Plan)

```
┌─────────────────────────────────────────────────────────────┐
│  Billing & Subscription                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💎 Current Plan: Cyrus Pro                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Plan Details                                        │   │
│  │ • Unlimited repositories                            │   │
│  │ • Priority support                                  │   │
│  │ • Advanced analytics                                │   │
│  │ • API access                                        │   │
│  │                                                     │   │
│  │ Next billing: Feb 14, 2024                         │   │
│  │ Amount: $20.00 / month                             │   │
│  │                                                     │   │
│  │ [Manage Subscription] [Cancel Plan]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📊 Usage This Month                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Requests                                        │   │
│  │ ████████████████░░░░ 1,234 / 10,000 (12%)         │   │
│  │                                                     │   │
│  │ Active Repositories                                 │   │
│  │ ██████░░░░░░░░░░░░░░ 3 / Unlimited                │   │
│  │                                                     │   │
│  │ Storage Used                                        │   │
│  │ ████░░░░░░░░░░░░░░░░ 245 MB / 10 GB (2%)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💳 Payment Method                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Visa ending in 4242                                │   │
│  │ Expires: 12/2025                                    │   │
│  │ [Update Payment Method]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🧾 Invoices                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Date       │ Amount  │ Status │ Actions            │   │
│  ├────────────┼─────────┼────────┼────────────────────┤   │
│  │ Jan 14 24  │ $20.00  │ Paid   │ [Download PDF]     │   │
│  │ Dec 14 23  │ $20.00  │ Paid   │ [Download PDF]     │   │
│  │ Nov 14 23  │ $20.00  │ Paid   │ [Download PDF]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Library

### Core Components (shadcn/ui based)

#### 1. Button

```typescript
// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

#### 2. Card

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### 3. Badge

```typescript
// Status badges
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>

// Session status
<Badge variant="success">
  <CircleIcon className="mr-1 h-2 w-2 fill-current" />
  Active
</Badge>
```

#### 4. Dialog / Modal

```typescript
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Description text
      </DialogDescription>
    </DialogHeader>
    <div>Content here</div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Custom Components

#### 5. SessionCard

```typescript
interface SessionCardProps {
  session: Session
  onStop: () => void
  onViewDetails: () => void
}

<SessionCard
  session={{
    id: 'session-123',
    issueIdentifier: 'CYR-123',
    issueTitle: 'Fix auth bug',
    status: 'active',
    duration: 323, // seconds
    repository: 'backend-api',
    metrics: {
      inputTokens: 1234,
      outputTokens: 3456,
    }
  }}
  onStop={() => handleStop('session-123')}
  onViewDetails={() => router.push('/sessions/session-123')}
/>
```

#### 6. MetricCard

```typescript
interface MetricCardProps {
  label: string
  value: string | number
  trend?: string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

<MetricCard
  label="Issues Processed"
  value={42}
  trend="+12%"
  icon={<TrendingUpIcon />}
  color="green"
/>
```

#### 7. StatusIndicator

```typescript
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'error'
  label?: string
  pulse?: boolean
}

<StatusIndicator
  status="online"
  label="2 agents online"
  pulse={true}
/>
```

#### 8. CodeBlock

```typescript
interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  highlightLines?: number[]
}

<CodeBlock
  code={`function hello() {
  console.log('Hello World')
}`}
  language="typescript"
  showLineNumbers={true}
  highlightLines={[2]}
/>
```

#### 9. Timeline

```typescript
interface TimelineProps {
  events: TimelineEvent[]
}

interface TimelineEvent {
  timestamp: Date
  title: string
  description?: string
  icon?: React.ReactNode
  type: 'info' | 'success' | 'error' | 'warning'
}

<Timeline
  events={[
    {
      timestamp: new Date(),
      title: 'Session started',
      description: 'CYR-123',
      icon: <PlayIcon />,
      type: 'info'
    },
    // ...
  ]}
/>
```

#### 10. CommandPalette

```typescript
// Global command palette (⌘K)
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Navigation">
      <CommandItem onSelect={() => router.push('/dashboard')}>
        <HomeIcon className="mr-2 h-4 w-4" />
        Dashboard
      </CommandItem>
      <CommandItem onSelect={() => router.push('/sessions')}>
        <ActivityIcon className="mr-2 h-4 w-4" />
        Sessions
      </CommandItem>
    </CommandGroup>
    <CommandGroup heading="Actions">
      <CommandItem onSelect={handleAddRepository}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Repository
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

---

## Interactions & States

### Loading States

```typescript
// Skeleton loaders
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-[200px] w-full" />
  </CardContent>
</Card>

// Spinner
<div className="flex items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin" />
</div>

// Progress bar
<Progress value={45} className="w-full" />
```

### Error States

```typescript
// Error boundary
<ErrorBoundary
  fallback={
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          We couldn't load this content. Please try again.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={retry}>Try Again</Button>
      </CardFooter>
    </Card>
  }
>
  <Content />
</ErrorBoundary>

// Inline error
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to load sessions. Please try again later.
  </AlertDescription>
</Alert>
```

### Empty States

```typescript
<div className="flex flex-col items-center justify-center py-12">
  <div className="rounded-full bg-muted p-3">
    <InboxIcon className="h-6 w-6 text-muted-foreground" />
  </div>
  <h3 className="mt-4 text-lg font-semibold">No sessions found</h3>
  <p className="mt-2 text-sm text-muted-foreground">
    Get started by assigning an issue to Cyrus in Linear
  </p>
  <Button className="mt-4" asChild>
    <a href="https://linear.app" target="_blank">
      Open Linear
    </a>
  </Button>
</div>
```

### Toast Notifications

```typescript
import { useToast } from '@/components/ui/use-toast'

function Component() {
  const { toast } = useToast()
  
  return (
    <Button
      onClick={() => {
        toast({
          title: "Session stopped",
          description: "CYR-123 has been stopped successfully",
          variant: "default",
        })
      }}
    >
      Stop Session
    </Button>
  )
}

// Different variants
toast({
  title: "Success",
  variant: "success",
})

toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
})

toast({
  title: "Info",
  variant: "default",
})
```

---

## Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}

// Usage in components
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  {/* Cards */}
</div>
```

### Mobile Layout

```
Mobile (< 768px):
┌─────────────────────┐
│  Header (sticky)    │
│  [☰] [🔍] [👤]     │
├─────────────────────┤
│                     │
│  Main Content       │
│  (Full width)       │
│                     │
│  Sidebar slides     │
│  in from left       │
│  on [☰] tap         │
│                     │
└─────────────────────┘

Tablet (768px - 1024px):
┌──────┬──────────────┐
│      │ Header       │
│ Nav  │ [🔍] [👤]   │
│ 80px ├──────────────┤
│      │              │
│ ▸    │  Content     │
│ ▸    │  (Expanded)  │
│ ▸    │              │
│      │              │
└──────┴──────────────┘
```

### Touch Interactions

```typescript
// Swipe gestures
import { useSwipeable } from 'react-swipeable'

function SessionCard({ session }) {
  const handlers = useSwipeable({
    onSwipedLeft: () => handleArchive(session.id),
    onSwipedRight: () => handleStar(session.id),
    preventScrollOnSwipe: true,
    trackMouse: true
  })
  
  return (
    <div {...handlers}>
      {/* Card content */}
    </div>
  )
}

// Tap targets (minimum 44x44px for mobile)
<Button className="min-h-[44px] min-w-[44px]">
  <Icon />
</Button>
```

---

## Accessibility

### Semantic HTML

```typescript
// Use proper semantic elements
<nav>
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Page Title</h1>
    <section>Content</section>
  </article>
</main>

<aside>Sidebar</aside>
```

### ARIA Labels

```typescript
// Screen reader support
<Button
  aria-label="Stop session CYR-123"
  onClick={handleStop}
>
  <StopIcon />
</Button>

<div role="status" aria-live="polite">
  {statusMessage}
</div>

<nav aria-label="Primary navigation">
  {/* Nav items */}
</nav>
```

### Keyboard Navigation

```typescript
// Focus management
import { useFocusTrap } from '@/hooks/useFocusTrap'

function Modal({ open, onClose }) {
  const ref = useFocusTrap(open)
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (open) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])
  
  return (
    <div ref={ref} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  )
}

// Skip to content link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to content
</a>
```

### Color Contrast

```css
/* Ensure WCAG AA compliance (4.5:1 for normal text) */
:root {
  /* Text on backgrounds */
  --text-on-background: hsl(222.2 84% 4.9%); /* #0a0a0e */
  --text-on-primary: hsl(210 40% 98%); /* #f8fafc */
  
  /* Interactive elements */
  --link-color: hsl(221.2 83.2% 53.3%); /* #3b82f6 */
  --link-hover: hsl(221.2 83.2% 43.3%); /* #2563eb */
  
  /* Status colors (with sufficient contrast) */
  --success-foreground: hsl(142.1 76.2% 36.3%);
  --error-foreground: hsl(0 84.2% 60.2%);
}
```

---

## Animation Guidelines

### Principles

1. **Purposeful** - Animations должны помогать пользователю понять изменения
2. **Fast** - Keep animations under 300ms for UI interactions
3. **Natural** - Use easing functions that feel natural (ease-out for entrances, ease-in for exits)
4. **Consistent** - Same animation patterns for similar interactions

### Timing Functions

```typescript
// Framer Motion variants
const easings = {
  easeOut: [0.0, 0.0, 0.2, 1.0],
  easeIn: [0.4, 0.0, 1.0, 1.0],
  easeInOut: [0.4, 0.0, 0.2, 1.0],
  spring: { type: 'spring', stiffness: 300, damping: 30 }
}

// Usage
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2, ease: easings.easeOut }}
>
  Content
</motion.div>
```

### Common Animations

```typescript
// Fade in
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

// Slide up
const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

// Scale
const scale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
}

// Stagger children
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Usage
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={slideUp}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Loading States

```typescript
// Skeleton shimmer effect
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
  <div className="h-4 bg-muted rounded w-1/2" />
</div>

// Spinner
<Loader2 className="h-8 w-8 animate-spin" />

// Progress pulse
<motion.div
  className="h-2 bg-primary rounded-full"
  animate={{
    scaleX: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut'
  }}
/>
```

### Micro-interactions

```typescript
// Button hover/tap
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>

// Card hover
<motion.div
  whileHover={{
    y: -4,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }}
  transition={{ duration: 0.2 }}
>
  Card content
</motion.div>

// Status indicator pulse
<motion.div
  className="h-3 w-3 rounded-full bg-green-500"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }}
/>
```

---

## Performance Considerations

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/avatar.png"
  alt="User avatar"
  width={40}
  height={40}
  priority={false} // Only true for above-the-fold images
  loading="lazy" // Lazy load by default
/>
```

### Code Splitting

```typescript
// Route-based
// Automatically handled by Next.js App Router

// Component-based
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton className="h-[300px]" />,
  ssr: false // Client-only if needed
})
```

### Virtualization

```typescript
// For long lists (100+ items)
import { VirtualList } from '@/components/VirtualList'

<VirtualList
  items={sessions}
  itemHeight={120}
  renderItem={(session) => <SessionCard session={session} />}
  overscan={3}
/>
```

---

*Документ создан: 2025-01-14*
*Автор: Claude Code Session*
*Версия: 1.0*
