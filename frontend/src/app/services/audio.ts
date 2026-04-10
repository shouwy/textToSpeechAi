import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service that abstracts audio playback for both:
 * - HTMLAudioElement (when using backend TTS/API audio blobs)
 * - Web Speech API SpeechSynthesis (browser fallback)
 */
@Injectable({
  providedIn: 'root',
})
export class AudioService implements OnDestroy {
  private audioElement: HTMLAudioElement | null = null;
  private speechSynth: SpeechSynthesis | null = null;
  private utterances: SpeechSynthesisUtterance[] = [];
  private currentUtteranceIndex = 0;
  private chunks: string[] = [];

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private progressSubject = new BehaviorSubject<number>(0);
  private currentChunkSubject = new BehaviorSubject<number>(0);

  /** Observable playing state. */
  isPlaying$ = this.isPlayingSubject.asObservable();

  /** Observable reading progress (0–100). */
  progress$ = this.progressSubject.asObservable();

  /** Observable index of the paragraph currently being spoken. */
  currentChunk$ = this.currentChunkSubject.asObservable();

  private rate = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.speechSynth = window.speechSynthesis;
    }
  }

  ngOnDestroy(): void {
    this.stopAll();
  }

  // ─── HTMLAudioElement playback ──────────────────────────────────────────────

  /**
   * Plays an audio Blob (MP3) via HTMLAudioElement.
   *
   * @param blob MP3 audio blob from the backend TTS API
   */
  playBlob(blob: Blob): void {
    this.stopAll();
    const url = URL.createObjectURL(blob);
    this.audioElement = new HTMLAudioElement();
    this.audioElement.src = url;
    this.audioElement.playbackRate = this.rate;

    this.audioElement.onplay = () =>
      this.ngZone.run(() => this.isPlayingSubject.next(true));

    this.audioElement.onpause = () =>
      this.ngZone.run(() => this.isPlayingSubject.next(false));

    this.audioElement.onended = () => {
      this.ngZone.run(() => {
        this.isPlayingSubject.next(false);
        this.progressSubject.next(100);
        URL.revokeObjectURL(url);
      });
    };

    this.audioElement.ontimeupdate = () => {
      if (this.audioElement && this.audioElement.duration) {
        this.ngZone.run(() =>
          this.progressSubject.next(
            (this.audioElement!.currentTime / this.audioElement!.duration) * 100
          )
        );
      }
    };

    this.audioElement.play().catch((err) => console.error('Audio play error:', err));
  }

  // ─── Web Speech API playback ────────────────────────────────────────────────

  /**
   * Starts reading the provided paragraphs using the Web Speech API.
   * Text is read paragraph by paragraph.
   *
   * @param paragraphs array of text paragraphs to read
   * @param startIndex paragraph index to start from (default 0)
   */
  speakParagraphs(paragraphs: string[], startIndex = 0): void {
    if (!this.speechSynth) {
      console.warn('Web Speech API not available in this browser.');
      return;
    }
    this.stopAll();
    this.chunks = [...paragraphs];
    this.currentUtteranceIndex = startIndex;
    this.speakNextChunk();
  }

  private speakNextChunk(): void {
    if (!this.speechSynth) return;
    if (this.currentUtteranceIndex >= this.chunks.length) {
      this.ngZone.run(() => {
        this.isPlayingSubject.next(false);
        this.progressSubject.next(100);
      });
      return;
    }

    const text = this.chunks[this.currentUtteranceIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      this.ngZone.run(() => {
        this.isPlayingSubject.next(true);
        this.currentChunkSubject.next(this.currentUtteranceIndex);
        this.progressSubject.next(
          (this.currentUtteranceIndex / this.chunks.length) * 100
        );
      });
    };

    utterance.onend = () => {
      this.currentUtteranceIndex++;
      this.speakNextChunk();
    };

    utterance.onerror = (event) => {
      // 'interrupted' is fired when we cancel; treat it as non-fatal
      if (event.error !== 'interrupted') {
        console.error('SpeechSynthesis error:', event.error);
        this.ngZone.run(() => this.isPlayingSubject.next(false));
      }
    };

    this.speechSynth.speak(utterance);
  }

  // ─── Controls ───────────────────────────────────────────────────────────────

  /** Pauses current playback (works for both HTMLAudioElement and Web Speech API). */
  pause(): void {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    if (this.speechSynth && this.speechSynth.speaking) {
      this.speechSynth.pause();
      this.ngZone.run(() => this.isPlayingSubject.next(false));
    }
  }

  /** Resumes paused playback. */
  resume(): void {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play().catch((err) => console.error('Resume error:', err));
    }
    if (this.speechSynth && this.speechSynth.paused) {
      this.speechSynth.resume();
      this.ngZone.run(() => this.isPlayingSubject.next(true));
    }
  }

  /** Stops all playback and resets state. */
  stopAll(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    this.chunks = [];
    this.utterances = [];
    this.currentUtteranceIndex = 0;
    this.ngZone.run(() => {
      this.isPlayingSubject.next(false);
      this.progressSubject.next(0);
      this.currentChunkSubject.next(0);
    });
  }

  /**
   * Sets the playback rate for both audio element and speech synthesis.
   *
   * @param rate playback speed (0.5 – 2.0)
   */
  setRate(rate: number): void {
    this.rate = rate;
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  /**
   * Selects a Web Speech API voice by its URI.
   *
   * @param voiceURI the URI of the desired voice
   */
  setVoiceByUri(voiceURI: string): void {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    this.selectedVoice = voices.find((v) => v.voiceURI === voiceURI) ?? null;
  }

  /**
   * Returns all available Web Speech API voices.
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.speechSynth ? this.speechSynth.getVoices() : [];
  }

  /** Whether audio is currently paused (HTMLAudioElement). */
  isAudioPaused(): boolean {
    return this.audioElement?.paused ?? true;
  }

  /** Whether Web Speech API is paused. */
  isSpeechPaused(): boolean {
    return this.speechSynth?.paused ?? true;
  }

  /** Returns the current paragraph index being spoken. */
  getCurrentChunkIndex(): number {
    return this.currentUtteranceIndex;
  }
}

