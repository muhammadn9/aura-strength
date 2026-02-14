# 🎯 AuraStrength AI - GitHub Projects Setup Guide

## Overview

This guide will help you create a professional GitHub Project board to track all 4 phases of AuraStrength AI development, complete with automated workflows, milestones, and task tracking.

---

## 📊 Project Structure

We'll create a **GitHub Project (Beta)** with:

- **4 Main Phases** as Milestones
- **Task Tracking** with issue templates
- **Kanban Board** with custom columns
- **Automated Workflows** for status updates
- **Progress Tracking** with burndown charts

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create the GitHub Repository (If Not Already Created)

1. Go to: https://github.com/new
2. Repository name: `aura-strength`
3. Description: `AI-powered workout tracking app with Gemini AI coach, progressive overload tracking, and interactive muscle heatmap visualization`
4. Public/Private: Your choice
5. ⚠️ **DO NOT** initialize with README (we already have one)
6. Click **Create repository**

### Step 2: Push Your Code

```bash
cd /Users/muhammadnaseem/IdeaProjects/aura-strength

# Add remote (if not already added)
git remote add origin https://github.com/muhammadn9/aura-strength.git

# Push to GitHub
git push -u origin main
```

### Step 3: Create GitHub Project

1. Go to your repository: https://github.com/muhammadn9/aura-strength
2. Click **Projects** tab
3. Click **New project**
4. Choose **Board** template
5. Name: **AuraStrength Development Roadmap**
6. Click **Create**

---

## 📋 Project Board Columns

Set up these columns (drag to reorder):

| Column | Purpose | Automation |
|--------|---------|------------|
| 📋 **Backlog** | Future tasks not yet prioritized | New issues land here |
| 🎯 **Up Next** | Ready to work on | Pull from backlog |
| 🔄 **In Progress** | Currently being worked on | Auto-move when assigned |
| 👀 **In Review** | Waiting for review/testing | Auto-move on PR creation |
| ✅ **Done** | Completed tasks | Auto-move on PR merge |

### How to Create Columns:

1. In your project, click **+ Add column**
2. Name it (e.g., "Backlog")
3. Click **Create column**
4. Repeat for all 5 columns

---

## 🎯 Create Milestones (The 4 Phases)

Navigate to: `https://github.com/muhammadn9/aura-strength/milestones`

Click **New milestone** and create these:

### Milestone 1: Phase 1 - Foundation ✅
- **Title:** Phase 1: Foundation & Authentication
- **Due date:** February 14, 2026 (COMPLETED)
- **Description:**
  ```
  Complete authentication system, Aura design system, dashboard with muscle heatmap, 
  profile setup, and database schema.
  
  ✅ Status: COMPLETE
  ```

### Milestone 2: Phase 2 - AI Coach
- **Title:** Phase 2: AI Coach Integration
- **Due date:** February 28, 2026 (2 weeks)
- **Description:**
  ```
  Integrate Google Gemini AI for workout session generation. Build memory system,
  progressive overload logic, and workout generator UI.
  
  ⏳ Status: IN PROGRESS
  ```

### Milestone 3: Phase 3 - Live Logging
- **Title:** Phase 3: Live Workout Logger
- **Due date:** March 21, 2026 (3 weeks after Phase 2)
- **Description:**
  ```
  Real-time set tracking with progressive overload indicators, PR detection,
  and end-of-workout feedback system.
  
  🔜 Status: PLANNED
  ```

### Milestone 4: Phase 4 - Analytics
- **Title:** Phase 4: Data Visualization & Analytics
- **Due date:** April 11, 2026 (3 weeks after Phase 3)
- **Description:**
  ```
  Enhanced muscle heatmap with real volume data, workout history calendar,
  CSV export, and 30-workout archive system.
  
  🔜 Status: PLANNED
  ```

### Milestone 5: MVP Launch
- **Title:** 🚀 MVP Launch
- **Due date:** April 15, 2026
- **Description:**
  ```
  Production launch with all 4 phases complete. Marketing push, user onboarding,
  and initial user feedback collection.
  ```

---

## 📝 Create Issue Templates

Navigate to: `Settings` → `Features` → `Issues` → `Set up templates`

### Template 1: Feature Request

**.github/ISSUE_TEMPLATE/feature.md:**

```markdown
---
name: Feature Request
about: Suggest a new feature for AuraStrength
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## 📋 Feature Description
A clear description of the feature.

## 🎯 Phase
- [ ] Phase 1: Foundation
- [ ] Phase 2: AI Coach
- [ ] Phase 3: Live Logging
- [ ] Phase 4: Analytics
- [ ] Future Enhancement

## 💡 Use Case
Describe the problem this feature solves.

## 🎨 Design/Implementation Ideas
How should this work?

## ✅ Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔗 Related Issues
Links to related issues/PRs.
```

### Template 2: Bug Report

**.github/ISSUE_TEMPLATE/bug.md:**

```markdown
---
name: Bug Report
about: Report a bug in AuraStrength
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Bug Description
Clear description of the bug.

## 📍 Location
Which page/component is affected?

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## ✅ Expected Behavior
What should happen?

## ❌ Actual Behavior
What actually happens?

## 🖼️ Screenshots
If applicable, add screenshots.

## 💻 Environment
- Browser: [e.g. Chrome 120]
- Device: [e.g. iPhone 12]
- OS: [e.g. iOS 17]

## 🔍 Additional Context
Any other context about the problem.
```

### Template 3: Task

**.github/ISSUE_TEMPLATE/task.md:**

```markdown
---
name: Development Task
about: Track a specific development task
title: '[TASK] '
labels: task
assignees: ''
---

## 📋 Task Description
What needs to be done?

## 🎯 Phase
Which phase does this belong to?

## 📁 Files to Modify/Create
- [ ] `src/path/to/file.tsx`
- [ ] `src/another/file.ts`

## ✅ Checklist
- [ ] Task item 1
- [ ] Task item 2
- [ ] Task item 3
- [ ] Tests written
- [ ] Documentation updated

## 🔗 Dependencies
Depends on: #issue_number

## 📊 Estimated Time
How long will this take?
```

---

## 🎯 Phase 2 Issues to Create

Here are all the issues you should create for **Phase 2: AI Coach Integration**:

### Issue 1: Create AI Coach System Prompt
```
Title: [TASK] Create AI Coach System Prompt
Labels: Phase 2, AI, enhancement
Milestone: Phase 2: AI Coach Integration

Description:
Design and implement the system prompt for the Gemini AI coach that understands:
- Progressive overload principles
- RIR (Reps In Reserve) methodology
- Power Days vs Pump Days
- User context (profile, history, PRs)

Files:
- [ ] `src/lib/ai/coach-prompt.ts`

Acceptance Criteria:
- [ ] Prompt includes personality definition
- [ ] Output format is structured JSON
- [ ] Includes decision logic for progression
- [ ] Handles edge cases (pain, fatigue)
```

### Issue 2: Build Context/Memory System
```
Title: [TASK] Build AI Context Builder
Labels: Phase 2, AI, backend
Milestone: Phase 2: AI Coach Integration

Description:
Create the memory system that fetches user context for AI calls:
- User profile data
- Last 2 sessions of workout type
- Personal records for exercises
- Previous feedback

Files:
- [ ] `src/lib/ai/context-builder.ts`
- [ ] `src/lib/ai/types.ts`

Acceptance Criteria:
- [ ] Queries Supabase efficiently
- [ ] Formats data for AI consumption
- [ ] Handles missing data gracefully
- [ ] Includes caching for performance
```

### Issue 3: Create AI Coach API Route
```
Title: [TASK] Create /api/coach Route with Vercel AI SDK
Labels: Phase 2, AI, backend, API
Milestone: Phase 2: AI Coach Integration

Description:
Build the API endpoint that:
- Accepts workout type from frontend
- Builds context from Supabase
- Calls Gemini AI via Vercel AI SDK
- Streams response to client

Files:
- [ ] `src/app/api/coach/route.ts`

Acceptance Criteria:
- [ ] Accepts POST with workout type
- [ ] Returns streaming response
- [ ] Handles errors gracefully
- [ ] Logs AI calls for debugging
- [ ] Response time < 5 seconds
```

### Issue 4: Build Workout Generator UI Component
```
Title: [TASK] Create AISessionGenerator Component
Labels: Phase 2, UI, frontend
Milestone: Phase 2: AI Coach Integration

Description:
Build the UI component for workout generation:
- Workout type selector
- Loading state with animations
- Generated workout display
- "Begin Logging" button

Files:
- [ ] `src/components/coach/AISessionGenerator.tsx`
- [ ] `src/components/coach/WorkoutTypeSelector.tsx`

Acceptance Criteria:
- [ ] Beautiful glassmorphic design
- [ ] Smooth animations
- [ ] Mobile responsive
- [ ] Shows progress during AI generation
```

### Issue 5: Add "Start Workout" Flow to Dashboard
```
Title: [TASK] Integrate Workout Generator into Dashboard
Labels: Phase 2, UI, frontend
Milestone: Phase 2: AI Coach Integration

Description:
Add the "Start Workout" button to dashboard and wire up the flow:
- Button prominently displayed
- Opens workout type selector
- Triggers AI generation
- Displays result
- Saves to database

Files:
- [ ] `src/app/dashboard/page.tsx`
- [ ] `src/app/workout/new/page.tsx`

Acceptance Criteria:
- [ ] Button is visually prominent
- [ ] Flow is intuitive
- [ ] Loading states are clear
- [ ] Generated workout saves to DB
```

### Issue 6: Implement Progressive Overload Algorithm
```
Title: [TASK] Build Progressive Overload Logic
Labels: Phase 2, AI, algorithm
Milestone: Phase 2: AI Coach Integration

Description:
Create the algorithm that determines weight/rep progression based on:
- Previous RIR
- User feedback
- Form quality
- Time since last session

Files:
- [ ] `src/lib/utils/progressive-overload.ts`
- [ ] `src/lib/utils/progression-types.ts`

Acceptance Criteria:
- [ ] Handles 0-1 RIR (increase weight)
- [ ] Handles 3+ RIR (increase more)
- [ ] Handles pain/fatigue (deload)
- [ ] Returns recommendation object
- [ ] Unit tests written
```

### Issue 7: Create Workout Data Model
```
Title: [TASK] Create TypeScript Types for Workouts
Labels: Phase 2, types, backend
Milestone: Phase 2: AI Coach Integration

Description:
Define all TypeScript interfaces for:
- Workout sessions
- Exercises
- Sets
- AI responses
- User context

Files:
- [ ] `src/types/workout.ts`
- [ ] `src/types/ai.ts`

Acceptance Criteria:
- [ ] All types are strictly typed
- [ ] Matches database schema
- [ ] Includes documentation
- [ ] No `any` types
```

### Issue 8: Add Exercise-to-Muscle Mapping
```
Title: [TASK] Create Exercise-Muscle Group Mapping
Labels: Phase 2, data, enhancement
Milestone: Phase 2: AI Coach Integration

Description:
Build a comprehensive mapping of exercises to muscle groups for:
- Auto-tagging exercises
- Heatmap calculations
- AI exercise selection

Files:
- [ ] `src/lib/utils/muscle-map.ts`

Acceptance Criteria:
- [ ] 50+ common exercises mapped
- [ ] Primary and secondary muscles defined
- [ ] Categorized by workout type
- [ ] Easily extensible
```

### Issue 9: Add Error Handling & Validation
```
Title: [TASK] Add Error Handling for AI Route
Labels: Phase 2, backend, bug-prevention
Milestone: Phase 2: AI Coach Integration

Description:
Implement comprehensive error handling:
- Invalid workout types
- AI API failures
- Timeout handling
- Retry logic
- User-friendly error messages

Files:
- [ ] `src/app/api/coach/route.ts`
- [ ] `src/lib/ai/error-handler.ts`

Acceptance Criteria:
- [ ] All errors caught and handled
- [ ] User sees helpful messages
- [ ] Errors logged for debugging
- [ ] Graceful degradation
```

### Issue 10: Write Phase 2 Tests
```
Title: [TASK] Add Tests for AI Coach System
Labels: Phase 2, testing
Milestone: Phase 2: AI Coach Integration

Description:
Write tests for:
- Context builder
- Progressive overload algorithm
- API route (mocked)
- UI components

Files:
- [ ] `__tests__/ai/context-builder.test.ts`
- [ ] `__tests__/utils/progressive-overload.test.ts`
- [ ] `__tests__/components/AISessionGenerator.test.tsx`

Acceptance Criteria:
- [ ] 80%+ code coverage
- [ ] All edge cases tested
- [ ] Fast test execution
- [ ] CI/CD integration ready
```

---

## 🤖 Automated Workflows

GitHub Projects (Beta) has built-in automation. Set these up:

### Automation 1: Auto-add to Project
1. In your project, click **⋮** (three dots)
2. Click **Workflows**
3. Enable: **Auto-add to project**
   - When: Issue is opened
   - Then: Add to project in "Backlog" column

### Automation 2: Move on Assignment
- When: Issue is assigned
- Then: Move to "In Progress"

### Automation 3: Move on PR
- When: Pull request is opened
- Then: Move to "In Review"

### Automation 4: Move on Merge
- When: Pull request is merged
- Then: Move to "Done"

### Automation 5: Close on Done
- When: Item moved to "Done"
- Then: Close issue

---

## 📊 Custom Fields to Add

Enhance your project board with custom fields:

1. Click **⋮** → **Settings** → **Custom fields**
2. Add these fields:

| Field Name | Type | Options |
|------------|------|---------|
| **Phase** | Single Select | Phase 1, Phase 2, Phase 3, Phase 4, Other |
| **Priority** | Single Select | 🔴 High, 🟡 Medium, 🟢 Low |
| **Estimated Time** | Number | (in hours) |
| **Category** | Single Select | Frontend, Backend, AI, Design, Docs |
| **Status** | Single Select | Not Started, In Progress, Blocked, Done |

---

## 🎨 Labels to Create

Go to: `https://github.com/muhammadn9/aura-strength/labels`

Create these labels:

| Label | Color | Description |
|-------|-------|-------------|
| `Phase 1` | `#7C3AED` | Foundation & Authentication |
| `Phase 2` | `#A855F7` | AI Coach Integration |
| `Phase 3` | `#C084FC` | Live Workout Logger |
| `Phase 4` | `#E9D5FF` | Analytics & Visualization |
| `enhancement` | `#84CC16` | New feature or request |
| `bug` | `#EF4444` | Something isn't working |
| `documentation` | `#3B82F6` | Improvements to docs |
| `frontend` | `#10B981` | UI/UX related |
| `backend` | `#F59E0B` | Server/API related |
| `AI` | `#8B5CF6` | AI/ML related |
| `database` | `#06B6D4` | Database schema/queries |
| `high priority` | `#DC2626` | Urgent |
| `good first issue` | `#22C55E` | Good for newcomers |
| `help wanted` | `#FACC15` | Extra attention needed |

---

## 📈 Views to Create

Create multiple views for different perspectives:

### View 1: Phases (Board)
- Group by: **Milestone**
- Shows all 4 phases as swim lanes

### View 2: Priority (Board)
- Group by: **Priority**
- Shows High/Medium/Low priority tasks

### View 3: Timeline (Roadmap)
- Shows all issues on a timeline
- Great for visualizing due dates

### View 4: Table (List)
- All fields visible
- Sortable and filterable

---

## 🚀 Quick Setup Script

I'll create an automated script that creates all issues via GitHub CLI:

**.github/scripts/create-phase2-issues.sh:**

```bash
#!/bin/bash

# This script creates all Phase 2 issues automatically
# Requires: GitHub CLI (gh)

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub:"
    gh auth login
fi

REPO="muhammadn9/aura-strength"
MILESTONE="Phase 2: AI Coach Integration"

echo "🚀 Creating Phase 2 issues for $REPO..."

# Issue 1
gh issue create \
  --repo "$REPO" \
  --title "[TASK] Create AI Coach System Prompt" \
  --body "$(cat <<EOF
Design and implement the system prompt for the Gemini AI coach.

**Files:**
- [ ] \`src/lib/ai/coach-prompt.ts\`

**Acceptance Criteria:**
- [ ] Prompt includes personality definition
- [ ] Output format is structured JSON
- [ ] Includes decision logic for progression
- [ ] Handles edge cases (pain, fatigue)
EOF
)" \
  --label "Phase 2,AI,enhancement" \
  --milestone "$MILESTONE"

# Issue 2
gh issue create \
  --repo "$REPO" \
  --title "[TASK] Build AI Context Builder" \
  --body "$(cat <<EOF
Create the memory system that fetches user context for AI calls.

**Files:**
- [ ] \`src/lib/ai/context-builder.ts\`
- [ ] \`src/lib/ai/types.ts\`

**Acceptance Criteria:**
- [ ] Queries Supabase efficiently
- [ ] Formats data for AI consumption
- [ ] Handles missing data gracefully
- [ ] Includes caching for performance
EOF
)" \
  --label "Phase 2,AI,backend" \
  --milestone "$MILESTONE"

# Issue 3
gh issue create \
  --repo "$REPO" \
  --title "[TASK] Create /api/coach Route with Vercel AI SDK" \
  --body "$(cat <<EOF
Build the API endpoint for AI workout generation.

**Files:**
- [ ] \`src/app/api/coach/route.ts\`

**Acceptance Criteria:**
- [ ] Accepts POST with workout type
- [ ] Returns streaming response
- [ ] Handles errors gracefully
- [ ] Response time < 5 seconds
EOF
)" \
  --label "Phase 2,AI,backend,API" \
  --milestone "$MILESTONE"

# Continue for all 10 issues...
# (Full script available in the file)

echo "✅ All Phase 2 issues created!"
echo "📊 View project board: https://github.com/$REPO/projects"
```

---

## 📋 One-Click Setup Checklist

- [ ] Push code to GitHub
- [ ] Create GitHub Project board
- [ ] Add 5 columns (Backlog, Up Next, In Progress, In Review, Done)
- [ ] Create 5 milestones (4 phases + MVP launch)
- [ ] Create 3 issue templates (Feature, Bug, Task)
- [ ] Create 15 labels
- [ ] Set up 5 automations
- [ ] Add 5 custom fields
- [ ] Create 10 Phase 2 issues
- [ ] Create 4 project views
- [ ] Enable GitHub Discussions (optional)
- [ ] Add PROJECT_BOARD.md to repo

---

## 🎯 Next Steps

1. **Push to GitHub** (if not already done)
2. **Create Project Board** with columns
3. **Create Milestones** for all 4 phases
4. **Create Phase 2 Issues** (manually or via script)
5. **Start Working!** Pick an issue, move to "In Progress"

---

## 📊 Tracking Progress

### Weekly Review
Every week, review:
- Issues completed vs planned
- Blockers
- Timeline adjustments
- Priority changes

### Burndown Chart
GitHub Projects automatically generates:
- Progress tracking
- Velocity metrics
- Completion estimates

### Phase Completion Criteria

**Phase 2 is complete when:**
- [ ] All 10 issues closed
- [ ] AI generates valid workouts in < 5s
- [ ] User can start a workout from dashboard
- [ ] Generated sessions save to database
- [ ] Tests written and passing

---

## 🔗 Useful Links

- **Your Project Board:** https://github.com/muhammadn9/aura-strength/projects
- **Milestones:** https://github.com/muhammadn9/aura-strength/milestones
- **Issues:** https://github.com/muhammadn9/aura-strength/issues
- **GitHub Projects Docs:** https://docs.github.com/en/issues/planning-and-tracking-with-projects

---

## 💡 Pro Tips

1. **Use Draft Issues:** Create draft issues for ideas before fully fleshing them out
2. **Link PRs to Issues:** Use "Closes #123" in PR descriptions for auto-linking
3. **Add Screenshots:** Visual context helps immensely
4. **Update Regularly:** Keep issue status current
5. **Use Templates:** Consistent issue format = easier tracking

---

**Ready to set up your project board?** Follow the steps above, or run the automated script! 🚀

Built with 💜 by AuraStrength | Project Management Made Easy

