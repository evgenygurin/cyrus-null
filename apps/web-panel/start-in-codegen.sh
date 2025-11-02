#!/bin/bash
set -e

echo "🚀 Starting Cyrus Web Panel for Codegen Sandbox..."

# Navigate to web-panel directory
cd "$(dirname "$0")"

# Check if running in Codegen sandbox
if [ -n "$CG_PREVIEW_URL" ]; then
  echo "✅ Detected Codegen sandbox environment"
  echo "📡 Preview URL: $CG_PREVIEW_URL"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install --frozen-lockfile --prefer-offline
else
  echo "✅ Dependencies already installed"
fi

# Check if production build exists
if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
  echo "🏗️  Using existing production build"
  echo "✨ Starting production server on port 3000..."
  pnpm start
else
  echo "🔥 Starting development server on port 3000..."
  pnpm dev
fi
