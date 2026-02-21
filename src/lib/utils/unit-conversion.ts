/**
 * Unit Conversion Utilities
 *
 * Handles metric ↔ imperial conversions for weights and heights.
 * Internally all data is stored in metric (kg, cm).
 * Display is converted based on user preference.
 */

export type UnitPreference = 'metric' | 'imperial';

// ============================================================================
// Weight Conversions
// ============================================================================

const KG_TO_LBS = 2.20462;

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return Math.round((lbs / KG_TO_LBS) * 10) / 10;
}

/**
 * Format weight for display based on unit preference
 */
export function formatWeight(kg: number, unit: UnitPreference): string {
  if (unit === 'imperial') {
    return `${kgToLbs(kg)} lb`;
  }
  return `${kg} kg`;
}

/**
 * Get weight unit label
 */
export function getWeightUnit(unit: UnitPreference): string {
  return unit === 'imperial' ? 'lb' : 'kg';
}

// ============================================================================
// Height Conversions
// ============================================================================

const CM_TO_INCHES = 0.393701;

/**
 * Convert centimeters to feet and inches
 */
export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm * CM_TO_INCHES;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);

  // Normalize rounding edge case where inches can become 12
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  return { feet, inches };
}

/**
 * Convert feet and inches to centimeters
 */
export function ftInToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches / CM_TO_INCHES * 10) / 10;
}

/**
 * Format height for display based on unit preference
 */
export function formatHeight(cm: number, unit: UnitPreference): string {
  if (unit === 'imperial') {
    const { feet, inches } = cmToFtIn(cm);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}

/**
 * Get height unit label
 */
export function getHeightUnit(unit: UnitPreference): string {
  return unit === 'imperial' ? 'ft/in' : 'cm';
}

// ============================================================================
// Input Conversion Helpers
// ============================================================================

/**
 * Convert a weight input value to kg for storage
 */
export function parseWeightInput(value: number, unit: UnitPreference): number {
  return unit === 'imperial' ? lbsToKg(value) : value;
}

/**
 * Convert stored kg to display value for input fields
 */
export function weightToDisplayValue(kg: number, unit: UnitPreference): number {
  return unit === 'imperial' ? kgToLbs(kg) : kg;
}

/**
 * Convert a height input to cm for storage
 */
export function parseHeightInput(
  value: number,
  unit: UnitPreference,
  inches?: number
): number {
  if (unit === 'imperial') {
    return ftInToCm(value, inches || 0);
  }
  return value;
}

