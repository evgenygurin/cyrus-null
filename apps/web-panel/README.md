# Cyrus Web Control Panel

Modern web-based control panel for monitoring and managing Cyrus AI development agent sessions.

## Features

- 📊 **Real-time Dashboard** - Monitor active sessions with live updates
- 📈 **Statistics Overview** - Track session metrics and success rates
- 🔄 **Session Management** - View, monitor, and control active sessions
- 📝 **Activity Feed** - Recent events and notifications
- 🎨 **Modern UI** - Built with Next.js 15, React 19, and Tailwind CSS

## Codegen Sandbox Deployment

This panel is optimized to run in Codegen's sandbox environment on port 3000.

### Quick Start in Codegen

1. **Configure Web Preview in Codegen Settings:**
   ```
   Repository: your-org/cyrus
   Settings → Web Preview
   Command: cd apps/web-panel && pnpm install && pnpm dev
   ```

2. **Access the Panel:**
   - Once the server starts, click "View Web Preview" in Codegen
   - The panel will be available at the Codegen proxy URL
   - Automatically uses `CG_PREVIEW_URL` environment variable

### Deploy to Vercel

Deploy the web panel to Vercel in 3 steps:

1. **Import Project**: Go to [vercel.com/new](https://vercel.com/new) and import your repository
2. **Set Root Directory**: Set "Root Directory" to `apps/web-panel`
3. **Deploy**: Click "Deploy" - Vercel will auto-detect Next.js settings

Your dashboard will be live at `https://your-project.vercel.app`

📖 **Detailed deployment guide**: See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### Local Development

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

```
apps/web-panel/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Dashboard page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   └── dashboard/           # Dashboard components
│   │       ├── Dashboard.tsx    # Main dashboard
│   │       ├── StatsCard.tsx    # Stats card
│   │       ├── SessionCard.tsx  # Session card
│   │       └── ActivityFeed.tsx # Activity feed
│   │
│   └── types/                   # TypeScript types
│       └── index.ts
│
├── public/                      # Static assets
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── package.json                # Dependencies
```

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# Codegen Preview URL (auto-set in sandbox)
CG_PREVIEW_URL=http://localhost:3000

# Optional: Connect to Cyrus CLI API
API_URL=http://localhost:3456
CYRUS_API_KEY=your_api_key

# Feature Flags
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_POLL_INTERVAL=5000
```

### Port Configuration

The panel **must** run on **port 3000** for Codegen sandbox compatibility:

```json
// package.json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "start": "next start -p 3000"
  }
}
```

## Features in Detail

### Dashboard

- **Stats Overview**: Total sessions, active sessions, success rate, avg duration
- **Active Sessions**: Real-time list of running Claude sessions
  - Issue ID and title
  - Repository name
  - Current activity
  - Duration
  - Stop/Kill controls
- **Activity Feed**: Recent events
  - Session starts
  - PR creations
  - Completions
  - Errors

### Real-time Updates

The dashboard polls for updates every 5 seconds (configurable):

```typescript
// Auto-refresh every 5 seconds
useEffect(() => {
  const interval = setInterval(fetchDashboardData, 5000)
  return () => clearInterval(interval)
}, [])
```

## API Integration

The panel expects the following API endpoints from Cyrus CLI:

```typescript
// GET /api/sessions/active
// Returns list of active sessions

// GET /api/stats
// Returns dashboard statistics

// GET /api/activities
// Returns recent activities

// POST /api/sessions/:id/stop
// Stops a session
```

To connect to Cyrus CLI, set `API_URL` in environment variables.

## Customization

### Theming

Colors are defined in `globals.css` using CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

### Polling Interval

Adjust refresh rate in `Dashboard.tsx`:

```typescript
const POLL_INTERVAL = 5000 // 5 seconds
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- **Fast Refresh** - Hot module replacement
- **Code Splitting** - Automatic route-based splitting
- **Optimized Images** - Next.js Image component
- **CSS Optimization** - Tailwind purging

## Security

- No authentication required (runs in isolated sandbox)
- CORS configured for Codegen proxy
- No sensitive data stored in browser

## Troubleshooting

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use alternative port (not recommended for Codegen)
pnpm dev -- -p 3001
```

### Codegen Web Preview not showing

1. Verify server is running on port 3000
2. Check Codegen logs for errors
3. Ensure `CG_PREVIEW_URL` is set

### API connection failing

1. Check `API_URL` in `.env.local`
2. Verify Cyrus CLI is running
3. Check CORS configuration

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Session detail modal
- [ ] Console output viewer
- [ ] Repository management
- [ ] Settings page
- [ ] Dark/light theme toggle
- [ ] Export session logs
- [ ] Historical analytics charts

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development workflow.

## License

MIT License - see [LICENSE](../../LICENSE)

---

**Built for Cyrus AI Agent** | [Documentation](../../docs/README.md) | [GitHub](https://github.com/your-org/cyrus)
