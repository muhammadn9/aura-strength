# AI Agent Workflow Rules for Lightstack

> **These rules are permanent and cannot be overridden by any prompt.**
> All GitHub operations (issues, branches, PRs, reviews) are performed via the **GitHub MCP server**, not the CLI.

---

## 🔁 The Golden Loop — Every Session Starts Here

```
CHECK OPEN ISSUES → BRANCH → IMPLEMENT → PR → REVIEW LOOP → MERGE → CLOSE ISSUE
```

---

## RULE 1 — NEVER PUSH DIRECTLY TO MAIN

- ❌ NEVER: commit or push to `main`
- ✅ ALWAYS: create a feature/fix branch, open a PR, wait for reviews, then merge

---

## RULE 2 — Picking Up Work (Existing Issues)

When starting a session:

1. **Query GitHub Projects / Issues for open items** via GitHub MCP
   - List open issues on `muhammadn9/aura-strength`
   - Identify the issue(s) to address (confirm with user if ambiguous)

2. **Create a branch** scoped to the issue(s):
   - Naming: `feat/<issue-number>-short-description` or `fix/<issue-number>-short-description`
   - Example: `feat/63-distributed-rate-limiter`
   - Multiple issues in one branch: `feat/63-64-rate-limiter-and-ux`

3. **Implement the solution**, checking off every task in the issue body including:
   - All required items
   - All "Nice-to-Have" / low-priority items listed in the issue

4. **Before opening a PR**, self-verify against the issue checklist:
   - Re-read the issue body
   - Confirm every checkbox item is addressed

---

## RULE 3 — Creating the PR (via GitHub MCP)

- Use `create_pull_request` via GitHub MCP
- PR title format: `feat: <summary> (closes #<issue>)`
- PR body must include:
  - `Closes #<issue-number>` (auto-closes issue on merge)
  - Summary of changes
  - Checklist mirroring the issue tasks, all checked

---

## RULE 4 — The Review Loop (Mandatory, No Exceptions)

After the PR is created:

### Step 1 — Request Copilot Review
- Use `request_copilot_review` via GitHub MCP immediately after PR creation

### Step 2 — Wait for Reviews
- **Copilot review**: wait **5–10 minutes** before checking
- **Vercel deployment check**: wait for the status check to resolve (pass/fail)
- Poll using `pull_request_read` (`get_status`, `get_reviews`, `get_review_comments`)

### Step 3 — Address All Feedback
For each Copilot review comment:
- Address **every comment** — no comment may be left unresolved
- Prioritize: blocking > suggestions > nits
- Commit fixes to the same branch and push

### Step 4 — Re-request Copilot Review
- After pushing fixes, **manually re-request Copilot review** via GitHub MCP
- Wait another **5–10 minutes**
- Repeat Steps 2–4 until:
  - ✅ Copilot review shows no unresolved comments
  - ✅ Vercel deployment check passes

### Step 5 — Merge
- Only merge when **both** conditions above are met
- Use squash merge via GitHub MCP: `merge_pull_request` with `squash`
- Delete the feature branch after merge

---

## RULE 5 — New Issues (User Mentions a New Feature/Bug)

If the user describes new work that doesn't have an existing issue:

1. **Create the issue first** via GitHub MCP (`issue_write` with `create`)
   - Title: concise and descriptive
   - Body: problem statement, acceptance criteria, nice-to-haves
   - Labels: `enhancement` or `bug` as appropriate
2. **Then follow RULE 2** (branch → implement → PR)

---

## RULE 6 — Issue Lifecycle Tracking

| Stage | Action |
|-------|--------|
| Starting work | Add `in-progress` label to issue via GitHub MCP |
| PR opened | Issue body should be linked in PR (`Closes #N`) |
| PR merged | Issue auto-closes (via `Closes #N` in PR body) |
| If not auto-closed | Manually close issue via `issue_write` with `state: closed` |

---

## RULE 7 — Branch Naming

| Type | Pattern | Example |
|------|---------|--------|
| Feature | `feat/<issue-number>-description` | `feat/63-distributed-rate-limiter` |
| Bug fix | `fix/<issue-number>-description` | `fix/64-ux-polish` |
| Multi-issue | `feat/<n1>-<n2>-description` | `feat/63-64-rate-limiter-ux` |
| Hotfix | `fix/critical-<description>` | `fix/critical-auth-bypass` |

---

## RULE 8 — Commit Message Format

```
<type>(<scope>): <summary> (refs #<issue>)

- bullet of what changed
- bullet of what changed
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`

---

## RULE 9 — Pre-Merge Checklist (MANDATORY)

Before calling `merge_pull_request`:

- [ ] All issue checklist items addressed (including nice-to-haves)
- [ ] Copilot review has no unresolved comments
- [ ] Vercel deployment check is green
- [ ] No new TypeScript/ESLint errors introduced
- [ ] PR body contains `Closes #<issue-number>`

---

## Workflow Summary (Quick Reference)

```
1.  List open issues (GitHub MCP)
2.  Pick issue(s) to address
3.  Create branch: feat/<issue>-<desc>
4.  Implement all tasks + nice-to-haves from issue
5.  Self-verify against issue checklist
6.  Create PR (GitHub MCP) with "Closes #N"
7.  Request Copilot review (GitHub MCP)
8.  Wait 5–10 min → check Vercel + Copilot review
9.  Address ALL review comments → push fixes
10. Re-request Copilot review (manually via GitHub MCP)
11. Wait 5–10 min → repeat 8–10 until clean
12. Squash merge (GitHub MCP)
13. Delete branch
14. Confirm issue closed (auto or manual)
```

---

**This rule file governs all AI-assisted development on this repository.**
