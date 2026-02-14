#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
#  🚀 AuraStrength - GitHub Phase 2 Issues Creator
# ═══════════════════════════════════════════════════════════════════════════
#
#  This script automatically creates all 10 Phase 2 issues on GitHub
#  Requires: GitHub CLI (gh)
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
echo "║     🎯 AURASTRENGTH - GITHUB PROJECT SETUP                      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found!${NC}"
    echo ""
    echo "Install with:"
    echo "  macOS: brew install gh"
    echo "  Other: https://cli.github.com/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI found${NC}"

# Check if authenticated
if ! gh auth status &> /dev/null 2>&1; then
    echo -e "${YELLOW}🔐 Not authenticated with GitHub. Let's log in...${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ Authenticated${NC}"
echo ""

# Repository details
REPO="muhammadn9/aura-strength"
MILESTONE="Phase 2: AI Coach Integration"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PURPLE}📋 Creating Phase 2 Issues for $REPO${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

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
        echo -e "${GREEN}✅ Created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed (might already exist)${NC}"
    fi
    echo ""
}

# Issue 1: AI Coach System Prompt
create_issue \
    "[TASK] Create AI Coach System Prompt" \
    "$(cat <<'EOF'
## 📋 Task Description
Design and implement the system prompt for the Gemini AI coach that understands progressive overload, RIR methodology, and user context.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`src/lib/ai/coach-prompt.ts\`
- [ ] \`src/lib/ai/types.ts\`

## 📝 Requirements
The prompt should:
- Define the coach personality (evidence-based, hypertrophy-focused)
- Specify output format (structured JSON)
- Include decision logic for progressive overload
- Handle edge cases (pain, fatigue, form breakdown)
- Distinguish between Power Days (0-1 RIR) and Pump Days (2-3 RIR)

## ✅ Acceptance Criteria
- [ ] System prompt is comprehensive and clear
- [ ] Output format is strictly defined (JSON schema)
- [ ] Includes examples of expected responses
- [ ] Handles all user context (profile, history, PRs)
- [ ] Progressive overload logic is documented

## 📊 Estimated Time
4-6 hours

## 🔗 Dependencies
None - this is the foundation for Phase 2

## 📚 Resources
- RIR Training: https://www.strongerbyscience.com/rir/
- Vercel AI SDK: https://sdk.vercel.ai/docs
- Gemini Docs: https://ai.google.dev/docs
EOF
)" \
    "Phase 2,AI,enhancement,high priority"

# Issue 2: Context Builder
create_issue \
    "[TASK] Build AI Context Builder" \
    "$(cat <<'EOF'
## 📋 Task Description
Create the memory/context system that fetches user data from Supabase and formats it for AI consumption.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`src/lib/ai/context-builder.ts\`
- [ ] \`src/lib/ai/context-types.ts\`

## 📝 Requirements
The context builder should fetch:
1. User profile (age, weight, training age, goals)
2. Last 2 sessions of the requested workout type
3. All personal records for relevant exercises
4. Previous session feedback (joint health, energy)

## ✅ Acceptance Criteria
- [ ] Efficiently queries Supabase (use joins where possible)
- [ ] Formats data for AI consumption
- [ ] Handles missing data gracefully
- [ ] Includes caching mechanism (5-minute TTL)
- [ ] TypeScript types are strict and documented
- [ ] Unit tests written

## 📊 Estimated Time
6-8 hours

## 🔗 Dependencies
Depends on: Database schema (Phase 1) ✅

## 🧪 Testing
- Test with new user (no history)
- Test with user who has 2+ sessions
- Test with missing profile data
EOF
)" \
    "Phase 2,AI,backend,high priority"

# Issue 3: API Route
create_issue \
    "[TASK] Create /api/coach API Route with Vercel AI SDK" \
    "$(cat <<'EOF'
## 📋 Task Description
Build the API endpoint that handles workout generation requests using Google Gemini via Vercel AI SDK.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`src/app/api/coach/route.ts\`
- [ ] \`src/lib/ai/error-handler.ts\`

## 📝 Requirements
The API should:
- Accept POST requests with \`{ workoutType: string }\`
- Build context using the context-builder
- Call Gemini AI with system prompt + context
- Stream response to client
- Handle errors gracefully
- Log requests for debugging

## ✅ Acceptance Criteria
- [ ] Accepts POST with workout type
- [ ] Returns streaming response (Server-Sent Events)
- [ ] Handles errors with user-friendly messages
- [ ] Response time < 5 seconds (95th percentile)
- [ ] Logs AI calls (timestamp, user_id, workout_type, duration)
- [ ] Rate limiting implemented (10 requests/minute per user)
- [ ] Environment variables validated

## 📊 Estimated Time
8-10 hours

## 🔗 Dependencies
Depends on:
- #1 (System Prompt)
- #2 (Context Builder)

## 🧪 Testing
- Test with valid workout type
- Test with invalid workout type
- Test with missing auth
- Test timeout handling
- Test streaming response
EOF
)" \
    "Phase 2,AI,backend,API,high priority"

# Issue 4: Workout Generator UI
create_issue \
    "[TASK] Build Workout Generator UI Component" \
    "$(cat <<'EOF'
## 📋 Task Description
Create the frontend component that displays the AI-generated workout session with beautiful animations.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`src/components/coach/AISessionGenerator.tsx\`
- [ ] \`src/components/coach/WorkoutTypeSelector.tsx\`
- [ ] \`src/components/coach/GeneratedWorkout.tsx\`

## 📝 Requirements
The component should:
- Display workout type selector (Chest, Back, Legs, etc.)
- Show loading state with purple animations
- Stream and display AI response in real-time
- Show each exercise as a glassmorphic card
- Display: Exercise name, Sets, Reps, RIR, Rest time, Coach note
- Include "Begin Logging" button

## ✅ Acceptance Criteria
- [ ] Beautiful glassmorphic design (matches Aura theme)
- [ ] Smooth animations with Framer Motion
- [ ] Mobile responsive
- [ ] Shows progress during AI generation
- [ ] Handles errors gracefully
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Loading skeleton matches final layout

## 📊 Estimated Time
10-12 hours

## 🔗 Dependencies
Depends on: #3 (API Route)

## 🎨 Design Notes
- Use GlassCard component
- Purple gradient for headers
- Lucide icons for muscle groups
- Smooth fade-in animations for each exercise
EOF
)" \
    "Phase 2,UI,frontend,high priority"

# Issue 5: Dashboard Integration
create_issue \
    "[TASK] Integrate Workout Generator into Dashboard" \
    "$(cat <<'EOF'
## 📋 Task Description
Add the "Start Workout" flow to the dashboard and create the workout planning page.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Modify/Create
- [ ] \`src/app/dashboard/page.tsx\` (add button)
- [ ] \`src/app/workout/new/page.tsx\` (new page)

## 📝 Requirements
1. Add prominent "Start Workout" button to dashboard
2. Create /workout/new page with workout type selector
3. Integrate AISessionGenerator component
4. Save generated workout to database
5. Redirect to workout logger (Phase 3) or show "Coming Soon"

## ✅ Acceptance Criteria
- [ ] "Start Workout" button is visually prominent on dashboard
- [ ] Button uses GlassCard with hover effects
- [ ] Clicking opens /workout/new page
- [ ] Workout type selector is intuitive
- [ ] Generated workout saves to \`workouts\` and \`exercises\` tables
- [ ] User can go back to dashboard
- [ ] Loading states are clear

## 📊 Estimated Time
6-8 hours

## 🔗 Dependencies
Depends on: #4 (UI Component)

## 🗄️ Database Operations
- Create workout record in \`workouts\` table
- Create exercise records in \`exercises\` table
- Link to current user via user_id
EOF
)" \
    "Phase 2,UI,frontend,backend"

# Issue 6: Progressive Overload Algorithm
create_issue \
    "[TASK] Implement Progressive Overload Algorithm" \
    "$(cat <<'EOF'
## 📋 Task Description
Build the algorithm that determines weight and rep progressions based on previous performance.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`src/lib/utils/progressive-overload.ts\`
- [ ] \`src/lib/utils/progression-types.ts\`
- [ ] \`__tests__/utils/progressive-overload.test.ts\`

## 📝 Requirements
The algorithm should consider:
- Last session's RIR (Reps In Reserve)
- User feedback (form quality, joint pain)
- Time since last workout
- Training age/experience level

Decision logic:
- RIR 0-1 + good form → Increase weight 2.5-5kg
- RIR 2 + good form → Maintain or add 1 rep
- RIR 3+ → Increase weight 5-10kg
- Pain/bad form → Deload 10%

## ✅ Acceptance Criteria
- [ ] Function takes last session data and returns recommendation
- [ ] Returns: \`{ weight: number, reps: number, note: string }\`
- [ ] Handles edge cases (first time, no history)
- [ ] Unit tests cover all scenarios
- [ ] Test coverage > 90%
- [ ] Well-documented with JSDoc comments

## 📊 Estimated Time
8-10 hours

## 🔗 Dependencies
None (pure function)

## 🧪 Test Cases
- [ ] RIR 0, no pain → increase weight
- [ ] RIR 3, good form → larger increase
- [ ] Joint pain reported → deload
- [ ] No previous data → baseline recommendation
EOF
)" \
    "Phase 2,AI,algorithm,high priority"

# Issue 7: Workout Data Models
create_issue \
    "[TASK] Create TypeScript Types for Workouts" \
    "$(cat <<'EOF'
## 📋 Task Description
Define all TypeScript interfaces and types for workout-related data structures.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`src/types/workout.ts\`
- [ ] \`src/types/ai.ts\`
- [ ] \`src/types/database.ts\`

## 📝 Requirements
Create types for:
- \`Workout\` - Workout session
- \`Exercise\` - Exercise within a workout
- \`Set\` - Individual set data
- \`AIWorkoutRequest\` - API request format
- \`AIWorkoutResponse\` - AI response format
- \`UserContext\` - Context for AI
- \`ProgressionRecommendation\` - Overload suggestions

## ✅ Acceptance Criteria
- [ ] All types strictly typed (no \`any\`)
- [ ] Types match database schema exactly
- [ ] Includes JSDoc documentation
- [ ] Exported from index files
- [ ] Used consistently throughout app
- [ ] Zod schemas for runtime validation

## 📊 Estimated Time
4-6 hours

## 🔗 Dependencies
Depends on: Database schema (Phase 1) ✅

## 📚 Resources
- Supabase types: \`supabase gen types typescript\`
- Zod docs: https://zod.dev/
EOF
)" \
    "Phase 2,types,backend"

# Issue 8: Exercise-Muscle Mapping
create_issue \
    "[TASK] Create Exercise-Muscle Group Mapping" \
    "$(cat <<'EOF'
## 📋 Task Description
Build a comprehensive mapping of common exercises to their target muscle groups.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`src/lib/utils/muscle-map.ts\`
- [ ] \`src/lib/utils/exercise-database.ts\`

## 📝 Requirements
Create mapping for 50+ exercises including:
- Primary muscle groups
- Secondary muscle groups
- Exercise category (compound/isolation)
- Equipment needed
- Difficulty level

Example exercises:
- Bench Press → Chest (primary), Front Delts, Triceps (secondary)
- Squats → Quads, Glutes (primary), Hamstrings (secondary)
- Deadlifts → Hamstrings, Glutes, Lower Back (primary)

## ✅ Acceptance Criteria
- [ ] 50+ exercises mapped
- [ ] Organized by workout type (Push, Pull, Legs)
- [ ] Includes variations (Barbell, Dumbbell, Cable)
- [ ] Easy to extend with new exercises
- [ ] Used by AI for exercise selection
- [ ] Used by heatmap for volume calculations

## 📊 Estimated Time
6-8 hours

## 🔗 Dependencies
None (reference data)

## 📚 Resources
- Exercise database: https://exrx.net/
- Muscle anatomy: https://www.musclewiki.com/
EOF
)" \
    "Phase 2,data,enhancement"

# Issue 9: Error Handling
create_issue \
    "[TASK] Add Comprehensive Error Handling" \
    "$(cat <<'EOF'
## 📋 Task Description
Implement error handling, validation, and retry logic for the AI coach system.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Modify/Create
- [ ] \`src/app/api/coach/route.ts\`
- [ ] \`src/lib/ai/error-handler.ts\`
- [ ] \`src/lib/ai/retry-logic.ts\`

## 📝 Requirements
Handle these error cases:
- Invalid workout type
- Missing user authentication
- Supabase query failures
- AI API timeout (> 30s)
- AI API rate limits
- Malformed AI responses
- Network failures

## ✅ Acceptance Criteria
- [ ] All errors caught and logged
- [ ] User sees helpful error messages
- [ ] No sensitive data in error messages
- [ ] Retry logic with exponential backoff
- [ ] Max 3 retries for transient failures
- [ ] Graceful degradation (fallback to default workout)
- [ ] Error tracking with Sentry (optional)

## 📊 Estimated Time
6-8 hours

## 🔗 Dependencies
Depends on: #3 (API Route)

## 🧪 Testing
- [ ] Test timeout handling
- [ ] Test invalid inputs
- [ ] Test rate limiting
- [ ] Test network failures
EOF
)" \
    "Phase 2,backend,bug-prevention"

# Issue 10: Phase 2 Testing
create_issue \
    "[TASK] Write Tests for Phase 2 Features" \
    "$(cat <<'EOF'
## 📋 Task Description
Comprehensive testing for all Phase 2 components and logic.

## 🎯 Phase
Phase 2: AI Coach Integration

## 📁 Files to Create
- [ ] \`__tests__/ai/context-builder.test.ts\`
- [ ] \`__tests__/ai/coach-prompt.test.ts\`
- [ ] \`__tests__/utils/progressive-overload.test.ts\`
- [ ] \`__tests__/components/AISessionGenerator.test.tsx\`
- [ ] \`__tests__/api/coach.test.ts\`

## 📝 Test Coverage
Unit tests:
- Context builder functions
- Progressive overload algorithm
- Exercise-muscle mapping
- Error handling logic

Integration tests:
- API route with mocked Gemini
- Component rendering
- Supabase queries

E2E tests (optional):
- Full workout generation flow
- Error scenarios

## ✅ Acceptance Criteria
- [ ] 80%+ code coverage
- [ ] All edge cases tested
- [ ] Fast execution (< 10s total)
- [ ] CI/CD integration ready
- [ ] Test documentation written
- [ ] Mock data fixtures created

## 📊 Estimated Time
10-12 hours

## 🔗 Dependencies
Depends on: All Phase 2 issues

## 🧪 Testing Tools
- Jest
- React Testing Library
- MSW (Mock Service Worker)
EOF
)" \
    "Phase 2,testing"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Phase 2 Issues Created Successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}📊 View your issues:${NC}"
echo "   https://github.com/$REPO/issues"
echo ""
echo -e "${BLUE}📋 View your project board:${NC}"
echo "   https://github.com/$REPO/projects"
echo ""
echo -e "${BLUE}🎯 View milestone:${NC}"
echo "   https://github.com/$REPO/milestone/2"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PURPLE}🎉 Next Steps:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Create a Project board on GitHub"
echo "2. Add these issues to your project"
echo "3. Organize into columns: Backlog → In Progress → Done"
echo "4. Start working on Issue #1!"
echo ""
echo -e "${GREEN}✨ Happy coding! 🚀${NC}"
echo ""

