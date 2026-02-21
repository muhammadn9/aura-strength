/**
 * Input Validation Utilities
 *
 * Strict validation for workout set data (weight, reps, RIR).
 * Used in both client-side forms and server-side save logic.
 */

export interface SetValidation {
  weight: number;
  reps: number;
  rir: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data?: SetValidation;
}

const LIMITS = {
  weight: { min: 0, max: 999 },
  reps: { min: 1, max: 100 },
  rir: { min: 0, max: 5 },
} as const;

/**
 * Validate a single set's input data
 */
export function validateSetInput(
  weight: unknown,
  reps: unknown,
  rir: unknown
): ValidationResult {
  const errors: ValidationError[] = [];

  // Weight validation
  const w = typeof weight === 'string' ? parseFloat(weight) : Number(weight);
  if (isNaN(w)) {
    errors.push({ field: 'weight', message: 'Weight is required' });
  } else if (w < LIMITS.weight.min || w > LIMITS.weight.max) {
    errors.push({ field: 'weight', message: `Weight must be ${LIMITS.weight.min}–${LIMITS.weight.max}` });
  }

  // Reps validation
  const r = typeof reps === 'string' ? parseInt(reps, 10) : Number(reps);
  if (isNaN(r)) {
    errors.push({ field: 'reps', message: 'Reps is required' });
  } else if (r < LIMITS.reps.min || r > LIMITS.reps.max) {
    errors.push({ field: 'reps', message: `Reps must be ${LIMITS.reps.min}–${LIMITS.reps.max}` });
  }

  // RIR validation
  const ri = typeof rir === 'string' ? parseInt(rir, 10) : Number(rir);
  if (isNaN(ri)) {
    errors.push({ field: 'rir', message: 'RIR is required' });
  } else if (ri < LIMITS.rir.min || ri > LIMITS.rir.max) {
    errors.push({ field: 'rir', message: `RIR must be ${LIMITS.rir.min}–${LIMITS.rir.max}` });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: { weight: w, reps: r, rir: ri },
  };
}

/**
 * Get the validation limits (for use in input min/max attributes)
 */
export function getValidationLimits() {
  return LIMITS;
}

