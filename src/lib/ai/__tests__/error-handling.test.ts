/**
 * Tests for Error Handling Utilities
 */

import {
  AppError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ExternalAPIError,
  DatabaseError,
  parseError,
  getUserFriendlyMessage,
  getErrorAction,
  validateRequired,
  validateRange,
} from '@/lib/ai/error-handling';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should include context when provided', () => {
      const context = { userId: '123' };
      const error = new AppError('Test', 500, true, context);

      expect(error.context).toEqual(context);
    });
  });

  describe('AuthenticationError', () => {
    it('should create 401 error', () => {
      const error = new AuthenticationError('Please sign in');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Please sign in');
    });
  });

  describe('RateLimitError', () => {
    it('should create 429 error with retryAfter', () => {
      const error = new RateLimitError('Too many requests', 60);

      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
    });
  });

  describe('ValidationError', () => {
    it('should create 400 error with field errors', () => {
      const fields = { email: 'Invalid email' };
      const error = new ValidationError('Invalid input', fields);

      expect(error.statusCode).toBe(400);
      expect(error.fields).toEqual(fields);
    });
  });

  describe('ExternalAPIError', () => {
    it('should create 502 error', () => {
      const error = new ExternalAPIError('API down');

      expect(error.statusCode).toBe(502);
    });
  });

  describe('DatabaseError', () => {
    it('should create 500 error', () => {
      const error = new DatabaseError('DB connection failed');

      expect(error.statusCode).toBe(500);
    });
  });
});

describe('Error Parsing', () => {
  describe('parseError', () => {
    it('should return AppError as-is', () => {
      const original = new AppError('Test', 500);
      const parsed = parseError(original);

      expect(parsed).toBe(original);
    });

    it('should convert standard Error to AppError', () => {
      const error = new Error('Standard error');
      const parsed = parseError(error);

      expect(parsed).toBeInstanceOf(AppError);
      expect(parsed.message).toBe('Standard error');
      expect(parsed.statusCode).toBe(500);
    });

    it('should handle response-like objects', () => {
      const error = { status: 404, message: 'Not found' };
      const parsed = parseError(error);

      expect(parsed.statusCode).toBe(404);
      expect(parsed.message).toBe('Not found');
    });

    it('should handle unknown error types', () => {
      const parsed = parseError('Unknown error');

      expect(parsed).toBeInstanceOf(AppError);
      expect(parsed.statusCode).toBe(500);
    });
  });
});

describe('User-Friendly Messages', () => {
  describe('getUserFriendlyMessage', () => {
    it('should return friendly message for AuthenticationError', () => {
      const error = new AuthenticationError();
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('sign in');
    });

    it('should return friendly message for RateLimitError', () => {
      const error = new RateLimitError('Too many requests', 60);
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('60 seconds');
    });

    it('should return friendly message for ExternalAPIError', () => {
      const error = new ExternalAPIError();
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('AI service');
    });

    it('should return friendly message based on status code', () => {
      const error = new AppError('Not found', 404);
      const message = getUserFriendlyMessage(error);

      expect(message).toContain('not found');
    });
  });

  describe('getErrorAction', () => {
    it('should suggest "Sign In" for auth errors', () => {
      const error = new AuthenticationError();
      const action = getErrorAction(error);

      expect(action).toBe('Sign In');
    });

    it('should suggest "Retry" for server errors', () => {
      const error = new AppError('Server error', 500);
      const action = getErrorAction(error);

      expect(action).toBe('Retry');
    });

    it('should return null for client errors', () => {
      const error = new ValidationError();
      const action = getErrorAction(error);

      expect(action).toBeNull();
    });
  });
});

describe('Validation Helpers', () => {
  describe('validateRequired', () => {
    it('should return null when all required fields present', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const error = validateRequired(data, ['name', 'email']);

      expect(error).toBeNull();
    });

    it('should return ValidationError when fields missing', () => {
      const data = { name: 'John' };
      const error = validateRequired(data, ['name', 'email']);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.fields).toHaveProperty('email');
    });

    it('should detect empty strings as missing', () => {
      const data = { name: '' };
      const error = validateRequired(data, ['name']);

      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('validateRange', () => {
    it('should return null when value in range', () => {
      const error = validateRange(50, 0, 100, 'age');

      expect(error).toBeNull();
    });

    it('should return error when value too low', () => {
      const error = validateRange(-1, 0, 100, 'age');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error?.message).toContain('between 0 and 100');
    });

    it('should return error when value too high', () => {
      const error = validateRange(101, 0, 100, 'age');

      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});

