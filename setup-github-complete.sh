#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
#  🚀 AuraStrength - Complete GitHub Setup with Milestones & Issues
# ═══════════════════════════════════════════════════════════════════════════
#
#  This script:
#  1. Creates all 4 phase milestones
#  2. Creates labels
#  3. Creates all 10 Phase 2 issues
#
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║     🎯 AURASTRENGTH - COMPLETE GITHUB SETUP                     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found!${NC}"
    echo ""
    echo "Install with: brew install gh"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI found${NC}"

# Check if authenticated
if ! gh auth status &> /dev/null 2>&1; then
    echo -e "${YELLOW}🔐 Not authenticated. Let's log in...${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ Authenticated${NC}"
echo ""

REPO="muhammadn9/aura-strength"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PURPLE}📋 Step 1: Creating Milestones${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to create milestone
create_milestone() {
    local title="$1"
    local due_date="$2"
    local description="$3"

    echo -e "${BLUE}Creating milestone: $title${NC}"

    if gh api repos/$REPO/milestones \
        -f title="$title" \
        -f due_on="$due_date" \
        -f description="$description" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Already exists or failed${NC}"
    fi
    echo ""
}

# Create 4 phase milestones
create_milestone \
    "Phase 1: Foundation & Authentication" \
    "2026-02-14T23:59:59Z" \
    "✅ COMPLETE - Authentication system, Aura design, dashboard, muscle heatmap, profile setup, and database schema."

create_milestone \
    "Phase 2: AI Coach Integration" \
    "2026-02-28T23:59:59Z" \
    "⏳ IN PROGRESS - Integrate Google Gemini AI for workout session generation with memory system and progressive overload logic."

create_milestone \
    "Phase 3: Live Workout Logger" \
    "2026-03-21T23:59:59Z" \
    "🔜 PLANNED - Real-time set tracking with progressive overload indicators, PR detection, and end-of-workout feedback."

create_milestone \
    "Phase 4: Data Visualization & Analytics" \
    "2026-04-11T23:59:59Z" \
    "🔜 PLANNED - Enhanced muscle heatmap with volume data, workout history calendar, CSV export, and archive system."

create_milestone \
    "🚀 MVP Launch" \
    "2026-04-15T23:59:59Z" \
    "Production launch with all 4 phases complete. Marketing push and user onboarding."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PURPLE}🏷️  Step 2: Creating Labels${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to create label
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"

    echo -e "${BLUE}Creating label: $name${NC}"

    if gh api repos/$REPO/labels \
        -f name="$name" \
        -f color="$color" \
        -f description="$description" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Created${NC}"
    else
        echo -e "${YELLOW}⚠️  Already exists${NC}"
    fi
}

# Create labels
create_label "Phase 1" "7C3AED" "Foundation & Authentication"
create_label "Phase 2" "A855F7" "AI Coach Integration"
create_label "Phase 3" "C084FC" "Live Workout Logger"
create_label "Phase 4" "E9D5FF" "Analytics & Visualization"
create_label "AI" "8B5CF6" "AI/ML related tasks"
create_label "frontend" "10B981" "UI/UX related"
create_label "backend" "F59E0B" "Server/API related"
create_label "database" "06B6D4" "Database schema/queries"
create_label "high priority" "DC2626" "Urgent tasks"
create_label "testing" "3B82F6" "Test-related tasks"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PURPLE}📝 Step 3: Creating Phase 2 Issues${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MILESTONE="Phase 2: AI Coach Integration"

# Function to create issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"

    echo -e "${BLUE}Creating: $title${NC}"

    if gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --milestone "$MILESTONE" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Created${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed or already exists${NC}"
    fi
    echo ""
}

# Issue 1
create_issue \
    "[TASK] Create AI Coach System Prompt" \
    "$(cat <<'EOF'
## 📋 Task Description
Design and implement the system prompt for the Gemini AI coach.

## 📁 Files to Create
- [ ] \`src/lib/ai/coach-prompt.ts\`
- [ ] \`src/lib/ai/types.ts\`

## ✅ Acceptance Criteria
- [ ] System prompt defines coach personality
- [ ] Output format is structured JSON
- [ ] Includes progressive overload decision logic
- [ ] Handles edge cases (pain, fatigue)

## 📊 Estimated Time: 4-6 hours
EOF
)" \
    "Phase 2,AI,enhancement,high priority"

# Issue 2
create_issue \
    "[TASK] Build AI Context Builder" \
    "$(cat <<'EOF'
## 📋 Task Description
Create the memory system that fetches user context from Supabase.

## 📁 Files to Create
- [ ] \`src/lib/ai/context-builder.ts\`
- [ ] \`src/lib/ai/context-types.ts\`

## ✅ Acceptance Criteria
- [ ] Queries Supabase efficiently
- [ ] Formats data for AI consumption
- [ ] Handles missing data gracefully
- [ ] Includes 5-minute caching

## 📊 Estimated Time: 6-8 hours
EOF
)" \
    "Phase 2,AI,backend,high priority"

# Issue 3
create_issue \
    "[TASK] Create /api/coach API Route" \
    "$(cat <<'EOF'
## 📋 Task Description
Build the API endpoint using Vercel AI SDK and Gemini.

## 📁 Files to Create
- [ ] \`src/app/api/coach/route.ts\`
- [ ] \`src/lib/ai/error-handler.ts\`

## ✅ Acceptance Criteria
- [ ] Accepts POST with workout type
- [ ] Returns streaming response
- [ ] Response time < 5 seconds
- [ ] Handles errors gracefully

## 📊 Estimated Time: 8-10 hours
EOF
)" \
    "Phase 2,AI,backend,high priority"

# Issue 4
create_issue \
    "[TASK] Build Workout Generator UI Component" \
    "$(cat <<'EOF'
## 📋 Task Description
Create the frontend component for AI workout generation.

## 📁 Files to Create
- [ ] \`src/components/coach/AISessionGenerator.tsx\`
- [ ] \`src/components/coach/WorkoutTypeSelector.tsx\`

## ✅ Acceptance Criteria
- [ ] Glassmorphic design (Aura theme)
- [ ] Smooth Framer Motion animations
- [ ] Mobile responsive
- [ ] Shows progress during generation

## 📊 Estimated Time: 10-12 hours
EOF
)" \
    "Phase 2,frontend,high priority"

# Issue 5
create_issue \
    "[TASK] Integrate Workout Generator into Dashboard" \
    "$(cat <<'EOF'
## 📋 Task Description
Add "Start Workout" flow to dashboard.

## 📁 Files to Modify
- [ ] \`src/app/dashboard/page.tsx\`
- [ ] \`src/app/workout/new/page.tsx\` (create)

## ✅ Acceptance Criteria
- [ ] "Start Workout" button prominent on dashboard
- [ ] Generated workout saves to database
- [ ] Loading states are clear

## 📊 Estimated Time: 6-8 hours
EOF
)" \
    "Phase 2,frontend,backend"

# Issue 6
create_issue \
    "[TASK] Implement Progressive Overload Algorithm" \
    "$(cat <<'EOF'
## 📋 Task Description
Build the algorithm for weight/rep progressions.

## 📁 Files to Create
- [ ] \`src/lib/utils/progressive-overload.ts\`
- [ ] \`__tests__/utils/progressive-overload.test.ts\`

## ✅ Acceptance Criteria
- [ ] Handles RIR 0-1 (increase weight)
- [ ] Handles RIR 3+ (larger increase)
- [ ] Handles pain/fatigue (deload)
- [ ] Unit tests with 90%+ coverage

## 📊 Estimated Time: 8-10 hours
EOF
)" \
    "Phase 2,AI,high priority"

# Issue 7
create_issue \
    "[TASK] Create TypeScript Types for Workouts" \
    "$(cat <<'EOF'
## 📋 Task Description
Define all TypeScript interfaces for workout data.

## 📁 Files to Create
- [ ] \`src/types/workout.ts\`
- [ ] \`src/types/ai.ts\`

## ✅ Acceptance Criteria
- [ ] All types strictly typed (no any)
- [ ] Types match database schema
- [ ] Includes JSDoc documentation
- [ ] Zod schemas for validation

## 📊 Estimated Time: 4-6 hours
EOF
)" \
    "Phase 2,backend"

# Issue 8
create_issue \
    "[TASK] Create Exercise-Muscle Group Mapping" \
    "$(cat <<'EOF'
## 📋 Task Description
Build comprehensive mapping of 50+ exercises to muscle groups.

## 📁 Files to Create
- [ ] \`src/lib/utils/muscle-map.ts\`
- [ ] \`src/lib/utils/exercise-database.ts\`

## ✅ Acceptance Criteria
- [ ] 50+ exercises mapped
- [ ] Primary and secondary muscles defined
- [ ] Organized by workout type
- [ ] Easy to extend

## 📊 Estimated Time: 6-8 hours
EOF
)" \
    "Phase 2,backend"

# Issue 9
create_issue \
    "[TASK] Add Comprehensive Error Handling" \
    "$(cat <<'EOF'
## 📋 Task Description
Implement error handling and retry logic for AI system.

## 📁 Files to Modify
- [ ] \`src/app/api/coach/route.ts\`
- [ ] \`src/lib/ai/retry-logic.ts\` (create)

## ✅ Acceptance Criteria
- [ ] All errors caught and logged
- [ ] User sees helpful messages
- [ ] Retry with exponential backoff
- [ ] Max 3 retries for transient failures

## 📊 Estimated Time: 6-8 hours
EOF
)" \
    "Phase 2,backend"

# Issue 10
create_issue \
    "[TASK] Write Tests for Phase 2 Features" \
    "$(cat <<'EOF'
## 📋 Task Description
Comprehensive testing for all Phase 2 components.

## 📁 Files to Create
- [ ] \`__tests__/ai/context-builder.test.ts\`
- [ ] \`__tests__/api/coach.test.ts\`
- [ ] \`__tests__/components/AISessionGenerator.test.tsx\`

## ✅ Acceptance Criteria
- [ ] 80%+ code coverage
- [ ] All edge cases tested
- [ ] Fast execution (< 10s)
- [ ] CI/CD integration ready

## 📊 Estimated Time: 10-12 hours
EOF
)" \
    "Phase 2,testing"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ GitHub Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}📊 View your setup:${NC}"
echo "   Issues:     https://github.com/$REPO/issues"
echo "   Milestones: https://github.com/$REPO/milestones"
echo "   Labels:     https://github.com/$REPO/labels"
echo ""

echo -e "${PURPLE}🎯 Next Steps:${NC}"
echo "1. Create a Project board: https://github.com/$REPO/projects"
echo "2. Add issues to the project"
echo "3. Pick an issue and start coding!"
echo ""

echo -e "${GREEN}✨ Ready to build Phase 2! 🚀${NC}"
echo ""

