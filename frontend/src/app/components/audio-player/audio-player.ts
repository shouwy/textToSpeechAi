import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AudioService } from '../../services/audio';
import { TtsService } from '../../services/tts';
import { ChapterService } from '../../services/chapter';
import { TtsEngine, TtsEngineId } from '../../models/tts.model';
import { Chapter } from '../../models/chapter.model';

/**
 * Component for controlling audio playback.
 * Supports both backend TTS engines (ElevenLabs / Google) and Web Speech API fallback.
 */
@Component({
  selector: 'app-audio-player',
  standalone: false,
  templateUrl: './audio-player.html',
  styleUrl: './audio-player.scss',
})
export class AudioPlayer implements OnInit, OnDestroy {
  isPlaying = false;
  progress = 0;
  rate = 1.0;
  activeEngine: TtsEngineId = 'browser';
  selectedEngineId: TtsEngineId = 'browser';
  availableVoices: SpeechSynthesisVoice[] = [];
  selectedVoiceUri = '';
  chapter: Chapter | null = null;

  readonly engineOptions: TtsEngine[] = [
    { id: 'elevenlabs', label: 'ElevenLabs AI', description: 'Cloud AI (requires API key)' },
    { id: 'google', label: 'Google TTS', description: 'Cloud AI (requires API key)' },
    { id: 'browser', label: 'Browser (Web Speech)', description: '100% free, built-in' },
  ];

  private subscriptions = new Subscription();

  constructor(
    private audioService: AudioService,
    private ttsService: TtsService,
    private chapterService: ChapterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.audioService.isPlaying$.subscribe((playing) => (this.isPlaying = playing))
    );

    this.subscriptions.add(
      this.audioService.progress$.subscribe((p) => (this.progress = p))
    );

    this.subscriptions.add(
      this.ttsService.activeEngine$.subscribe((engine) => {
        this.activeEngine = engine;
        this.selectedEngineId = engine;
      })
    );

    this.subscriptions.add(
      this.chapterService.chapter$.subscribe((ch) => (this.chapter = ch))
    );

    // Load available browser voices
    this.loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadVoices(): void {
    this.availableVoices = this.audioService.getAvailableVoices();
  }

  /**
   * Starts playback using the selected TTS engine.
   */
  play(): void {
    if (!this.chapter || !this.chapter.paragraphs.length) {
      this.snackBar.open('Please load a chapter first.', 'Close', { duration: 3000 });
      return;
    }

    const engine = this.selectedEngineId;

    if (engine === 'browser') {
      this.playWithBrowser();
    } else {
      this.playWithBackend(engine);
    }
  }

  private playWithBrowser(): void {
    if (!this.chapter) return;
    if (this.selectedVoiceUri) {
      this.audioService.setVoiceByUri(this.selectedVoiceUri);
    }
    this.audioService.speakParagraphs(this.chapter.paragraphs);
  }

  private playWithBackend(engine: TtsEngineId): void {
    if (!this.chapter) return;

    // Join all paragraphs for API TTS (backend limits to 5000 chars)
    const text = this.chapter.paragraphs.join(' ').substring(0, 5000);

    this.ttsService.synthesizeWithBackend(text).subscribe({
      next: (blob) => this.audioService.playBlob(blob),
      error: (err) => {
        // If backend returns 503, fall back to browser
        if (err?.status === 503) {
          this.snackBar.open(
            'No API key configured — falling back to browser speech synthesis.',
            'Close',
            { duration: 4000 }
          );
          this.selectedEngineId = 'browser';
          this.ttsService.setEngine('browser');
          this.playWithBrowser();
        } else {
          this.snackBar.open(
            err?.error?.error ?? 'TTS synthesis failed.',
            'Close',
            { duration: 5000 }
          );
        }
      },
    });
  }

  /** Pauses current playback. */
  pause(): void {
    this.audioService.pause();
  }

  /** Resumes paused playback. */
  resume(): void {
    this.audioService.resume();
  }

  /** Stops all playback. */
  stop(): void {
    this.audioService.stopAll();
  }

  /** Updates playback rate when slider changes. */
  onRateChange(value: number): void {
    this.rate = value;
    this.audioService.setRate(value);
  }

  /** Updates selected voice when user picks from dropdown. */
  onVoiceChange(voiceUri: string): void {
    this.selectedVoiceUri = voiceUri;
    this.audioService.setVoiceByUri(voiceUri);
  }

  /** Updates the active engine when user selects from dropdown. */
  onEngineChange(engineId: TtsEngineId): void {
    this.selectedEngineId = engineId;
    this.ttsService.setEngine(engineId);
    this.audioService.stopAll();
  }

  /** Returns a human-readable label for the active engine. */
  get engineLabel(): string {
    return this.engineOptions.find((e) => e.id === this.activeEngine)?.label ?? this.activeEngine;
  }

  /** Returns true if the browser supports Web Speech API. */
  get speechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

