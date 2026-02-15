#!/bin/bash

# GitHub Personal Access Token Setup Helper
# GitHub requires PAT instead of password for authentication

echo "🔐 GitHub Authentication Setup"
echo "================================"
echo ""
echo "⚠️  IMPORTANT: GitHub no longer accepts passwords!"
echo "   You need a Personal Access Token (PAT) instead."
echo ""

echo "📋 STEP-BY-STEP GUIDE:"
echo ""
echo "STEP 1: Create a Personal Access Token"
echo "---------------------------------------"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "3. Give it a name: 'AuraStrength Development'"
echo "4. Set expiration: 90 days (or 'No expiration' if you prefer)"
echo "5. Select scopes:"
echo "   ☑ repo (all)"
echo "   ☑ workflow"
echo "6. Click 'Generate token' at the bottom"
echo "7. ⚠️  COPY THE TOKEN - You'll only see it once!"
echo ""
echo "Press Enter when you have your token ready..."
read -r

echo ""
echo "STEP 2: Configure Git to Use Your Token"
echo "----------------------------------------"
echo ""

# Check current remote
if git remote get-url origin 2>/dev/null; then
    current_url=$(git remote get-url origin)
    echo "Current remote URL: $current_url"
    echo ""

    # Extract username and repo
    if [[ $current_url =~ github\.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
        username="${BASH_REMATCH[1]}"
        repo="${BASH_REMATCH[2]%.git}"

        echo "Detected:"
        echo "  Username: $username"
        echo "  Repository: $repo"
        echo ""

        read -p "Is this correct? (y/n): " -n 1 -r
        echo ""

        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter your GitHub username: " username
            repo="aura-strength"
        fi
    else
        read -p "Enter your GitHub username: " username
        repo="aura-strength"
    fi
else
    read -p "Enter your GitHub username: " username
    repo="aura-strength"
fi

echo ""
echo "STEP 3: Update Git Remote"
echo "--------------------------"
echo ""
echo "Now paste your Personal Access Token when prompted..."
echo ""
read -sp "Paste your token here: " token
echo ""

if [ -z "$token" ]; then
    echo "❌ Token cannot be empty!"
    exit 1
fi

# Remove existing remote if it exists
if git remote get-url origin 2>/dev/null; then
    git remote remove origin
    echo "✅ Removed old remote"
fi

# Add new remote with token
new_url="https://${username}:${token}@github.com/${username}/${repo}.git"
git remote add origin "$new_url"

if [ $? -eq 0 ]; then
    echo "✅ Remote configured with token authentication!"
else
    echo "❌ Failed to add remote"
    exit 1
fi

echo ""
echo "STEP 4: Test Connection & Push"
echo "--------------------------------"
echo ""
read -p "Ready to push to GitHub? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    git branch -M main
    git push -u origin main

    if [ $? -eq 0 ]; then
        echo ""
        echo "╔════════════════════════════════════════════════════╗"
        echo "║  ✅ SUCCESS! YOUR PROJECT IS NOW ON GITHUB! 🎉    ║"
        echo "╚════════════════════════════════════════════════════╝"
        echo ""
        echo "🌐 Repository URL:"
        echo "   https://github.com/${username}/${repo}"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Visit your repository"
        echo "   2. Add topics (nextjs, typescript, supabase, ai)"
        echo "   3. Deploy to Vercel"
        echo ""
        echo "🔐 Security Note:"
        echo "   Your token is stored in: .git/config"
        echo "   Keep this directory private!"
        echo ""
    else
        echo ""
        echo "❌ Push failed. Common issues:"
        echo ""
        echo "1. Repository doesn't exist on GitHub"
        echo "   → Create it at: https://github.com/new"
        echo ""
        echo "2. Token doesn't have correct permissions"
        echo "   → Needs 'repo' scope"
        echo ""
        echo "3. Wrong username or repository name"
        echo "   → Check: https://github.com/${username}/${repo}"
        echo ""
    fi
else
    echo ""
    echo "📋 Manual push later:"
    echo "   git push -u origin main"
    echo ""
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "Setup complete!"
echo ""
echo "💡 TIP: Use GitHub CLI (gh) for easier authentication:"
echo "   brew install gh"
echo "   gh auth login"
echo "   gh repo create aura-strength --public --source=. --push"

