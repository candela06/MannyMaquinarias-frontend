import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-empleado-dashboard',
  templateUrl: './empleado-dashboard.component.html',
  imports: [CommonModule, RouterModule],
})
export class empleadoDashboardComponent {
  employeeOptions = [
    {
      title: 'Gestionar Máquinas',
      description:
        'Recibir, entregar, iniciar y finalizar mantenimiento de máquina.',
      icon: 'bi-plus-circle-fill',
      route: '',
    },
    {
      title: 'Reservas',
      description:
        'Todas las reservas de todos los usuarios y cancelar reservas',
      icon: 'bi-list-ul',
      route: '/trabajador/reservas',
    },
  ];

  logClick(route: string): void {
    console.log('Botón "Ir a ' + route + '" clicado.');
  }
}
