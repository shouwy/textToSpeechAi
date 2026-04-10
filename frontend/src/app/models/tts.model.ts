/**
 * Available TTS engine identifiers.
 */
export type TtsEngineId = 'elevenlabs' | 'google' | 'browser';

/**
 * Metadata for a TTS engine option.
 */
export interface TtsEngine {
  id: TtsEngineId;
  label: string;
  description: string;
}

/**
 * Request body for the /api/tts endpoint.
 */
export interface TtsRequest {
  text: string;
  voiceId?: string;
}

/**
 * Application state managed via RxJS subjects in services.
 */
export interface AppState {
  currentUrl: string;
  isLoading: boolean;
  activeEngine: TtsEngineId;
  isPlaying: boolean;
  readingProgress: number;
}
