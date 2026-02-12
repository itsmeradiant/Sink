#!/bin/bash

# Analytics Debug Test Script
# This script tests the analytics endpoints and debug functionality

# Configuration
BASE_URL="https://d.encryptedge.in"
AUTH_TOKEN="bRWVZSHSEizaH3k6"

echo "Testing Analytics Endpoints"
echo "============================"
echo ""

# Test 1: Debug endpoint
echo "Testing /api/debug endpoint..."
echo "Command: curl \"${BASE_URL}/api/debug\" -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""
curl "${BASE_URL}/api/debug" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -s | jq '.' || echo "Failed or returned non-JSON"
echo ""
echo "---"
echo ""

# Test 2: Stats views with proper timestamps
NOW=$(date +%s)
WEEK_AGO=$((NOW - 604800))  # 7 days ago

echo "Testing /api/stats/views endpoint..."
echo "Time range: Last 7 days"
echo "Command: curl \"${BASE_URL}/api/stats/views?unit=day&clientTimezone=UTC&startAt=${WEEK_AGO}&endAt=${NOW}\" -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""
curl "${BASE_URL}/api/stats/views?unit=day&clientTimezone=UTC&startAt=${WEEK_AGO}&endAt=${NOW}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -s | jq '.' || echo "Failed or returned non-JSON"
echo ""
echo "---"
echo ""

# Test 3: Stats counters
echo "Testing /api/stats/counters endpoint..."
echo "Command: curl \"${BASE_URL}/api/stats/counters?startAt=${WEEK_AGO}&endAt=${NOW}\" -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""
curl "${BASE_URL}/api/stats/counters?startAt=${WEEK_AGO}&endAt=${NOW}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -s | jq '.' || echo "Failed or returned non-JSON"
echo ""
echo "---"
echo ""

echo "Tests complete!"
echo ""
echo "Next steps:"
echo "   1. Deploy: CLOUDFLARE_ACCOUNT_ID=3a4960d702fd37a7c328a3870550af97 pnpm deploy:worker"
echo "   2. Visit some short links to generate data"
echo "   3. Wait 1-2 minutes for data to propagate"
echo "   4. Run this script again to see results"
