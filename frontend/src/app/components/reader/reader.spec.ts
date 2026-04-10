import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { Reader } from './reader';

describe('Reader', () => {
  let component: Reader;
  let fixture: ComponentFixture<Reader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Reader],
      imports: [
        NoopAnimationsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatIconModule,
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Reader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show null chapter initially', () => {
    expect(component.chapter).toBeNull();
  });

  it('isActive should return true for current paragraph index', () => {
    component.currentParagraphIndex = 2;
    expect(component.isActive(2)).toBe(true);
    expect(component.isActive(0)).toBe(false);
  });
});
