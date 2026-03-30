import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function getUploadDir(): string {
  return path.join(process.cwd(), 'public', 'uploads', 'sentences');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    const fileBlob = file as Blob;
    if (!file || typeof fileBlob.arrayBuffer !== 'function') {
      return ApiErrors.VALIDATION_ERROR('No file provided');
    }

    if (!ALLOWED_TYPES.has(fileBlob.type)) {
      return ApiErrors.VALIDATION_ERROR(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      );
    }

    if (fileBlob.size > MAX_FILE_SIZE) {
      return ApiErrors.VALIDATION_ERROR('File too large. Maximum size is 10MB.');
    }

    const ext = MIME_TO_EXT[fileBlob.type] ?? 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = getUploadDir();

    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await fileBlob.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/sentences/${filename}`;
    return successResponse({ imageUrl }, 201);
  } catch (error) {
    console.error('Error uploading image:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to upload image');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return ApiErrors.VALIDATION_ERROR('imageUrl is required');
    }

    if (!imageUrl.startsWith('/uploads/sentences/') || imageUrl.includes('..')) {
      return ApiErrors.VALIDATION_ERROR('Invalid imageUrl path');
    }

    const filename = path.basename(imageUrl);
    const filePath = path.join(getUploadDir(), filename);

    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      const fsErr = err as NodeJS.ErrnoException;
      if (fsErr.code !== 'ENOENT') {
        throw err;
      }
    }

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return ApiErrors.VALIDATION_ERROR('Invalid request body');
    }
    console.error('Error deleting image:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to delete image');
  }
}
