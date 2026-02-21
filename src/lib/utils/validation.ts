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

export interface SetFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: SetFieldError[];
  data?: SetValidation;
}

const LIMITS = {
  weight: { min: 0, max: 999 },
  reps: { min: 1, max: 100 },
  rir: { min: 0, max: 5 },
} as const;

/**
 * Strictly parse a numeric value, rejecting null/undefined/empty/non-numeric strings.
 */
function strictParseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'string' ? Number(value) : Number(value);
  if (isNaN(n) || !isFinite(n)) return null;
  // Reject strings like "10abc" — Number("10abc") is NaN, so already handled
  // But also reject strings that have trailing non-numeric chars via trim check
  if (typeof value === 'string' && value.trim() !== String(n)) return null;
  return n;
}

/**
 * Validate a single set's input data
 */
export function validateSetInput(
  weight: unknown,
  reps: unknown,
  rir: unknown
): ValidationResult {
  const errors: SetFieldError[] = [];

  // Weight validation (decimals allowed, e.g., 67.5 kg)
  const w = strictParseNumber(weight);
  if (w === null) {
    errors.push({ field: 'weight', message: 'Weight is required and must be a number' });
  } else if (w < LIMITS.weight.min || w > LIMITS.weight.max) {
    errors.push({ field: 'weight', message: `Weight must be ${LIMITS.weight.min}–${LIMITS.weight.max}` });
  }

  // Reps validation (must be integer)
  const r = strictParseNumber(reps);
  if (r === null) {
    errors.push({ field: 'reps', message: 'Reps is required and must be a number' });
  } else if (!Number.isInteger(r)) {
    errors.push({ field: 'reps', message: 'Reps must be a whole number' });
  } else if (r < LIMITS.reps.min || r > LIMITS.reps.max) {
    errors.push({ field: 'reps', message: `Reps must be ${LIMITS.reps.min}–${LIMITS.reps.max}` });
  }

  // RIR validation (must be integer)
  const ri = strictParseNumber(rir);
  if (ri === null) {
    errors.push({ field: 'rir', message: 'RIR is required and must be a number' });
  } else if (!Number.isInteger(ri)) {
    errors.push({ field: 'rir', message: 'RIR must be a whole number' });
  } else if (ri < LIMITS.rir.min || ri > LIMITS.rir.max) {
    errors.push({ field: 'rir', message: `RIR must be ${LIMITS.rir.min}–${LIMITS.rir.max}` });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: { weight: w!, reps: r!, rir: ri! },
  };
}

/**
 * Get the validation limits (for use in input min/max attributes)
 */
export function getValidationLimits() {
  return LIMITS;
}
