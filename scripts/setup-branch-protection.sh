#!/bin/bash

# Branch Protection Setup Script
# This script configures GitHub branch protection rules for the Cyrus project

set -e

REPO="evgenygurin/cyrus-null"
GH_TOKEN="${GITHUB_TOKEN:-}"

if [ -z "$GH_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN environment variable is required"
    echo "Please set your GitHub token: export GITHUB_TOKEN=your_token_here"
    exit 1
fi

echo "🔒 Setting up branch protection rules for $REPO"

# Function to setup branch protection
setup_branch_protection() {
    local branch=$1
    local required_reviews=$2
    local dismiss_stale=$3
    local require_code_owner=$4
    local admin_enforcement=$5
    
    echo "Setting up protection for branch: $branch"
    
    gh api \
        --method PUT \
        "/repos/$REPO/branches/$branch/protection" \
        --field required_status_checks='{"strict":true,"contexts":["test"]}' \
        --field enforce_admins=$admin_enforcement \
        --field required_pull_request_reviews="{\"required_approving_review_count\":$required_reviews,\"dismiss_stale_reviews\":$dismiss_stale,\"require_code_owner_reviews\":$require_code_owner}" \
        --field restrictions='{"users":[],"teams":[]}' \
        > /dev/null
    
    echo "✅ Branch protection configured for $branch"
}

# Setup main branch (development)
echo "📝 Configuring main branch protection..."
setup_branch_protection "main" 1 true false false

# Setup stage branch (staging)
echo "🧪 Configuring stage branch protection..."
setup_branch_protection "stage" 2 true false false

# Setup prod branch (production)
echo "🚀 Configuring prod branch protection..."
setup_branch_protection "prod" 2 true true true

echo ""
echo "✅ All branch protection rules have been configured!"
echo ""
echo "Branch protection summary:"
echo "• main: 1 required reviewer, dismiss stale reviews"
echo "• stage: 2 required reviewers, dismiss stale reviews"
echo "• prod: 2 required reviewers, code owner review required, admin enforcement"
echo ""
echo "🎉 Branch protection setup complete!"