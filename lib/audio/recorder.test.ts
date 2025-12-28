import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioRecorder } from './recorder';

/**
 * AudioRecorder Test Suite
 * Tests for audio recording functionality with MediaRecorder API
 */

// Mock MediaRecorder
class MockMediaRecorder {
  state: string = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['test'], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }
}

global.MediaRecorder = MockMediaRecorder as any;

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  }),
} as any;

describe('AudioRecorder', () => {
  let recorder: AudioRecorder;

  beforeEach(() => {
    vi.clearAllMocks();
    recorder = new AudioRecorder();
  });

  describe('isSupported', () => {
    it('should return true when MediaRecorder is available', () => {
      expect(AudioRecorder.isSupported()).toBe(true);
    });
  });

  describe('startRecording', () => {
    it('should request microphone permission', async () => {
      await recorder.startRecording();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      });
    });

    it('should start recording', async () => {
      await recorder.startRecording();

      expect(recorder.isRecording()).toBe(true);
    });

    it('should throw error if already recording', async () => {
      await recorder.startRecording();

      await expect(recorder.startRecording()).rejects.toThrow(
        'Already recording'
      );
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return audio blob', async () => {
      await recorder.startRecording();
      const blob = await recorder.stopRecording();

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('audio/webm');
      expect(recorder.isRecording()).toBe(false);
    });

    it('should throw error if not recording', async () => {
      await expect(recorder.stopRecording()).rejects.toThrow(
        'Not currently recording'
      );
    });
  });

  describe('pauseRecording', () => {
    it('should pause recording', async () => {
      await recorder.startRecording();
      recorder.pauseRecording();

      expect(recorder.isPaused()).toBe(true);
    });

    it('should throw error if not recording', () => {
      expect(() => recorder.pauseRecording()).toThrow(
        'Not currently recording'
      );
    });
  });

  describe('resumeRecording', () => {
    it('should resume recording', async () => {
      await recorder.startRecording();
      recorder.pauseRecording();
      recorder.resumeRecording();

      expect(recorder.isPaused()).toBe(false);
      expect(recorder.isRecording()).toBe(true);
    });

    it('should throw error if not paused', async () => {
      await recorder.startRecording();

      expect(() => recorder.resumeRecording()).toThrow(
        'Recording is not paused'
      );
    });
  });

  describe('getRecordingDuration', () => {
    it('should return recording duration in seconds', async () => {
      await recorder.startRecording();
      
      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const duration = recorder.getRecordingDuration();
      expect(duration).toBeGreaterThan(0);
    });

    it('should return 0 when not recording', () => {
      expect(recorder.getRecordingDuration()).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should stop media stream tracks', async () => {
      await recorder.startRecording();
      const stopSpy = vi.fn();
      (recorder as any).mediaStream.getTracks()[0].stop = stopSpy;

      recorder.cleanup();

      expect(stopSpy).toHaveBeenCalled();
    });
  });
});

