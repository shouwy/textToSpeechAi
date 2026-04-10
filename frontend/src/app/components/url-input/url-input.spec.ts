import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UrlInput } from './url-input';

describe('UrlInput', () => {
  let component: UrlInput;
  let fixture: ComponentFixture<UrlInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UrlInput],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid urlControl when empty', () => {
    component.urlControl.setValue('');
    expect(component.urlControl.invalid).toBe(true);
  });

  it('should have valid urlControl with valid URL', () => {
    component.urlControl.setValue('https://example.com/chapter-1');
    expect(component.urlControl.valid).toBe(true);
  });

  it('should have invalid urlControl with non-http URL', () => {
    component.urlControl.setValue('ftp://example.com');
    expect(component.urlControl.invalid).toBe(true);
  });
});

