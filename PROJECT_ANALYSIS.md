# AuraStrength AI - Project Analysis & Implementation Plan

## 📊 Current State Assessment

### ✅ What's Already Set Up
- **Framework**: Next.js 16.1.6 (App Router) ✓
- **Styling**: Tailwind CSS v4 ✓
- **Animation**: Framer Motion v12 ✓
- **Icons**: Lucide React ✓
- **Backend**: @supabase/supabase-js ✓
- **AI**: Vercel AI SDK + @ai-sdk/google ✓
- **Environment**: Supabase credentials configured ✓

### 🎨 Design System: "The Aura"

```
Color Palette:
├── Deep Obsidian: #020617 (bg-slate-950)
├── Radiant Purple: #A855F7 (purple-500)
└── Indigo Accent: #6366F1 (indigo-500)

Visual Effects:
├── Glassmorphism: bg-white/5 backdrop-blur-md
├── Radial Gradients: blur-3xl purple/indigo orbs
└── Muscle Heatmap: Purple glow intensity by volume
```

---

## 🏗️ Architecture Overview

### File Structure (Recommended)
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx              # Main hub with heatmap
│   │   └── layout.tsx            # Glassmorphic container
│   ├── workout/
│   │   ├── [id]/
│   │   │   └── live/page.tsx    # Real-time logging
│   │   └── new/page.tsx          # AI session generator
│   ├── profile/page.tsx
│   ├── history/page.tsx
│   ├── api/
│   │   └── coach/route.ts        # AI endpoint
│   └── layout.tsx
├── components/
│   ├── aura/
│   │   ├── GlassCard.tsx
│   │   ├── AuraBackground.tsx
│   │   └── MuscleHeatmap.tsx     # SVG human silhouette
│   ├── workout/
│   │   ├── ExerciseCard.tsx
│   │   ├── SetLogger.tsx
│   │   └── ProgressiveOverloadIndicator.tsx
│   └── coach/
│       └── AISessionGenerator.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts              # Database types
│   ├── ai/
│   │   ├── coach-prompt.ts
│   │   └── session-generator.ts
│   └── utils/
│       ├── progressive-overload.ts
│       └── muscle-map.ts         # Maps exercises → muscle groups
└── types/
    └── workout.ts
```

---

## 🗄️ Database Schema (Supabase)

### Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  height DECIMAL(5,2),  -- in cm
  weight DECIMAL(5,2),  -- in kg
  training_age INTEGER, -- months of training
  training_goals TEXT[],
  split_preference TEXT, -- e.g., 'PPL', 'Upper/Lower'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `workouts`
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL, -- 'Chest Day', 'Pull Day', etc.
  duration_minutes INTEGER,
  coach_summary_note TEXT,
  user_overall_feedback TEXT, -- Joint health + energy
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `exercises`
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group_id INTEGER, -- FK to muscle_groups
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps TEXT, -- '8-10' or '12-15'
  target_rir TEXT,  -- '0-1' or '2-3'
  rest_seconds INTEGER
);
```

#### `sets`
```sql
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  rir INTEGER NOT NULL, -- 0-5
  user_set_feedback TEXT,
  is_pr BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `muscle_groups` (Reference Table)
```sql
CREATE TABLE muscle_groups (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  svg_path_id TEXT NOT NULL -- Links to SVG element IDs
);

-- Pre-populate:
INSERT INTO muscle_groups (name, svg_path_id) VALUES
  ('Chest', 'chest-area'),
  ('Front Delts', 'front-delts'),
  ('Quads', 'quads'),
  ('Biceps', 'biceps'),
  ('Lats', 'lats'),
  ('Rear Delts', 'rear-delts'),
  ('Glutes', 'glutes'),
  ('Hamstrings', 'hamstrings'),
  ('Triceps', 'triceps'),
  ('Traps', 'traps');
```

#### `all_time_prs` (Archive)
```sql
CREATE TABLE all_time_prs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  date_achieved DATE NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🤖 AI System Design

### Coach Personality Prompt
```typescript
export const COACH_SYSTEM_PROMPT = `
You are the AuraStrength Coach, an expert in evidence-based hypertrophy training.

CORE PRINCIPLES:
- Prioritize mechanical tension and progressive overload
- Use RIR (Reps In Reserve) as the primary intensity metric
- Distinguish between "Power Days" (0-1 RIR) and "Pump Days" (2-3 RIR)

DECISION LOGIC:
1. If last session: 0-1 RIR + good form → Increase weight 2.5-5kg or add 1-2 reps
2. If last session: "shaky form" or "joint pain" → Hold weight or reduce 5-10%
3. If last session: RIR 3+ → Increase weight next time

OUTPUT FORMAT (JSON):
{
  "exercises": [
    {
      "name": "Barbell Bench Press",
      "muscle_groups": ["Chest", "Front Delts", "Triceps"],
      "sets": 4,
      "target_reps": "6-8",
      "target_rir": "0-1",
      "rest_seconds": 180,
      "coach_note": "Focus on chest stretch at bottom"
    }
  ]
}

CONTEXT PROVIDED:
- User Profile (age, weight, training age)
- Last 2 sessions of this workout type
- Personal records for each exercise
- Previous session feedback (joint health, energy)
`;
```

### Memory System
Every AI call must include:
```typescript
interface AIContext {
  userProfile: {
    age: number;
    weight: number;
    training_age: number;
  };
  lastTwoSessions: WorkoutHistory[];
  personalRecords: Record<string, PRData>;
  lastFeedback: {
    joint_health: string;
    energy_level: string;
  };
}
```

---

## 🎯 Feature Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal**: Authentication + Dashboard Shell

#### Tasks:
1. **Supabase Setup**
   - Run schema migrations
   - Configure RLS policies
   - Set up Auth UI

2. **Core Layout**
   - Create `AuraBackground.tsx` component
   - Build `GlassCard.tsx` with glassmorphism
   - Implement navigation

3. **Dashboard Skeleton**
   - Create muscle heatmap SVG
   - Wire up to Supabase (query last 7 days volume)
   - Display upcoming workout

**Deliverable**: User can sign up, log in, see empty dashboard with "aura" aesthetic

---

### Phase 2: AI Coach Integration (Week 3-4)
**Goal**: Generate AI-powered workout sessions

#### Tasks:
1. **Profile Onboarding**
   - Form for age, height, weight, training goals
   - Select split preference (PPL, Upper/Lower, etc.)

2. **AI Route Handler**
   - `/api/coach/route.ts`
   - Fetch user context from Supabase
   - Call Gemini via Vercel AI SDK
   - Stream response

3. **Session Generator UI**
   - "Start Workout" button → workout type selector
   - AI generates session plan
   - Display as cards (Exercise → Sets → Reps → RIR)

**Deliverable**: User can generate a structured workout plan from AI

---

### Phase 3: Live Workout Logger (Week 5-6)
**Goal**: Real-time set tracking with progressive overload

#### Tasks:
1. **SetLogger Component**
   - Input fields: Weight, Reps, RIR
   - Display "Previous Best" above inputs (query last workout)
   - "How did it feel?" text area per set

2. **Progressive Overload Indicator**
   - Visual cue: Green (+2.5kg from last time), Yellow (same), Red (deload)
   - Auto-detect PRs (compare to all-time best)

3. **End-of-Workout Summary**
   - Text areas: Joint Health + Overall Energy
   - Save to `workouts` table with coach_summary_note

**Deliverable**: User can log sets, see previous performance, mark PRs

---

### Phase 4: Data Visualization (Week 7-8)
**Goal**: Muscle heatmap + history tracking

#### Tasks:
1. **Muscle Heatmap Logic**
   - Query last 7 days: COUNT(sets) GROUP BY muscle_group_id
   - Map volume → purple opacity (0-100% scale)
   - Animate glow on hover

2. **History Page**
   - Calendar view of workouts
   - Click → see session details
   - Export to CSV button (when 30+ workouts)

3. **30-Workout Warning**
   - Dashboard notification: "You've logged 30 workouts! Export & archive?"
   - Button: "Export Cycle" (generates CSV)
   - Button: "Clear for New Month" (archives to all_time_prs)

**Deliverable**: Visual feedback system + data management

---

## 🎨 Key UI Components

### 1. AuraBackground
```typescript
// Radial gradients that shift position on mouse move
<div className="fixed inset-0 -z-10 bg-slate-950">
  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 
                  rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 
                  rounded-full blur-3xl animate-pulse delay-1000" />
</div>
```

### 2. GlassCard
```typescript
<div className="bg-white/5 backdrop-blur-md border border-white/10 
                rounded-2xl p-6 shadow-2xl">
  {children}
</div>
```

### 3. MuscleHeatmap
```typescript
// SVG human silhouette with interactive paths
<svg viewBox="0 0 200 400">
  {muscleGroups.map(group => (
    <path
      id={group.svg_path_id}
      d={group.path_data}
      fill={`rgba(168, 85, 247, ${group.volume_opacity})`}
      className="transition-all hover:brightness-125"
    />
  ))}
</svg>
```

---

## 🔐 Security & RLS Policies

### Example Policy (workouts table)
```sql
-- Users can only see their own workouts
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workouts
CREATE POLICY "Users can create own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 📈 Progressive Overload Algorithm

### Logic:
```typescript
function calculateProgression(
  lastWeight: number,
  lastReps: number,
  lastRIR: number,
  feedback: string
): ProgressionRecommendation {
  // Case 1: PR territory (0-1 RIR, good form)
  if (lastRIR <= 1 && !feedback.includes('pain')) {
    return {
      weight: lastWeight + 2.5,
      reps: lastReps,
      note: 'Weight increased - you crushed last time!'
    };
  }
  
  // Case 2: Too much RIR (3+)
  if (lastRIR >= 3) {
    return {
      weight: lastWeight + 5,
      reps: lastReps,
      note: 'Jump in weight - you had more in the tank'
    };
  }
  
  // Case 3: Form breakdown or pain
  if (feedback.includes('shaky') || feedback.includes('pain')) {
    return {
      weight: lastWeight * 0.9,
      reps: lastReps,
      note: 'Deload for recovery - prioritize form'
    };
  }
  
  // Default: Maintain
  return {
    weight: lastWeight,
    reps: lastReps,
    note: 'Hold steady - solid performance'
  };
}
```

---

## 🚀 Development Workflow

### Suggested Order:
1. ✅ Dependencies installed (DONE)
2. ⬜ Set up Supabase tables (run migrations)
3. ⬜ Create auth pages (login/signup)
4. ⬜ Build dashboard with AuraBackground
5. ⬜ Implement profile setup
6. ⬜ Create AI coach route handler
7. ⬜ Build workout session generator
8. ⬜ Implement live set logger
9. ⬜ Add muscle heatmap
10. ⬜ Create history/export features

---

## 📝 Next Immediate Steps

### When You're Ready to Code:

1. **Create Supabase Migration**
   ```bash
   # In Supabase dashboard → SQL Editor
   # Copy schema from this document
   ```

2. **Set Up Supabase Client**
   ```typescript
   // lib/supabase/client.ts
   import { createBrowserClient } from '@supabase/ssr'
   ```

3. **Build Auth Pages**
   - Use Supabase Auth UI
   - Implement sign-up flow with profile creation

4. **Create Dashboard Layout**
   - AuraBackground component
   - Navigation bar (glassmorphic)
   - Muscle heatmap placeholder

---

## 🎓 Key Technical Decisions

### Why Vercel AI SDK?
- Built-in streaming for real-time AI responses
- Type-safe with TypeScript
- Seamless Next.js integration

### Why Supabase?
- PostgreSQL (production-grade relational DB)
- Built-in auth
- Real-time subscriptions (future: live workout updates)
- RLS for security

### Why Framer Motion?
- Perfect for "aura" animations
- Layout animations for set completion
- Smooth transitions between workout states

---

## 💡 Pro Tips

1. **AI Token Management**: Cache user context in Redis to avoid re-fetching on every AI call
2. **Muscle Map**: Create a `EXERCISE_TO_MUSCLES` object to auto-tag exercises
3. **Form State**: Use React Hook Form for complex workout logging forms
4. **Optimistic UI**: Show set as logged immediately, sync to DB in background
5. **PWA**: Add manifest.json for mobile "install app" capability

---

## 🎯 Success Metrics

- User completes onboarding in < 2 minutes
- AI generates session in < 5 seconds
- Set logging takes < 10 seconds per set
- Muscle heatmap updates in real-time
- Export file generates in < 3 seconds

---

## 🐛 Potential Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| AI generates invalid exercises | Validate against whitelist in `muscle_map.ts` |
| Muscle heatmap SVG complexity | Use library like `react-simple-maps` |
| Large dataset queries (30+ workouts) | Index on `user_id` + `date`, paginate results |
| Mobile responsive heatmap | Use `viewBox` scaling + mobile-first design |
| RIR subjectivity | Show RIR guide: "0 = failure, 3 = 3 more reps" |

---

## 📚 Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [RIR Training Guide](https://www.strongerbyscience.com/rir/)
- [Human Anatomy SVG](https://www.svgrepo.com/vectors/human-body/)

---

**You're ready to build! When you want to start coding, just say the word and we'll begin with Phase 1. 🚀**

