// src/app/usuario/reservas/pago/failure.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-failure',
  templateUrl: './failure.component.html',
})
export class FailureComponent {
  constructor(private router: Router) {}

  volverCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  volverInicio() {
    this.router.navigate(['/']);
  }
}
