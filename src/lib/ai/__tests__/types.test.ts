/**
 * Tests for TypeScript Type Utilities
 */

import {
  isValidRIR,
  isValidWorkoutType,
  isValidMuscleGroup,
  parseRepRange,
  formatWeight,
  calculateAverageRIR,
  getMuscleColor,
  kgToLb,
  lbToKg,
  cmToFeetInches,
  feetInchesToCm,
} from '@/lib/ai/types';

describe('Type Guards', () => {
  describe('isValidRIR', () => {
    it('should return true for valid RIR values (0-5)', () => {
      expect(isValidRIR(0)).toBe(true);
      expect(isValidRIR(1)).toBe(true);
      expect(isValidRIR(5)).toBe(true);
    });

    it('should return false for invalid RIR values', () => {
      expect(isValidRIR(-1)).toBe(false);
      expect(isValidRIR(6)).toBe(false);
      expect(isValidRIR(2.5)).toBe(false);
    });
  });

  describe('isValidWorkoutType', () => {
    it('should return true for valid workout types', () => {
      expect(isValidWorkoutType('Chest Day')).toBe(true);
      expect(isValidWorkoutType('Back Day')).toBe(true);
      expect(isValidWorkoutType('Push Day')).toBe(true);
    });

    it('should return false for invalid workout types', () => {
      expect(isValidWorkoutType('Invalid Day')).toBe(false);
      expect(isValidWorkoutType('')).toBe(false);
      expect(isValidWorkoutType(null)).toBe(false);
    });
  });

  describe('isValidMuscleGroup', () => {
    it('should return true for valid muscle groups', () => {
      expect(isValidMuscleGroup('Chest')).toBe(true);
      expect(isValidMuscleGroup('Biceps')).toBe(true);
      expect(isValidMuscleGroup('Quads')).toBe(true);
    });

    it('should return false for invalid muscle groups', () => {
      expect(isValidMuscleGroup('InvalidMuscle')).toBe(false);
      expect(isValidMuscleGroup('')).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  describe('parseRepRange', () => {
    it('should parse rep range correctly', () => {
      expect(parseRepRange('6-8')).toEqual({ min: 6, max: 8 });
      expect(parseRepRange('10-12')).toEqual({ min: 10, max: 12 });
      expect(parseRepRange('15-20')).toEqual({ min: 15, max: 20 });
    });
  });

  describe('formatWeight', () => {
    it('should format weight in lbs', () => {
      expect(formatWeight(80)).toBe('80 lbs');
      expect(formatWeight(100)).toBe('100 lbs');
      expect(formatWeight(185)).toBe('185 lbs');
    });
  });

  describe('calculateAverageRIR', () => {
    it('should calculate average RIR correctly', () => {
      expect(calculateAverageRIR([1, 2, 2, 3])).toBe(2.0);
      expect(calculateAverageRIR([0, 1, 1])).toBe(0.7);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverageRIR([])).toBe(0);
    });
  });

  describe('getMuscleColor', () => {
    it('should return correct color based on volume score', () => {
      expect(getMuscleColor(90)).toBe('fill-purple-600');
      expect(getMuscleColor(70)).toBe('fill-purple-500');
      expect(getMuscleColor(50)).toBe('fill-purple-400');
      expect(getMuscleColor(30)).toBe('fill-purple-300');
      expect(getMuscleColor(10)).toBe('fill-slate-700');
    });
  });

  describe('Unit Conversions', () => {
    describe('kgToLb', () => {
      it('should convert kg to lb correctly', () => {
        expect(kgToLb(80)).toBe(176);
        expect(kgToLb(100)).toBe(220);
      });
    });

    describe('lbToKg', () => {
      it('should convert lb to kg correctly', () => {
        expect(lbToKg(176)).toBe(80);
        expect(lbToKg(220)).toBe(100);
      });
    });

    describe('cmToFeetInches', () => {
      it('should convert cm to feet and inches', () => {
        expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
        expect(cmToFeetInches(170)).toEqual({ feet: 5, inches: 7 });
      });
    });

    describe('feetInchesToCm', () => {
      it('should convert feet and inches to cm', () => {
        expect(feetInchesToCm(5, 11)).toBe(180);
        expect(feetInchesToCm(6, 0)).toBe(183);
      });
    });
  });
});

