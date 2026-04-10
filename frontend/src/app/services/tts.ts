import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TtsEngineId, TtsRequest } from '../models/tts.model';
import { environment } from '../../environments/environment';

/**
 * Service for Text-to-Speech synthesis.
 * Implements a strategy pattern:
 *  1. ElevenLabs (if backend reports key configured)
 *  2. Google TTS (if backend reports key configured)
 *  3. Web Speech API (browser fallback)
 */
@Injectable({
  providedIn: 'root',
})
export class TtsService {
  private readonly ttsUrl = `${environment.apiUrl}/api/tts`;
  private readonly engineUrl = `${environment.apiUrl}/api/tts/engine`;

  private activeEngineSubject = new BehaviorSubject<TtsEngineId>('browser');

  /** Observable of the active TTS engine. */
  activeEngine$ = this.activeEngineSubject.asObservable();

  constructor(private http: HttpClient) {
    this.detectEngine();
  }

  /**
   * Queries the backend to determine which TTS engine is active.
   */
  detectEngine(): void {
    this.http
      .get<{ engine: TtsEngineId }>(this.engineUrl)
      .pipe(catchError(() => of({ engine: 'browser' as TtsEngineId })))
      .subscribe((res) => this.activeEngineSubject.next(res.engine));
  }

  /**
   * Returns the currently active TTS engine ID.
   */
  getActiveEngine(): TtsEngineId {
    return this.activeEngineSubject.getValue();
  }

  /**
   * Sets the active TTS engine manually (e.g. user selects from dropdown).
   */
  setEngine(engine: TtsEngineId): void {
    this.activeEngineSubject.next(engine);
  }

  /**
   * Synthesizes the given text using the backend API.
   * Returns a Blob containing the MP3 audio.
   *
   * @param text the text to synthesize
   * @param voiceId optional voice ID for ElevenLabs
   */
  synthesizeWithBackend(text: string, voiceId?: string): Observable<Blob> {
    const request: TtsRequest = { text, voiceId };
    return this.http.post(this.ttsUrl, request, { responseType: 'blob' });
  }
}

