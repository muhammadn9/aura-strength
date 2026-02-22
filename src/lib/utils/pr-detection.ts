/**
 * PR Detection Utility
 *
 * Detects Personal Records in real-time during workout sessions.
 * A PR can be detected based on:
 * 1. Weight PR: Highest weight for a given exercise at any rep count
 * 2. Volume PR: Highest weight × reps combination
 * 3. Rep PR: Most reps at a given weight
 */

import { createClient } from '@/lib/supabase/client';

export interface PRRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  dateAchieved: string;
}

export interface PRCheckResult {
  isPR: boolean;
  prType: 'weight' | 'volume' | 'reps' | null;
  previousBest: PRRecord | null;
  improvement: string | null;
}

/**
 * Fetch the user's PR history for a specific exercise.
 * Returns all historical sets for this exercise (both from all_time_prs and past workout sets).
 */
export async function getExercisePRs(
  exerciseName: string,
  userId: string
): Promise<PRRecord[]> {
  const supabase = createClient();
  const prs: PRRecord[] = [];

  // Check all_time_prs table
  const { data: archivedPRs, error: archivedError } = await supabase
    .from('all_time_prs')
    .select('exercise_name, weight, reps, date_achieved')
    .eq('user_id', userId)
    .ilike('exercise_name', exerciseName);

  if (archivedError) {
    console.error('Error fetching archived PRs:', archivedError);
  }

  if (archivedPRs) {
    archivedPRs.forEach(pr => {
      prs.push({
        exerciseName: pr.exercise_name,
        weight: pr.weight,
        reps: pr.reps,
        dateAchieved: pr.date_achieved,
      });
    });
  }

  // Fetch ALL historical sets for this exercise from past workouts (not just ones marked is_pr)
  // Filter by user and exercise name at the database level for performance
  const { data: historicalSets, error: histError } = await supabase
    .from('sets')
    .select(`
      weight,
      reps,
      exercise:exercises!inner (
        name,
        workout:workouts!inner (
          user_id,
          date
        )
      )
    `)
    .eq('exercise.workout.user_id', userId)
    .ilike('exercise.name', exerciseName);

  if (histError) {
    console.error('Error fetching historical sets:', histError);
  }

  if (historicalSets) {
    const normalizedExerciseName = exerciseName.trim().toLowerCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    historicalSets.forEach((set: any) => {
      const exercise = Array.isArray(set.exercise) ? set.exercise[0] : set.exercise;
      const workout = exercise?.workout;
      const workoutData = Array.isArray(workout) ? workout[0] : workout;
      const dbExerciseName = exercise?.name?.trim().toLowerCase();

      if (
        workoutData?.user_id === userId &&
        dbExerciseName === normalizedExerciseName
      ) {
        prs.push({
          exerciseName: exercise.name,
          weight: set.weight,
          reps: set.reps,
          dateAchieved: workoutData.date,
        });
      }
    });
  }

  return prs;
}

/**
 * Check if a set is a PR compared to previous history.
 * Only flags a PR when the current set EXCEEDS historical bests.
 * First-time exercises are NOT automatically PRs — user needs actual history.
 */
export function checkForPR(
  weight: number,
  reps: number,
  previousPRs: PRRecord[]
): PRCheckResult {
  // No history = no PR. Users need at least one past workout to earn a PR.
  if (previousPRs.length === 0) {
    return {
      isPR: false,
      prType: null,
      previousBest: null,
      improvement: null,
    };
  }

  const currentVolume = weight * reps;

  // Find best weight at any rep count
  const bestWeight = Math.max(...previousPRs.map(pr => pr.weight));

  // Find best volume (weight × reps)
  const bestVolume = Math.max(...previousPRs.map(pr => pr.weight * pr.reps));
  const bestVolumeRecord = previousPRs.find(
    pr => pr.weight * pr.reps === bestVolume
  );

  // Find best reps at this specific weight
  const bestRepsAtWeight = previousPRs
    .filter(pr => pr.weight === weight)
    .reduce((max, pr) => Math.max(max, pr.reps), 0);

  // Check for weight PR (heaviest ever) — must strictly exceed
  if (weight > bestWeight) {
    const improvement = `+${(weight - bestWeight).toFixed(1)} lbs heavier than your previous best!`;
    return {
      isPR: true,
      prType: 'weight',
      previousBest: previousPRs.find(pr => pr.weight === bestWeight) || null,
      improvement,
    };
  }

  // Check for volume PR (most total work) — must strictly exceed
  if (currentVolume > bestVolume) {
    const volumeIncrease = ((currentVolume - bestVolume) / bestVolume * 100).toFixed(0);
    const improvement = `+${volumeIncrease}% more volume than your previous best!`;
    return {
      isPR: true,
      prType: 'volume',
      previousBest: bestVolumeRecord || null,
      improvement,
    };
  }

  // Check for rep PR at this weight (if user has done this weight before)
  if (bestRepsAtWeight > 0 && reps > bestRepsAtWeight) {
    const improvement = `+${reps - bestRepsAtWeight} more reps at ${weight} lbs!`;
    return {
      isPR: true,
      prType: 'reps',
      previousBest: previousPRs.find(pr => pr.weight === weight && pr.reps === bestRepsAtWeight) || null,
      improvement,
    };
  }

  return {
    isPR: false,
    prType: null,
    previousBest: null,
    improvement: null,
  };
}

/**
 * Calculate the "estimated 1RM" using Brzycki formula
 * Useful for comparing PRs across different rep ranges
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return weight * (1 + reps / 30); // Less accurate for high reps
  return weight * (36 / (37 - reps));
}

/**
 * Get a formatted string describing the PR type
 */
export function getPRTypeLabel(prType: 'weight' | 'volume' | 'reps'): string {
  switch (prType) {
    case 'weight':
      return '🏆 WEIGHT PR';
    case 'volume':
      return '💪 VOLUME PR';
    case 'reps':
      return '🔥 REP PR';
    default:
      return '🎉 NEW PR';
  }
}
