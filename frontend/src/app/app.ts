import { Component } from '@angular/core';

/**
 * Root application component.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App {
  readonly title = 'WebNovel Reader';
}

