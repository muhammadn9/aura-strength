/**
 * Data Export Utility
 *
 * Generates CSV exports of workout data and handles archiving.
 */

import { createClient } from '@/lib/supabase/client';

export interface ExportWorkoutData {
  date: string;
  workoutType: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  feedback: string | null;
  isPR: boolean;
}

export interface WorkoutExportResult {
  success: boolean;
  data?: ExportWorkoutData[];
  csvContent?: string;
  error?: string;
  workoutCount?: number;
}

/**
 * Fetch all workout data for export
 */
export async function fetchWorkoutDataForExport(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<WorkoutExportResult> {
  const supabase = createClient();

  let query = supabase
    .from('workouts')
    .select(`
      id,
      date,
      workout_type,
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
    .order('date', { ascending: true });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data: workouts, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  if (!workouts || workouts.length === 0) {
    return { success: true, data: [], workoutCount: 0 };
  }

  const exportData: ExportWorkoutData[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workouts.forEach((workout: any) => {
    const exercises = workout.exercises || [];

    // Sort exercises by order_index
    exercises.sort((a: { order_index: number }, b: { order_index: number }) =>
      (a.order_index || 0) - (b.order_index || 0)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exercises.forEach((exercise: any) => {
      const sets = exercise.sets || [];

      // Sort sets by set_number
      sets.sort((a: { set_number: number }, b: { set_number: number }) =>
        (a.set_number || 0) - (b.set_number || 0)
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sets.forEach((set: any) => {
        exportData.push({
          date: workout.date,
          workoutType: workout.workout_type,
          exerciseName: exercise.name,
          setNumber: set.set_number,
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
          feedback: set.user_set_feedback,
          isPR: set.is_pr || false,
        });
      });
    });
  });

  return {
    success: true,
    data: exportData,
    workoutCount: workouts.length,
  };
}

/**
 * Convert workout data to CSV format
 */
export function convertToCSV(data: ExportWorkoutData[]): string {
  if (data.length === 0) {
    return '';
  }

  // Helper to properly escape CSV fields
  const escapeCsvField = (
    value: string | number | boolean | null | undefined
  ): string => {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);
    const escaped = str.replace(/"/g, '""');
    const needsQuotes = /[",\n\r]/.test(escaped);

    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const headers = [
    'Date',
    'Workout Type',
    'Exercise',
    'Set #',
    'Weight (kg)',
    'Reps',
    'RIR',
    'Feedback',
    'PR',
  ];

  const rows = data.map(row => [
    escapeCsvField(row.date),
    escapeCsvField(row.workoutType),
    escapeCsvField(row.exerciseName),
    escapeCsvField(row.setNumber),
    escapeCsvField(row.weight),
    escapeCsvField(row.reps),
    escapeCsvField(row.rir),
    escapeCsvField(row.feedback),
    escapeCsvField(row.isPR ? 'Yes' : ''),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generate and download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export workout data as CSV
 */
export async function exportWorkoutsToCSV(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<WorkoutExportResult> {
  const result = await fetchWorkoutDataForExport(userId, startDate, endDate);

  if (!result.success || !result.data) {
    return result;
  }

  const csvContent = convertToCSV(result.data);

  // Generate filename with date range
  const today = new Date().toISOString().split('T')[0];
  const filename = startDate && endDate
    ? `aura-strength-export-${startDate}-to-${endDate}.csv`
    : `aura-strength-export-${today}.csv`;

  downloadCSV(csvContent, filename);

  return {
    ...result,
    csvContent,
  };
}

/**
 * Get workout count for a user
 */
export async function getWorkoutCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('workouts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error getting workout count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Archive workouts (move PRs to all_time_prs, delete old data)
 */
export async function archiveAndClearWorkouts(
  userId: string,
  keepPRs: boolean = true
): Promise<{ success: boolean; error?: string; archivedCount?: number }> {
  const supabase = createClient();

  try {
    if (keepPRs) {
      // First, get all PRs that aren't already archived
      const { data: prs, error: prError } = await supabase
        .from('sets')
        .select(`
          weight,
          reps,
          is_pr,
          exercise:exercises!inner (
            name,
            workout:workouts!inner (
              user_id,
              date
            )
          )
        `)
        .eq('is_pr', true);

      if (prError) {
        throw new Error(`Failed to fetch PRs: ${prError.message}`);
      }

      // Filter PRs for this user and insert into all_time_prs
      if (prs && prs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userPRs = prs.filter((pr: any) => {
          const exercise = Array.isArray(pr.exercise) ? pr.exercise[0] : pr.exercise;
          const workout = exercise?.workout;
          const workoutData = Array.isArray(workout) ? workout[0] : workout;
          return workoutData?.user_id === userId;
        });

        if (userPRs.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const prsToArchive = userPRs.map((pr: any) => {
            const exercise = Array.isArray(pr.exercise) ? pr.exercise[0] : pr.exercise;
            const workout = exercise?.workout;
            const workoutData = Array.isArray(workout) ? workout[0] : workout;

            return {
              user_id: userId,
              exercise_name: exercise?.name,
              weight: pr.weight,
              reps: pr.reps,
              date_achieved: workoutData?.date,
            };
          });

          const { error: archiveError } = await supabase
            .from('all_time_prs')
            .insert(prsToArchive);

          if (archiveError) {
            throw new Error(`Failed to archive PRs: ${archiveError.message}`);
          }
        }
      }
    }

    // Delete all workouts for this user (cascades to exercises and sets)
    const { error: deleteError } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Failed to delete workouts: ${deleteError.message}`);
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Archive failed';
    return { success: false, error: message };
  }
}

