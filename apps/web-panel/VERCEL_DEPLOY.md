# Deploying Cyrus Web Panel to Vercel

This guide explains how to deploy the Cyrus Web Control Panel to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your repository pushed to GitHub, GitLab, or Bitbucket
- Git repository with the `apps/web-panel` directory

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Connect Your Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository containing the Cyrus project
4. Authorize Vercel to access your repository

### Step 2: Configure Project Settings

When importing, configure the following:

**Framework Preset:** Next.js

**Root Directory:** `apps/web-panel`
- Click "Edit" next to Root Directory
- Enter `apps/web-panel`
- This tells Vercel where to find the Next.js application

**Build & Development Settings:**
- Build Command: `cd ../.. && pnpm install && cd apps/web-panel && pnpm build`
- Output Directory: `.next` (auto-detected)
- Install Command: `cd ../.. && pnpm install`
- Node.js Version: `20.x` (recommended)

**IMPORTANT for Monorepo:**
The build and install commands need to navigate to the root directory to install all workspace dependencies before building the web-panel. This ensures all internal package dependencies are available.

### Step 3: Configure Environment Variables

Add the following environment variables in the Vercel dashboard:

**Optional Variables:**
```
API_URL=https://your-cyrus-api.com  # If connecting to Cyrus CLI API
CYRUS_API_KEY=your_api_key          # If API requires authentication
```

**Public Variables (already set in vercel.json):**
```
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_POLL_INTERVAL=5000
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy from Project Directory

```bash
cd /path/to/cyrus/apps/web-panel
vercel
```

For production deployment:

```bash
vercel --prod
```

The CLI will:
1. Detect Next.js automatically
2. Upload your code
3. Build the project
4. Deploy to a unique URL

## Method 3: Deploy via GitHub Actions

Create `.github/workflows/deploy-web-panel.yml`:

```yaml
name: Deploy Web Panel to Vercel

on:
  push:
    branches: [main, prod, stage]
    paths:
      - 'apps/web-panel/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: apps/web-panel
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: apps/web-panel
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: apps/web-panel
```

Add `VERCEL_TOKEN` to your GitHub repository secrets.

## Vercel Configuration Explained

The `vercel.json` file configures:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "prod": true,
      "stage": true
    }
  }
}
```

- **buildCommand**: Builds the Next.js app
- **installCommand**: Installs dependencies with pnpm
- **framework**: Tells Vercel this is a Next.js project
- **git.deploymentEnabled**: Auto-deploy on push to main, prod, or stage branches

## Post-Deployment

### Verify Deployment

1. Visit your Vercel deployment URL
2. Check that the dashboard loads correctly
3. Verify stats cards display mock data
4. Test session cards and activity feed

### Configure API Connection (Optional)

If you want to connect to a real Cyrus CLI instance:

1. Deploy your Cyrus CLI API
2. Set `API_URL` environment variable in Vercel
3. Add API key if required
4. Redeploy

### Monitor Performance

- View deployment logs in Vercel dashboard
- Check analytics and performance metrics
- Monitor function execution times

## Troubleshooting

### Build Fails

**Issue**: `pnpm: command not found`
**Solution**: Vercel should auto-detect pnpm from the `packageManager` field in `package.json`. Ensure both root and web-panel `package.json` files have:
```json
{
  "packageManager": "pnpm@10.13.1"
}
```
The versions must match between root and apps/web-panel to avoid dependency resolution issues.

**Issue**: Module not found errors
**Solution**: Ensure all dependencies are in `package.json` and run `pnpm install` locally first

### Runtime Errors

**Issue**: Environment variables not working
**Solution**: Check that variables are set in Vercel dashboard and start with `NEXT_PUBLIC_` for client-side access

**Issue**: API connection failing
**Solution**: Verify CORS settings on your API and check `API_URL` environment variable

### Performance Issues

**Issue**: Slow page loads
**Solution**: 
- Enable Next.js Image Optimization
- Check bundle size with `pnpm build`
- Use Vercel Analytics to identify bottlenecks

## Automatic Deployments

Vercel automatically deploys:

- **Production**: Pushes to `main`, `prod`, or `stage` branches
- **Preview**: Pull requests and other branches
- **Rollback**: Previous deployments available in dashboard

Each deployment gets a unique URL for testing.

## Cost

The Cyrus Web Panel fits comfortably within Vercel's **Free Tier**:

- ✅ 100 GB bandwidth
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ CDN
- ✅ Serverless functions

## Next Steps

1. ✅ Deploy to Vercel
2. Configure custom domain (optional)
3. Set up monitoring and alerts
4. Connect to Cyrus CLI API (optional)
5. Enable analytics

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Need help?** Check the [Cyrus documentation](../../README.md) or open an issue on GitHub.
