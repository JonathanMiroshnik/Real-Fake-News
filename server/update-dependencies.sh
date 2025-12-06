#!/bin/bash

# Dependency Update Script for Real-Fake-News Server
# This script updates Phase 1 (safe) dependencies

set -e  # Exit on error

echo "🚀 Starting dependency updates (Phase 1 - Safe Updates)..."
echo ""

cd "$(dirname "$0")"

# Backup package files
echo "📦 Creating backups..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup 2>/dev/null || true

echo "✅ Backups created"
echo ""

# Update production dependencies (Phase 1 - Safe)
echo "📥 Updating production dependencies..."
npm install \
  axios@^1.13.2 \
  better-sqlite3@^12.5.0 \
  express@^5.2.1 \
  fs-extra@^11.3.2 \
  jsonwebtoken@^9.0.3 \
  luxon@^3.7.2 \
  morgan@^1.10.1 \
  @runware/sdk-js@^1.2.2 \
  --legacy-peer-deps

echo ""
echo "📥 Updating dev dependencies..."
npm install -D \
  @types/cors@^2.8.19 \
  @types/express@^5.0.6 \
  @types/jsonwebtoken@^9.0.10 \
  @types/luxon@^3.7.1 \
  @types/morgan@^1.9.10 \
  @types/node@^22.19.1 \
  nodemon@^3.1.11 \
  tsx@^4.21.0 \
  typescript@^5.9.3 \
  --legacy-peer-deps

echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Phase 1 updates complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test your application: npm start"
echo "   2. Run tests if available"
echo "   3. Review DEPENDENCY_UPDATE_PLAN.md for Phase 2 (major updates)"
echo ""
echo "💡 To restore backups if needed:"
echo "   cp package.json.backup package.json"
echo "   cp package-lock.json.backup package-lock.json"
echo "   npm install --legacy-peer-deps"

