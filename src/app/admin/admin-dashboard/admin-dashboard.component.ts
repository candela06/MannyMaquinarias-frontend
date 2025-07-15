import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngFor, *ngIf
import { RouterModule } from '@angular/router'; // Necesario para routerLink

/**
 * @description Componente del panel de administración.
 * Sirve como punto central para que los administradores accedan a las diferentes
 * funcionalidades de gestión de la aplicación, como el registro, listado y modificación de máquinas.
 */
@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, RouterModule], // Importar RouterModule
})
export class AdminDashboardComponent {
  adminOptions = [
    {
      title: 'Registrar Máquina',
      description: 'Añadir una nueva máquina al inventario.',
      icon: 'bi-plus-circle-fill',
      route: '/admin/maquinas/registrar',
    },
    {
      title: 'Gestionar Máquinas',
      description: 'Ver, modificar y eliminar máquinas existentes.',
      icon: 'bi-list-ul',
      route: '/admin/maquinas/listar',
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar cuentas de usuario, roles y lista negra',
      icon: 'bi-people-fill',
      route: '/admin/usuarios/listar',
    },
    {
      title: 'Estadisticas',
      description: 'Ver estadisticas de usuarios, máquinas e ingresos',
      icon: 'bi-graph-up-arrow',
      route: '/admin/estadisticas',
    },
  ];

  logClick(route: string): void {
    console.log('Botón "Ir a ' + route + '" clicado.');
  }
}
