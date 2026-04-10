import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ChapterService } from './chapter';

describe('ChapterService', () => {
  let service: ChapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null chapter', () => {
    return new Promise<void>((resolve) => {
      service.chapter$.subscribe((ch) => {
        expect(ch).toBeNull();
        resolve();
      });
    });
  });

  it('should initialize with loading false', () => {
    return new Promise<void>((resolve) => {
      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        resolve();
      });
    });
  });

  it('loadChapter should error on blank url', () => {
    return new Promise<void>((resolve) => {
      service.loadChapter('').subscribe({
        error: (err) => {
          expect(err.message).toContain('blank');
          resolve();
        },
      });
    });
  });
});


