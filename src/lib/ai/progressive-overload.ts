/**
 * Progressive Overload Algorithm
 *
 * Analyzes workout history and determines optimal progression strategies.
 * Uses RIR (Reps In Reserve) methodology and performance trends.
 */

import { ExercisePerformance, ProgressionRecommendation, ProgressionConfidence } from './types';

// ============================================================================
// Constants
// ============================================================================

const RIR_THRESHOLDS = {
  STRONG: 1, // RIR 0-1: Very strong performance
  GOOD: 2, // RIR 2: Good performance
  MODERATE: 3, // RIR 3: Moderate performance
  WEAK: 4, // RIR 4+: Needs more practice
};

const WEIGHT_INCREMENT = {
  SMALL: 2.5, // kg or ~5 lb
  MEDIUM: 5, // kg or ~10 lb
  LARGE: 10, // kg or ~20 lb
};

const REP_INCREMENT = {
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
};

// ============================================================================
// Main Progressive Overload Function
// ============================================================================

export interface ProgressionInput {
  exerciseName: string;
  previousPerformance: ExercisePerformance[];
  targetReps: string; // e.g., '6-8', '10-12'
  currentWeight?: number;
  currentReps?: number;
  currentRIR?: number;
}

export function calculateProgression(input: ProgressionInput): ProgressionRecommendation {
  const { exerciseName, previousPerformance, targetReps, currentWeight, currentReps, currentRIR } =
    input;

  // If no history, recommend starting conservatively
  if (previousPerformance.length === 0) {
    return {
      exerciseName,
      action: 'maintain',
      recommendedWeight: currentWeight,
      recommendedReps: targetReps,
      recommendedRIR: '2-3',
      reasoning: 'First time performing this exercise. Start conservatively and focus on form.',
      confidence: 'low',
    };
  }

  // Analyze most recent performance
  const lastPerformance = previousPerformance[0];
  const penultimatePerformance = previousPerformance[1];

  // Calculate progression based on RIR and performance trends
  if (currentRIR !== undefined && currentRIR <= RIR_THRESHOLDS.STRONG) {
    return recommendWeightIncrease(input, lastPerformance, penultimatePerformance);
  } else if (currentRIR !== undefined && currentRIR === RIR_THRESHOLDS.GOOD) {
    return recommendRepIncrease(input, lastPerformance);
  } else if (currentRIR !== undefined && currentRIR >= RIR_THRESHOLDS.WEAK) {
    return recommendMaintainOrDeload(input, lastPerformance, previousPerformance);
  }

  // Default: maintain current load
  return {
    exerciseName,
    action: 'maintain',
    recommendedWeight: currentWeight,
    recommendedReps: targetReps,
    recommendedRIR: '1-2',
    reasoning: 'Continue with current weight to build consistency.',
    confidence: 'medium',
  };
}

// ============================================================================
// Recommendation Strategies
// ============================================================================

function recommendWeightIncrease(
  input: ProgressionInput,
  lastPerformance: ExercisePerformance,
  penultimatePerformance?: ExercisePerformance
): ProgressionRecommendation {
  const { exerciseName, currentWeight, targetReps } = input;

  // Check if user has been hitting RIR 0-1 consistently
  const isConsistentlyStrong =
    penultimatePerformance &&
    penultimatePerformance.averageRIR !== undefined &&
    penultimatePerformance.averageRIR <= RIR_THRESHOLDS.STRONG;

  // Determine increment size based on exercise type and consistency
  const increment = determineWeightIncrement(
    exerciseName,
    isConsistentlyStrong || false,
    currentWeight
  );

  const newWeight = currentWeight ? currentWeight + increment : undefined;

  return {
    exerciseName,
    action: 'increase_weight',
    recommendedWeight: newWeight,
    recommendedReps: targetReps,
    recommendedRIR: '1-2',
    reasoning: `Strong performance (RIR ${lastPerformance.averageRIR}). Ready for weight increase of ${increment}kg.`,
    confidence: isConsistentlyStrong ? 'high' : 'medium',
    previousWeight: currentWeight,
    weightChange: increment,
  };
}

function recommendRepIncrease(
  input: ProgressionInput,
  lastPerformance: ExercisePerformance
): ProgressionRecommendation {
  const { exerciseName, currentWeight, currentReps } = input;

  // Parse target rep range
  const [minReps, maxReps] = input.targetReps.split('-').map((r) => parseInt(r.trim()));

  // Recommend increasing reps if not at top of range
  const increment =
    currentReps && currentReps < maxReps
      ? Math.min(REP_INCREMENT.SMALL, maxReps - currentReps)
      : REP_INCREMENT.SMALL;

  const newRepTarget =
    currentReps && currentReps < maxReps
      ? `${currentReps + increment}-${maxReps}`
      : `${maxReps}-${maxReps + REP_INCREMENT.MEDIUM}`;

  return {
    exerciseName,
    action: 'increase_reps',
    recommendedWeight: currentWeight,
    recommendedReps: newRepTarget,
    recommendedRIR: '1-2',
    reasoning: `Good performance (RIR ${lastPerformance.averageRIR}). Try adding ${increment} rep(s) before increasing weight.`,
    confidence: 'high',
  };
}

function recommendMaintainOrDeload(
  input: ProgressionInput,
  lastPerformance: ExercisePerformance,
  allPerformance: ExercisePerformance[]
): ProgressionRecommendation {
  const { exerciseName, currentWeight, targetReps, currentRIR } = input;

  // Check for consistent struggles (3+ sessions with high RIR)
  const recentStruggles = allPerformance
    .slice(0, 3)
    .filter((p) => p.averageRIR !== undefined && p.averageRIR >= RIR_THRESHOLDS.WEAK).length;

  // Check for pain/injury indicators
  const hasPainIndicators =
    lastPerformance.userFeedback?.toLowerCase().includes('pain') ||
    lastPerformance.userFeedback?.toLowerCase().includes('hurt') ||
    lastPerformance.userFeedback?.toLowerCase().includes('injury');

  if (hasPainIndicators || recentStruggles >= 2) {
    // Recommend deload (reduce weight by 10-15%)
    const deloadWeight = currentWeight ? Math.round(currentWeight * 0.85 * 2) / 2 : undefined;

    return {
      exerciseName,
      action: 'deload',
      recommendedWeight: deloadWeight,
      recommendedReps: targetReps,
      recommendedRIR: '2-3',
      reasoning: hasPainIndicators
        ? 'Pain/discomfort reported. Deload to focus on form and recovery.'
        : `Consistently high RIR (${currentRIR}+). Deload 15% to rebuild with better form.`,
      confidence: 'high',
      previousWeight: currentWeight,
      weightChange: deloadWeight && currentWeight ? deloadWeight - currentWeight : undefined,
    };
  }

  // Just maintain current weight
  return {
    exerciseName,
    action: 'maintain',
    recommendedWeight: currentWeight,
    recommendedReps: targetReps,
    recommendedRIR: '2-3',
    reasoning: `Higher RIR (${currentRIR}). Focus on hitting lower RIR before progressing.`,
    confidence: 'medium',
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function determineWeightIncrement(
  exerciseName: string,
  isConsistentlyStrong: boolean,
  currentWeight?: number
): number {
  const lowerName = exerciseName.toLowerCase();

  // Small increments for isolation/accessory exercises
  const isIsolation =
    lowerName.includes('curl') ||
    lowerName.includes('raise') ||
    lowerName.includes('extension') ||
    lowerName.includes('fly') ||
    lowerName.includes('lateral');

  // Large increments for compound lower body
  const isHeavyCompound =
    lowerName.includes('squat') ||
    lowerName.includes('deadlift') ||
    lowerName.includes('leg press');

  // Small increments for upper body accessories
  if (isIsolation) {
    return WEIGHT_INCREMENT.SMALL;
  }

  // Large increments for heavy compounds if consistently strong
  if (isHeavyCompound && isConsistentlyStrong) {
    return WEIGHT_INCREMENT.LARGE;
  }

  // Medium increments for most compound movements
  if (isHeavyCompound || lowerName.includes('press') || lowerName.includes('row')) {
    return WEIGHT_INCREMENT.MEDIUM;
  }

  // Default to small increments
  return WEIGHT_INCREMENT.SMALL;
}

// ============================================================================
// Performance Analysis
// ============================================================================

export function analyzePerformanceTrend(
  performances: ExercisePerformance[]
): 'improving' | 'plateauing' | 'declining' {
  if (performances.length < 2) {
    return 'plateauing';
  }

  const recent = performances.slice(0, 3);

  // Calculate average RIR trend
  const rirTrend = recent.map((p) => p.averageRIR || 3);

  // Check if RIR is decreasing (getting stronger)
  const isImproving = rirTrend.every((rir, i) => i === 0 || rir <= rirTrend[i - 1]);

  // Check if RIR is increasing (getting weaker)
  const isDeclining = rirTrend.every((rir, i) => i === 0 || rir >= rirTrend[i - 1]);

  if (isImproving) return 'improving';
  if (isDeclining) return 'declining';
  return 'plateauing';
}

export function calculateConfidenceScore(
  performances: ExercisePerformance[],
  recommendation: ProgressionRecommendation
): ProgressionConfidence {
  // More data = higher confidence
  if (performances.length < 2) return 'low';
  if (performances.length >= 5) return 'high';

  // Consistent performance = higher confidence
  const recentRIRs = performances
    .slice(0, 3)
    .map((p) => p.averageRIR)
    .filter((rir): rir is number => rir !== undefined);

  if (recentRIRs.length >= 2) {
    const variance = calculateVariance(recentRIRs);
    if (variance < 1) return 'high'; // Very consistent
    if (variance > 2) return 'low'; // Too variable
  }

  return 'medium';
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
}

