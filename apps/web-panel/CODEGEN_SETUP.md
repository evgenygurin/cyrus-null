# Codegen Sandbox Setup Guide

Complete guide for deploying Cyrus Web Panel in Codegen sandbox environment.

## Prerequisites

- Codegen account with repository access
- Cyrus repository configured in Codegen
- pnpm package manager

## Step-by-Step Setup

### 1. Configure Web Preview in Codegen

Navigate to your repository settings in Codegen:

```
https://codegen.com/{your_org}/{repo_name}/settings/web-preview
```

**Configuration:**

- **Command:**
  ```bash
  cd apps/web-panel && pnpm install && pnpm dev
  ```

- **Port:** 3000 (automatically detected)

- **Working Directory:** Repository root

### 2. Environment Variables (Optional)

If you need to connect to Cyrus CLI API, configure in Codegen:

```
Settings → Environment Variables
```

Add:

```bash
API_URL=http://localhost:3456
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_POLL_INTERVAL=5000
```

### 3. Trigger Web Preview

**From Codegen UI:**

1. Create or open an issue
2. Assign to Cyrus agent
3. Wait for agent to start
4. Click "View Web Preview" button in agent trace page

**From CLI:**

```bash
# Start Codegen agent with web preview
codegen run --preview
```

### 4. Access the Panel

The web panel will be accessible at:

```
https://your-sandbox-id.codegen.app
```

Codegen automatically:
- Sets `CG_PREVIEW_URL` environment variable
- Proxies requests to port 3000
- Handles SSL/HTTPS
- Manages sandbox lifecycle

## Architecture in Codegen

```
┌─────────────────────────────────────────────────┐
│           Codegen Sandbox                       │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │   Cyrus CLI Agent                        │  │
│  │   (Processing Linear issues)             │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │   Web Panel (Port 3000)                  │  │
│  │   - Next.js server                       │  │
│  │   - Dashboard UI                         │  │
│  │   - Real-time monitoring                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS (Codegen Proxy)
                  ↓
         ┌────────────────────┐
         │  Your Browser      │
         │  View Web Preview  │
         └────────────────────┘
```

## How It Works

1. **Agent Starts:** Cyrus CLI begins processing issues
2. **Server Starts:** Web panel starts on port 3000
3. **Codegen Detects:** Port 3000 becomes available
4. **Proxy Created:** Codegen creates secure HTTPS proxy
5. **Button Appears:** "View Web Preview" shows in UI
6. **Access Panel:** Click to open in new tab

## Configuration Options

### Custom Port (Not Recommended)

If you must use a different port, update:

**package.json:**
```json
{
  "scripts": {
    "dev": "next dev -p YOUR_PORT",
    "start": "next start -p YOUR_PORT"
  }
}
```

**next.config.js:**
```javascript
module.exports = {
  serverRuntimeConfig: {
    port: YOUR_PORT,
  },
}
```

⚠️ **Warning:** Codegen is configured to look for port 3000. Using a different port may require additional configuration.

### Build for Production

For faster startup in Codegen:

```bash
# Build once
cd apps/web-panel
pnpm build

# Update Codegen command
cd apps/web-panel && pnpm start
```

This skips installation and build on every run.

### Custom Startup Script

Create `apps/web-panel/start-in-codegen.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting Cyrus Web Panel..."

# Navigate to web-panel directory
cd "$(dirname "$0")"

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install --frozen-lockfile
fi

# Build if not built
if [ ! -d ".next" ]; then
  echo "🏗️  Building application..."
  pnpm build
fi

# Start server
echo "✨ Starting server on port 3000..."
pnpm start
```

Make executable:
```bash
chmod +x apps/web-panel/start-in-codegen.sh
```

Update Codegen command:
```bash
./apps/web-panel/start-in-codegen.sh
```

## Troubleshooting

### Issue: "View Web Preview" button not appearing

**Solutions:**

1. **Check port 3000 is listening:**
   ```bash
   # In Codegen terminal
   lsof -i :3000
   # Should show Node.js process
   ```

2. **Check server logs:**
   ```bash
   # Look for startup message
   ✓ Ready on http://localhost:3000
   ```

3. **Verify Codegen config:**
   - Port must be 3000
   - Command must start server successfully
   - No build errors

### Issue: Panel loads but shows errors

**Solutions:**

1. **Check environment variables:**
   ```bash
   echo $CG_PREVIEW_URL
   # Should output proxy URL
   ```

2. **Check API connectivity:**
   - Verify `API_URL` if connecting to Cyrus CLI
   - Check CORS configuration
   - Review browser console for errors

3. **Check dependencies:**
   ```bash
   cd apps/web-panel
   pnpm install --force
   ```

### Issue: Slow startup

**Solutions:**

1. **Pre-build the app:**
   ```bash
   pnpm build
   ```

2. **Use production build:**
   ```bash
   pnpm start  # Instead of pnpm dev
   ```

3. **Cache node_modules:**
   - Create `.codegenignore`:
     ```
     !apps/web-panel/node_modules
     ```

### Issue: Port 3000 already in use

**Solutions:**

```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or find and kill
ps aux | grep node
kill -9 <PID>
```

## Performance Optimization

### 1. Reduce Build Time

**Skip TypeScript checks during build:**

`next.config.js`:
```javascript
module.exports = {
  typescript: {
    ignoreBuildErrors: true, // Only for development
  },
}
```

### 2. Optimize Dependencies

**Use only essential packages:**

Remove unused:
```bash
pnpm remove unused-package
```

### 3. Cache Optimization

**Configure Next.js cache:**

`.env.production`:
```bash
NEXT_TELEMETRY_DISABLED=1
```

## Monitoring

### Health Check Endpoint

The panel automatically includes a health check:

```bash
curl http://localhost:3000/api/health
# {"status": "ok", "uptime": 1234}
```

### Logs

Access logs in Codegen UI:

1. Navigate to agent trace
2. Click "Logs" tab
3. Filter by "web-panel"

### Metrics

Monitor in dashboard:
- Server startup time
- Page load time
- API response times
- Memory usage

## Security Considerations

### Sandbox Isolation

- Panel runs in isolated Codegen sandbox
- No direct internet access
- Controlled environment variables
- Automatic cleanup after session

### No Authentication Required

- Sandbox is already authenticated
- No public access to panel
- Session-scoped URLs
- Automatic expiration

### CORS Configuration

Pre-configured for Codegen proxy:

`next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.CG_PREVIEW_URL || '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ]
}
```

## Advanced Configuration

### Custom Middleware

Add middleware for logging:

`src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('[Codegen] Request:', request.method, request.url)
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### Environment Detection

Detect Codegen environment:

```typescript
export const isCodegenSandbox = Boolean(process.env.CG_PREVIEW_URL)

if (isCodegenSandbox) {
  console.log('Running in Codegen sandbox')
  // Adjust configuration
}
```

## Best Practices

1. **Keep it lightweight** - Minimize dependencies
2. **Fast startup** - Pre-build when possible
3. **Graceful degradation** - Handle missing APIs
4. **Clear logging** - Easy to debug in Codegen UI
5. **Health checks** - Monitor server status

## Support

- **Codegen Docs:** https://docs.codegen.com
- **Cyrus Docs:** See main repository README
- **Issues:** Create GitHub issue with `web-panel` label

---

Last updated: 2025-01-17
