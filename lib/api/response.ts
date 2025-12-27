import { NextResponse } from 'next/server';

/**
 * API Response Types
 * Defines standard response formats for all API endpoints
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  BAD_REQUEST: (message: string, details?: unknown) =>
    errorResponse('BAD_REQUEST', message, 400, details),

  UNAUTHORIZED: (message = 'Unauthorized access') =>
    errorResponse('UNAUTHORIZED', message, 401),

  FORBIDDEN: (message = 'Access forbidden') => errorResponse('FORBIDDEN', message, 403),

  NOT_FOUND: (message = 'Resource not found') => errorResponse('NOT_FOUND', message, 404),

  VALIDATION_ERROR: (message: string, details?: unknown) =>
    errorResponse('VALIDATION_ERROR', message, 400, details),

  INTERNAL_ERROR: (message = 'Internal server error', details?: unknown) =>
    errorResponse('INTERNAL_ERROR', message, 500, details),

  DATABASE_ERROR: (message = 'Database operation failed', details?: unknown) =>
    errorResponse('DATABASE_ERROR', message, 500, details),
};

