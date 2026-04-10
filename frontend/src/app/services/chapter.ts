import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Chapter, ExtractRequest } from '../models/chapter.model';
import { environment } from '../../environments/environment';

/**
 * Service for fetching and managing chapter data from the backend.
 */
@Injectable({
  providedIn: 'root',
})
export class ChapterService {
  private readonly apiUrl = `${environment.apiUrl}/api/extract`;

  private chapterSubject = new BehaviorSubject<Chapter | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private currentUrlSubject = new BehaviorSubject<string>('');

  /** Observable of the currently loaded chapter. */
  chapter$ = this.chapterSubject.asObservable();

  /** Observable loading state. */
  loading$ = this.loadingSubject.asObservable();

  /** Observable of the current URL being read. */
  currentUrl$ = this.currentUrlSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Loads a chapter from the given URL by calling the backend extraction API.
   *
   * @param url the URL of the chapter to load
   * @returns Observable that resolves to the loaded Chapter
   */
  loadChapter(url: string): Observable<Chapter> {
    if (!url || !url.trim()) {
      return throwError(() => new Error('URL must not be blank'));
    }

    this.loadingSubject.next(true);
    this.currentUrlSubject.next(url);

    const request: ExtractRequest = { url };

    return this.http.post<Chapter>(this.apiUrl, request).pipe(
      tap((chapter) => {
        this.chapterSubject.next(chapter);
        this.loadingSubject.next(false);
      }),
      catchError((err) => {
        this.loadingSubject.next(false);
        return throwError(() => err);
      })
    );
  }

  /** Returns the currently loaded chapter snapshot. */
  getCurrentChapter(): Chapter | null {
    return this.chapterSubject.getValue();
  }
}

