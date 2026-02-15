# 🧰 AuraStrength Setup Scripts

This folder contains automation scripts for project setup and deployment. These scripts help with GitHub, Vercel, and project configuration.

## 📜 Available Scripts

### GitHub Setup
- **`setup-github-complete.sh`** - Complete GitHub setup (milestones, labels, issues)
- **`setup-github.sh`** - Basic GitHub repository setup
- **`setup-github-token.sh`** - GitHub token authentication setup
- **`create-phase2-issues.sh`** - Create Phase 2 issues on GitHub

### Deployment
- **`setup-vercel-env.sh`** - Configure Vercel environment variables
- **`verify-setup.sh`** - Verify project setup and configuration

---

## 🚀 Quick Start

### Setup GitHub Project
```bash
./scripts/setup-github-complete.sh
```

### Setup Vercel Deployment
```bash
./scripts/setup-vercel-env.sh
```

### Verify Everything
```bash
./scripts/verify-setup.sh
```

---

## 📝 Notes

- All scripts are executable (`chmod +x` already applied)
- Scripts use GitHub CLI (`gh`) and Vercel CLI (`vercel`)
- Make sure you're authenticated before running scripts

---

**Tip:** Run `./scripts/verify-setup.sh` to check if all tools are installed and configured correctly.

