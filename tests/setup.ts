import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock ResizeObserver (required by Radix UI components)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as any;

// Mock IntersectionObserver (required by some UI components)
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = IntersectionObserverMock as any;

// Mock matchMedia (required for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Web Speech API (required for TTS features)
const mockSpeechSynthesisUtterance = vi.fn().mockImplementation(function (this: any, text: string) {
  this.text = text;
  this.lang = 'ja-JP';
  this.rate = 1;
  this.pitch = 1;
  this.volume = 1;
  this.onend = null;
  this.onerror = null;
});

const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
};

global.SpeechSynthesisUtterance = mockSpeechSynthesisUtterance as any;
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

// Mock MediaRecorder (required for audio recording)
class MediaRecorderMock {
  state = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  requestData() {
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob() });
    }
  }
}

global.MediaRecorder = MediaRecorderMock as any;
(global.MediaRecorder as any).isTypeSupported = vi.fn(() => true);

// Mock getUserMedia (required for microphone access)
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: vi.fn(),
            kind: 'audio',
            enabled: true,
          },
        ],
        getAudioTracks: () => [
          {
            stop: vi.fn(),
            kind: 'audio',
            enabled: true,
          },
        ],
      })
    ),
  },
});

// Mock HTMLMediaElement (required for audio playback)
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
});

// 每個測試後清理 React 組件
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
