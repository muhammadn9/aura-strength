# AuraStrength AI - Multi-Agent Workflow

This document describes how to use the specialized agents for this project.

## 🤖 Available Agents

### 1. Feature Development Agent (`@feature`)
**Purpose:** Core feature implementation and issue resolution.

**When to use:**
- Implementing new features from issues
- Building components and pages
- Adding new functionality
- Creating PRs with core code

**How to invoke:**
```
@feature Implement Phase 4: Enhanced Muscle Heatmap (#39)
```

---

### 2. Test & Quality Agent (`@test`)
**Purpose:** Writing tests and ensuring code quality coverage.

**When to use:**
- After a feature is implemented
- Adding unit tests for utilities
- Adding integration tests for components
- Improving test coverage

**How to invoke:**
```
@test Add tests for pr-detection.ts utility functions
```

---

### 3. PR Review & Fix Agent (`@review`)
**Purpose:** Address Copilot review feedback and code quality issues.

**When to use:**
- After a PR receives Copilot review
- Fixing critical issues flagged in reviews
- Addressing nice-to-have suggestions
- Improving accessibility, performance, etc.

**How to invoke:**
```
@review Address Copilot feedback on PR #38
```

---

### 4. Architecture Review Agent (`@architect`)
**Purpose:** Periodic system design review and tech debt identification.

**When to use:**
- At the end of each phase
- When planning major refactors
- Identifying code duplication
- Reviewing folder structure

**How to invoke:**
```
@architect Review Phase 3 architecture and identify improvements
```

---

## 📋 Recommended Workflow

### Standard Feature Development Flow:

```
1. @feature → Implements the feature, creates PR
2. (Wait for Copilot review)
3. @review → Fixes any critical/important feedback
4. @test → Adds test coverage
5. Merge PR
6. (Periodically) @architect → Reviews overall design
```

### Bundled PR Flow (Multiple Issues):

```
1. @feature → Implements Issues #39, #40, #41 together
2. (Wait for Copilot review + Vercel deployment)
3. @review → Addresses all feedback
4. @test → Adds comprehensive tests
5. Merge PR
```

---

## ⚙️ Configuration Files

Each agent has its own instruction file in `.github/agents/`:
- `feature-agent.md` - Feature development instructions
- `test-agent.md` - Test writing instructions
- `review-agent.md` - PR review fix instructions
- `architect-agent.md` - Architecture review instructions

---

## 🎯 Best Practices

1. **One agent at a time** - Don't run multiple agents on the same files
2. **Wait for reviews** - Let Copilot review before running @review agent
3. **Bundle related issues** - Use @feature to implement multiple related issues in one PR
4. **Test after features** - Run @test after @feature completes
5. **Periodic architecture** - Run @architect at phase boundaries

---

## 📝 Example Session

```bash
# Start Phase 4 with bundled issues
@feature Implement Phase 4: Issues #39, #40, #41 (Heatmap, History, Export)

# After PR is created and Copilot reviews...
@review Address Copilot feedback on PR #44

# Add test coverage
@test Add tests for muscle-volume.ts and export.ts

# At end of Phase 4
@architect Review Phase 4 implementation and identify tech debt
```

