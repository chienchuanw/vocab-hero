import { ApiResponse } from './response';

/**
 * Base fetch utility for API requests
 * Provides consistent error handling and response parsing
 */

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Base fetch function with error handling
 */
export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    fullUrl = `${url}?${searchParams.toString()}`;
  }

  // Set default headers
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });

    // Parse response
    const data: ApiResponse<T> = await response.json();

    // Handle error response
    if (!data.success) {
      throw new FetchError(data.error.message, response.status, data.error.code);
    }

    return data.data;
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new FetchError(error.message, 500);
    }

    throw new FetchError('An unknown error occurred', 500);
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
};

