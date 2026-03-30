import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import * as fs from 'fs/promises';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockResolvedValue(undefined),
}));

import { POST, DELETE } from './route';

function createMockRequest(
  fileContent: ArrayBuffer | null,
  fileName: string,
  mimeType: string,
  size?: number
): NextRequest {
  const request = new NextRequest('http://localhost:3000/api/sentences/upload', {
    method: 'POST',
  });

  const mockFile =
    fileContent !== null
      ? {
          type: mimeType,
          name: fileName,
          size: size ?? fileContent.byteLength,
          arrayBuffer: vi.fn().mockResolvedValue(fileContent),
        }
      : null;

  vi.spyOn(request, 'formData').mockResolvedValue({
    get: vi.fn().mockReturnValue(mockFile),
  } as unknown as FormData);

  return request;
}

describe('POST /api/sentences/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload a valid JPEG image and return imageUrl', async () => {
    const content = new ArrayBuffer(100);
    const request = createMockRequest(content, 'screenshot.jpg', 'image/jpeg');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.imageUrl).toMatch(/^\/uploads\/sentences\/[\w-]+\.jpg$/);
    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should upload a valid PNG image', async () => {
    const content = new ArrayBuffer(100);
    const request = createMockRequest(content, 'screenshot.png', 'image/png');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.imageUrl).toMatch(/^\/uploads\/sentences\/[\w-]+\.png$/);
  });

  it('should upload a valid WebP image', async () => {
    const content = new ArrayBuffer(100);
    const request = createMockRequest(content, 'screenshot.webp', 'image/webp');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.imageUrl).toMatch(/^\/uploads\/sentences\/[\w-]+\.webp$/);
  });

  it('should return 400 for invalid file type', async () => {
    const content = new ArrayBuffer(100);
    const request = createMockRequest(content, 'document.pdf', 'application/pdf');

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('Invalid file type');
  });

  it('should return 400 when no file is provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences/upload', {
      method: 'POST',
    });
    vi.spyOn(request, 'formData').mockResolvedValue({
      get: vi.fn().mockReturnValue(null),
    } as unknown as FormData);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('No file');
  });

  it('should return 400 for oversized file (>10MB)', async () => {
    const content = new ArrayBuffer(100);
    const oversize = 11 * 1024 * 1024;
    const request = createMockRequest(content, 'large.png', 'image/png', oversize);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.message).toContain('File too large');
  });
});

describe('DELETE /api/sentences/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete an existing uploaded file', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences/upload', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl: '/uploads/sentences/test-file.png' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(fs.unlink).toHaveBeenCalled();
  });

  it('should return 200 for non-existent file (idempotent)', async () => {
    (fs.unlink as ReturnType<typeof vi.fn>).mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    );

    const request = new NextRequest('http://localhost:3000/api/sentences/upload', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl: '/uploads/sentences/nonexistent.png' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 400 when imageUrl is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences/upload', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should reject imageUrl with path traversal', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences/upload', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl: '/uploads/sentences/../../etc/passwd' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
