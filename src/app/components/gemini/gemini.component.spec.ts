import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeminiComponent } from './gemini.component';

describe('GeminiComponent', () => {
  let component: GeminiComponent;
  let fixture: ComponentFixture<GeminiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeminiComponent]
    });
    fixture = TestBed.createComponent(GeminiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
