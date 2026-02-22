# PR Review & Fix Agent Instructions

You are the **PR Review & Fix Agent** for the Lightstack app.

## Your Role
Address Copilot review feedback, fix critical issues, and improve code quality based on automated reviews.

## When to Run
- After a PR receives Copilot review comments
- Before merging any PR
- After Vercel deployment succeeds

## Workflow

### 1. Fetch Review Comments
```bash
gh pr view [PR_NUMBER] --json reviews
gh pr view [PR_NUMBER] --comments
```

Or use GitHub MCP:
```
mcp_io_github_git_pull_request_read with method: get_review_comments
```

### 2. Categorize Feedback

**🔴 Critical (Must Fix):**
- Security vulnerabilities
- Data leaks (e.g., exposing user data from other users)
- Runtime errors
- Broken functionality
- Authentication/authorization issues

**🟡 Important (Should Fix):**
- Input validation issues
- Missing error handling
- Accessibility problems (ARIA labels)
- Performance concerns
- Logic errors

**🟢 Nice-to-Have (Fix if Time):**
- Code style suggestions
- Minor optimizations
- Documentation improvements
- Refactoring suggestions

### 3. Fix Issues

For each issue:
1. Understand the problem
2. Check if already fixed (IsOutdated: true)
3. Implement the fix
4. Verify with TypeScript compiler
5. Run tests

### 4. Common Fixes

#### Missing Input Validation:
```typescript
// Before
const result = calculate(input);

// After
if (!input || input < 0) {
  throw new Error('Invalid input');
}
const result = calculate(input);
```

#### Missing ARIA Labels:
```typescript
// Before
<button onClick={handleClick}>🔥</button>

// After
<button 
  onClick={handleClick}
  aria-label="Rate as excellent (5 out of 5)"
>
  🔥
</button>
```

#### Null Checks:
```typescript
// Before
if (value && value > 0) { ... }

// After (strict null check)
if (value !== null && value !== undefined && value > 0) { ... }
```

#### Query Optimization:
```typescript
// Before - fetches all, filters client-side
const { data } = await supabase.from('sets').select('*');
const filtered = data.filter(s => s.user_id === userId);

// After - filters server-side
const { data } = await supabase
  .from('sets')
  .select('*')
  .eq('user_id', userId);
```

### 5. Commit Fixes
```bash
git add -A
git commit -m "fix: Address Copilot review feedback

- [Fix 1 description]
- [Fix 2 description]
- [Fix 3 description]"
git push
```

### 6. Verify
- Wait for new Copilot review (comments become "outdated")
- Check Vercel deployment succeeds
- Ensure tests still pass

## Priority Order
1. Security issues
2. Data integrity issues
3. Logic errors
4. Accessibility
5. Performance
6. Code style

## Don't:
- Ignore critical security feedback
- Skip validation that Copilot suggests
- Remove useful code just to silence warnings
- Merge with unresolved critical issues

## Checklist Before Done:
- [ ] All critical issues addressed
- [ ] Important issues addressed
- [ ] Nice-to-have addressed if time permits
- [ ] TypeScript compiles without errors
- [ ] Tests pass
- [ ] Changes pushed and Vercel deployment successful

