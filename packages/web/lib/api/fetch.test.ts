import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, api, FetchError } from './fetch';
import type { ApiResponse } from './response';

describe('FetchError', () => {
  it('should create FetchError with message and status', () => {
    const error = new FetchError('Test error', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('FetchError');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.code).toBeUndefined();
  });

  it('should create FetchError with message, status, and code', () => {
    const error = new FetchError('Not found', 404, 'NOT_FOUND');

    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });
});

describe('apiFetch', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should make successful GET request', async () => {
    const responseData = { id: '1', name: 'Test' };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    const result = await apiFetch<typeof responseData>('/api/test');

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({}));
    expect(result).toEqual(responseData);
  });

  it('should include query parameters in URL', async () => {
    const responseData = { items: [] };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    await apiFetch<typeof responseData>('/api/items', {
      params: { page: 1, limit: 10, active: true },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items?page=1&limit=10&active=true',
      expect.objectContaining({})
    );
  });

  it('should set Content-Type header when body is provided', async () => {
    const responseData = { id: '1' };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => apiResponse,
    });

    await apiFetch<typeof responseData>('/api/items', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs).toBeDefined();
    const headers = callArgs![1].headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should not override existing Content-Type header', async () => {
    const responseData = { id: '1' };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => apiResponse,
    });

    await apiFetch<typeof responseData>('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'plain text body',
    });

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs).toBeDefined();
    const headers = callArgs![1].headers as Headers;
    expect(headers.get('Content-Type')).toBe('text/plain');
  });

  it('should throw FetchError on API error response', async () => {
    const apiResponse: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    };

    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => apiResponse,
    });

    await expect(apiFetch('/api/test')).rejects.toThrow(FetchError);
    await expect(apiFetch('/api/test')).rejects.toThrow('Validation failed');

    try {
      await apiFetch('/api/test');
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      if (error instanceof FetchError) {
        expect(error.status).toBe(400);
        expect(error.code).toBe('VALIDATION_ERROR');
      }
    }
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await expect(apiFetch('/api/test')).rejects.toThrow(FetchError);
    await expect(apiFetch('/api/test')).rejects.toThrow('Network error');

    try {
      await apiFetch('/api/test');
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      if (error instanceof FetchError) {
        expect(error.status).toBe(500);
      }
    }
  });

  it('should handle unknown errors', async () => {
    mockFetch.mockRejectedValue('string error');

    await expect(apiFetch('/api/test')).rejects.toThrow(FetchError);
    await expect(apiFetch('/api/test')).rejects.toThrow('An unknown error occurred');

    try {
      await apiFetch('/api/test');
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      if (error instanceof FetchError) {
        expect(error.status).toBe(500);
      }
    }
  });

  it('should preserve FetchError when re-throwing', async () => {
    const apiResponse: ApiResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => apiResponse,
    });

    try {
      await apiFetch('/api/test');
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);
      if (error instanceof FetchError) {
        expect(error.code).toBe('NOT_FOUND');
        expect(error.message).toBe('Resource not found');
        expect(error.status).toBe(404);
      }
    }
  });
});

describe('api convenience methods', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should make GET request using api.get', async () => {
    const responseData = { id: '1' };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    const result = await api.get<typeof responseData>('/api/test');

    expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual(responseData);
  });

  it('should make POST request using api.post', async () => {
    const requestData = { name: 'Test' };
    const responseData = { id: '1', name: 'Test' };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => apiResponse,
    });

    const result = await api.post<typeof responseData>('/api/test', requestData);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestData),
      })
    );
    expect(result).toEqual(responseData);
  });

  it('should make POST request without body', async () => {
    const responseData = { success: true };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    await api.post<typeof responseData>('/api/test');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        body: undefined,
      })
    );
  });

  it('should make PUT request using api.put', async () => {
    const requestData = { name: 'Updated' };
    const responseData = { id: '1', name: 'Updated' };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    const result = await api.put<typeof responseData>('/api/test/1', requestData);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(requestData),
      })
    );
    expect(result).toEqual(responseData);
  });

  it('should make PATCH request using api.patch', async () => {
    const requestData = { name: 'Patched' };
    const responseData = { id: '1', name: 'Patched' };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    const result = await api.patch<typeof responseData>('/api/test/1', requestData);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(requestData),
      })
    );
    expect(result).toEqual(responseData);
  });

  it('should make DELETE request using api.delete', async () => {
    const responseData = { success: true };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    const result = await api.delete<typeof responseData>('/api/test/1');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result).toEqual(responseData);
  });

  it('should pass options to convenience methods', async () => {
    const responseData = { items: [] };
    const apiResponse: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiResponse,
    });

    await api.get<typeof responseData>('/api/items', {
      params: { page: 1 },
      headers: { Authorization: 'Bearer token' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/items?page=1',
      expect.objectContaining({
        method: 'GET',
      })
    );

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs).toBeDefined();
    const headers = callArgs![1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token');
  });
});
