import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IniciarMantenimientoComponent } from './iniciar-mantenimiento.component';

describe('IniciarMantenimientoComponent', () => {
  let component: IniciarMantenimientoComponent;
  let fixture: ComponentFixture<IniciarMantenimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciarMantenimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IniciarMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
