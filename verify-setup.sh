#!/bin/bash

# AuraStrength Quick Start Script
# This script helps you verify your setup

echo "🚀 AuraStrength Setup Verification"
echo "=================================="
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo "   Node.js: $node_version"
if [[ "$node_version" < "v18" ]]; then
    echo "   ⚠️  Warning: Node.js 18+ is recommended"
else
    echo "   ✅ Node.js version OK"
fi
echo ""

# Check if .env.local exists
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local found"

    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "   ✅ Supabase URL configured"
    else
        echo "   ❌ Missing NEXT_PUBLIC_SUPABASE_URL"
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "   ✅ Supabase Anon Key configured"
    else
        echo "   ❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
    fi

    if grep -q "GOOGLE_GENERATIVE_AI_API_KEY" .env.local; then
        echo "   ✅ Gemini API Key configured"
    else
        echo "   ⚠️  Missing GOOGLE_GENERATIVE_AI_API_KEY (needed for Phase 2)"
    fi
else
    echo "   ❌ .env.local not found!"
    echo "   Create it with your Supabase credentials"
fi
echo ""

# Check if dependencies are installed
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ❌ node_modules not found. Run: npm install"
fi
echo ""

# Database setup check
echo "🗄️  Database Setup"
echo "   Have you run supabase_schema.sql in Supabase SQL Editor?"
echo "   [ ] Yes"
echo "   [ ] No - Go to: https://tzyjfgcasifincmfnerj.supabase.co"
echo ""

# OAuth configuration
echo "🔑 OAuth Configuration"
echo "   Have you configured OAuth providers in Supabase?"
echo "   Google: [ ]"
echo "   Apple:  [ ]"
echo "   (Optional - you can use email auth for testing)"
echo ""

# Final instructions
echo "✨ Next Steps:"
echo "   1. If database not set up: Run supabase_schema.sql in Supabase"
echo "   2. Start dev server: npm run dev"
echo "   3. Open: http://localhost:3000"
echo "   4. Sign up and complete profile setup"
echo ""
echo "📖 Documentation:"
echo "   - SETUP_GUIDE.md - Detailed setup instructions"
echo "   - PROJECT_ANALYSIS.md - Full roadmap"
echo "   - README.md - Quick reference"
echo ""
echo "=================================="

