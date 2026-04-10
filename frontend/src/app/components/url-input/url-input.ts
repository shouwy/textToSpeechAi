import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChapterService } from '../../services/chapter';
import { AudioService } from '../../services/audio';
import { TtsService } from '../../services/tts';

/**
 * Component that handles URL input and triggers chapter loading.
 */
@Component({
  selector: 'app-url-input',
  standalone: false,
  templateUrl: './url-input.html',
  styleUrl: './url-input.scss',
})
export class UrlInput implements OnInit {
  urlControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^https?:\/\/.+/),
  ]);

  isLoading = false;

  constructor(
    private chapterService: ChapterService,
    private audioService: AudioService,
    private ttsService: TtsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.chapterService.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  /**
   * Loads the chapter at the entered URL.
   */
  loadChapter(): void {
    if (this.urlControl.invalid) {
      this.snackBar.open('Please enter a valid URL (http:// or https://)', 'Close', {
        duration: 3000,
      });
      return;
    }

    const url = this.urlControl.value!.trim();
    this.audioService.stopAll();

    this.chapterService.loadChapter(url).subscribe({
      next: () => {
        this.snackBar.open('Chapter loaded successfully!', 'Close', { duration: 2000 });
      },
      error: (err) => {
        const message =
          err?.error?.error ?? err?.message ?? 'Failed to load chapter. Check the URL and try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  /** Returns true if the URL field has a validation error. */
  get urlError(): string | null {
    if (this.urlControl.hasError('required')) return 'URL is required';
    if (this.urlControl.hasError('pattern')) return 'URL must start with http:// or https://';
    return null;
  }
}

