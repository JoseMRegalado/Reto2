import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilIdealComponent } from './perfil-ideal.component';

describe('PerfilIdealComponent', () => {
  let component: PerfilIdealComponent;
  let fixture: ComponentFixture<PerfilIdealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PerfilIdealComponent]
    });
    fixture = TestBed.createComponent(PerfilIdealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
