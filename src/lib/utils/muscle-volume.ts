/**
 * Muscle Volume Calculation Utility
 *
 * Calculates training volume per muscle group from workout history.
 * Used to drive the muscle heatmap visualization.
 */

import { createClient } from '@/lib/supabase/client';

export interface MuscleVolumeData {
  muscleGroup: string;
  totalSets: number;
  totalVolume: number; // weight × reps
  lastWorked: string | null;
  intensity: number; // 0-100 scale for heatmap opacity
}

export interface VolumeByMuscle {
  [muscleGroup: string]: MuscleVolumeData;
}

// Exercise to muscle group mapping
export const EXERCISE_MUSCLE_MAP: Record<string, string[]> = {
  // Chest
  'bench press': ['Chest', 'Front Delts', 'Triceps'],
  'incline bench press': ['Chest', 'Front Delts', 'Triceps'],
  'dumbbell press': ['Chest', 'Front Delts', 'Triceps'],
  'incline dumbbell press': ['Chest', 'Front Delts', 'Triceps'],
  'chest fly': ['Chest'],
  'cable fly': ['Chest'],
  'push-up': ['Chest', 'Front Delts', 'Triceps'],
  'dips': ['Chest', 'Triceps', 'Front Delts'],

  // Back
  'pull-up': ['Lats', 'Biceps', 'Rear Delts'],
  'chin-up': ['Lats', 'Biceps'],
  'lat pulldown': ['Lats', 'Biceps'],
  'barbell row': ['Lats', 'Rear Delts', 'Biceps', 'Traps'],
  'dumbbell row': ['Lats', 'Rear Delts', 'Biceps'],
  'cable row': ['Lats', 'Rear Delts', 'Biceps'],
  'seated row': ['Lats', 'Rear Delts', 'Biceps'],
  't-bar row': ['Lats', 'Rear Delts', 'Traps'],
  'deadlift': ['Lats', 'Glutes', 'Hamstrings', 'Traps', 'Core'],
  'face pull': ['Rear Delts', 'Traps'],

  // Shoulders
  'overhead press': ['Front Delts', 'Triceps'],
  'military press': ['Front Delts', 'Triceps'],
  'dumbbell shoulder press': ['Front Delts', 'Triceps'],
  'lateral raise': ['Front Delts'],
  'front raise': ['Front Delts'],
  'rear delt fly': ['Rear Delts'],
  'shrugs': ['Traps'],

  // Arms
  'bicep curl': ['Biceps'],
  'hammer curl': ['Biceps', 'Forearms'],
  'preacher curl': ['Biceps'],
  'tricep pushdown': ['Triceps'],
  'tricep extension': ['Triceps'],
  'skull crusher': ['Triceps'],
  'close grip bench': ['Triceps', 'Chest'],
  'wrist curl': ['Forearms'],

  // Legs
  'squat': ['Quads', 'Glutes', 'Core'],
  'back squat': ['Quads', 'Glutes', 'Core'],
  'front squat': ['Quads', 'Core'],
  'leg press': ['Quads', 'Glutes'],
  'leg extension': ['Quads'],
  'leg curl': ['Hamstrings'],
  'romanian deadlift': ['Hamstrings', 'Glutes'],
  'stiff leg deadlift': ['Hamstrings', 'Glutes'],
  'hip thrust': ['Glutes', 'Hamstrings'],
  'lunge': ['Quads', 'Glutes'],
  'bulgarian split squat': ['Quads', 'Glutes'],
  'calf raise': ['Calves'],
  'seated calf raise': ['Calves'],

  // Core
  'plank': ['Core'],
  'crunch': ['Core'],
  'leg raise': ['Core'],
  'ab wheel': ['Core'],
  'cable crunch': ['Core'],
  'russian twist': ['Core'],
};

/**
 * Get muscle groups for an exercise name (fuzzy matching)
 */
export function getMuscleGroupsForExercise(exerciseName: string): string[] {
  const normalizedName = exerciseName.toLowerCase().trim();

  // Direct match
  if (EXERCISE_MUSCLE_MAP[normalizedName]) {
    return EXERCISE_MUSCLE_MAP[normalizedName];
  }

  // Partial match
  for (const [exercise, muscles] of Object.entries(EXERCISE_MUSCLE_MAP)) {
    if (normalizedName.includes(exercise) || exercise.includes(normalizedName)) {
      return muscles;
    }
  }

  // Default fallback based on common keywords
  if (normalizedName.includes('chest') || normalizedName.includes('press') && !normalizedName.includes('leg')) {
    return ['Chest'];
  }
  if (normalizedName.includes('back') || normalizedName.includes('row') || normalizedName.includes('pull')) {
    return ['Lats'];
  }
  if (normalizedName.includes('shoulder') || normalizedName.includes('delt')) {
    return ['Front Delts'];
  }
  if (normalizedName.includes('bicep') || normalizedName.includes('curl')) {
    return ['Biceps'];
  }
  if (normalizedName.includes('tricep')) {
    return ['Triceps'];
  }
  if (normalizedName.includes('squat') || normalizedName.includes('leg') || normalizedName.includes('quad')) {
    return ['Quads'];
  }
  if (normalizedName.includes('ham') || normalizedName.includes('rdl')) {
    return ['Hamstrings'];
  }
  if (normalizedName.includes('glute') || normalizedName.includes('hip')) {
    return ['Glutes'];
  }
  if (normalizedName.includes('calf') || normalizedName.includes('calves')) {
    return ['Calves'];
  }
  if (normalizedName.includes('core') || normalizedName.includes('ab')) {
    return ['Core'];
  }

  return ['Core']; // Default fallback
}

/**
 * Fetch volume data for last N days for a user
 */
export async function getMuscleVolumeData(
  userId: string,
  days: number = 7
): Promise<VolumeByMuscle> {
  const supabase = createClient();

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Fetch workouts with exercises and sets
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      id,
      date,
      exercises (
        id,
        name,
        sets (
          weight,
          reps
        )
      )
    `)
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDateStr)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching muscle volume data:', error);
    return {};
  }

  // Initialize volume tracking
  const volumeData: VolumeByMuscle = {};
  const allMuscles = [
    'Chest', 'Front Delts', 'Quads', 'Biceps', 'Lats', 'Rear Delts',
    'Glutes', 'Hamstrings', 'Triceps', 'Traps', 'Core', 'Calves', 'Forearms'
  ];

  allMuscles.forEach(muscle => {
    volumeData[muscle] = {
      muscleGroup: muscle,
      totalSets: 0,
      totalVolume: 0,
      lastWorked: null,
      intensity: 0,
    };
  });

  // Process workouts
  if (workouts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workouts.forEach((workout: any) => {
      const exercises = workout.exercises || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exercises.forEach((exercise: any) => {
        const muscleGroups = getMuscleGroupsForExercise(exercise.name);
        const sets = exercise.sets || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sets.forEach((set: any) => {
          if (set.weight && set.reps) {
            const volume = set.weight * set.reps;

            muscleGroups.forEach(muscle => {
              if (volumeData[muscle]) {
                volumeData[muscle].totalSets += 1;
                volumeData[muscle].totalVolume += volume;

                // Track last worked date
                if (!volumeData[muscle].lastWorked || workout.date > volumeData[muscle].lastWorked) {
                  volumeData[muscle].lastWorked = workout.date;
                }
              }
            });
          }
        });
      });
    });
  }

  // Calculate intensity (0-100) based on sets
  // Max sets per muscle group per week = ~20 for trained individuals
  const maxSetsPerWeek = 20;

  Object.values(volumeData).forEach(data => {
    data.intensity = Math.min(100, Math.round((data.totalSets / maxSetsPerWeek) * 100));
  });

  return volumeData;
}

/**
 * Get a summary of muscle volume for display
 */
export function getVolumeSummary(volumeData: VolumeByMuscle): {
  totalSets: number;
  totalVolume: number;
  mostWorkedMuscle: string | null;
  leastWorkedMuscle: string | null;
} {
  let totalSets = 0;
  let totalVolume = 0;
  let mostWorkedMuscle: string | null = null;
  let leastWorkedMuscle: string | null = null;
  let maxSets = 0;
  let minSets = Infinity;

  Object.values(volumeData).forEach(data => {
    totalSets += data.totalSets;
    totalVolume += data.totalVolume;

    if (data.totalSets > maxSets) {
      maxSets = data.totalSets;
      mostWorkedMuscle = data.muscleGroup;
    }

    if (data.totalSets < minSets && data.totalSets > 0) {
      minSets = data.totalSets;
      leastWorkedMuscle = data.muscleGroup;
    }
  });

  return {
    totalSets,
    totalVolume: Math.round(totalVolume),
    mostWorkedMuscle,
    leastWorkedMuscle,
  };
}

