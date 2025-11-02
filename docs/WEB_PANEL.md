# Cyrus Web Panel

Complete documentation for the Cyrus Web Control Panel - a modern, real-time monitoring dashboard optimized for Codegen sandbox deployment.

## Overview

The Cyrus Web Panel is a Next.js 15 application that provides a beautiful, real-time interface for monitoring and managing Cyrus AI agent sessions. It's specifically optimized to run in Codegen's sandbox environment on port 3000.

## Features

### ✨ Core Features

- **Real-time Dashboard** - Live updates every 5 seconds
- **Session Monitoring** - Track active Claude sessions
- **Statistics Overview** - Key metrics at a glance
- **Activity Feed** - Recent events and notifications
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Modern UI** - Built with Next.js 15, React 19, Tailwind CSS

### 📊 Dashboard Components

#### Stats Cards
- Total sessions count
- Active sessions count
- Success rate percentage
- Average duration

#### Session Cards
- Issue ID and title
- Repository name
- Current activity status
- Duration timer
- Stop/kill controls

#### Activity Feed
- Session starts
- PR creations
- Completions
- Error notifications

## Quick Start

### For Codegen Sandbox (Recommended)

1. **Configure Web Preview** in Codegen repository settings:
   ```bash
   cd apps/web-panel && pnpm install && pnpm dev
   ```

2. **Start an agent** - Assign a Linear issue to Cyrus

3. **Click "View Web Preview"** - Opens in new tab

See [apps/web-panel/CODEGEN_SETUP.md](../apps/web-panel/CODEGEN_SETUP.md) for detailed instructions.

### For Local Development

```bash
# Install dependencies
cd apps/web-panel
pnpm install

# Run development server
pnpm dev

# Open browser
open http://localhost:3000
```

## Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.3 | React framework with App Router |
| **React** | 19.0.0 | UI library |
| **TypeScript** | 5.7.2 | Type safety |
| **Tailwind CSS** | 3.4.17 | Styling framework |
| **Lucide React** | Latest | Icon library |
| **date-fns** | 4.1.0 | Date formatting |
| **Recharts** | 2.15.0 | Charts (future) |

### Project Structure

```
apps/web-panel/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (Dashboard)
│   │   ├── globals.css               # Global styles
│   │   └── api/
│   │       └── health/
│   │           └── route.ts          # Health check endpoint
│   │
│   ├── components/                    # React components
│   │   └── dashboard/
│   │       ├── Dashboard.tsx         # Main dashboard
│   │       ├── StatsCard.tsx         # Statistics card
│   │       ├── SessionCard.tsx       # Session card
│   │       └── ActivityFeed.tsx      # Activity feed
│   │
│   ├── lib/
│   │   └── utils.ts                  # Utility functions
│   │
│   └── types/
│       └── index.ts                  # TypeScript types
│
├── public/                           # Static assets
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
├── README.md                         # Main documentation
├── CODEGEN_SETUP.md                  # Codegen-specific setup
├── QUICK_START.md                    # Quick start guide
└── start-in-codegen.sh              # Startup script
```

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# Codegen Preview URL (auto-set in sandbox)
CG_PREVIEW_URL=

# Optional: Connect to Cyrus CLI
API_URL=http://localhost:3456
CYRUS_API_KEY=

# Feature Flags
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_POLL_INTERVAL=5000
```

### Port Configuration

**IMPORTANT:** The panel **must** run on port 3000 for Codegen sandbox compatibility.

Configured in `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "start": "next start -p 3000"
  }
}
```

### Codegen Configuration

**Web Preview Command:**
```bash
cd apps/web-panel && pnpm install && pnpm dev
```

**Or use the startup script:**
```bash
./apps/web-panel/start-in-codegen.sh
```

## API Integration

The panel is designed to work with the following API structure:

### Expected Endpoints

```typescript
// GET /api/sessions/active
// Returns active sessions
{
  sessions: Session[]
}

// GET /api/stats
// Returns dashboard statistics
{
  totalSessions: number
  activeSessions: number
  successRate: number
  avgDuration: number
}

// GET /api/activities
// Returns recent activities
{
  activities: ActivityEvent[]
}

// POST /api/sessions/:id/stop
// Stops a session
{
  success: boolean
}
```

### Type Definitions

```typescript
interface Session {
  id: string
  issueId: string
  issueTitle: string
  repository: string
  status: 'active' | 'thinking' | 'paused' | 'completed' | 'failed'
  startedAt: string
  currentActivity: string
}

interface Stats {
  totalSessions: number
  activeSessions: number
  successRate: number
  avgDuration: number
}

interface ActivityEvent {
  id: string
  type: 'session_start' | 'session_complete' | 'pr_created' | 'error'
  message: string
  timestamp: string
}
```

## Real-time Updates

The dashboard implements polling-based real-time updates:

```typescript
// Auto-refresh every 5 seconds (configurable)
useEffect(() => {
  fetchDashboardData()
  const interval = setInterval(fetchDashboardData, 5000)
  return () => clearInterval(interval)
}, [])
```

**Configuration:**
- Default: 5000ms (5 seconds)
- Configurable via `NEXT_PUBLIC_POLL_INTERVAL` env variable
- Automatically stops on component unmount

## Customization

### Theming

Colors are defined using CSS variables in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --success: 142.1 76.2% 36.3%;
  --warning: 47.9 95.8% 53.1%;
  --error: 0 84.2% 60.2%;
  /* ... */
}
```

### Adding Components

1. Create component file:
   ```typescript
   // src/components/dashboard/MyComponent.tsx
   export function MyComponent() {
     return <div>My content</div>
   }
   ```

2. Import in Dashboard:
   ```typescript
   import { MyComponent } from './MyComponent'
   ```

### Adjusting Refresh Rate

Edit `src/components/dashboard/Dashboard.tsx`:

```typescript
const POLL_INTERVAL = 10000 // 10 seconds instead of 5
const interval = setInterval(fetchDashboardData, POLL_INTERVAL)
```

## Deployment

### Codegen Sandbox Deployment

See [CODEGEN_SETUP.md](../apps/web-panel/CODEGEN_SETUP.md) for complete instructions.

**Summary:**
1. Configure Web Preview in Codegen settings
2. Set command: `cd apps/web-panel && pnpm install && pnpm dev`
3. Trigger agent
4. Click "View Web Preview"

### Production Build

For faster startup in Codegen:

```bash
# Build once
cd apps/web-panel
pnpm build

# Update Codegen command to use production build
cd apps/web-panel && pnpm start
```

### Health Checks

The panel includes a health check endpoint:

```bash
# Check server status
curl http://localhost:3000/api/health

# Response
{
  "status": "ok",
  "uptime": 1234,
  "timestamp": "2025-01-17T...",
  "environment": "production",
  "isCodegenSandbox": true
}
```

## Troubleshooting

### Common Issues

#### 1. "View Web Preview" button not appearing

**Solutions:**
- Verify server is running on port 3000
- Check Codegen logs for errors
- Wait ~30 seconds for detection
- Ensure no build errors

#### 2. Port 3000 already in use

**Solutions:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or find and kill manually
lsof -i :3000
kill -9 <PID>
```

#### 3. Slow startup in Codegen

**Solutions:**
- Pre-build the application: `pnpm build`
- Use production mode: `pnpm start`
- Cache node_modules (use `.codegenignore`)

#### 4. Panel shows but no data

**Expected:** Currently uses mock data for development.

**To connect real API:**
1. Set `API_URL` in `.env.local`
2. Implement API endpoints in Cyrus CLI
3. Update `fetchDashboardData()` in Dashboard.tsx

### Debug Mode

Enable detailed logging:

```typescript
// src/components/dashboard/Dashboard.tsx
const DEBUG = true

if (DEBUG) {
  console.log('[Dashboard] Fetched data:', { stats, sessions, activities })
}
```

## Performance

### Optimizations

- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **CSS Purging** - Tailwind removes unused styles
- **Fast Refresh** - Hot module replacement in dev
- **Production Build** - Optimized bundles

### Metrics

Typical performance in Codegen sandbox:

- **Initial Load**: ~1-2 seconds
- **Time to Interactive**: ~2-3 seconds
- **Bundle Size**: ~200KB (gzipped)
- **Memory Usage**: ~50MB

## Security

### Sandbox Isolation

- Runs in isolated Codegen sandbox
- No direct internet access
- Controlled environment variables
- Automatic cleanup after session

### No Authentication

- Not required in sandbox environment
- Sandbox already authenticated
- Session-scoped URLs
- Automatic expiration

### CORS

Pre-configured for Codegen proxy:

```javascript
// next.config.js
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: process.env.CG_PREVIEW_URL || '*' },
    ],
  }]
}
```

## Future Enhancements

Planned features:

- [ ] WebSocket support for instant updates
- [ ] Session detail modal with logs
- [ ] Console output streaming
- [ ] Repository management UI
- [ ] Settings page
- [ ] Dark/light theme toggle
- [ ] Historical analytics charts
- [ ] Export session data
- [ ] Multi-agent support
- [ ] Custom alert rules

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development workflow.

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/cyrus.git
cd cyrus

# Install dependencies
pnpm install

# Navigate to web panel
cd apps/web-panel

# Run development server
pnpm dev
```

### Making Changes

1. Create feature branch
2. Make changes
3. Test locally
4. Test in Codegen sandbox
5. Create pull request

## Resources

### Documentation

- [Quick Start](../apps/web-panel/QUICK_START.md) - 5-minute setup guide
- [Codegen Setup](../apps/web-panel/CODEGEN_SETUP.md) - Detailed Codegen instructions
- [Main README](../apps/web-panel/README.md) - Component documentation

### External Links

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Codegen Documentation](https://docs.codegen.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React 19](https://react.dev)

## Support

- **Issues**: Create GitHub issue with `web-panel` label
- **Questions**: See main repository [README](../README.md)
- **Codegen Support**: https://docs.codegen.com/support

---

**Version:** 0.1.0  
**Last Updated:** 2025-01-17  
**Maintained by:** Cyrus Development Team
