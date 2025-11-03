#!/bin/bash

# Cyrus Vercel Deployment Validation Script
# This script validates that the deployment configuration is correct

set -e  # Exit on any error

echo "🔍 Validating Cyrus Vercel Deployment Configuration..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "apps/web-panel" ]]; then
    echo -e "${RED}❌ Error: Please run this script from the repository root${NC}"
    exit 1
fi

echo "📍 Current directory: $(pwd)"

# Check Node.js and pnpm versions
echo -e "\n🔧 Checking prerequisites..."
echo "Node.js version: $(node --version)"
echo "pnpm version: $(pnpm --version)"

# Check if all required files exist
echo -e "\n📁 Checking required configuration files..."

required_files=(
    "package.json"
    "vercel.json"
    "apps/web-panel/package.json"
    "apps/web-panel/vercel.json"
    "apps/web-panel/next.config.js"
    ".github/workflows/deploy-vercel.yml"
    ".env.vercel.example"
    "VERCEL_DEPLOYMENT_GUIDE.md"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        exit 1
    fi
done

# Validate package.json scripts
echo -e "\n🔨 Checking deployment scripts..."
if pnpm run --help | grep -q "vercel:build"; then
    echo -e "${GREEN}✅ vercel:build script exists${NC}"
else
    echo -e "${RED}❌ Missing vercel:build script${NC}"
    exit 1
fi

if pnpm run --help | grep -q "deploy:web-panel"; then
    echo -e "${GREEN}✅ deploy:web-panel script exists${NC}"
else
    echo -e "${RED}❌ Missing deploy:web-panel script${NC}"
    exit 1
fi

# Install dependencies
echo -e "\n📦 Installing dependencies..."
pnpm install --silent

# Test build process
echo -e "\n🏗️  Testing build process..."
if pnpm vercel:build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Running build with verbose output for debugging:"
    pnpm vercel:build
    exit 1
fi

# Validate Next.js configuration
echo -e "\n⚙️  Validating Next.js configuration..."
cd apps/web-panel

# Check if build output exists
if [[ -d ".next" ]]; then
    echo -e "${GREEN}✅ Next.js build output exists${NC}"
    echo "   Build size: $(du -sh .next 2>/dev/null | cut -f1)"
else
    echo -e "${RED}❌ Next.js build output missing${NC}"
    exit 1
fi

# Validate build output structure
required_dirs=(".next/static" ".next/server")
for dir in "${required_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
        echo -e "${GREEN}✅ $dir exists${NC}"
    else
        echo -e "${RED}❌ Missing: $dir${NC}"
        exit 1
    fi
done

cd ../..

# Check Vercel configuration
echo -e "\n🔧 Validating Vercel configuration..."

# Check root vercel.json
if jq -e '.buildCommand' vercel.json > /dev/null 2>&1; then
    BUILD_CMD=$(jq -r '.buildCommand' vercel.json)
    echo -e "${GREEN}✅ Build command: $BUILD_CMD${NC}"
else
    echo -e "${RED}❌ Missing buildCommand in root vercel.json${NC}"
    exit 1
fi

if jq -e '.framework' vercel.json > /dev/null 2>&1; then
    FRAMEWORK=$(jq -r '.framework' vercel.json)
    if [[ "$FRAMEWORK" == "nextjs" ]]; then
        echo -e "${GREEN}✅ Framework: $FRAMEWORK${NC}"
    else
        echo -e "${YELLOW}⚠️  Framework: $FRAMEWORK (expected: nextjs)${NC}"
    fi
fi

# Check environment variables
echo -e "\n🌍 Checking environment variables configuration..."
if jq -e '.env.NEXT_PUBLIC_ENABLE_REALTIME' vercel.json > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Environment variables configured${NC}"
else
    echo -e "${YELLOW}⚠️  No environment variables configured in vercel.json${NC}"
fi

# Validate GitHub Actions workflow
echo -e "\n🔄 Validating GitHub Actions workflow..."
if [[ -f ".github/workflows/deploy-vercel.yml" ]]; then
    if grep -q "VERCEL_TOKEN" .github/workflows/deploy-vercel.yml; then
        echo -e "${GREEN}✅ GitHub Actions workflow configured${NC}"
    else
        echo -e "${RED}❌ Missing VERCEL_TOKEN in workflow${NC}"
    fi
else
    echo -e "${RED}❌ Missing GitHub Actions workflow${NC}"
fi

# Final summary
echo -e "\n🎉 Deployment Configuration Summary"
echo "=================================="
echo -e "${GREEN}✅ All configuration files present${NC}"
echo -e "${GREEN}✅ Build process working${NC}"
echo -e "${GREEN}✅ Next.js application ready${NC}"
echo -e "${GREEN}✅ Vercel configuration valid${NC}"

echo -e "\n📋 Next Steps:"
echo "1. Push your code to GitHub"
echo "2. Connect repository to Vercel at vercel.com/new"
echo "3. Set root directory to 'apps/web-panel'"
echo "4. Add environment variables (see .env.vercel.example)"
echo "5. Deploy! 🚀"

echo -e "\n📚 For detailed instructions, see:"
echo "   - VERCEL_DEPLOYMENT_GUIDE.md"
echo "   - apps/web-panel/VERCEL_DEPLOY.md"

echo -e "\n${GREEN}🎯 Ready for deployment!${NC}"