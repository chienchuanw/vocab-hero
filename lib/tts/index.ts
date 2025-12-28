/**
 * TTS Module
 * Exports TTS-related utilities and types
 */

export { TTSEngine, ttsEngine } from './tts-engine';
export type {
  TTSConfig,
  TTSState,
  TTSVoice,
  TTSError,
  TTSErrorType,
  TTSSpeed,
  TTSVolume,
  TTSPitch,
  TTSEngine as ITTSEngine,
} from './tts.types';
export {
  DEFAULT_TTS_CONFIG,
  TTS_SPEED_PRESETS,
  TTS_LIMITS,
} from './tts.types';

