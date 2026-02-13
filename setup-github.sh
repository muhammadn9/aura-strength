#!/bin/bash

# AuraStrength GitHub Setup Script
# Quick helper to set up your GitHub repository

echo "🚀 AuraStrength GitHub Setup Helper"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository!"
    echo "   Run this script from /Users/muhammadnaseem/IdeaProjects/aura-strength"
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check if remote already exists
if git remote -v | grep -q "origin"; then
    echo "ℹ️  Remote 'origin' already exists:"
    git remote -v
    echo ""
    read -p "Do you want to remove it and add a new one? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo "✅ Removed existing remote"
    else
        echo "Keeping existing remote. Exiting."
        exit 0
    fi
fi

# Get GitHub username
echo ""
echo "📝 GitHub Setup"
echo "---------------"
read -p "Enter your GitHub username: " username

if [ -z "$username" ]; then
    echo "❌ Username cannot be empty!"
    exit 1
fi

# Construct repository URL
repo_url="https://github.com/$username/aura-strength.git"

echo ""
echo "📋 Summary:"
echo "   Username: $username"
echo "   Repository: aura-strength"
echo "   URL: $repo_url"
echo ""

read -p "Is this correct? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Add remote
echo ""
echo "🔗 Adding remote..."
git remote add origin "$repo_url"

if [ $? -eq 0 ]; then
    echo "✅ Remote added successfully!"
else
    echo "❌ Failed to add remote"
    exit 1
fi

# Show current status
echo ""
echo "📊 Current status:"
git remote -v
echo ""
git status
echo ""

# Ask if user wants to push
echo "⚠️  IMPORTANT: Make sure you've created the repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Name: aura-strength"
echo "   Don't add README, .gitignore, or license (we already have them)"
echo ""

read -p "Have you created the repository on GitHub? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    git branch -M main
    git push -u origin main

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESS! Your repository is now on GitHub!"
        echo ""
        echo "🎉 Repository URL:"
        echo "   https://github.com/$username/aura-strength"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Add topics to your repository (nextjs, typescript, supabase, ai)"
        echo "   2. Deploy to Vercel: vercel"
        echo "   3. Share your project!"
        echo ""
    else
        echo ""
        echo "❌ Push failed. Common issues:"
        echo "   - Repository doesn't exist on GitHub"
        echo "   - Authentication required (use personal access token)"
        echo "   - Branch protection rules"
        echo ""
        echo "Try manually:"
        echo "   git push -u origin main"
    fi
else
    echo ""
    echo "📋 Manual push instructions:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Create repository named: aura-strength"
    echo "3. Don't add README, .gitignore, or license"
    echo "4. Then run:"
    echo "   git push -u origin main"
    echo ""
fi

echo ""
echo "===================================="
echo "Setup script complete!"

