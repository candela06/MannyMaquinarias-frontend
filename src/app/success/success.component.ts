// src/app/usuario/reservas/pago/success.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
})
export class SuccessComponent {
  constructor(private router: Router) {}

  volverInicio() {
    this.router.navigate(['/']);
  }

  irMisReservas() {
    this.router.navigate(['/mis-reservas']);
  }
}
