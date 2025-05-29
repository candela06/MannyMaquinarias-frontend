import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMaquinariaComponent } from './detalle-maquinaria.component';

describe('DetalleMaquinariaComponent', () => {
  let component: DetalleMaquinariaComponent;
  let fixture: ComponentFixture<DetalleMaquinariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMaquinariaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleMaquinariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
