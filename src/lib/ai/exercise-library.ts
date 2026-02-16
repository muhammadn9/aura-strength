/**
 * Exercise Library
 *
 * Comprehensive database of 50+ exercises with muscle group mappings.
 * Used by the AI coach to generate workouts and populate the muscle heatmap.
 */

import { MuscleGroup } from './types';

// ============================================================================
// Exercise Interface
// ============================================================================

export interface ExerciseDefinition {
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  category: 'Compound' | 'Isolation' | 'Accessory';
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  defaultSets: number;
  defaultRepRange: string;
  defaultRIR: string;
  defaultRestSeconds: number;
  coachingCues: string[];
}

// ============================================================================
// CHEST EXERCISES
// ============================================================================

const CHEST_EXERCISES: ExerciseDefinition[] = [
  {
    name: 'Barbell Bench Press',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps'],
    category: 'Compound',
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultRepRange: '6-8',
    defaultRIR: '1-2',
    defaultRestSeconds: 180,
    coachingCues: [
      'Retract scapula and arch slightly',
      'Lower to mid-chest',
      'Press in slight arc toward face',
      'Keep elbows at 45-degree angle',
    ],
  },
  {
    name: 'Incline Dumbbell Press',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps'],
    category: 'Compound',
    equipment: ['Dumbbells', 'Incline Bench'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: [
      'Set bench to 30-45 degrees',
      'Path slightly toward midline',
      'Full ROM without shoulder pain',
    ],
  },
  {
    name: 'Cable Flyes',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Delts'],
    category: 'Isolation',
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '12-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Keep slight elbow bend', 'Squeeze at peak contraction', 'Slow eccentric'],
  },
  {
    name: 'Push-Ups',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps', 'Abs'],
    category: 'Compound',
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Full body tension', 'Chest to floor', 'Protract scapula at top'],
  },
  {
    name: 'Dumbbell Flyes',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Front Delts'],
    category: 'Isolation',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Slight elbow bend throughout', 'Stretch at bottom', 'Control the weight'],
  },
  {
    name: 'Decline Bench Press',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    category: 'Compound',
    equipment: ['Barbell', 'Decline Bench'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Lower chest emphasis', 'Full ROM', 'Controlled descent'],
  },
  {
    name: 'Chest Dips',
    primaryMuscles: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    category: 'Compound',
    equipment: ['Dip Bar'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-12',
    defaultRIR: '1-2',
    defaultRestSeconds: 120,
    coachingCues: ['Lean forward', 'Elbows out', 'Deep stretch'],
  },
];

// ============================================================================
// BACK EXERCISES
// ============================================================================

const BACK_EXERCISES: ExerciseDefinition[] = [
  {
    name: 'Deadlift',
    primaryMuscles: ['Lower Back', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Lats', 'Upper Back', 'Forearms'],
    category: 'Compound',
    equipment: ['Barbell'],
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultRepRange: '5-6',
    defaultRIR: '2-3',
    defaultRestSeconds: 240,
    coachingCues: [
      'Hip hinge pattern',
      'Neutral spine throughout',
      'Bar close to shins',
      'Drive through heels',
    ],
  },
  {
    name: 'Pull-Ups',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    category: 'Compound',
    equipment: ['Pull-up Bar'],
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultRepRange: '6-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Full hang to full chin over bar', 'Depress scapula', 'Think elbows down'],
  },
  {
    name: 'Barbell Row',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Lower Back'],
    category: 'Compound',
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultRepRange: '8-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Hinge at hips', 'Row to lower chest/upper abs', 'Squeeze at top'],
  },
  {
    name: 'Lat Pulldown',
    primaryMuscles: ['Lats'],
    secondaryMuscles: ['Biceps', 'Upper Back'],
    category: 'Compound',
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '1-2',
    defaultRestSeconds: 120,
    coachingCues: ['Pull to upper chest', 'Lean back slightly', 'Full stretch at top'],
  },
  {
    name: 'Seated Cable Row',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    category: 'Compound',
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Keep chest up', 'Pull to sternum', 'Squeeze shoulder blades'],
  },
  {
    name: 'Face Pulls',
    primaryMuscles: ['Rear Delts', 'Upper Back'],
    secondaryMuscles: ['Side Delts'],
    category: 'Isolation',
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '15-20',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Pull to face level', 'External rotation at end', 'High rep range'],
  },
  {
    name: 'T-Bar Row',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Lower Back'],
    category: 'Compound',
    equipment: ['T-Bar', 'Barbell'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Pull to chest', 'Squeeze hard', 'Stable base'],
  },
  {
    name: 'Single-Arm Dumbbell Row',
    primaryMuscles: ['Lats', 'Upper Back'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    category: 'Compound',
    equipment: ['Dumbbell', 'Bench'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Row to hip', 'Don\'t rotate torso', 'Full stretch'],
  },
  {
    name: 'Chest-Supported Row',
    primaryMuscles: ['Upper Back', 'Lats'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    category: 'Compound',
    equipment: ['Incline Bench', 'Dumbbells'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Chest on bench', 'No momentum', 'Squeeze shoulder blades'],
  },
];

// ============================================================================
// LEG EXERCISES
// ============================================================================

const LEG_EXERCISES: ExerciseDefinition[] = [
  {
    name: 'Barbell Back Squat',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Lower Back', 'Abs'],
    category: 'Compound',
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'Advanced',
    defaultSets: 4,
    defaultRepRange: '6-8',
    defaultRIR: '2-3',
    defaultRestSeconds: 240,
    coachingCues: [
      'Depth to parallel or below',
      'Knees track over toes',
      'Chest up, core braced',
      'Drive through full foot',
    ],
  },
  {
    name: 'Romanian Deadlift',
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Lower Back'],
    category: 'Compound',
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '2-3',
    defaultRestSeconds: 150,
    coachingCues: ['Hinge at hips', 'Slight knee bend', 'Feel hamstring stretch'],
  },
  {
    name: 'Leg Press',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings'],
    category: 'Compound',
    equipment: ['Leg Press Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Full ROM', 'Feet shoulder-width', 'Control the descent'],
  },
  {
    name: 'Bulgarian Split Squat',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings'],
    category: 'Compound',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Upright torso', 'Front knee over ankle', 'Push through front heel'],
  },
  {
    name: 'Leg Curl',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Leg Curl Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '12-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Full ROM', 'Squeeze at peak', 'Control eccentric'],
  },
  {
    name: 'Leg Extension',
    primaryMuscles: ['Quads'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Leg Extension Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '12-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Full extension', 'Slow negative', 'Pause at top'],
  },
  {
    name: 'Walking Lunges',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Hamstrings'],
    category: 'Compound',
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Long stride', 'Back knee almost touches', 'Upright torso'],
  },
  {
    name: 'Calf Raises',
    primaryMuscles: ['Calves'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Calf Raise Machine'],
    difficulty: 'Beginner',
    defaultSets: 4,
    defaultRepRange: '15-20',
    defaultRIR: '1-2',
    defaultRestSeconds: 60,
    coachingCues: ['Full ROM', 'Pause at top', 'Stretch at bottom'],
  },
  {
    name: 'Front Squat',
    primaryMuscles: ['Quads'],
    secondaryMuscles: ['Glutes', 'Abs'],
    category: 'Compound',
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'Advanced',
    defaultSets: 4,
    defaultRepRange: '6-8',
    defaultRIR: '2-3',
    defaultRestSeconds: 210,
    coachingCues: ['Elbows high', 'Upright torso', 'Full depth'],
  },
  {
    name: 'Hack Squat',
    primaryMuscles: ['Quads'],
    secondaryMuscles: ['Glutes'],
    category: 'Compound',
    equipment: ['Hack Squat Machine'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Full ROM', 'Knees forward', 'Control descent'],
  },
  {
    name: 'Nordic Hamstring Curl',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Bodyweight', 'Partner'],
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultRepRange: '5-8',
    defaultRIR: '1-2',
    defaultRestSeconds: 120,
    coachingCues: ['Slow eccentric', 'Full body tension', 'Use assistance if needed'],
  },
  {
    name: 'Goblet Squat',
    primaryMuscles: ['Quads', 'Glutes'],
    secondaryMuscles: ['Abs'],
    category: 'Compound',
    equipment: ['Dumbbell'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Hold dumbbell at chest', 'Squat deep', 'Upright torso'],
  },
];

// ============================================================================
// SHOULDER EXERCISES
// ============================================================================

const SHOULDER_EXERCISES: ExerciseDefinition[] = [
  {
    name: 'Overhead Press',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps', 'Upper Back'],
    category: 'Compound',
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultRepRange: '6-8',
    defaultRIR: '1-2',
    defaultRestSeconds: 180,
    coachingCues: ['Vertical bar path', 'Full lockout', 'Core braced'],
  },
  {
    name: 'Dumbbell Lateral Raise',
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '12-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Slight forward lean', 'Lead with elbows', 'To shoulder height'],
  },
  {
    name: 'Arnold Press',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps'],
    category: 'Compound',
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Start palms facing you', 'Rotate as you press', 'Full ROM'],
  },
  {
    name: 'Rear Delt Fly',
    primaryMuscles: ['Rear Delts'],
    secondaryMuscles: ['Upper Back'],
    category: 'Isolation',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '15-20',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Chest supported', 'Wide arc', 'Squeeze at top'],
  },
  {
    name: 'Front Raise',
    primaryMuscles: ['Front Delts'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '12-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['To eye level', 'Slight bend in elbows', 'Control the descent'],
  },
  {
    name: 'Seated Dumbbell Press',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps'],
    category: 'Compound',
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Back supported', 'Press straight up', 'Full lockout'],
  },
  {
    name: 'Cable Lateral Raise',
    primaryMuscles: ['Side Delts'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '12-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Constant tension', 'Lead with elbow', 'Control both directions'],
  },
  {
    name: 'Upright Row',
    primaryMuscles: ['Side Delts', 'Upper Back'],
    secondaryMuscles: [],
    category: 'Compound',
    equipment: ['Barbell'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Pull to chin', 'Elbows high', 'Wide grip to reduce shoulder stress'],
  },
];

// ============================================================================
// ARM EXERCISES
// ============================================================================

const ARM_EXERCISES: ExerciseDefinition[] = [
  {
    name: 'Barbell Curl',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    category: 'Isolation',
    equipment: ['Barbell'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 120,
    coachingCues: ['No swinging', 'Full ROM', 'Squeeze at top'],
  },
  {
    name: 'Hammer Curl',
    primaryMuscles: ['Biceps', 'Forearms'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Dumbbells'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Neutral grip throughout', 'No elbow movement', 'Control tempo'],
  },
  {
    name: 'Tricep Dips',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Front Delts'],
    category: 'Compound',
    equipment: ['Dip Bar'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-12',
    defaultRIR: '1-2',
    defaultRestSeconds: 120,
    coachingCues: ['Upright torso for triceps', 'Full ROM', 'Don\'t flare elbows'],
  },
  {
    name: 'Overhead Tricep Extension',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Dumbbell'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Keep elbows still', 'Full stretch', 'Squeeze at top'],
  },
  {
    name: 'Cable Tricep Pushdown',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '12-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Elbows tucked', 'Full extension', 'Control return'],
  },
  {
    name: 'Preacher Curl',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    category: 'Isolation',
    equipment: ['Preacher Bench', 'Barbell'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Arm fully supported', 'No momentum', 'Peak contraction'],
  },
  {
    name: 'Close-Grip Bench Press',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Chest', 'Front Delts'],
    category: 'Compound',
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '8-10',
    defaultRIR: '1-2',
    defaultRestSeconds: 150,
    coachingCues: ['Hands shoulder-width', 'Elbows tucked', 'Lower to mid-chest'],
  },
  {
    name: 'Concentration Curl',
    primaryMuscles: ['Biceps'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Dumbbell'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Elbow on thigh', 'Full ROM', 'Squeeze at top'],
  },
  {
    name: 'Skull Crushers',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Barbell', 'Bench'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '10-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 120,
    coachingCues: ['Lower to forehead', 'Elbows stable', 'Full extension'],
  },
];

// ============================================================================
// CORE EXERCISES
// ============================================================================

const CORE_EXERCISES: ExerciseDefinition[] = [
  {
    name: 'Plank',
    primaryMuscles: ['Abs'],
    secondaryMuscles: ['Obliques'],
    category: 'Isolation',
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '30-60s',
    defaultRIR: '2-3',
    defaultRestSeconds: 60,
    coachingCues: ['Neutral spine', 'Full body tension', 'Breathe steadily'],
  },
  {
    name: 'Hanging Leg Raise',
    primaryMuscles: ['Abs'],
    secondaryMuscles: ['Obliques'],
    category: 'Isolation',
    equipment: ['Pull-up Bar'],
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultRepRange: '10-15',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Control swing', 'Legs straight or bent', 'Pause at top'],
  },
  {
    name: 'Cable Crunch',
    primaryMuscles: ['Abs'],
    secondaryMuscles: [],
    category: 'Isolation',
    equipment: ['Cable Machine'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '15-20',
    defaultRIR: '2-3',
    defaultRestSeconds: 60,
    coachingCues: ['Crunch down', 'Squeeze abs', 'Don\'t pull with arms'],
  },
  {
    name: 'Russian Twist',
    primaryMuscles: ['Obliques'],
    secondaryMuscles: ['Abs'],
    category: 'Isolation',
    equipment: ['Dumbbell'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '20-30',
    defaultRIR: '2-3',
    defaultRestSeconds: 60,
    coachingCues: ['Twist fully', 'Controlled movement', 'Keep core engaged'],
  },
  {
    name: 'Ab Wheel Rollout',
    primaryMuscles: ['Abs'],
    secondaryMuscles: ['Lower Back'],
    category: 'Compound',
    equipment: ['Ab Wheel'],
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultRepRange: '8-12',
    defaultRIR: '2-3',
    defaultRestSeconds: 90,
    coachingCues: ['Full extension', 'Maintain neutral spine', 'Control return'],
  },
  {
    name: 'Side Plank',
    primaryMuscles: ['Obliques'],
    secondaryMuscles: ['Abs'],
    category: 'Isolation',
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultRepRange: '30-45s',
    defaultRIR: '2-3',
    defaultRestSeconds: 60,
    coachingCues: ['Stack feet', 'Straight line', 'Hips high'],
  },
];

// ============================================================================
// COMBINED EXERCISE LIBRARY
// ============================================================================

export const EXERCISE_LIBRARY: Record<string, ExerciseDefinition[]> = {
  Chest: CHEST_EXERCISES,
  Back: BACK_EXERCISES,
  Legs: LEG_EXERCISES,
  Shoulders: SHOULDER_EXERCISES,
  Arms: ARM_EXERCISES,
  Core: CORE_EXERCISES,
};

// Flat array of all exercises
export const ALL_EXERCISES: ExerciseDefinition[] = [
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...LEG_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...ARM_EXERCISES,
  ...CORE_EXERCISES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find exercise by name (case-insensitive partial match)
 */
export function findExercise(name: string): ExerciseDefinition | undefined {
  const searchTerm = name.toLowerCase();
  return ALL_EXERCISES.find((ex) => ex.name.toLowerCase().includes(searchTerm));
}

/**
 * Get exercises by primary muscle group
 */
export function getExercisesByMuscle(muscle: MuscleGroup): ExerciseDefinition[] {
  return ALL_EXERCISES.filter((ex) => ex.primaryMuscles.includes(muscle));
}

/**
 * Get all exercises for a workout type
 */
export function getExercisesForWorkoutType(workoutType: string): ExerciseDefinition[] {
  const type = workoutType.toLowerCase();

  if (type.includes('chest')) return CHEST_EXERCISES;
  if (type.includes('back')) return BACK_EXERCISES;
  if (type.includes('leg')) return LEG_EXERCISES;
  if (type.includes('shoulder')) return SHOULDER_EXERCISES;
  if (type.includes('arm')) return ARM_EXERCISES;

  // For push/pull/etc., return combinations
  if (type.includes('push')) {
    return [...CHEST_EXERCISES, ...SHOULDER_EXERCISES, ...ARM_EXERCISES.slice(2, 5)]; // Tricep exercises
  }

  if (type.includes('pull')) {
    return [...BACK_EXERCISES, ...ARM_EXERCISES.slice(0, 2)]; // Bicep exercises
  }

  // Default: return all
  return ALL_EXERCISES;
}

/**
 * Get all muscle groups worked by an exercise
 */
export function getMusclesWorked(exerciseName: string): MuscleGroup[] {
  const exercise = findExercise(exerciseName);
  if (!exercise) return [];
  return [...exercise.primaryMuscles, ...exercise.secondaryMuscles];
}

/**
 * Calculate volume contribution for muscle heatmap
 * Returns muscle group -> volume score mapping
 */
export function calculateMuscleVolume(
  exercises: Array<{ name: string; sets: number; reps: number }>
): Record<string, number> {
  const volumeMap: Record<string, number> = {};

  exercises.forEach((ex) => {
    const definition = findExercise(ex.name);
    if (!definition) return;

    const totalVolume = ex.sets * ex.reps;

    // Primary muscles get full volume
    definition.primaryMuscles.forEach((muscle) => {
      volumeMap[muscle] = (volumeMap[muscle] || 0) + totalVolume;
    });

    // Secondary muscles get 50% volume
    definition.secondaryMuscles.forEach((muscle) => {
      volumeMap[muscle] = (volumeMap[muscle] || 0) + totalVolume * 0.5;
    });
  });

  return volumeMap;
}

