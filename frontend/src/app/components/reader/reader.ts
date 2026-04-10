import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chapter } from '../../models/chapter.model';
import { ChapterService } from '../../services/chapter';
import { AudioService } from '../../services/audio';

/**
 * Component that displays the chapter title and paragraphs,
 * and highlights the paragraph currently being read.
 */
@Component({
  selector: 'app-reader',
  standalone: false,
  templateUrl: './reader.html',
  styleUrl: './reader.scss',
})
export class Reader implements OnInit, OnDestroy {
  chapter: Chapter | null = null;
  isLoading = false;
  currentParagraphIndex = 0;

  private subscriptions = new Subscription();

  constructor(
    private chapterService: ChapterService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.chapterService.chapter$.subscribe((ch) => {
        this.chapter = ch;
        this.currentParagraphIndex = 0;
      })
    );

    this.subscriptions.add(
      this.chapterService.loading$.subscribe((loading) => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.add(
      this.audioService.currentChunk$.subscribe((index) => {
        this.currentParagraphIndex = index;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Returns true if the given paragraph is currently highlighted during playback.
   */
  isActive(index: number): boolean {
    return this.currentParagraphIndex === index;
  }
}

