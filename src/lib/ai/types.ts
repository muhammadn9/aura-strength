/**
 * TypeScript Types for AI Coach System
 *
 * These types define the structure of data flowing through the AI coaching system,
 * from user context to AI responses to workout generation.
 */

// ============================================================================
// User Context Types
// ============================================================================

/**
 * User profile data needed for AI coaching decisions
 */
export interface UserProfile {
  userId: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  trainingAge: number; // months of consistent training
  trainingGoals: string[];
  splitPreference: string; // 'PPL', 'Upper/Lower', 'Full Body', etc.
}

/**
 * Previous workout session data
 */
export interface PreviousWorkout {
  workoutId: string;
  date: string; // ISO date
  workoutType: string;
  exercises: PreviousExercise[];
  userFeedback?: {
    jointHealth: string;
    energyLevel: string;
    overallFeeling: string;
  };
}

/**
 * Exercise data from a previous session
 */
export interface PreviousExercise {
  exerciseId: string;
  name: string;
  sets: PreviousSet[];
}

/**
 * Individual set data from previous workout
 */
export interface PreviousSet {
  setNumber: number;
  weight: number; // in kg
  reps: number;
  rir: number; // Reps In Reserve (0-5)
  feedback?: string;
  isPR: boolean;
}

/**
 * Personal record for an exercise
 */
export interface PersonalRecord {
  exerciseName: string;
  weight: number; // in kg
  reps: number;
  dateAchieved: string; // ISO date
}

/**
 * Complete context provided to the AI
 */
export interface AIContext {
  userProfile: UserProfile;
  lastTwoWorkouts: PreviousWorkout[];
  personalRecords: PersonalRecord[];
  requestedWorkoutType: string;
}

// ============================================================================
// AI Request/Response Types
// ============================================================================

/**
 * Request sent to the AI API
 */
export interface AIWorkoutRequest {
  workoutType: string; // 'Chest Day', 'Back Day', 'Leg Day', etc.
  userId: string;
  context?: AIContext;
}

/**
 * Response from the AI - structured workout plan
 */
export interface AIWorkoutResponse {
  workoutType: string;
  exercises: AIExercise[];
  summary: string;
  estimatedDuration?: number; // in minutes
}

/**
 * Single exercise in the AI-generated workout
 */
export interface AIExercise {
  name: string;
  muscleGroups: string[];
  sets: number;
  targetReps: string; // '6-8', '10-12', '12-15', etc.
  targetRIR: string; // '0-1', '1-2', '2-3'
  restSeconds: number;
  coachNote: string;
}

// ============================================================================
// Progressive Overload Types
// ============================================================================

/**
 * Recommendation for progressing an exercise
 */
export interface ProgressionRecommendation {
  exerciseName: string;
  recommendedWeight: number;
  recommendedReps: number;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Analysis of previous performance
 */
export interface PerformanceAnalysis {
  exerciseName: string;
  lastWeight: number;
  lastReps: number;
  lastRIR: number;
  formQuality: 'excellent' | 'good' | 'shaky' | 'poor';
  painReported: boolean;
  readyForProgression: boolean;
  recommendation: ProgressionRecommendation;
}

// ============================================================================
// Workout Generation Types
// ============================================================================

/**
 * Saved workout session
 */
export interface WorkoutSession {
  id: string;
  userId: string;
  workoutType: string;
  date: string;
  exercises: Exercise[];
  duration?: number;
  coachSummary?: string;
  userFeedback?: WorkoutFeedback;
}

/**
 * Exercise within a workout session
 */
export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  muscleGroupIds: number[];
  orderIndex: number;
  targetSets: number;
  targetReps: string;
  targetRIR: string;
  restSeconds: number;
  coachNote?: string;
}

/**
 * Individual set logged during workout
 */
export interface ExerciseSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  feedback?: string;
  isPR: boolean;
  recordedAt: string;
}

/**
 * User feedback at end of workout
 */
export interface WorkoutFeedback {
  jointHealth: string;
  energyLevel: string;
  overallFeeling: string;
  notes?: string;
}

// ============================================================================
// Database Types (Supabase)
// ============================================================================

/**
 * Profile row from database
 */
export interface ProfileRow {
  id: string;
  user_id: string;
  age: number;
  height: number;
  weight: number;
  training_age: number;
  training_goals: string[];
  split_preference: string;
  created_at: string;
  updated_at: string;
}

/**
 * Workout row from database
 */
export interface WorkoutRow {
  id: string;
  user_id: string;
  date: string;
  workout_type: string;
  duration_minutes?: number;
  coach_summary_note?: string;
  user_overall_feedback?: string;
  created_at: string;
}

/**
 * Exercise row from database
 */
export interface ExerciseRow {
  id: string;
  workout_id: string;
  name: string;
  muscle_group_id?: number;
  order_index: number;
  target_sets?: number;
  target_reps?: string;
  target_rir?: string;
  rest_seconds?: number;
}

/**
 * Set row from database
 */
export interface SetRow {
  id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  rir: number;
  user_set_feedback?: string;
  is_pr: boolean;
  recorded_at: string;
}

/**
 * Muscle group reference row
 */
export interface MuscleGroupRow {
  id: number;
  name: string;
  svg_path_id: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * RIR (Reps In Reserve) value
 */
export type RIR = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Workout types
 */
export type WorkoutType =
  | 'Chest Day'
  | 'Back Day'
  | 'Leg Day'
  | 'Shoulder Day'
  | 'Arm Day'
  | 'Push Day'
  | 'Pull Day'
  | 'Upper Body'
  | 'Lower Body'
  | 'Full Body';

/**
 * Training split types
 */
export type TrainingSplit =
  | 'PPL' // Push/Pull/Legs
  | 'Upper/Lower'
  | 'Full Body'
  | 'Bro Split'
  | 'Arnold Split';

/**
 * Muscle groups
 */
export type MuscleGroup =
  | 'Chest'
  | 'Front Delts'
  | 'Side Delts'
  | 'Rear Delts'
  | 'Lats'
  | 'Upper Back'
  | 'Lower Back'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Abs'
  | 'Obliques';

/**
 * API Error response
 */
export interface APIError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid RIR
 */
export function isValidRIR(value: number): value is RIR {
  return Number.isInteger(value) && value >= 0 && value <= 5;
}

/**
 * Check if response is an error
 */
export function isAPIError(response: unknown): response is APIError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    'message' in response
  );
}

