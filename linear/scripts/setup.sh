#!/bin/bash

set -e

echo "🚀 Setting up Linear plugin..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js found: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm or Node.js"
    exit 1
fi

echo "✅ npm found: $(npm -v)"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

# Install @linear/sdk locally in the plugin directory
echo ""
echo "📦 Installing @linear/sdk..."
cd "$PLUGIN_DIR"

if [ -f "package.json" ]; then
    npm install
else
    npm init -y > /dev/null 2>&1
    npm install @linear/sdk
fi

echo "✅ @linear/sdk installed"

# Check if LINEAR_API_KEY is set
echo ""
if [ -z "$LINEAR_API_KEY" ]; then
    echo "⚠️  LINEAR_API_KEY environment variable is not set"
    echo "    Set it with: export LINEAR_API_KEY='lin_api_...'"
    echo "    Get your API key from: https://linear.app/settings/api"
    exit 1
fi

echo "✅ LINEAR_API_KEY is set"

# Test the API connection
echo ""
echo "🔗 Testing Linear API connection..."
if node "$SCRIPT_DIR/linear.js" me > /dev/null 2>&1; then
    echo "✅ API connection successful!"
    USER=$(node "$SCRIPT_DIR/linear.js" me --pretty 2>&1 | grep '"name"' | head -1 || echo "")
    echo "   Connected as: $USER"
else
    echo "❌ API connection failed. Check your LINEAR_API_KEY"
    exit 1
fi

echo ""
echo "✨ Setup complete! Linear plugin is ready to use."
echo ""
echo "Quick start:"
echo "  node linear.js me              # Show current user"
echo "  node linear.js issues          # List your issues"
echo "  node linear.js teams           # List teams"
echo ""
