#!/bin/bash

# Auto-assign Cyrus to all unassigned issues in Codegen AI Integration project
# Usage: ./scripts/auto-assign-cyrus.sh

PROJECT_ID="dbfb7240-463b-42e0-a074-f42a36b0daff"
CYRUS_ID="fc34aa25-5bbc-4cd0-aa40-5e119e394a21"

# Check if LINEAR_API_TOKEN is set
if [ -z "$LINEAR_API_TOKEN" ]; then
  echo "❌ Error: LINEAR_API_TOKEN environment variable is not set"
  echo "Please set it with: export LINEAR_API_TOKEN=your_token_here"
  exit 1
fi

TOKEN="$LINEAR_API_TOKEN"

echo "🤖 Auto-assigning Cyrus to unassigned issues..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Array of issue IDs
ISSUE_IDS=(
  "1cea0706-948a-488c-b30c-8fd0dd4fd2a9"  # CCB-207
  "6b660c65-c9bb-4e07-8596-331247e0517c"  # CCB-206
  "6bfbee7b-cdf2-4042-879a-4f1a56c94650"  # CCB-205
  "7ea637da-f31e-4b5f-82a1-0e05ad440aa8"  # CCB-204
  "b79ef750-f350-46df-aea4-78e10169033b"  # CCB-203
  "a5ece5bb-1561-4438-8a3a-3da3cd416ebe"  # CCB-202
  "bae91d20-a2f1-4118-ae4c-ea61558c346c"  # CCB-201
  "45199341-1e5d-4bbc-aa7b-aa357591c40d"  # CCB-200
  "7a21c381-adaa-4b56-8f70-71ab2e96c00a"  # CCB-199
  "2dec7559-7c72-4c1b-8b82-fee466ce55dd"  # CCB-198
  "8d93e29d-46e5-45d0-ba0e-3e13a688653f"  # CCB-197
  "313b7edd-eb14-4903-824d-88e78dd6e13a"  # CCB-196
  "88d9e01c-bb65-4f3f-b99f-8db8c8e9a4e6"  # CCB-195
  "c02558e9-09f7-4d71-9b8e-c4b36edc2689"  # CCB-194
  "b31cb4ef-e80b-4e41-be32-3a4e6dbbe237"  # CCB-193
)

SUCCESS=0
FAILED=0

for ISSUE_ID in "${ISSUE_IDS[@]}"; do
  echo -n "Assigning ${ISSUE_ID:0:8}... "

  RESULT=$(curl -s -X POST https://api.linear.app/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: ${TOKEN}" \
    -d "{
      \"query\": \"mutation { issueUpdate(id: \\\"${ISSUE_ID}\\\", input: { assigneeId: \\\"${CYRUS_ID}\\\" }) { success issue { identifier } } }\"
    }")

  if echo "$RESULT" | grep -q "\"success\":true"; then
    IDENTIFIER=$(echo "$RESULT" | grep -o 'CCB-[0-9]*' | head -1)
    echo "✅ ${IDENTIFIER}"
    ((SUCCESS++))
  else
    echo "❌ Failed"
    ((FAILED++))
  fi

  sleep 0.5  # Rate limiting
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results: ${SUCCESS} assigned, ${FAILED} failed"
echo "🎯 Cyrus is now responsible for ${SUCCESS} issues!"
