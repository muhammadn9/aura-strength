/**
 * Workout Session Types
 *
 * Types for managing active workout sessions
 */

export interface SessionExercise {
  id: string;
  name: string;
  muscleGroups: string[];
  targetSets: number;
  targetReps: string;
  targetRIR: string;
  restSeconds: number;
  coachNote: string;
  completedSets: SessionSet[];
  order: number;
}

export interface SessionSet {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  completed: boolean;
  timestamp: Date;
  feedback?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutType: string;
  startTime: Date;
  currentExerciseIndex: number;
  currentSetIndex: number;
  status: 'active' | 'paused' | 'completed';
  exercises: SessionExercise[];
  overallFeedback?: string;
}

export type SessionStatus = 'active' | 'paused' | 'completed';

