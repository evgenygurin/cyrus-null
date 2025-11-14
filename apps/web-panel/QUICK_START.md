# Quick Start Guide

Get the Cyrus Web Panel running in 5 minutes.

## For Codegen Sandbox

### 1. Configure in Codegen UI

Go to: `https://codegen.com/{your_org}/{repo}/settings/web-preview`

**Web Preview Command:**
```bash
cd apps/web-panel && pnpm install && pnpm dev
```

### 2. Trigger Agent

- Assign a Linear issue to Cyrus agent
- Agent starts automatically
- Wait for "View Web Preview" button
- Click to open panel

**That's it!** 🎉

## For Local Development

### 1. Install Dependencies

```bash
cd apps/web-panel
pnpm install
```

### 2. Run Development Server

```bash
pnpm dev
```

### 3. Open Browser

```
http://localhost:3000
```

## What You'll See

### Dashboard
- **Stats Cards**: Total sessions, active sessions, success rate, avg duration
- **Active Sessions**: Real-time list of running sessions
- **Activity Feed**: Recent events and notifications

### Features
- ✅ Real-time updates (polls every 5 seconds)
- ✅ Session monitoring with live status
- ✅ Activity feed with timestamps
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Modern UI with smooth animations

## Connect to Cyrus CLI (Optional)

To fetch real data from Cyrus CLI:

### 1. Create `.env.local`

```bash
API_URL=http://localhost:3456
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### 2. Start Cyrus CLI

```bash
# In separate terminal
cd apps/cli
pnpm start
```

### 3. Refresh Dashboard

The panel will automatically connect to Cyrus CLI API.

## Customization

### Change Refresh Rate

Edit `src/components/dashboard/Dashboard.tsx`:

```typescript
// Change from 5000 to your preferred interval (milliseconds)
const interval = setInterval(fetchDashboardData, 5000)
```

### Adjust Colors

Edit `src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Change primary color */
}
```

### Add Custom Components

```typescript
// src/components/dashboard/YourComponent.tsx
export function YourComponent() {
  return <div>Your custom content</div>
}

// Import in Dashboard.tsx
import { YourComponent } from './YourComponent'
```

## Troubleshooting

### Server won't start

```bash
# Check port 3000
lsof -i :3000

# Kill existing process
lsof -ti:3000 | xargs kill -9

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### "View Web Preview" not showing in Codegen

1. Check port is 3000 ✓
2. Check server started successfully ✓
3. Wait ~30 seconds for Codegen to detect ⏱️

### Panel shows but no data

Currently uses mock data. To connect real API:

1. Set `API_URL` in `.env.local`
2. Ensure Cyrus CLI is running
3. Implement API endpoints (see README.md)

## Next Steps

- 📖 Read [README.md](./README.md) for detailed documentation
- 🚀 Read [CODEGEN_SETUP.md](./CODEGEN_SETUP.md) for Codegen specifics
- 🔧 Customize the dashboard to your needs
- 🌐 Connect to real Cyrus CLI API

## Support

- Issues: Create GitHub issue with `web-panel` label
- Questions: See [Contributing Guide](../../CONTRIBUTING.md)
- Codegen: https://docs.codegen.com

---

**Ready to monitor your AI agent!** 🤖
