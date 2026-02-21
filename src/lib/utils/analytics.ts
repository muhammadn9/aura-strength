/**
 * Analytics Utility
 *
 * Calculates workout statistics, streaks, and improvements.
 */

import { createClient } from '@/lib/supabase/client';

export interface WorkoutStats {
  totalWorkouts: number;
  totalWorkoutsThisMonth: number;
  totalWorkoutsThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutDuration: number;
  totalVolume: number;
  averageWorkoutsPerWeek: number;
}

export interface ExerciseImprovement {
  exerciseName: string;
  firstWeight: number;
  currentWeight: number;
  improvementPercent: number;
  firstDate: string;
  latestDate: string;
}

export interface VolumeByWeek {
  weekStart: string;
  totalVolume: number;
  totalSets: number;
  workoutCount: number;
}

/**
 * Get basic workout statistics
 */
export async function getWorkoutStats(userId: string): Promise<WorkoutStats> {
  const supabase = createClient();

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Fetch all workouts
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('id, date, duration_minutes')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error || !workouts) {
    console.error('Error fetching workout stats:', error);
    return {
      totalWorkouts: 0,
      totalWorkoutsThisMonth: 0,
      totalWorkoutsThisWeek: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageWorkoutDuration: 0,
      totalVolume: 0,
      averageWorkoutsPerWeek: 0,
    };
  }

  const totalWorkouts = workouts.length;

  // Count workouts this week and month
  const thisWeekWorkouts = workouts.filter(w =>
    new Date(w.date) >= startOfWeek
  );
  const thisMonthWorkouts = workouts.filter(w =>
    new Date(w.date) >= startOfMonth
  );

  // Calculate average duration
  const durationsWithValue = workouts.filter(w => w.duration_minutes && w.duration_minutes > 0);
  const averageWorkoutDuration = durationsWithValue.length > 0
    ? Math.round(durationsWithValue.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / durationsWithValue.length)
    : 0;

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(workouts.map(w => w.date));

  // Calculate average workouts per week
  if (workouts.length > 0) {
    const firstWorkout = new Date(workouts[0].date);
    const weeksSinceFirst = Math.max(1, Math.ceil((today.getTime() - firstWorkout.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const averageWorkoutsPerWeek = Math.round((totalWorkouts / weeksSinceFirst) * 10) / 10;

    return {
      totalWorkouts,
      totalWorkoutsThisMonth: thisMonthWorkouts.length,
      totalWorkoutsThisWeek: thisWeekWorkouts.length,
      currentStreak,
      longestStreak,
      averageWorkoutDuration,
      totalVolume: 0, // Will be calculated separately
      averageWorkoutsPerWeek,
    };
  }

  return {
    totalWorkouts: 0,
    totalWorkoutsThisMonth: 0,
    totalWorkoutsThisWeek: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageWorkoutDuration: 0,
    totalVolume: 0,
    averageWorkoutsPerWeek: 0,
  };
}

/**
 * Calculate workout streaks
 */
function calculateStreaks(dates: string[]): { currentStreak: number; longestStreak: number } {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort dates and remove duplicates
  const uniqueDates = [...new Set(dates)].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if last workout was today or yesterday (streak is active)
  const lastWorkoutDate = new Date(uniqueDates[uniqueDates.length - 1]);
  lastWorkoutDate.setHours(0, 0, 0, 0);

  const isStreakActive = lastWorkoutDate.getTime() === today.getTime() ||
                         lastWorkoutDate.getTime() === yesterday.getTime();

  // Calculate longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const prevDate = new Date(uniqueDates[i - 1]);

    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Current streak (from most recent working backwards)
  if (isStreakActive) {
    currentStreak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const currentDate = new Date(uniqueDates[i + 1]);
      const prevDate = new Date(uniqueDates[i]);

      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Get exercise improvements (comparing first vs latest)
 */
export async function getExerciseImprovements(
  userId: string,
  limit: number = 5
): Promise<ExerciseImprovement[]> {
  const supabase = createClient();

  // Get all exercises with their sets, ordered by date
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      date,
      exercises (
        name,
        sets (
          weight,
          reps
        )
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error || !workouts) {
    console.error('Error fetching exercise improvements:', error);
    return [];
  }

  // Track first and last weight for each exercise
  const exerciseData: Record<string, {
    firstWeight: number;
    firstDate: string;
    currentWeight: number;
    latestDate: string;
  }> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workouts.forEach((workout: any) => {
    const exercises = workout.exercises || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exercises.forEach((exercise: any) => {
      const exerciseName = exercise.name.toLowerCase().trim();
      const sets = exercise.sets || [];

      // Get max weight for this workout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxWeight = Math.max(...sets.map((s: any) => s.weight || 0));

      if (maxWeight > 0) {
        if (!exerciseData[exerciseName]) {
          exerciseData[exerciseName] = {
            firstWeight: maxWeight,
            firstDate: workout.date,
            currentWeight: maxWeight,
            latestDate: workout.date,
          };
        } else {
          exerciseData[exerciseName].currentWeight = maxWeight;
          exerciseData[exerciseName].latestDate = workout.date;
        }
      }
    });
  });

  // Calculate improvements and sort
  const improvements: ExerciseImprovement[] = Object.entries(exerciseData)
    .map(([name, data]) => ({
      exerciseName: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      firstWeight: data.firstWeight,
      currentWeight: data.currentWeight,
      improvementPercent: data.firstWeight > 0
        ? Math.round(((data.currentWeight - data.firstWeight) / data.firstWeight) * 100)
        : 0,
      firstDate: data.firstDate,
      latestDate: data.latestDate,
    }))
    .filter(imp => imp.improvementPercent > 0 && imp.firstDate !== imp.latestDate)
    .sort((a, b) => b.improvementPercent - a.improvementPercent)
    .slice(0, limit);

  return improvements;
}

/**
 * Get weekly volume trends
 */
export async function getWeeklyVolumeTrends(
  userId: string,
  weeks: number = 4
): Promise<VolumeByWeek[]> {
  const supabase = createClient();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select(`
      date,
      exercises (
        sets (
          weight,
          reps
        )
      )
    `)
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error || !workouts) {
    console.error('Error fetching volume trends:', error);
    return [];
  }

  // Group by week
  const weeklyData: Record<string, VolumeByWeek> = {};

  // Initialize weeks
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(endDate);
    weekStart.setDate(endDate.getDate() - ((weeks - 1 - i) * 7));
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

    const weekKey = weekStart.toISOString().split('T')[0];
    weeklyData[weekKey] = {
      weekStart: weekKey,
      totalVolume: 0,
      totalSets: 0,
      workoutCount: 0,
    };
  }

  // Process workouts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workouts.forEach((workout: any) => {
    const workoutDate = new Date(workout.date);
    const weekStart = new Date(workoutDate);
    weekStart.setDate(workoutDate.getDate() - workoutDate.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (weeklyData[weekKey]) {
      weeklyData[weekKey].workoutCount++;

      const exercises = workout.exercises || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exercises.forEach((exercise: any) => {
        const sets = exercise.sets || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sets.forEach((set: any) => {
          if (set.weight && set.reps) {
            weeklyData[weekKey].totalVolume += set.weight * set.reps;
            weeklyData[weekKey].totalSets++;
          }
        });
      });
    }
  });

  return Object.values(weeklyData).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

