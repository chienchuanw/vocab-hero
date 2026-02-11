import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockRecognize, mockTerminate, mockWorker, mockCreateWorker } = vi.hoisted(() => {
  const mockRecognize = vi.fn();
  const mockTerminate = vi.fn();
  const mockWorker = { recognize: mockRecognize, terminate: mockTerminate };
  const mockCreateWorker = vi.fn();
  return { mockRecognize, mockTerminate, mockWorker, mockCreateWorker };
});

vi.mock('tesseract.js', () => ({
  createWorker: mockCreateWorker,
}));

import { initializeOcr, recognizeText, terminateOcr } from './tesseract-worker';
import type { OcrProgress, OcrResult } from './tesseract-worker';

describe('tesseract-worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateWorker.mockResolvedValue(mockWorker);
    mockTerminate.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await terminateOcr();
  });

  describe('module exports', () => {
    it('should export initializeOcr function', () => {
      expect(typeof initializeOcr).toBe('function');
    });

    it('should export recognizeText function', () => {
      expect(typeof recognizeText).toBe('function');
    });

    it('should export terminateOcr function', () => {
      expect(typeof terminateOcr).toBe('function');
    });
  });

  describe('initializeOcr', () => {
    it('should create a worker with Japanese and English languages', async () => {
      await initializeOcr();

      expect(mockCreateWorker).toHaveBeenCalledWith(
        'jpn+eng',
        expect.any(Number),
        expect.objectContaining({
          logger: expect.any(Function),
        })
      );
    });

    it('should forward progress events to the callback', async () => {
      const progressCallback = vi.fn();

      mockCreateWorker.mockImplementation(
        async (
          _langs: string,
          _oem: number,
          options: { logger: (msg: { status: string; progress: number }) => void }
        ) => {
          if (options?.logger) {
            options.logger({ status: 'loading tesseract core', progress: 0.5 });
          }
          return mockWorker;
        }
      );

      await initializeOcr(progressCallback);

      expect(progressCallback).toHaveBeenCalledWith({
        status: 'loading tesseract core',
        progress: 0.5,
      });
    });

    it('should not create a new worker if already initialized', async () => {
      await initializeOcr();
      await initializeOcr();

      expect(mockCreateWorker).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from createWorker', async () => {
      mockCreateWorker.mockRejectedValue(new Error('Failed to load worker'));

      await expect(initializeOcr()).rejects.toThrow('Failed to load worker');
    });
  });

  describe('recognizeText', () => {
    it('should return OcrResult with text and confidence', async () => {
      const mockResult = {
        data: {
          text: 'こんにちは Hello',
          confidence: 92,
        },
      };
      mockRecognize.mockResolvedValue(mockResult);

      const imageBlob = new Blob(['fake-image-data'], { type: 'image/png' });
      const result: OcrResult = await recognizeText(imageBlob);

      expect(result).toEqual({
        text: 'こんにちは Hello',
        confidence: 92,
      });
    });

    it('should auto-initialize worker if not yet initialized', async () => {
      const mockResult = {
        data: {
          text: 'test',
          confidence: 85,
        },
      };
      mockRecognize.mockResolvedValue(mockResult);

      const imageBlob = new Blob(['fake'], { type: 'image/png' });
      await recognizeText(imageBlob);

      expect(mockCreateWorker).toHaveBeenCalled();
      expect(mockRecognize).toHaveBeenCalledWith(imageBlob);
    });

    it('should forward progress events during recognition', async () => {
      const progressCallback = vi.fn();
      const mockResult = {
        data: { text: 'result', confidence: 90 },
      };

      let capturedLogger: ((msg: { status: string; progress: number }) => void) | undefined;
      mockCreateWorker.mockImplementation(
        async (
          _langs: string,
          _oem: number,
          options: { logger: (msg: { status: string; progress: number }) => void }
        ) => {
          capturedLogger = options?.logger;
          return mockWorker;
        }
      );

      mockRecognize.mockImplementation(async () => {
        if (capturedLogger) {
          capturedLogger({ status: 'recognizing text', progress: 0.75 });
        }
        return mockResult;
      });

      const imageBlob = new Blob(['fake'], { type: 'image/png' });
      await recognizeText(imageBlob, progressCallback);

      expect(progressCallback).toHaveBeenCalledWith({
        status: 'recognizing text',
        progress: 0.75,
      });
    });

    it('should propagate recognition errors', async () => {
      mockRecognize.mockRejectedValue(new Error('Recognition failed'));

      const imageBlob = new Blob(['fake'], { type: 'image/png' });
      await expect(recognizeText(imageBlob)).rejects.toThrow('Recognition failed');
    });

    it('should accept File objects', async () => {
      const mockResult = {
        data: { text: 'file text', confidence: 88 },
      };
      mockRecognize.mockResolvedValue(mockResult);

      const file = new File(['fake-image'], 'screenshot.png', { type: 'image/png' });
      const result = await recognizeText(file);

      expect(result.text).toBe('file text');
      expect(mockRecognize).toHaveBeenCalledWith(file);
    });
  });

  describe('terminateOcr', () => {
    it('should call worker.terminate when worker exists', async () => {
      await initializeOcr();
      await terminateOcr();

      expect(mockTerminate).toHaveBeenCalled();
    });

    it('should not throw when called without initialization', async () => {
      await expect(terminateOcr()).resolves.not.toThrow();
    });

    it('should allow re-initialization after termination', async () => {
      await initializeOcr();
      await terminateOcr();

      mockCreateWorker.mockClear();
      mockCreateWorker.mockResolvedValue(mockWorker);

      await initializeOcr();
      expect(mockCreateWorker).toHaveBeenCalledTimes(1);
    });
  });

  describe('type contracts', () => {
    it('OcrProgress should have status and progress fields', () => {
      const progress: OcrProgress = {
        status: 'loading',
        progress: 0.5,
      };
      expect(progress.status).toBe('loading');
      expect(progress.progress).toBe(0.5);
    });

    it('OcrResult should have text and confidence fields', () => {
      const result: OcrResult = {
        text: 'test text',
        confidence: 95,
      };
      expect(result.text).toBe('test text');
      expect(result.confidence).toBe(95);
    });
  });
});
