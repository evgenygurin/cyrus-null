# Cyrus Monorepo - Vercel Deployment Guide

This guide provides comprehensive instructions for deploying the Cyrus project to Vercel, including both manual and automated deployment methods.

## 🚀 Quick Start

The fastest way to deploy:

1. **Fork/Clone** this repository to your GitHub account
2. **Connect** to Vercel via [vercel.com/new](https://vercel.com/new)
3. **Configure** root directory as `apps/web-panel`
4. **Deploy** 🎉

## 📋 Prerequisites

- ✅ Vercel account ([sign up free](https://vercel.com))
- ✅ Repository on GitHub/GitLab/Bitbucket
- ✅ Node.js 20+ and pnpm installed locally (for CLI deployments)

## 🏗️ Architecture Overview

```
cyrus/
├── apps/
│   ├── web-panel/          # Next.js dashboard (→ Vercel)
│   ├── proxy-worker/       # Cloudflare Workers (→ CF Workers)
│   └── cli/                # Node.js CLI (→ npm/local)
├── packages/               # Shared libraries
└── vercel.json            # Root-level Vercel config
```

**What gets deployed to Vercel:**
- 🎯 **Primary**: `apps/web-panel` - The web dashboard
- 🔧 **Build Dependencies**: All `packages/*` are built as dependencies

## 🎯 Method 1: Vercel Dashboard (Recommended)

### Step 1: Import Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your Cyrus repository
4. Authorize Vercel access

### Step 2: Configure Project

**Framework Preset:** `Next.js` ✅

**Root Directory:** 
- Click **"Edit"** next to Root Directory  
- Enter: `apps/web-panel`
- This tells Vercel where the Next.js app lives in the monorepo

**Build Settings** (auto-detected):
```bash
Build Command: pnpm build
Output Directory: .next  
Install Command: pnpm install
```

### Step 3: Environment Variables

In Vercel dashboard, add these variables:

**Required:**
```bash
# Already set in vercel.json:
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_POLL_INTERVAL=5000
```

**Optional (for API integration):**
```bash
API_URL=https://your-cyrus-api.com
CYRUS_API_KEY=your_api_key_here
```

### Step 4: Deploy

1. Click **"Deploy"** 
2. Wait ~2-3 minutes for build
3. Get your URL: `https://your-project.vercel.app`

✅ **Success!** Your dashboard is now live.

## 🔧 Method 2: Vercel CLI

### Install & Login

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account  
vercel login
```

### Deploy from Web Panel Directory

```bash
# Navigate to the web panel
cd apps/web-panel

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Deploy from Repository Root

```bash
# Deploy web panel from root with custom commands
pnpm deploy:web-panel        # Preview deployment
pnpm deploy:web-panel:prod   # Production deployment
```

The CLI automatically:
- ✅ Detects Next.js framework
- ✅ Uses `vercel.json` configuration  
- ✅ Builds with pnpm in monorepo context
- ✅ Deploys to unique URL

## 🤖 Method 3: GitHub Actions (Automated)

### Setup Repository Secrets

In your GitHub repo: **Settings** → **Secrets and Variables** → **Actions**

Add these secrets:

```bash
VERCEL_TOKEN=your_vercel_token_here         # From vercel.com/account/tokens
VERCEL_ORG_ID=your_org_id_here             # From project settings  
VERCEL_PROJECT_ID=your_project_id_here     # From project settings
```

### Workflow Triggers

The GitHub Action (`.github/workflows/deploy-vercel.yml`) automatically runs on:

**Production Deployments:**
- ✅ Push to `main`, `prod`, or `stage` branches
- ✅ Changes in `apps/web-panel/`, `packages/`, or config files

**Preview Deployments:**  
- ✅ Pull requests targeting main branches
- ✅ Automatic PR comments with preview URL

**Features:**
- 🧪 Runs tests before deployment
- 🔍 Type checking with TypeScript  
- ⚡ Performance monitoring with Lighthouse
- 💬 Automatic PR preview links

## ⚙️ Configuration Files

### Root Level (`vercel.json`)

```json
{
  "monorepo": true,
  "projects": [{
    "name": "cyrus-web-panel", 
    "source": "apps/web-panel",
    "framework": "nextjs",
    "buildCommand": "cd ../.. && pnpm build --filter=@cyrus/web-panel"
  }]
}
```

### Web Panel (`apps/web-panel/vercel.json`)

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build", 
  "installCommand": "pnpm install",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "prod": true, 
      "stage": true
    }
  }
}
```

### Next.js Config (`apps/web-panel/next.config.js`)

```javascript
{
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"]
  },
  env: {
    PREVIEW_URL: process.env.VERCEL_URL || "localhost:3000"
  }
}
```

## 🔍 Deployment Verification

After deployment, verify these features work:

### Dashboard Features
- ✅ Stats cards display data
- ✅ Session cards load correctly  
- ✅ Activity feed shows entries
- ✅ Real-time updates (if enabled)
- ✅ Responsive design on mobile

### Performance Checks
- ✅ Page load time < 2s
- ✅ Lighthouse score > 90
- ✅ No JavaScript errors in console
- ✅ Images load properly

### Test Commands

```bash
# Test locally before deploying
pnpm build --filter=@cyrus/web-panel
pnpm test:packages:run
pnpm typecheck --filter=@cyrus/web-panel
```

## 🌟 Advanced Features

### Custom Domains

1. **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Add your custom domain  
3. Configure DNS records as instructed
4. SSL automatically provisioned

### Preview Deployments

Every pull request gets a unique preview URL:
- 🔗 `https://cyrus-git-feature-branch.vercel.app`
- 💬 Automatic GitHub PR comments with links
- 🧹 Auto-cleanup when PR is merged

### Environment Variables per Environment

```bash
# Production
NEXT_PUBLIC_API_URL=https://api.cyrus.com

# Preview  
NEXT_PUBLIC_API_URL=https://staging-api.cyrus.com

# Development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Performance Monitoring

The deployment includes:
- 📊 **Lighthouse CI** - Performance budgets
- 📈 **Vercel Analytics** - Real user metrics  
- 🔍 **Bundle Analysis** - Size optimization

## 🚨 Troubleshooting

### Build Failures

**Issue:** `pnpm: command not found`
```json
// Add to package.json
{
  "packageManager": "pnpm@10.13.1"
}
```

**Issue:** Module resolution errors
```bash
# Ensure workspace dependencies are declared
pnpm install
pnpm build --filter=@cyrus/web-panel
```

### Runtime Issues

**Issue:** Environment variables not working
- ✅ Check variable names start with `NEXT_PUBLIC_` for client-side
- ✅ Verify variables are set in Vercel dashboard  
- ✅ Redeploy after adding variables

**Issue:** API connection failing  
- ✅ Check CORS settings on your API
- ✅ Verify `API_URL` environment variable
- ✅ Test API endpoints directly

### Performance Issues

**Issue:** Slow page loads
```bash
# Analyze bundle size
pnpm build --filter=@cyrus/web-panel
npx @next/bundle-analyzer

# Check Vercel Function Logs
vercel logs your-deployment-url
```

## 📊 Monitoring & Analytics

### Vercel Analytics

```bash
# Add to environment variables
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Error Tracking

Consider integrating:
- 🐛 **Sentry** - Error monitoring
- 📊 **PostHog** - User analytics  
- 🔍 **LogRocket** - Session replay

## 💰 Cost Estimation

**Vercel Free Tier** includes:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments  
- ✅ Automatic HTTPS & CDN
- ✅ Serverless Functions (100GB-hrs)

**Typical Usage:**
- 📱 Web Panel: ~1-5 GB/month
- ⚡ Functions: Minimal usage  
- 💰 **Cost: FREE** for most use cases

## 🔗 Multiple App Deployment

To deploy other apps from the monorepo:

### Proxy Worker (Cloudflare Workers)
```bash
cd apps/proxy-worker
pnpm deploy  # Deploys to Cloudflare Workers
```

### CLI (npm Package)
```bash
cd apps/cli  
pnpm publish  # Publishes to npm registry
```

## 🛠️ Development Workflow

### Local Development
```bash
# Start all apps in development mode
pnpm dev

# Start only web panel  
cd apps/web-panel && pnpm dev
```

### Testing
```bash
# Run all tests
pnpm test

# Test only packages
pnpm test:packages:run
```

### Production Build
```bash
# Build everything
pnpm build

# Build only web panel
pnpm build --filter=@cyrus/web-panel
```

## 🔄 Continuous Deployment

### Branch Strategy

- **`main`** → Production deployment
- **`stage`** → Staging environment  
- **`feature/*`** → Preview deployments
- **Pull Requests** → Automatic previews

### Release Process

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Creates preview deployment
   ```

2. **Testing & Review**  
   - ✅ Automatic preview URL in PR
   - ✅ Lighthouse performance check
   - ✅ Code review process

3. **Production Deployment**
   ```bash
   git checkout main
   git merge feature/new-feature  
   git push origin main
   # Triggers production deployment
   ```

## 📚 Resources

- 📖 [Vercel Documentation](https://vercel.com/docs)
- 🚀 [Next.js Deployment Guide](https://nextjs.org/docs/deployment)  
- 🔧 [Vercel CLI Reference](https://vercel.com/docs/cli)
- 🎯 [Monorepo Deployment](https://vercel.com/docs/concepts/monorepos)
- 🔐 [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/ceedaragents/cyrus/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ceedaragents/cyrus/discussions)  
- 📧 **Email**: support@cyrus.dev
- 🐦 **Twitter**: [@CyrusAI](https://twitter.com/cyrusai)

---

**🎉 Ready to deploy?** Start with Method 1 (Vercel Dashboard) for the easiest setup!