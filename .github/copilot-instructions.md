# GitHub Copilot Instructions for Lightstack

> ⚠️ **MANDATORY**: Before writing any code, read `.github/AI_AGENT_RULES.md`.
> All work **must** flow through GitHub Issues → Branch → PR → Review Loop → Merge.
> All GitHub operations use the **GitHub MCP server** (never raw CLI for GitHub actions).

## 🔁 Workflow at a Glance
1. **Existing issue?** → Check project board → list open issues via GitHub MCP → label `in-progress` → branch → implement → PR → review loop → merge
2. **New work mentioned?** → Create the issue via GitHub MCP first → then follow step 1
3. **PR review loop**: request Copilot review → wait 5–10 min → address ALL comments → re-request → repeat until clean + Vercel green → squash merge

## 📌 Project Board
**URL:** https://github.com/users/muhammadn9/projects/1

Labels drive board state. Required labels (create once in repo settings if missing):
| Label | Color | Meaning |
|-------|-------|--------|
| `in-progress` | `#fbca04` (yellow) | Work started, branch exists |
| `in-review` | `#0075ca` (blue) | PR open, under review |

---

## Project Overview
Lightstack is a workout tracking and AI-coaching web application built with:
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **AI:** Vercel AI SDK with Google Gemini
- **Icons:** Lucide React

## Design System ("The Aura")
- **Background:** Deep Obsidian `#020617` / `bg-slate-950`
- **Primary:** Radiant Purple `#A855F7` / `purple-500`
- **Secondary:** Indigo `#6366F1` / `indigo-500`
- **Glass Effect:** `bg-white/5 backdrop-blur-md border border-white/10`
- **Cards:** Use `GlassCard` component from `@/components/aura/GlassCard`

## Code Conventions
- Use TypeScript with strict types
- Prefer functional components with hooks
- Use `'use client'` directive for client components
- Follow Next.js App Router conventions
- Use Tailwind CSS (avoid inline styles)
- Add accessibility attributes (aria-label, role, etc.)

## File Structure
```
src/
├── app/           # Pages and API routes
├── components/    # Reusable UI components
├── lib/           # Utilities, AI logic, Supabase clients
└── types/         # TypeScript type definitions
```

## Multi-Agent Workflow
This project uses specialized agents. See `.github/agents/README.md` for details:
- `@feature` - Feature development
- `@test` - Test writing
- `@review` - PR review fixes
- `@architect` - Architecture review

## PR Rules
> Full rules in `.github/AI_AGENT_RULES.md` — the summary below is non-exhaustive.

1. **Never push directly to main** — branch always required
2. **Issues first** — every change traces to a GitHub issue (create one if missing)
3. **Label lifecycle** — `in-progress` when starting → `in-review` when PR opens → closed on merge
4. **PR via GitHub MCP** — title `feat: summary (closes #N)`, body must contain `Closes #N`
5. **Copilot review loop** — request review → wait 5–10 min → address ALL comments → re-request → repeat
6. **Vercel must be green** — never merge a failing deployment
7. **Squash merge only** — delete branch after merge
8. **Confirm issue closed** — auto via `Closes #N` or manually via GitHub MCP

## Database Schema
See `supabase_schema.sql` for table definitions:
- `profiles` - User profiles
- `workouts` - Workout sessions
- `exercises` - Exercises within workouts
- `sets` - Individual sets with weight/reps/RIR
- `all_time_prs` - Personal records archive
