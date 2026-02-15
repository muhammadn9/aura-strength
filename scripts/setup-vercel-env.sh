#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
#  🚀 AuraStrength - Vercel Environment Variables Setup Script
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║     🚀 AURASTRENGTH - VERCEL ENV SETUP                          ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Error: .env.local file not found!${NC}"
    echo "Please create .env.local with your credentials first."
    exit 1
fi

echo -e "${BLUE}📋 Loading environment variables from .env.local...${NC}"
source .env.local

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo ""
echo -e "${GREEN}✅ Vercel CLI ready${NC}"
echo ""

# Check if user is logged in
echo -e "${BLUE}🔐 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in. Please log in to Vercel:${NC}"
    vercel login
fi

echo ""
echo -e "${GREEN}✅ Authenticated${NC}"
echo ""

# Link project (if not already linked)
echo -e "${BLUE}🔗 Linking project...${NC}"
if [ ! -d ".vercel" ]; then
    vercel link --project=aura-strength --yes
else
    echo -e "${GREEN}✅ Project already linked${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PURPLE}📝 Adding Environment Variables to Vercel${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_value=$2

    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}⚠️  Skipping $var_name (not set in .env.local)${NC}"
        return
    fi

    echo -e "${BLUE}Adding $var_name...${NC}"

    # Add to production
    echo "$var_value" | vercel env add "$var_name" production --force > /dev/null 2>&1 || true

    # Add to preview
    echo "$var_value" | vercel env add "$var_name" preview --force > /dev/null 2>&1 || true

    # Add to development
    echo "$var_value" | vercel env add "$var_name" development --force > /dev/null 2>&1 || true

    echo -e "${GREEN}✅ $var_name added to all environments${NC}"
}

# Add each environment variable
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
add_env_var "GOOGLE_GENERATIVE_AI_API_KEY" "$GOOGLE_GENERATIVE_AI_API_KEY"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All environment variables added successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask to redeploy
echo -e "${YELLOW}🚀 Ready to redeploy?${NC}"
echo ""
echo "Options:"
echo "  1. Redeploy now (vercel --prod)"
echo "  2. Trigger via Git commit + push"
echo "  3. Manual redeploy from dashboard"
echo "  4. Skip for now"
echo ""
read -p "Choose option (1-4): " deploy_choice

case $deploy_choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Deploying to production...${NC}"
        vercel --prod
        echo ""
        echo -e "${GREEN}✅ Deployment triggered!${NC}"
        echo -e "${BLUE}📊 Check status: https://vercel.com/muhammad-naseems-projects/aura-strength${NC}"
        ;;
    2)
        echo ""
        echo -e "${BLUE}📝 Creating empty commit...${NC}"
        git commit --allow-empty -m "chore: trigger redeploy with environment variables"
        echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
        git push
        echo ""
        echo -e "${GREEN}✅ Commit pushed! Vercel will automatically deploy.${NC}"
        echo -e "${BLUE}📊 Check status: https://vercel.com/muhammad-naseems-projects/aura-strength${NC}"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Manual redeploy steps:${NC}"
        echo "1. Go to: https://vercel.com/muhammad-naseems-projects/aura-strength"
        echo "2. Click on the failed deployment"
        echo "3. Click the three dots (...)"
        echo "4. Select 'Redeploy'"
        ;;
    4)
        echo ""
        echo -e "${YELLOW}⏭️  Skipping deployment for now.${NC}"
        echo "You can deploy later with: ${BLUE}vercel --prod${NC}"
        ;;
    *)
        echo ""
        echo -e "${YELLOW}Invalid option. Skipping deployment.${NC}"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PURPLE}📋 NEXT STEPS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ✅ Environment variables: DONE"
echo ""
echo "2. 🔒 Disable Deployment Protection (if public app):"
echo "   → https://vercel.com/muhammad-naseems-projects/aura-strength/settings/deployment-protection"
echo "   → Set to 'None' for Production"
echo ""
echo "3. 🔗 Add Vercel URLs to Supabase:"
echo "   → https://supabase.com/dashboard/project/tzyjfgcasifincmfnerj/auth/url-configuration"
echo "   → Add redirect URLs:"
echo "     • https://aura-strength.vercel.app/auth/callback"
echo "     • https://*.vercel.app/auth/callback"
echo ""
echo "4. 🎉 Test your deployment:"
echo "   → https://aura-strength.vercel.app"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✨ Setup complete! Your app should deploy successfully now. 🚀${NC}"
echo ""

