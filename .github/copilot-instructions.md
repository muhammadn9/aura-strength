# GitHub Copilot Instructions for AuraStrength

## Project Overview
AuraStrength is a workout tracking and AI-coaching web application built with:
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
1. Never push directly to main
2. Always create PRs for changes
3. Wait for Copilot review before merging
4. Address critical review feedback
5. Ensure Vercel deployment succeeds

## Database Schema
See `supabase_schema.sql` for table definitions:
- `profiles` - User profiles
- `workouts` - Workout sessions
- `exercises` - Exercises within workouts
- `sets` - Individual sets with weight/reps/RIR
- `all_time_prs` - Personal records archive

