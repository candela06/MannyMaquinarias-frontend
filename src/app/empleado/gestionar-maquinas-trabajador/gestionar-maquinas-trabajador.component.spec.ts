import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarMaquinasTrabajadorComponent } from './gestionar-maquinas-trabajador.component';

describe('GestionarMaquinasTrabajadorComponent', () => {
  let component: GestionarMaquinasTrabajadorComponent;
  let fixture: ComponentFixture<GestionarMaquinasTrabajadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarMaquinasTrabajadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarMaquinasTrabajadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
