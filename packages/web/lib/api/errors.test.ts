import { describe, it, expect } from 'vitest';
import {
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  isApiError,
  toApiError,
} from './errors';

describe('ApiError', () => {
  it('should create ApiError with required parameters', () => {
    const error = new ApiError('TEST_ERROR', 'Test error message');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('ApiError');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
    expect(error.statusCode).toBe(500);
    expect(error.details).toBeUndefined();
  });

  it('should create ApiError with custom status code', () => {
    const error = new ApiError('TEST_ERROR', 'Test error message', 404);

    expect(error.statusCode).toBe(404);
  });

  it('should create ApiError with details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const error = new ApiError('TEST_ERROR', 'Test error message', 400, details);

    expect(error.details).toEqual(details);
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with default values', () => {
    const error = new ValidationError('Validation failed');

    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(400);
    expect(error.details).toBeUndefined();
  });

  it('should create ValidationError with details', () => {
    const details = { field: 'email', errors: ['required', 'invalid format'] };
    const error = new ValidationError('Validation failed', details);

    expect(error.details).toEqual(details);
  });
});

describe('NotFoundError', () => {
  it('should create NotFoundError with default message', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('NotFoundError');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create NotFoundError with custom message', () => {
    const error = new NotFoundError('User not found');

    expect(error.message).toBe('User not found');
  });
});

describe('UnauthorizedError', () => {
  it('should create UnauthorizedError with default message', () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('UnauthorizedError');
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Unauthorized access');
    expect(error.statusCode).toBe(401);
  });

  it('should create UnauthorizedError with custom message', () => {
    const error = new UnauthorizedError('Invalid token');

    expect(error.message).toBe('Invalid token');
  });
});

describe('ForbiddenError', () => {
  it('should create ForbiddenError with default message', () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('ForbiddenError');
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('Access forbidden');
    expect(error.statusCode).toBe(403);
  });

  it('should create ForbiddenError with custom message', () => {
    const error = new ForbiddenError('Insufficient permissions');

    expect(error.message).toBe('Insufficient permissions');
  });
});

describe('DatabaseError', () => {
  it('should create DatabaseError with default message', () => {
    const error = new DatabaseError();

    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe('DatabaseError');
    expect(error.code).toBe('DATABASE_ERROR');
    expect(error.message).toBe('Database operation failed');
    expect(error.statusCode).toBe(500);
    expect(error.details).toBeUndefined();
  });

  it('should create DatabaseError with custom message and details', () => {
    const details = { query: 'SELECT * FROM users', error: 'Connection timeout' };
    const error = new DatabaseError('Failed to connect to database', details);

    expect(error.message).toBe('Failed to connect to database');
    expect(error.details).toEqual(details);
  });
});

describe('isApiError', () => {
  it('should return true for ApiError instances', () => {
    const error = new ApiError('TEST_ERROR', 'Test message');

    expect(isApiError(error)).toBe(true);
  });

  it('should return true for ValidationError instances', () => {
    const error = new ValidationError('Validation failed');

    expect(isApiError(error)).toBe(true);
  });

  it('should return true for NotFoundError instances', () => {
    const error = new NotFoundError();

    expect(isApiError(error)).toBe(true);
  });

  it('should return false for regular Error instances', () => {
    const error = new Error('Regular error');

    expect(isApiError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isApiError('string error')).toBe(false);
    expect(isApiError({ message: 'error object' })).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError(42)).toBe(false);
  });
});

describe('toApiError', () => {
  it('should return same error if already ApiError', () => {
    const originalError = new ApiError('TEST_ERROR', 'Test message', 404);
    const result = toApiError(originalError);

    expect(result).toBe(originalError);
    expect(result.code).toBe('TEST_ERROR');
    expect(result.statusCode).toBe(404);
  });

  it('should convert ValidationError to ApiError', () => {
    const originalError = new ValidationError('Validation failed');
    const result = toApiError(originalError);

    expect(result).toBe(originalError);
    expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('should convert regular Error to ApiError', () => {
    const originalError = new Error('Something went wrong');
    const result = toApiError(originalError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('Something went wrong');
    expect(result.statusCode).toBe(500);
  });

  it('should convert string error to ApiError', () => {
    const result = toApiError('string error');

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('An unknown error occurred');
    expect(result.statusCode).toBe(500);
  });

  it('should convert null error to ApiError', () => {
    const result = toApiError(null);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('An unknown error occurred');
    expect(result.statusCode).toBe(500);
  });

  it('should convert undefined error to ApiError', () => {
    const result = toApiError(undefined);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('An unknown error occurred');
    expect(result.statusCode).toBe(500);
  });

  it('should convert object error to ApiError', () => {
    const result = toApiError({ custom: 'error object' });

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.message).toBe('An unknown error occurred');
    expect(result.statusCode).toBe(500);
  });
});
