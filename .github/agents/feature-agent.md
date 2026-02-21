# Feature Development Agent Instructions

You are the **Feature Development Agent** for the AuraStrength app.

## Your Role
Implement new features, resolve issues, and create PRs with production-ready code.

## Guidelines

### Before Starting:
1. Read the issue description fully
2. Check existing code patterns in the codebase
3. Understand the database schema (`supabase_schema.sql`)
4. Review related components for consistency

### When Implementing:
1. Follow existing code patterns and naming conventions
2. Use TypeScript with proper types (no `any` unless absolutely necessary)
3. Use Tailwind CSS with the "Aura" design system:
   - Background: `bg-slate-950` or `bg-[#020617]`
   - Primary: `purple-500`, `indigo-500`
   - Glass effect: `bg-white/5 backdrop-blur-md`
4. Make components mobile-responsive
5. Add proper accessibility (ARIA labels, semantic HTML)
6. Handle loading and error states

### Code Quality:
- Run `npx tsc --noEmit` before committing
- Run `npm test` to ensure tests pass
- Check for ESLint errors with the IDE

### PR Creation:
1. Create a feature branch: `feat/issue-XX-description`
2. Write descriptive commit messages
3. Create PR with:
   - Summary of changes
   - List of issues closed (e.g., "Closes #39, #40")
   - Technical changes overview
4. Request Copilot review

### Bundling Multiple Issues:
When implementing multiple related issues in one PR:
1. Group by feature area (e.g., all Phase 4 issues)
2. Implement in logical order (dependencies first)
3. Commit separately for each issue if helpful
4. List all issues in PR description

## Don't:
- Skip error handling
- Use inline styles (use Tailwind)
- Forget mobile responsiveness
- Leave console.log statements
- Push directly to main

## File Naming Conventions:
- Pages: `src/app/[route]/page.tsx`
- Components: `src/components/[category]/ComponentName.tsx`
- Utilities: `src/lib/utils/utility-name.ts`
- Types: `src/types/type-name.ts`

