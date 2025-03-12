#!/bin/bash

# Display a header
echo "=========================================================="
echo "  Cleanly System Admin - Development Server Launcher"
echo "=========================================================="
echo ""

# Navigate to project directory (in case script is run from elsewhere)
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies (this may take a minute)..."
  npm install
else
  echo "✅ Dependencies already installed"
fi

# Ensure no stale lock files
rm -f .vite/

echo "🚀 Starting development server..."
echo ""

# Run with npx to ensure we use the local vite
npx vite

# Exit with the same status as the vite command
exit $? 