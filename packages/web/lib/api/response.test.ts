import { describe, it, expect } from 'vitest';
import {
  successResponse,
  errorResponse,
  ApiErrors,
  type ApiSuccessResponse,
  type ApiErrorResponse,
} from './response';

describe('successResponse', () => {
  it('should create success response with data', () => {
    const data = { id: '1', name: 'Test' };
    const response = successResponse(data);

    expect(response.status).toBe(200);

    const json = response.json() as Promise<ApiSuccessResponse<typeof data>>;
    return json.then((body) => {
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });
  });

  it('should create success response with custom status code', () => {
    const data = { id: '1' };
    const response = successResponse(data, 201);

    expect(response.status).toBe(201);
  });

  it('should create success response with array data', () => {
    const data = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];
    const response = successResponse(data);

    const json = response.json() as Promise<ApiSuccessResponse<typeof data>>;
    return json.then((body) => {
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.data).toHaveLength(2);
    });
  });

  it('should create success response with null data', () => {
    const response = successResponse(null);

    const json = response.json() as Promise<ApiSuccessResponse<null>>;
    return json.then((body) => {
      expect(body.success).toBe(true);
      expect(body.data).toBeNull();
    });
  });

  it('should create success response with boolean data', () => {
    const response = successResponse(true);

    const json = response.json() as Promise<ApiSuccessResponse<boolean>>;
    return json.then((body) => {
      expect(body.success).toBe(true);
      expect(body.data).toBe(true);
    });
  });

  it('should create success response with number data', () => {
    const response = successResponse(42);

    const json = response.json() as Promise<ApiSuccessResponse<number>>;
    return json.then((body) => {
      expect(body.success).toBe(true);
      expect(body.data).toBe(42);
    });
  });
});

describe('errorResponse', () => {
  it('should create error response with code and message', () => {
    const response = errorResponse('TEST_ERROR', 'Test error message');

    expect(response.status).toBe(400);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TEST_ERROR');
      expect(body.error.message).toBe('Test error message');
      expect(body.error.details).toBeUndefined();
    });
  });

  it('should create error response with custom status code', () => {
    const response = errorResponse('NOT_FOUND', 'Resource not found', 404);

    expect(response.status).toBe(404);
  });

  it('should create error response with details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const response = errorResponse('VALIDATION_ERROR', 'Validation failed', 400, details);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.details).toEqual(details);
    });
  });

  it('should create error response with complex details', () => {
    const details = {
      fields: [
        { name: 'email', errors: ['required', 'invalid'] },
        { name: 'password', errors: ['too short'] },
      ],
    };
    const response = errorResponse('VALIDATION_ERROR', 'Multiple validation errors', 400, details);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.details).toEqual(details);
    });
  });
});

describe('ApiErrors', () => {
  it('should create BAD_REQUEST error', () => {
    const response = ApiErrors.BAD_REQUEST('Invalid request');

    expect(response.status).toBe(400);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.code).toBe('BAD_REQUEST');
      expect(body.error.message).toBe('Invalid request');
    });
  });

  it('should create BAD_REQUEST error with details', () => {
    const details = { field: 'id', value: 'abc' };
    const response = ApiErrors.BAD_REQUEST('Invalid ID', details);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.details).toEqual(details);
    });
  });

  it('should create UNAUTHORIZED error with default message', () => {
    const response = ApiErrors.UNAUTHORIZED();

    expect(response.status).toBe(401);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toBe('Unauthorized access');
    });
  });

  it('should create UNAUTHORIZED error with custom message', () => {
    const response = ApiErrors.UNAUTHORIZED('Invalid token');

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.message).toBe('Invalid token');
    });
  });

  it('should create FORBIDDEN error with default message', () => {
    const response = ApiErrors.FORBIDDEN();

    expect(response.status).toBe(403);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.code).toBe('FORBIDDEN');
      expect(body.error.message).toBe('Access forbidden');
    });
  });

  it('should create FORBIDDEN error with custom message', () => {
    const response = ApiErrors.FORBIDDEN('Insufficient permissions');

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.message).toBe('Insufficient permissions');
    });
  });

  it('should create NOT_FOUND error with default message', () => {
    const response = ApiErrors.NOT_FOUND();

    expect(response.status).toBe(404);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.message).toBe('Resource not found');
    });
  });

  it('should create NOT_FOUND error with custom message', () => {
    const response = ApiErrors.NOT_FOUND('User not found');

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.message).toBe('User not found');
    });
  });

  it('should create VALIDATION_ERROR error', () => {
    const response = ApiErrors.VALIDATION_ERROR('Validation failed');

    expect(response.status).toBe(400);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('Validation failed');
    });
  });

  it('should create VALIDATION_ERROR error with details', () => {
    const details = { field: 'email', errors: ['required', 'invalid'] };
    const response = ApiErrors.VALIDATION_ERROR('Validation failed', details);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.details).toEqual(details);
    });
  });

  it('should create INTERNAL_ERROR error with default message', () => {
    const response = ApiErrors.INTERNAL_ERROR();

    expect(response.status).toBe(500);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.code).toBe('INTERNAL_ERROR');
      expect(body.error.message).toBe('Internal server error');
    });
  });

  it('should create INTERNAL_ERROR error with custom message and details', () => {
    const details = { stack: 'Error stack trace' };
    const response = ApiErrors.INTERNAL_ERROR('Database connection failed', details);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.message).toBe('Database connection failed');
      expect(body.error.details).toEqual(details);
    });
  });

  it('should create DATABASE_ERROR error with default message', () => {
    const response = ApiErrors.DATABASE_ERROR();

    expect(response.status).toBe(500);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.code).toBe('DATABASE_ERROR');
      expect(body.error.message).toBe('Database operation failed');
    });
  });

  it('should create DATABASE_ERROR error with custom message and details', () => {
    const details = { query: 'SELECT * FROM users', error: 'Connection timeout' };
    const response = ApiErrors.DATABASE_ERROR('Query execution failed', details);

    const json = response.json() as Promise<ApiErrorResponse>;
    return json.then((body) => {
      expect(body.error.message).toBe('Query execution failed');
      expect(body.error.details).toEqual(details);
    });
  });
});
