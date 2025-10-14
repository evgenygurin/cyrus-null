# Cyrus Control Panel - Implementation Guide

## Оглавление
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Implementation Phases](#implementation-phases)
- [File-by-File Guide](#file-by-file-guide)
- [Testing Strategy](#testing-strategy)
- [Deployment Checklist](#deployment-checklist)

---

## Project Structure

### Directory Layout

```
apps/control-panel/
├── .env.local                    # Local environment variables
├── .env.example                  # Example env file
├── .eslintrc.json               # ESLint config
├── biome.json                    # Biome config
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js            # PostCSS config
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript config
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed data
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/             # Auth layout group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/        # Main app layout group
│   │   │   ├── layout.tsx      # Dashboard layout
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   │
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── repositories/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── history/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   ├── agent/
│   │   │   │   ├── integrations/
│   │   │   │   └── security/
│   │   │   │
│   │   │   └── billing/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── sessions/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── stop/
│   │   │   │   │       └── route.ts
│   │   │   │   └── stream/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── repositories/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── overview/
│   │   │   │   └── timeline/
│   │   │   │
│   │   │   └── webhooks/
│   │   │       ├── linear/
│   │   │       │   └── route.ts
│   │   │       └── stripe/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   └── error.tsx           # Error boundary
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── CommandPalette.tsx
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── ActiveAgents.tsx
│   │   │   ├── ActiveSessions.tsx
│   │   │   └── ActivityFeed.tsx
│   │   │
│   │   ├── sessions/           # Session components
│   │   │   ├── SessionCard.tsx
│   │   │   ├── SessionList.tsx
│   │   │   ├── SessionDetails.tsx
│   │   │   └── SessionConsole.tsx
│   │   │
│   │   ├── repositories/       # Repository components
│   │   │   ├── RepositoryCard.tsx
│   │   │   ├── RepositoryList.tsx
│   │   │   ├── RepositoryForm.tsx
│   │   │   └── ToolsEditor.tsx
│   │   │
│   │   ├── analytics/          # Analytics components
│   │   │   ├── SessionsChart.tsx
│   │   │   ├── ToolUsageChart.tsx
│   │   │   └── MetricCard.tsx
│   │   │
│   │   └── shared/             # Shared components
│   │       ├── StatusIndicator.tsx
│   │       ├── CodeBlock.tsx
│   │       ├── Timeline.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── api/                # API clients
│   │   │   ├── sessions.ts
│   │   │   ├── repositories.ts
│   │   │   └── analytics.ts
│   │   │
│   │   ├── auth/               # Authentication
│   │   │   ├── auth.ts         # NextAuth config
│   │   │   ├── linear-oauth.ts
│   │   │   └── permissions.ts
│   │   │
│   │   ├── db/                 # Database
│   │   │   ├── prisma.ts       # Prisma client
│   │   │   └── queries.ts
│   │   │
│   │   ├── integrations/       # External services
│   │   │   ├── linear.ts
│   │   │   ├── stripe.ts
│   │   │   └── github.ts
│   │   │
│   │   └── utils/              # Utilities
│   │       ├── cn.ts           # Class name utility
│   │       ├── format.ts       # Formatters
│   │       ├── validation.ts   # Validators
│   │       └── crypto.ts       # Encryption
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSession.ts
│   │   ├── useRepositories.ts
│   │   ├── useAnalytics.ts
│   │   ├── useToast.ts
│   │   └── useDebounce.ts
│   │
│   ├── store/                  # State management
│   │   ├── sessionStore.ts     # Zustand stores
│   │   ├── uiStore.ts
│   │   └── authStore.ts
│   │
│   └── types/                  # TypeScript types
│       ├── index.ts
│       ├── session.ts
│       ├── repository.ts
│       ├── analytics.ts
│       └── api.ts
│
└── tests/                      # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Setup Instructions

### 1. Create Next.js Project

```bash
# Navigate to apps directory
cd apps

# Create Next.js 15 project with TypeScript, Tailwind, App Router
pnpx create-next-app@latest control-panel \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint

cd control-panel
```

### 2. Install Dependencies

```bash
# Core dependencies
pnpm add next@latest react@latest react-dom@latest

# UI Components
pnpm add @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-tooltip \
  @radix-ui/react-slot \
  lucide-react \
  class-variance-authority \
  clsx \
  tailwind-merge

# State Management
pnpm add @tanstack/react-query zustand

# Forms & Validation
pnpm add react-hook-form @hookform/resolvers zod

# Database
pnpm add @prisma/client
pnpm add -D prisma

# Authentication
pnpm add next-auth@beta

# External Services
pnpm add @linear/sdk stripe

# Utilities
pnpm add date-fns

# Animations
pnpm add framer-motion

# Charts
pnpm add recharts

# Dev Dependencies
pnpm add -D @types/node \
  @types/react \
  @types/react-dom \
  typescript \
  @biomejs/biome \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test
```

### 3. Initialize shadcn/ui

```bash
# Initialize shadcn/ui (will create components.json)
pnpx shadcn@latest init

# Add initial components
pnpx shadcn@latest add button card dialog input select badge skeleton toast
```

### 4. Setup Prisma

```bash
# Initialize Prisma
pnpm prisma init

# Create schema (see schema below)
# Then generate client
pnpm prisma generate

# Create and apply migrations
pnpm prisma migrate dev --name init

# (Optional) Seed database
pnpm prisma db seed
```

### 5. Setup Environment Variables

```bash
# Create .env.local
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..." # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Linear
LINEAR_CLIENT_ID="..."
LINEAR_CLIENT_SECRET="..."
LINEAR_WEBHOOK_SECRET="..."

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudflare (optional)
CF_ACCOUNT_ID="..."
CF_KV_NAMESPACE_ID="..."

# Encryption
ENCRYPTION_KEY="..." # 64 hex characters

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
```

### 6. Configure Next.js

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Image optimization
  images: {
    domains: ['avatars.githubusercontent.com', 'linear.app'],
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
```

### 7. Configure Tailwind

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Setup project infrastructure and core layout

#### Day 1-2: Project Setup
- [x] Create Next.js project
- [x] Install dependencies
- [x] Setup Prisma with database schema
- [x] Configure environment variables
- [ ] Initialize Git repository

#### Day 3-4: Authentication
```typescript
// src/lib/auth/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Implement authentication logic
        const user = await verifyUser(credentials)
        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
})
```

#### Day 5-7: Core Layout
- [ ] Create root layout with providers
- [ ] Build Header component
- [ ] Build Sidebar component
- [ ] Implement responsive navigation
- [ ] Add Command Palette (⌘K)

**Files to create:**
```
src/app/layout.tsx
src/app/(auth)/layout.tsx
src/app/(dashboard)/layout.tsx
src/components/layout/Header.tsx
src/components/layout/Sidebar.tsx
src/components/layout/CommandPalette.tsx
```

### Phase 2: Dashboard & Sessions (Week 2)

#### Day 8-10: Dashboard Page
```typescript
// src/app/(dashboard)/page.tsx
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getActiveSessions } from '@/lib/api/sessions'
import { getDailyStats } from '@/lib/api/analytics'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { ActiveSessions } from '@/components/dashboard/ActiveSessions'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')
  
  const [sessions, stats] = await Promise.all([
    getActiveSessions(),
    getDailyStats(),
  ])
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <StatsOverview stats={stats} />
      <ActiveSessions sessions={sessions} />
    </div>
  )
}
```

**Components to create:**
- StatsOverview
- ActiveSessions
- SessionCard
- ActivityFeed
- MetricCard

#### Day 11-14: Sessions Management
- [ ] Sessions list page
- [ ] Session details modal/page
- [ ] Console output viewer
- [ ] Real-time updates via SSE
- [ ] Stop/Kill session actions

**API Routes:**
```typescript
// src/app/api/sessions/route.ts
export async function GET(request: Request) {
  const sessions = await prisma.session.findMany({
    where: { status: 'ACTIVE' },
    include: { repository: true }
  })
  return Response.json({ sessions })
}

// src/app/api/sessions/[id]/stop/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  await stopSession(params.id)
  return Response.json({ success: true })
}

// src/app/api/sessions/stream/route.ts
export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // SSE implementation
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
```

### Phase 3: Repository Management (Week 3)

#### Day 15-17: Repository List & Forms
```typescript
// src/components/repositories/RepositoryForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const repositorySchema = z.object({
  name: z.string().min(1),
  repositoryPath: z.string().min(1),
  baseBranch: z.string().default('main'),
  linearWorkspaceId: z.string().min(1),
  linearToken: z.string().min(1),
  allowedTools: z.array(z.string()),
})

type RepositoryFormData = z.infer<typeof repositorySchema>

export function RepositoryForm({ 
  repository, 
  onSubmit 
}: { 
  repository?: Repository
  onSubmit: (data: RepositoryFormData) => void 
}) {
  const form = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
    defaultValues: repository || {
      baseBranch: 'main',
      allowedTools: DEFAULT_TOOLS,
    }
  })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

#### Day 18-21: Advanced Configuration
- [ ] Allowed tools editor
- [ ] Routing rules configuration
- [ ] Label prompts setup
- [ ] MCP servers configuration

**Components:**
- RepositoryCard
- RepositoryForm
- ToolsEditor
- RoutingConfig
- LabelsConfig

### Phase 4: Analytics & History (Week 4)

#### Day 22-24: History Page
```typescript
// src/app/(dashboard)/history/page.tsx
import { SessionHistory } from '@/components/history/SessionHistory'
import { getSessionHistory } from '@/lib/api/sessions'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; status?: string }
}) {
  const sessions = await getSessionHistory({
    from: searchParams.from,
    to: searchParams.to,
    status: searchParams.status,
  })
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">History</h1>
      <SessionHistory sessions={sessions} />
    </div>
  )
}
```

#### Day 25-28: Analytics Dashboard
- [ ] Overview metrics
- [ ] Time-series charts (Recharts)
- [ ] Tool usage distribution
- [ ] Success rate trends
- [ ] Export functionality

**Components:**
- SessionsChart
- ToolUsageChart
- SuccessRateChart
- TimelineChart
- ExportButton

### Phase 5: Settings & Billing (Week 5)

#### Day 29-31: Settings Pages
- [ ] Profile settings
- [ ] Agent configuration
- [ ] Integrations management
- [ ] Security settings

#### Day 32-35: Billing Integration
```typescript
// src/app/api/billing/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { priceId } = await request.json()
  const session = await auth()
  
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    customer_email: session.user.email,
  })
  
  return Response.json({ url: checkoutSession.url })
}
```

### Phase 6: Polish & Testing (Week 6)

#### Day 36-38: UX Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Toast notifications
- [ ] Animations

#### Day 39-42: Testing
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Accessibility testing

---

## File-by-File Guide

### Core Files

#### 1. Database Schema
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
  
  @@index([email])
}

enum Role {
  ADMIN
  USER
  VIEWER
}

model Repository {
  id                   String    @id @default(cuid())
  name                 String
  repositoryPath       String
  baseBranch           String    @default("main")
  linearWorkspaceId    String
  linearWorkspaceName  String?
  linearToken          String    // encrypted
  workspaceBaseDir     String
  isActive             Boolean   @default(true)
  allowedTools         Json      // string[]
  mcpConfigPath        Json?     // string | string[]
  teamKeys             Json?     // string[]
  projectKeys          Json?     // string[]
  routingLabels        Json?     // string[]
  labelPrompts         Json?     // LabelPromptConfig
  setupScript          String?
  totalIssuesProcessed Int       @default(0)
  successRate          Float     @default(0)
  lastActiveAt         DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  userId               String
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions             Session[]
  
  @@index([userId])
  @@index([linearWorkspaceId])
  @@index([isActive])
}

model Session {
  id               String         @id @default(cuid())
  issueId          String
  issueIdentifier  String
  issueTitle       String
  issueUrl         String?
  status           SessionStatus  @default(STARTING)
  startedAt        DateTime       @default(now())
  endedAt          DateTime?
  claudeVersion    String?
  workspacePath    String
  workspaceBranch  String
  exitCode         Int?
  inputTokens      Int            @default(0)
  outputTokens     Int            @default(0)
  thinkingTokens   Int            @default(0)
  duration         Int?           // seconds
  errorMessage     String?        @db.Text
  repositoryId     String
  repository       Repository     @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  userId           String
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
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

#### 2. Root Layout
```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Cyrus Control Panel',
  description: 'AI development agent control panel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

#### 3. Providers
```typescript
// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))
  
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

#### 4. Dashboard Layout
```typescript
// src/app/(dashboard)/layout.tsx
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/unit/components/SessionCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionCard } from '@/components/sessions/SessionCard'
import { mockSession } from '../mocks'

describe('SessionCard', () => {
  it('renders session information', () => {
    render(<SessionCard session={mockSession()} />)
    
    expect(screen.getByText('CYR-123')).toBeInTheDocument()
    expect(screen.getByText(/Fix auth bug/i)).toBeInTheDocument()
  })
  
  it('calls onStop when stop button clicked', async () => {
    const onStop = vi.fn()
    render(<SessionCard session={mockSession()} onStop={onStop} />)
    
    fireEvent.click(screen.getByRole('button', { name: /stop/i }))
    
    expect(onStop).toHaveBeenCalled()
  })
})
```

### Integration Tests

```typescript
// tests/integration/api/sessions.test.ts
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/sessions/route'

describe('Sessions API', () => {
  it('returns active sessions', async () => {
    const response = await GET(new Request('http://localhost:3000/api/sessions'))
    const data = await response.json()
    
    expect(data).toHaveProperty('sessions')
    expect(Array.isArray(data.sessions)).toBe(true)
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test('user can view dashboard', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  // Navigate to dashboard
  await page.waitForURL('/dashboard')
  
  // Check content
  await expect(page.locator('h1')).toContainText('Dashboard')
  await expect(page.locator('[data-testid="active-sessions"]')).toBeVisible()
})
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run all tests: `pnpm test`
- [ ] Check TypeScript: `pnpm typecheck`
- [ ] Lint code: `pnpm lint`
- [ ] Build locally: `pnpm build`
- [ ] Test production build: `pnpm start`
- [ ] Review environment variables
- [ ] Update CHANGELOG.md

### Vercel Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all env vars

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Post-Deployment

- [ ] Run database migrations: `pnpm prisma migrate deploy`
- [ ] Seed initial data (if needed)
- [ ] Test authentication flow
- [ ] Test webhooks (Linear, Stripe)
- [ ] Verify SSE connections
- [ ] Check error tracking (Sentry)
- [ ] Monitor analytics (PostHog)
- [ ] Setup monitoring alerts

### Domain Setup

```bash
# Add custom domain
vercel domains add control.cyrus.com

# Configure DNS
# Add CNAME record: control.cyrus.com → cname.vercel-dns.com

# Enable SSL (automatic with Vercel)
```

---

## Maintenance & Monitoring

### Regular Tasks

**Daily:**
- Monitor error rates (Sentry)
- Check API response times
- Review failed sessions

**Weekly:**
- Review analytics trends
- Update dependencies: `pnpm update`
- Check security vulnerabilities: `pnpm audit`

**Monthly:**
- Database optimization
- Review and archive old sessions
- Cost analysis
- Feature usage analysis

### Monitoring Setup

```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  tracesSampleRate: 1.0,
})

// Usage
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'sessions',
      operation: 'stop',
    },
  })
  throw error
}
```

---

## Additional Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Vercel Deployment](https://vercel.com/docs)

### Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vercel Analytics](https://vercel.com/analytics)

---

*Документ создан: 2025-01-14*
*Автор: Claude Code Session*
*Версия: 1.0*
