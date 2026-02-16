/**
 * Error Handling Utilities
 *
 * Centralized error handling with user-friendly messages,
 * retry logic, and logging capabilities.
 */

import { APIError } from './types';

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
    super(message, 401, true, context);
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Too many requests. Please try again later.',
    retryAfter?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 429, true, { ...context, retryAfter });
    this.retryAfter = retryAfter;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(
    message: string = 'Invalid input',
    fields?: Record<string, string>,
    context?: Record<string, unknown>
  ) {
    super(message, 400, true, { ...context, fields });
    this.fields = fields;
  }
}

/**
 * External API errors (e.g., Gemini AI)
 */
export class ExternalAPIError extends AppError {
  constructor(message: string = 'External service error', context?: Record<string, unknown>) {
    super(message, 502, true, context);
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context?: Record<string, unknown>) {
    super(message, 500, true, context);
  }
}

// ============================================================================
// Error Parsing
// ============================================================================

/**
 * Parse various error types into AppError
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(error.message, 500, true, { originalError: error.name });
  }

  // Fetch/Response errors
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if ('status' in err && typeof err.status === 'number') {
      const message =
        typeof err.message === 'string' ? err.message : 'An error occurred';
      return new AppError(message, err.status, true, err);
    }
  }

  // Unknown error type
  return new AppError('An unexpected error occurred', 500, false, { error });
}

/**
 * Convert error to API error response format
 */
export function toAPIError(error: AppError): APIError {
  return {
    error: error.name,
    message: error.message,
    statusCode: error.statusCode,
    details: error.context,
  };
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyMessage(error: unknown): string {
  const appError = parseError(error);

  // Specific error type messages
  if (appError instanceof AuthenticationError) {
    return 'Please sign in to continue. Your session may have expired.';
  }

  if (appError instanceof RateLimitError) {
    const retryAfter = appError.retryAfter;
    if (retryAfter) {
      return `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
    }
    return 'Too many requests. Please try again in a moment.';
  }

  if (appError instanceof ValidationError) {
    return appError.message || 'Please check your input and try again.';
  }

  if (appError instanceof ExternalAPIError) {
    return 'Our AI service is temporarily unavailable. Please try again in a moment.';
  }

  if (appError instanceof DatabaseError) {
    return 'We encountered a problem saving your data. Please try again.';
  }

  // Status code based messages
  switch (appError.statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Please sign in to continue.';
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Something went wrong on our end. Please try again.';
    case 502:
    case 503:
      return 'Service temporarily unavailable. Please try again shortly.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Get action suggestion for error
 */
export function getErrorAction(error: unknown): string | null {
  const appError = parseError(error);

  if (appError instanceof AuthenticationError) {
    return 'Sign In';
  }

  if (appError instanceof RateLimitError) {
    return 'Try Again Later';
  }

  if (appError.statusCode >= 500) {
    return 'Retry';
  }

  return null;
}

// ============================================================================
// Retry Logic
// ============================================================================

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true,
  shouldRetry: (error: unknown) => {
    const appError = parseError(error);
    // Retry on server errors and rate limits
    return appError.statusCode >= 500 || appError.statusCode === 429;
  },
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Check if we should retry this error
      if (!opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = opts.backoff ? opts.delayMs * Math.pow(2, attempt - 1) : opts.delayMs;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// Logging
// ============================================================================

/**
 * Log error to console (in production, send to logging service)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const appError = parseError(error);

  // In production, send to logging service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
    console.error('[Production Error]', {
      name: appError.name,
      message: appError.message,
      statusCode: appError.statusCode,
      timestamp: appError.timestamp,
      context: { ...appError.context, ...context },
      stack: appError.stack,
    });
  } else {
    // Development: detailed console logging
    console.error('[Error]', appError.name, appError.message);
    console.error('Status:', appError.statusCode);
    console.error('Context:', { ...appError.context, ...context });
    console.error('Stack:', appError.stack);
  }
}

/**
 * Log warning
 */
export function logWarning(message: string, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
    console.warn('[Production Warning]', { message, context });
  } else {
    console.warn('[Warning]', message, context);
  }
}

// ============================================================================
// Error Boundary Helpers
// ============================================================================

/**
 * Check if error should show fallback UI
 */
export function shouldShowFallbackUI(error: unknown): boolean {
  const appError = parseError(error);

  // Show fallback for server errors and non-operational errors
  return appError.statusCode >= 500 || !appError.isOperational;
}

/**
 * Get fallback component props from error
 */
export interface FallbackProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function getFallbackProps(
  error: unknown,
  onRetry?: () => void,
  onReset?: () => void
): FallbackProps {
  const message = getUserFriendlyMessage(error);
  const actionLabel = getErrorAction(error);
  const appError = parseError(error);

  let action: FallbackProps['action'];

  if (appError instanceof AuthenticationError && onReset) {
    action = {
      label: 'Sign In',
      onClick: onReset,
    };
  } else if (actionLabel === 'Retry' && onRetry) {
    action = {
      label: 'Try Again',
      onClick: onRetry,
    };
  } else if (onReset) {
    action = {
      label: 'Go Back',
      onClick: onReset,
    };
  }

  return {
    title: 'Oops! Something went wrong',
    message,
    action,
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): ValidationError | null {
  const missing: string[] = [];

  fields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    const fieldErrors: Record<string, string> = {};
    missing.forEach((field) => {
      fieldErrors[field] = 'This field is required';
    });

    return new ValidationError('Missing required fields', fieldErrors, { missing });
  }

  return null;
}

/**
 * Validate number range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null {
  if (value < min || value > max) {
    return new ValidationError(`${fieldName} must be between ${min} and ${max}`, {
      [fieldName]: `Must be between ${min} and ${max}`,
    });
  }
  return null;
}

