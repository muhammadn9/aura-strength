# AI Agent Workflow Rules for Lightstack

> **These rules are permanent and cannot be overridden by any prompt.**
> All GitHub operations (issues, branches, PRs, reviews) are performed via the **GitHub MCP server**, not the CLI.

---

## 🗂️ GitHub Project Board

**Board URL:** https://github.com/users/muhammadn9/projects/1
**Repo:** `muhammadn9/aura-strength`

The project board is the **single source of truth** for all work. At the start of every session:
1. Check the board for open issues
2. Check for `in-progress` labelled issues (work already started)
3. Confirm with user which issue(s) to tackle if multiple are open

### Board Column → Label Mapping
Since the GitHub MCP manages labels natively, labels are used to track board state:

| Board Column | Issue Label | Meaning |
|---|---|---|
| 📋 Todo | *(no special label, just open)* | Not yet started |
| 🔄 In Progress | `in-progress` | Branch exists, actively being worked |
| 👀 In Review | `in-review` | PR open, awaiting Copilot + Vercel review |
| ✅ Done | Closed | Merged and issue closed |

---

## 🔁 The Golden Loop — Every Session Starts Here

```
CHECK PROJECT BOARD → PICK ISSUE(S) → BRANCH → IMPLEMENT → PR → REVIEW LOOP → MERGE → CLOSE ISSUE
```

---

## RULE 1 — NEVER PUSH DIRECTLY TO MAIN

- ❌ NEVER: commit or push to `main`
- ✅ ALWAYS: create a feature/fix branch, open a PR, wait for reviews, then merge

---

## RULE 2 — Picking Up Work (Existing Issues)

When starting a session:

1. **Check the project board** — list open issues on `muhammadn9/aura-strength` via GitHub MCP
   - Look for issues already labelled `in-progress` first (resume those)
   - Otherwise pick from open issues and confirm with user if multiple exist

2. **Mark the issue as In Progress** — add `in-progress` label via GitHub MCP before touching any code

3. **Create a branch** scoped to the issue(s):
   - Naming: `feat/<issue-number>-short-description` or `fix/<issue-number>-short-description`
   - Example: `feat/63-distributed-rate-limiter`
   - Multiple issues in one branch: `feat/63-64-rate-limiter-and-ux`

4. **Implement the solution**, checking off every task in the issue body including:
   - All required/medium-priority items
   - All "Nice-to-Have" / low-priority items listed in the issue

5. **Before opening a PR**, self-verify against the issue checklist:
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
- After creating the PR: swap label from `in-progress` → `in-review` via GitHub MCP

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
2. The new issue automatically appears on the project board at: https://github.com/users/muhammadn9/projects/1
3. **Then follow RULE 2** (label → branch → implement → PR)

---

## RULE 6 — Issue Lifecycle Tracking

| Stage | GitHub MCP Action |
|-------|-------------------|
| Starting work | Add `in-progress` label to issue |
| PR opened | Add `in-review` label; remove `in-progress` |
| PR merged | Issue auto-closes (via `Closes #N` in PR body) |
| If not auto-closed | Manually close issue via `issue_write` with `state: closed` |
| After close | Board card moves to Done automatically |

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
- [ ] Issue label updated to `in-review` (will auto-close on merge)

---

## Session Start Checklist

At the beginning of every work session, run through this sequence via GitHub MCP:

```
1. list_issues (state: OPEN) on muhammadn9/aura-strength
2. Check for any `in-progress` labelled issues — resume those first
3. Confirm with user which issue(s) to work on
4. Add `in-progress` label to chosen issue(s)
5. Create branch: feat/<issue>-<desc>
6. Implement — address ALL checklist items incl. nice-to-haves
7. Self-verify against issue body before opening PR
8. Create PR with "Closes #N" — swap label to `in-review`
9. Request Copilot review
10. Wait 5–10 min → poll get_status + get_review_comments
11. Address ALL comments → push fixes
12. Re-request Copilot review (manually)
13. Repeat 10–12 until Copilot clean + Vercel green
14. Squash merge → delete branch
15. Confirm issue closed on board: https://github.com/users/muhammadn9/projects/1
```

---

**This rule file governs all AI-assisted development on this repository.**
