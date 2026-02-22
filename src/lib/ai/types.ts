/**
 * TypeScript Types for AI Coach System
 *
 * Complete type definitions for the AuraStrength AI coaching system.
 * These types ensure type safety across the entire application.
 *
 * @module ai/types
 * @author Lightstack Team
 * @version 0.5.0
 */

// ============================================================================
// User Context Types
// ============================================================================

/**
 * User profile data for AI coaching decisions
 *
 * Contains all user-specific information needed by the AI coach to generate
 * personalized workout recommendations.
 *
 * @interface UserProfile
 * @property {string} userId - Unique identifier from Supabase Auth
 * @property {number} age - User's age in years (used for recovery calculations)
 * @property {number} weight - Current body weight in kilograms
 * @property {number} height - Height in centimeters
 * @property {number} trainingAge - Months of consistent training (affects volume tolerance)
 * @property {string[]} trainingGoals - Goals like 'Muscle Growth', 'Strength', 'Aesthetics'
 * @property {string} splitPreference - Preferred training split (PPL, Upper/Lower, etc.)
 *
 * @example
 * ```typescript
 * const profile: UserProfile = {
 *   userId: 'user_123',
 *   age: 25,
 *   weight: 80,
 *   height: 180,
 *   trainingAge: 24,
 *   trainingGoals: ['Muscle Growth', 'Strength'],
 *   splitPreference: 'PPL'
 * };
 * ```
 */
export interface UserProfile {
  userId: string;
  age: number;
  weight: number; // in lbs
  height: number; // in inches
  trainingAge: number; // months of consistent training
  trainingGoals: string[];
  splitPreference: string; // 'PPL', 'Upper/Lower', 'Full Body', etc.
}

/**
 * Previous workout session data
 *
 * Represents a complete workout session from the user's history.
 * Used by the AI to understand recent training patterns and recovery.
 *
 * @interface PreviousWorkout
 * @property {string} workoutId - Unique workout identifier
 * @property {string} date - ISO 8601 date string (e.g., '2026-02-15')
 * @property {string} workoutType - Type of workout (e.g., 'Chest Day', 'Push Day')
 * @property {PreviousExercise[]} exercises - All exercises performed
 * @property {object} [userFeedback] - Optional end-of-workout feedback
 *
 * @example
 * ```typescript
 * const workout: PreviousWorkout = {
 *   workoutId: 'workout_456',
 *   date: '2026-02-14',
 *   workoutType: 'Chest Day',
 *   exercises: [...],
 *   userFeedback: {
 *     jointHealth: 'Good',
 *     energyLevel: 'High',
 *     overallFeeling: 'Strong session'
 *   }
 * };
 * ```
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
 *
 * Contains all performance data for a single exercise including all sets.
 *
 * @interface PreviousExercise
 * @property {string} exerciseId - Unique exercise identifier
 * @property {string} name - Exercise name (e.g., 'Barbell Bench Press')
 * @property {PreviousSet[]} sets - All sets performed for this exercise
 *
 * @example
 * ```typescript
 * const exercise: PreviousExercise = {
 *   exerciseId: 'ex_789',
 *   name: 'Barbell Bench Press',
 *   sets: [
 *     { weight: 80, reps: 8, rir: 2 },
 *     { weight: 80, reps: 7, rir: 3 }
 *   ]
 * };
 * ```
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
  weight: number; // in lbs
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
  weight: number; // in lbs
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
 * Type of progression action
 */
export type ProgressionAction = 'increase_weight' | 'increase_reps' | 'maintain' | 'deload';

/**
 * Confidence level for progression recommendation
 */
export type ProgressionConfidence = 'high' | 'medium' | 'low';

/**
 * Recommendation for progressing an exercise
 */
export interface ProgressionRecommendation {
  exerciseName: string;
  action: ProgressionAction;
  recommendedWeight?: number;
  recommendedReps: string;
  recommendedRIR: string;
  reasoning: string;
  confidence: ProgressionConfidence;
  previousWeight?: number;
  weightChange?: number;
}

/**
 * Exercise performance from previous workout
 */
export interface ExercisePerformance {
  exerciseName: string;
  date: string;
  sets: Array<{
    weight: number;
    reps: number;
    rir: number;
  }>;
  averageRIR?: number;
  topSet?: {
    weight: number;
    reps: number;
  };
  userFeedback?: string;
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

/**
 * Type guard to check if a value is a valid WorkoutType
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is a valid WorkoutType
 *
 * @example
 * ```typescript
 * if (isValidWorkoutType(userSelection)) {
 *   generateWorkout(userSelection);
 * }
 * ```
 */
export function isValidWorkoutType(value: unknown): value is WorkoutType {
  const validTypes: WorkoutType[] = [
    'Chest Day',
    'Back Day',
    'Leg Day',
    'Shoulder Day',
    'Arm Day',
    'Push Day',
    'Pull Day',
    'Upper Body',
    'Lower Body',
    'Full Body',
  ];
  return typeof value === 'string' && validTypes.includes(value as WorkoutType);
}

/**
 * Type guard to check if a value is a valid MuscleGroup
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is a valid MuscleGroup
 */
export function isValidMuscleGroup(value: unknown): value is MuscleGroup {
  const validMuscles: MuscleGroup[] = [
    'Chest',
    'Front Delts',
    'Side Delts',
    'Rear Delts',
    'Lats',
    'Upper Back',
    'Lower Back',
    'Biceps',
    'Triceps',
    'Forearms',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Abs',
    'Obliques',
  ];
  return typeof value === 'string' && validMuscles.includes(value as MuscleGroup);
}

/**
 * Type guard to check if a value is a valid ProgressionAction
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is a valid ProgressionAction
 */
export function isValidProgressionAction(value: unknown): value is ProgressionAction {
  return (
    typeof value === 'string' &&
    ['increase_weight', 'increase_reps', 'maintain', 'deload'].includes(value)
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse a rep range string into min and max values
 *
 * @param {string} repRange - Rep range string (e.g., '6-8', '10-12')
 * @returns {{ min: number; max: number }} Parsed min and max reps
 *
 * @example
 * ```typescript
 * const { min, max } = parseRepRange('6-8'); // { min: 6, max: 8 }
 * ```
 */
export function parseRepRange(repRange: string): { min: number; max: number } {
  const [min, max] = repRange.split('-').map((r) => parseInt(r.trim()));
  return { min, max };
}

/**
 * Format weight for display in lbs
 *
 * @param {number} weight - Weight in lbs
 * @returns {string} Formatted weight string
 *
 * @example
 * ```typescript
 * formatWeight(185); // '185 lbs'
 * formatWeight(225); // '225 lbs'
 * ```
 */
export function formatWeight(weight: number): string {
  return `${weight} lbs`;
}

/**
 * Calculate average RIR from an array of values
 *
 * @param {number[]} rirValues - Array of RIR values
 * @returns {number} Average RIR rounded to 1 decimal place
 *
 * @example
 * ```typescript
 * calculateAverageRIR([1, 2, 2, 3]); // 2.0
 * ```
 */
export function calculateAverageRIR(rirValues: number[]): number {
  if (rirValues.length === 0) return 0;
  const sum = rirValues.reduce((acc, rir) => acc + rir, 0);
  return Math.round((sum / rirValues.length) * 10) / 10;
}

/**
 * Get muscle group display color for heatmap visualization
 *
 * Returns Tailwind color class based on volume score.
 *
 * @param {number} volumeScore - Volume score (0-100)
 * @returns {string} Tailwind color class
 *
 * @example
 * ```typescript
 * getMuscleColor(80); // 'fill-purple-600' (high volume)
 * getMuscleColor(30); // 'fill-purple-300' (low volume)
 * getMuscleColor(10); // 'fill-slate-700' (minimal volume)
 * ```
 */
export function getMuscleColor(volumeScore: number): string {
  if (volumeScore >= 80) return 'fill-purple-600';
  if (volumeScore >= 60) return 'fill-purple-500';
  if (volumeScore >= 40) return 'fill-purple-400';
  if (volumeScore >= 20) return 'fill-purple-300';
  return 'fill-slate-700';
}

/**
 * Validate workout data completeness
 *
 * Type guard to ensure data matches AIWorkoutResponse interface.
 *
 * @param {unknown} data - Data to validate
 * @returns {boolean} True if data is valid AIWorkoutResponse
 *
 * @example
 * ```typescript
 * const data = await response.json();
 * if (isValidWorkoutData(data)) {
 *   setWorkout(data); // TypeScript knows this is AIWorkoutResponse
 * }
 * ```
 */
export function isValidWorkoutData(data: unknown): data is AIWorkoutResponse {
  if (typeof data !== 'object' || data === null) return false;
  const workout = data as Record<string, unknown>;
  return (
    typeof workout.workoutType === 'string' &&
    Array.isArray(workout.exercises) &&
    typeof workout.summary === 'string'
  );
}

/**
 * Convert kg to lb (legacy conversion helper)
 *
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds (rounded)
 *
 * @example
 * ```typescript
 * kgToLb(80); // 176
 * ```
 */
export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462);
}

/**
 * Convert lb to kg (legacy conversion helper)
 *
 * @param {number} lb - Weight in pounds
 * @returns {number} Weight in kilograms (rounded to nearest 0.5)
 *
 * @example
 * ```typescript
 * lbToKg(176); // 80
 * ```
 */
export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 2) / 2; // Round to nearest 0.5 lbs equivalent
}

/**
 * Convert cm to feet and inches
 *
 * @param {number} cm - Height in centimeters
 * @returns {{ feet: number; inches: number }} Height in imperial units
 *
 * @example
 * ```typescript
 * cmToFeetInches(180); // { feet: 5, inches: 11 }
 * ```
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Convert feet and inches to cm
 *
 * @param {number} feet - Feet
 * @param {number} inches - Inches
 * @returns {number} Height in centimeters
 *
 * @example
 * ```typescript
 * feetInchesToCm(5, 11); // 180
 * ```
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
}
