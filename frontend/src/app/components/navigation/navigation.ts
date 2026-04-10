import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chapter } from '../../models/chapter.model';
import { ChapterService } from '../../services/chapter';
import { AudioService } from '../../services/audio';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Component for navigating between chapters (previous / next).
 */
@Component({
  selector: 'app-navigation',
  standalone: false,
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation implements OnInit, OnDestroy {
  chapter: Chapter | null = null;
  isLoading = false;

  private subscriptions = new Subscription();

  constructor(
    private chapterService: ChapterService,
    private audioService: AudioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.chapterService.chapter$.subscribe((ch) => (this.chapter = ch))
    );
    this.subscriptions.add(
      this.chapterService.loading$.subscribe((loading) => (this.isLoading = loading))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /** Navigates to the next chapter. */
  goNext(): void {
    if (this.chapter?.nextChapterUrl) {
      this.navigate(this.chapter.nextChapterUrl);
    }
  }

  /** Navigates to the previous chapter. */
  goPrevious(): void {
    if (this.chapter?.previousChapterUrl) {
      this.navigate(this.chapter.previousChapterUrl);
    }
  }

  private navigate(url: string): void {
    this.audioService.stopAll();
    this.chapterService.loadChapter(url).subscribe({
      error: (err) => {
        const message = err?.error?.error ?? 'Failed to navigate to chapter.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  get hasPrevious(): boolean {
    return !!this.chapter?.previousChapterUrl;
  }

  get hasNext(): boolean {
    return !!this.chapter?.nextChapterUrl;
  }
}

