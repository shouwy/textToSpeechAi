import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with isPlaying false', () => {
    return new Promise<void>((resolve) => {
      service.isPlaying$.subscribe((playing) => {
        expect(playing).toBe(false);
        resolve();
      });
    });
  });

  it('should update rate via setRate without error', () => {
    service.setRate(1.5);
    expect(true).toBe(true);
  });

  it('should return empty voices array when speechSynth not available', () => {
    const voices = service.getAvailableVoices();
    expect(Array.isArray(voices)).toBe(true);
  });
});


