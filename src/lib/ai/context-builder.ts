/**
 * AI Context Builder
 *
 * Fetches user data from Supabase and formats it for the AI coach.
 * Handles user profiles, workout history, personal records, and formats
 * everything into the AIContext structure expected by the coach prompt.
 */

import { createClient } from '@/lib/supabase/server';
import type {
  AIContext,
  UserProfile,
  PreviousWorkout,
  PreviousExercise,
  PreviousSet,
  PersonalRecord,
} from './types';

// ============================================================================
// Cache Configuration
// ============================================================================

interface CacheEntry {
  data: AIContext;
  timestamp: number;
}

// Simple in-memory cache (5-minute TTL)
const contextCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get cached context if available and not expired
 */
function getCachedContext(userId: string, workoutType: string): AIContext | null {
  const cacheKey = `${userId}:${workoutType}`;
  const cached = contextCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    contextCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

/**
 * Cache context for future requests
 */
function setCachedContext(userId: string, workoutType: string, context: AIContext): void {
  const cacheKey = `${userId}:${workoutType}`;
  contextCache.set(cacheKey, {
    data: context,
    timestamp: Date.now(),
  });
}

/**
 * Clear cache for a specific user (useful after they complete a workout)
 */
export function clearUserCache(userId: string): void {
  for (const key of contextCache.keys()) {
    if (key.startsWith(userId)) {
      contextCache.delete(key);
    }
  }
}

// ============================================================================
// Main Context Builder
// ============================================================================

/**
 * Build complete AI context for a user and workout type
 *
 * @param userId - User's ID from auth
 * @param requestedWorkoutType - Type of workout (e.g., "Chest Day")
 * @param skipCache - Force refresh, ignore cache
 * @returns Complete AIContext object ready for AI coach
 */
export async function buildAIContext(
  userId: string,
  requestedWorkoutType: string,
  skipCache = false
): Promise<AIContext> {
  // Check cache first (unless skipped)
  if (!skipCache) {
    const cached = getCachedContext(userId, requestedWorkoutType);
    if (cached) {
      console.log(`[Context Builder] Cache hit for ${userId}:${requestedWorkoutType}`);
      return cached;
    }
  }

  console.log(`[Context Builder] Building fresh context for ${userId}:${requestedWorkoutType}`);

  // Fetch all data in parallel
  const [userProfile, lastTwoWorkouts, personalRecords] = await Promise.all([
    fetchUserProfile(userId),
    fetchLastTwoWorkouts(userId, requestedWorkoutType),
    fetchPersonalRecords(userId),
  ]);

  // Build context object
  const context: AIContext = {
    userProfile,
    lastTwoWorkouts,
    personalRecords,
    requestedWorkoutType,
  };

  // Cache for future requests
  setCachedContext(userId, requestedWorkoutType, context);

  return context;
}

// ============================================================================
// User Profile Fetcher
// ============================================================================

/**
 * Fetch user profile from Supabase
 */
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[Context Builder] Error fetching profile:', error);
    // Return default profile for new users
    return {
      userId,
      age: 25,
      weight: 75,
      height: 175,
      trainingAge: 0,
      trainingGoals: ['Build Muscle'],
      splitPreference: 'PPL',
    };
  }

  if (!profile) {
    console.warn('[Context Builder] No profile found for user:', userId);
    return {
      userId,
      age: 25,
      weight: 75,
      height: 175,
      trainingAge: 0,
      trainingGoals: ['Build Muscle'],
      splitPreference: 'PPL',
    };
  }

  return {
    userId: profile.user_id,
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    trainingAge: profile.training_age,
    trainingGoals: profile.training_goals || [],
    splitPreference: profile.split_preference || 'PPL',
  };
}

// ============================================================================
// Workout History Fetcher
// ============================================================================

/**
 * Fetch last 2 workouts of the requested type
 */
async function fetchLastTwoWorkouts(
  userId: string,
  workoutType: string
): Promise<PreviousWorkout[]> {
  const supabase = await createClient();

  // Query workouts with nested exercises and sets
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      id,
      date,
      workout_type,
      user_overall_feedback,
      exercises (
        id,
        name,
        order_index,
        sets (
          set_number,
          weight,
          reps,
          rir,
          user_set_feedback,
          is_pr
        )
      )
    `)
    .eq('user_id', userId)
    .eq('workout_type', workoutType)
    .order('date', { ascending: false })
    .limit(2);

  if (error) {
    console.error('[Context Builder] Error fetching workouts:', error);
    return [];
  }

  if (!workouts || workouts.length === 0) {
    console.log('[Context Builder] No previous workouts found');
    return [];
  }

  // Transform database structure to AIContext structure
  return workouts.map(workout => {
    const exercises: PreviousExercise[] = (workout.exercises || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(exercise => {
        const sets: PreviousSet[] = (exercise.sets || [])
          .sort((a, b) => a.set_number - b.set_number)
          .map(set => ({
            setNumber: set.set_number,
            weight: set.weight,
            reps: set.reps,
            rir: set.rir,
            feedback: set.user_set_feedback || undefined,
            isPR: set.is_pr,
          }));

        return {
          exerciseId: exercise.id,
          name: exercise.name,
          sets,
        };
      });

    // Parse user feedback if available
    let userFeedback;
    if (workout.user_overall_feedback) {
      try {
        const parsed = JSON.parse(workout.user_overall_feedback);
        userFeedback = {
          jointHealth: parsed.jointHealth || 'Good',
          energyLevel: parsed.energyLevel || '7/10',
          overallFeeling: parsed.overallFeeling || 'Normal',
        };
      } catch {
        // If parsing fails, use the string as overall feeling
        userFeedback = {
          jointHealth: 'Unknown',
          energyLevel: 'Unknown',
          overallFeeling: workout.user_overall_feedback,
        };
      }
    }

    return {
      workoutId: workout.id,
      date: workout.date,
      workoutType: workout.workout_type,
      exercises,
      userFeedback,
    };
  });
}

// ============================================================================
// Personal Records Fetcher
// ============================================================================

/**
 * Fetch all personal records for the user
 */
async function fetchPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const supabase = await createClient();

  // Query all-time PRs
  const { data: prs, error } = await supabase
    .from('all_time_prs')
    .select('*')
    .eq('user_id', userId)
    .order('date_achieved', { ascending: false });

  if (error) {
    console.error('[Context Builder] Error fetching PRs:', error);
    return [];
  }

  if (!prs || prs.length === 0) {
    console.log('[Context Builder] No PRs found');
    return [];
  }

  return prs.map(pr => ({
    exerciseName: pr.exercise_name,
    weight: pr.weight,
    reps: pr.reps,
    dateAchieved: pr.date_achieved,
  }));
}

// ============================================================================
// Alternative: Fetch from Recent Sets (if no all_time_prs)
// ============================================================================

/**
 * Calculate PRs from recent workout history if all_time_prs table is empty
 * This is a fallback method
 */
export async function calculatePRsFromHistory(userId: string): Promise<PersonalRecord[]> {
  const supabase = await createClient();

  // Query all sets marked as PRs from recent workouts
  const { data: prSets, error } = await supabase
    .from('sets')
    .select(`
      weight,
      reps,
      recorded_at,
      exercises (
        name,
        workouts (
          user_id
        )
      )
    `)
    .eq('is_pr', true)
    .order('recorded_at', { ascending: false });

  if (error || !prSets) {
    console.error('[Context Builder] Error calculating PRs from history:', error);
    return [];
  }

  // Filter for this user and transform
  const userPRs = prSets
    .filter(set => {
      const exercise = Array.isArray(set.exercises) ? set.exercises[0] : set.exercises;
      const workout = exercise?.workouts?.[0];
      return workout?.user_id === userId;
    })
    .map(set => {
      const exercise = Array.isArray(set.exercises) ? set.exercises[0] : set.exercises;
      return {
        exerciseName: exercise?.name || 'Unknown',
        weight: set.weight,
        reps: set.reps,
        dateAchieved: set.recorded_at,
      };
    });

  // Group by exercise and keep only the best (highest weight × reps)
  const prMap = new Map<string, PersonalRecord>();

  userPRs.forEach(pr => {
    const existing = prMap.get(pr.exerciseName);
    const score = pr.weight * pr.reps;
    const existingScore = existing ? existing.weight * existing.reps : 0;

    if (!existing || score > existingScore) {
      prMap.set(pr.exerciseName, pr);
    }
  });

  return Array.from(prMap.values());
}

// ============================================================================
// Validation & Health Checks
// ============================================================================

/**
 * Validate that the context has sufficient data for AI generation
 */
export function validateContext(context: AIContext): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check user profile
  if (context.userProfile.trainingAge === 0) {
    warnings.push('User is a beginner (training age = 0)');
  }

  // Check workout history
  if (context.lastTwoWorkouts.length === 0) {
    warnings.push('No previous workout history available');
  } else if (context.lastTwoWorkouts.length === 1) {
    warnings.push('Only 1 previous workout available (ideally 2)');
  }

  // Check PRs
  if (context.personalRecords.length === 0) {
    warnings.push('No personal records available');
  }

  // Check if workouts have exercises
  const hasEmptyWorkouts = context.lastTwoWorkouts.some(w => w.exercises.length === 0);
  if (hasEmptyWorkouts) {
    warnings.push('Some previous workouts have no exercises logged');
  }

  // Context is still valid even with warnings
  return {
    valid: true,
    warnings,
  };
}

/**
 * Get a summary of the context for debugging
 */
export function getContextSummary(context: AIContext): string {
  const { userProfile, lastTwoWorkouts, personalRecords, requestedWorkoutType } = context;

  return `
AI Context Summary:
  Workout Type: ${requestedWorkoutType}
  User: ${userProfile.age}y, ${userProfile.weight} lbs, ${userProfile.trainingAge} months training
  Goals: ${userProfile.trainingGoals.join(', ')}
  Previous Workouts: ${lastTwoWorkouts.length}
  Personal Records: ${personalRecords.length}
  ${lastTwoWorkouts.map((w, i) => `
    Session ${i + 1}: ${w.date}
      Exercises: ${w.exercises.length}
      Sets Total: ${w.exercises.reduce((sum, e) => sum + e.sets.length, 0)}
  `).join('')}
  `.trim();
}

// ============================================================================
// Export Main Function
// ============================================================================

export { buildAIContext as default };

