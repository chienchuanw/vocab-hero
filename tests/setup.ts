import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock ResizeObserver (required by Radix UI components)
class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock IntersectionObserver (required by some UI components)
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

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
interface MockSpeechSynthesisUtteranceInstance {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => unknown) | null;
}
const mockSpeechSynthesisUtterance = vi.fn().mockImplementation(function (
  this: MockSpeechSynthesisUtteranceInstance,
  text: string
) {
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

global.SpeechSynthesisUtterance =
  mockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

// Mock MediaRecorder (required for audio recording)
interface BlobEvent {
  data: Blob;
}
class MediaRecorderMock {
  state = 'inactive';
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

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

global.MediaRecorder = MediaRecorderMock as unknown as typeof MediaRecorder;
(
  global.MediaRecorder as unknown as { isTypeSupported: (type: string) => boolean }
).isTypeSupported = vi.fn(() => true);

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
