#!/usr/bin/env bash

# Setup script for Node.js Backend App using Bun
# This script sets up the project using Bun instead of npm

echo "🚀 Setting up Node.js Backend App with Bun"
echo "=========================================="

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    echo "   or visit: https://bun.sh"
    exit 1
fi

echo "✅ Bun detected: $(bun --version)"

# Install dependencies using Bun
echo ""
echo "📦 Installing dependencies with Bun..."
bun install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📋 Copying .env.example to .env..."
        cp .env.example .env
        echo "⚠️  Please update .env with your specific configuration values"
    else
        echo "⚠️  No .env file found. Please create one with the following variables:"
        echo "   JWT_SECRET=your-secret-key"
        echo "   DATABASE_URI=mongodb://localhost:27017/your-database"
        echo "   PORT=3000"
    fi
else
    echo "✅ .env file already exists"
fi

# Make shell scripts executable
echo ""
echo "🔧 Making test scripts executable..."
chmod +x *.sh
echo "✅ Test scripts are now executable"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   bun run dev"
echo ""
echo "🧪 To run tests:"
echo "   ./test_auth.sh"
echo "   ./test_enhanced_auth.sh"
echo "   ./test_refresh_rotation.sh"
echo ""
echo "📋 Make sure to:"
echo "   1. Update your .env file with correct values"
echo "   2. Start your MongoDB server"
echo "   3. Review the README.md for detailed setup instructions"
