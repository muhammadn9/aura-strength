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

# 5. ⏱️ WAIT FOR COPILOT REVIEW (2-5 minutes) - NEW MANDATORY STEP
gh pr view <number> --json reviews

# 6. Check Copilot review comments
# - If approved: proceed to merge
# - If comments exist: address them before merging
# - Never skip this step!

# 7. Wait for Vercel preview
gh pr view <number> --json statusCheckRollup

# 8. Merge (only after BOTH reviews pass)
gh pr merge <number> --squash --delete-branch

# 9. Update local main
git checkout main
git pull
```

---

## 🚨 NEW RULE: MANDATORY COPILOT REVIEW WAIT

### Before Every Merge:

1. **Wait 2-5 minutes** for Copilot to complete review
2. **Check review results:**
   ```bash
   gh pr view <number> --json reviews
   ```
3. **Read ALL review comments** - don't skip!
4. **Address critical issues** before merging
5. **Only merge** when:
   - ✅ Copilot review is complete
   - ✅ Vercel preview deployed successfully
   - ✅ No critical issues raised
   - ✅ All blocking comments addressed

### Why This Matters:

- Copilot catches bugs, security issues, best practices
- Reviews often find redundancies or potential user bugs
- Taking 2-5 minutes now saves hours of debugging later
- Better code quality = fewer production issues

### What to Look For in Reviews:

- ❌ **Critical:** Security issues, breaking changes, bugs
- ⚠️ **Important:** Performance issues, code smells, anti-patterns  
- 💡 **Suggestions:** Better approaches, optimizations
- 📝 **Style:** Code formatting, naming conventions

### If Review Has Comments:

```bash
# 1. Read all comments carefully
gh pr view <number> --comments

# 2. Decide if they need addressing:
#    - Critical/Important: MUST fix
#    - Suggestions: Consider fixing
#    - Style: Optional

# 3. If fixing, make changes on same branch
git add -A
git commit -m "fix: address copilot review comments"
git push

# 4. Wait for new review
# 5. Then merge
```

---

## Exception: Critical Hotfixes

Even for critical bugs:
1. Create branch: `fix/critical-bug-name`
2. Make fix
3. Create PR with "URGENT" label
4. **STILL wait for Copilot review** (even if just 2 minutes)
5. Fast-track review but don't skip it
6. Merge through PR

**NO EXCEPTIONS TO PR + REVIEW WORKFLOW**

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

