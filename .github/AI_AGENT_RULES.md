# AI Agent Workflow Rules

## CRITICAL RULE: NEVER PUSH TO MAIN

### Before Making ANY Code Changes:

1. **CHECK CURRENT BRANCH**
   ```bash
   git branch --show-current
   ```
   
2. **IF ON MAIN → CREATE FEATURE BRANCH IMMEDIATELY**
   ```bash
   git checkout -b feat/descriptive-name
   ```

3. **NEVER run `git push` without `origin <branch-name>`**
   - ❌ WRONG: `git push` (pushes to current branch, might be main!)
   - ✅ CORRECT: `git push -u origin feat/branch-name`

### Standard Workflow (ALWAYS):

```bash
# 1. Create branch
git checkout -b feat/issue-number-description

# 2. Make changes, commit
git add -A
git commit -m "feat: description (refs #issue)"

# 3. Push to feature branch
git push -u origin feat/branch-name

# 4. Create PR
gh pr create --title "Title" --body "Closes #issue" --base main

# 5. Wait for reviews (Copilot + Vercel)

# 6. Check reviews
gh pr view <number> --json reviews,statusCheckRollup

# 7. Merge (only after reviews pass)
gh pr merge <number> --squash --delete-branch

# 8. Update local main
git checkout main
git pull
```

### Exception: Critical Hotfixes

Even for critical bugs:
1. Create branch: `fix/critical-bug-name`
2. Make fix
3. Create PR with "URGENT" label
4. Fast-track review
5. Merge through PR

**NO EXCEPTIONS TO PR WORKFLOW**

---

## Pre-Push Checklist (MANDATORY)

Before EVERY `git push` command:

```bash
# Run this first!
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then
  echo "🚨 ERROR: You are on main branch!"
  echo "Create feature branch instead:"
  echo "git checkout -b feat/your-feature-name"
  exit 1
fi
```

---

## AI Agent Rules

When instructed to make code changes:

1. ✅ **ALWAYS check current branch first**
2. ✅ **ALWAYS create feature branch if needed**
3. ✅ **ALWAYS create PR for review**
4. ✅ **ALWAYS wait for CI/CD checks**
5. ❌ **NEVER push directly to main**
6. ❌ **NEVER skip PR process**

---

## Phase 3 Grouped PR Strategy

**PR #1:** feat/phase-3-session-and-logging
- Issues: #26 + #27
- Branch: `feat/phase-3-session-and-logging`

**PR #2:** feat/phase-3-feedback-and-timer
- Issues: #28 + #29
- Branch: `feat/phase-3-feedback-and-timer`

**PR #3:** feat/phase-3-pr-tracking-and-summary
- Issues: #30 + #31
- Branch: `feat/phase-3-pr-tracking-and-summary`

**PR #4:** feat/analytics-integration
- Issue: #32
- Branch: `feat/analytics-integration`

---

**This rule is permanent and cannot be overridden.**

