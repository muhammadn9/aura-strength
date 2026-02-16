/**
 * Tests for Exercise Library
 */

import {
  ALL_EXERCISES,
  EXERCISE_LIBRARY,
  findExercise,
  getExercisesByMuscle,
  getExercisesForWorkoutType,
  getMusclesWorked,
  calculateMuscleVolume,
} from '@/lib/ai/exercise-library';

describe('Exercise Library', () => {
  describe('ALL_EXERCISES', () => {
    it('should contain 50+ exercises', () => {
      expect(ALL_EXERCISES.length).toBeGreaterThanOrEqual(50);
    });

    it('should have valid structure for each exercise', () => {
      ALL_EXERCISES.forEach((exercise) => {
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('primaryMuscles');
        expect(exercise).toHaveProperty('secondaryMuscles');
        expect(exercise).toHaveProperty('category');
        expect(exercise).toHaveProperty('equipment');
        expect(exercise).toHaveProperty('difficulty');
        expect(exercise).toHaveProperty('defaultSets');
        expect(exercise).toHaveProperty('defaultRepRange');
        expect(exercise).toHaveProperty('coachingCues');
      });
    });

    it('should have unique exercise names', () => {
      const names = ALL_EXERCISES.map((ex) => ex.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('EXERCISE_LIBRARY', () => {
    it('should contain all muscle group categories', () => {
      expect(EXERCISE_LIBRARY).toHaveProperty('Chest');
      expect(EXERCISE_LIBRARY).toHaveProperty('Back');
      expect(EXERCISE_LIBRARY).toHaveProperty('Legs');
      expect(EXERCISE_LIBRARY).toHaveProperty('Shoulders');
      expect(EXERCISE_LIBRARY).toHaveProperty('Arms');
      expect(EXERCISE_LIBRARY).toHaveProperty('Core');
    });

    it('should have exercises in each category', () => {
      Object.values(EXERCISE_LIBRARY).forEach((exercises) => {
        expect(exercises.length).toBeGreaterThan(0);
      });
    });
  });

  describe('findExercise', () => {
    it('should find exercise by exact name', () => {
      const exercise = findExercise('Barbell Bench Press');

      expect(exercise).toBeDefined();
      expect(exercise?.name).toBe('Barbell Bench Press');
    });

    it('should find exercise by partial name (case-insensitive)', () => {
      const exercise = findExercise('bench');

      expect(exercise).toBeDefined();
      expect(exercise?.name.toLowerCase()).toContain('bench');
    });

    it('should return undefined for non-existent exercise', () => {
      const exercise = findExercise('NonExistent Exercise');

      expect(exercise).toBeUndefined();
    });
  });

  describe('getExercisesByMuscle', () => {
    it('should return exercises for chest', () => {
      const exercises = getExercisesByMuscle('Chest');

      expect(exercises.length).toBeGreaterThan(0);
      exercises.forEach((ex) => {
        expect(ex.primaryMuscles).toContain('Chest');
      });
    });

    it('should return exercises for biceps', () => {
      const exercises = getExercisesByMuscle('Biceps');

      expect(exercises.length).toBeGreaterThan(0);
      exercises.forEach((ex) => {
        expect(ex.primaryMuscles).toContain('Biceps');
      });
    });

    it('should return empty array for invalid muscle', () => {
      const exercises = getExercisesByMuscle('InvalidMuscle' as any);

      expect(exercises).toEqual([]);
    });
  });

  describe('getExercisesForWorkoutType', () => {
    it('should return chest exercises for "Chest Day"', () => {
      const exercises = getExercisesForWorkoutType('Chest Day');

      expect(exercises.length).toBeGreaterThan(0);
      expect(exercises[0].primaryMuscles).toContain('Chest');
    });

    it('should return back exercises for "Back Day"', () => {
      const exercises = getExercisesForWorkoutType('Back Day');

      expect(exercises.length).toBeGreaterThan(0);
    });

    it('should return push exercises for "Push Day"', () => {
      const exercises = getExercisesForWorkoutType('Push Day');

      expect(exercises.length).toBeGreaterThan(0);
      // Should include chest, shoulders, and triceps exercises
    });

    it('should return pull exercises for "Pull Day"', () => {
      const exercises = getExercisesForWorkoutType('Pull Day');

      expect(exercises.length).toBeGreaterThan(0);
      // Should include back and biceps exercises
    });

    it('should return all exercises for unknown type', () => {
      const exercises = getExercisesForWorkoutType('Unknown Day');

      expect(exercises.length).toBe(ALL_EXERCISES.length);
    });
  });

  describe('getMusclesWorked', () => {
    it('should return all muscles for an exercise', () => {
      const muscles = getMusclesWorked('Barbell Bench Press');

      expect(muscles).toContain('Chest');
      expect(muscles).toContain('Triceps');
      expect(muscles).toContain('Front Delts');
    });

    it('should return empty array for non-existent exercise', () => {
      const muscles = getMusclesWorked('NonExistent Exercise');

      expect(muscles).toEqual([]);
    });
  });

  describe('calculateMuscleVolume', () => {
    it('should calculate volume correctly', () => {
      const exercises = [
        { name: 'Barbell Bench Press', sets: 4, reps: 8 },
        { name: 'Dumbbell Flyes', sets: 3, reps: 12 },
      ];

      const volume = calculateMuscleVolume(exercises);

      expect(volume).toHaveProperty('Chest');
      expect(volume['Chest']).toBeGreaterThan(0);
    });

    it('should give full volume to primary muscles', () => {
      const exercises = [{ name: 'Barbell Bench Press', sets: 4, reps: 8 }];

      const volume = calculateMuscleVolume(exercises);

      // Chest is primary, should get full 32 volume (4 sets × 8 reps)
      expect(volume['Chest']).toBe(32);
    });

    it('should give 50% volume to secondary muscles', () => {
      const exercises = [{ name: 'Barbell Bench Press', sets: 4, reps: 8 }];

      const volume = calculateMuscleVolume(exercises);

      // Triceps is secondary, should get 50% volume
      expect(volume['Triceps']).toBe(16); // 32 * 0.5
    });

    it('should accumulate volume across multiple exercises', () => {
      const exercises = [
        { name: 'Barbell Bench Press', sets: 4, reps: 8 },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
      ];

      const volume = calculateMuscleVolume(exercises);

      // Both exercises hit chest, volume should accumulate
      expect(volume['Chest']).toBe(62); // 32 + 30
    });

    it('should handle unknown exercises gracefully', () => {
      const exercises = [
        { name: 'Unknown Exercise', sets: 4, reps: 8 },
      ];

      const volume = calculateMuscleVolume(exercises);

      expect(Object.keys(volume).length).toBe(0);
    });
  });

  describe('Exercise Properties', () => {
    it('should have coaching cues for all exercises', () => {
      ALL_EXERCISES.forEach((exercise) => {
        expect(exercise.coachingCues).toBeDefined();
        expect(exercise.coachingCues.length).toBeGreaterThan(0);
      });
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];

      ALL_EXERCISES.forEach((exercise) => {
        expect(validDifficulties).toContain(exercise.difficulty);
      });
    });

    it('should have valid categories', () => {
      const validCategories = ['Compound', 'Isolation', 'Accessory'];

      ALL_EXERCISES.forEach((exercise) => {
        expect(validCategories).toContain(exercise.category);
      });
    });

    it('should have at least one primary muscle', () => {
      ALL_EXERCISES.forEach((exercise) => {
        expect(exercise.primaryMuscles.length).toBeGreaterThan(0);
      });
    });

    it('should have valid rep ranges', () => {
      ALL_EXERCISES.forEach((exercise) => {
        // Should match "6-8", "10-12", "30-60s", etc.
        expect(exercise.defaultRepRange).toMatch(/^(\d+-\d+|\d+s|\d+-\d+s)$/);
      });
    });
  });
});

