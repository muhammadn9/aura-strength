-- AuraStrength Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  age INTEGER,
  height DECIMAL(5,2),  -- in inches (imperial only)
  weight DECIMAL(5,2),  -- in lbs (imperial only)
  training_age INTEGER, -- months of training
  training_goals TEXT[],
  split_preference TEXT, -- e.g., 'PPL', 'Upper/Lower'
  unit_preference TEXT DEFAULT 'imperial', -- always 'imperial'
  equipment JSONB DEFAULT '{"chest":[],"back":[],"shoulders":[],"arms":[],"legs":[],"core":[]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MUSCLE GROUPS (Reference Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS muscle_groups (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  svg_path_id TEXT NOT NULL -- Links to SVG element IDs
);

-- Pre-populate muscle groups
INSERT INTO muscle_groups (name, svg_path_id) VALUES
  ('Chest', 'chest'),
  ('Front Delts', 'front-delts'),
  ('Quads', 'quads'),
  ('Biceps', 'biceps'),
  ('Lats', 'lats'),
  ('Rear Delts', 'rear-delts'),
  ('Glutes', 'glutes'),
  ('Hamstrings', 'hamstrings'),
  ('Triceps', 'triceps'),
  ('Traps', 'traps'),
  ('Core', 'core'),
  ('Calves', 'calves'),
  ('Forearms', 'forearms')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- WORKOUTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL, -- 'Chest Day', 'Pull Day', etc.
  duration_minutes INTEGER,
  coach_summary_note TEXT,
  user_overall_feedback TEXT, -- Joint health + energy
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXERCISES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  muscle_group_id INTEGER REFERENCES muscle_groups(id),
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps TEXT, -- '8-10' or '12-15'
  target_rir TEXT,  -- '0-1' or '2-3'
  rest_seconds INTEGER
);

-- =====================================================
-- SETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  rir INTEGER NOT NULL, -- 0-5
  user_set_feedback TEXT,
  is_pr BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ALL TIME PRS (Archive)
-- =====================================================
CREATE TABLE IF NOT EXISTS all_time_prs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  date_achieved DATE NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_all_time_prs_user_id ON all_time_prs(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE all_time_prs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- WORKOUTS POLICIES
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- EXERCISES POLICIES
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own exercises"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- SETS POLICIES
CREATE POLICY "Users can view own sets"
  ON sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own sets"
  ON sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sets"
  ON sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sets"
  ON sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

-- ALL TIME PRS POLICIES
CREATE POLICY "Users can view own PRs"
  ON all_time_prs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own PRs"
  ON all_time_prs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- MUSCLE GROUPS - Public read access (no user_id)
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view muscle groups"
  ON muscle_groups FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- View for recent workout summary
CREATE OR REPLACE VIEW recent_workouts_summary AS
SELECT
  w.id,
  w.user_id,
  w.date,
  w.workout_type,
  w.duration_minutes,
  COUNT(DISTINCT e.id) as exercise_count,
  COUNT(s.id) as total_sets,
  SUM(s.weight * s.reps) as total_volume
FROM workouts w
LEFT JOIN exercises e ON e.workout_id = w.id
LEFT JOIN sets s ON s.exercise_id = e.id
GROUP BY w.id, w.user_id, w.date, w.workout_type, w.duration_minutes;

-- View for muscle group volume (last 7 days)
CREATE OR REPLACE VIEW muscle_volume_7d AS
SELECT
  w.user_id,
  mg.id as muscle_group_id,
  mg.name as muscle_group_name,
  COUNT(s.id) as set_count,
  SUM(s.weight * s.reps) as total_volume
FROM workouts w
JOIN exercises e ON e.workout_id = w.id
JOIN sets s ON s.exercise_id = e.id
JOIN muscle_groups mg ON mg.id = e.muscle_group_id
WHERE w.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY w.user_id, mg.id, mg.name;

-- =====================================================
-- MIGRATION: Add equipment column (run if upgrading)
-- =====================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '{"chest":[],"back":[],"shoulders":[],"arms":[],"legs":[],"core":[]}'::jsonb;

-- =====================================================
-- RATE LIMITS TABLE (Distributed rate limiting - refs #63)
-- =====================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL DEFAULT 'coach',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint
  ON rate_limits(user_id, endpoint, requested_at);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate_limits (the check_rate_limit RPC is SECURITY DEFINER)
CREATE POLICY "Service role manages rate limits"
  ON rate_limits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Atomic rate limit check-and-increment function with advisory lock
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_window_start TIMESTAMPTZ,
  p_max_requests INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_allowed BOOLEAN;
  v_lock_key BIGINT;
  v_oldest TIMESTAMPTZ;
BEGIN
  -- Use advisory lock keyed on the user ID to prevent race conditions
  v_lock_key := ('x' || left(replace(p_user_id::text, '-', ''), 15))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Clean up old entries outside the window
  DELETE FROM rate_limits
  WHERE user_id = p_user_id
    AND requested_at < p_window_start;

  -- Count requests and find oldest in the current window
  SELECT COUNT(*), MIN(requested_at) INTO v_count, v_oldest
  FROM rate_limits
  WHERE user_id = p_user_id
    AND requested_at >= p_window_start;

  IF v_count >= p_max_requests THEN
    v_allowed := FALSE;
  ELSE
    -- Insert new request record
    INSERT INTO rate_limits (user_id, endpoint, requested_at)
    VALUES (p_user_id, 'coach', NOW());
    v_count := v_count + 1;
    IF v_oldest IS NULL THEN
      v_oldest := NOW();
    END IF;
    v_allowed := TRUE;
  END IF;

  RETURN json_build_object(
    'allowed', v_allowed,
    'request_count', v_count,
    'oldest_request_at', v_oldest
  );
END;
$$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Lightstack database schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Enable OAuth providers (Google, Apple) in Supabase Authentication settings';
  RAISE NOTICE '2. Configure redirect URLs for your application';
  RAISE NOTICE '3. Test authentication flow';
END $$;

