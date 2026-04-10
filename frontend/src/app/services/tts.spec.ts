import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TtsService } from './tts';

describe('TtsService', () => {
  let service: TtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TtsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to browser engine', () => {
    return new Promise<void>((resolve) => {
      service.activeEngine$.subscribe((engine) => {
        expect(['browser', 'elevenlabs', 'google']).toContain(engine);
        resolve();
      });
    });
  });

  it('should allow manually setting engine', () => {
    service.setEngine('elevenlabs');
    expect(service.getActiveEngine()).toBe('elevenlabs');

    service.setEngine('browser');
    expect(service.getActiveEngine()).toBe('browser');
  });
});


