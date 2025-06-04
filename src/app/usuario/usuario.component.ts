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
  templateUrl: './usuario.component.html',
  //styleUrls: ['./usuario.component.css'],
  imports: [CommonModule, RouterModule], // Importar RouterModule
})
export class UsuarioDashboardComponent {
  /**
   * @description Define las opciones disponibles en el panel de administración.
   * Cada objeto contiene el título, una descripción, un icono y la ruta a la que navega.
   */
  adminOptions = [
    {
      title: 'Ver Reservas',
      description: 'Consultar tu historial de reservas',
      icon: 'bi-plus-circle-fill', // Icono de Bootstrap Icons
      route: '/mis-reservas',
    },
    {
      title: 'Modificar usuario',
      description: 'Ver y modificar mi usuario.',
      icon: 'bi-list-ul',
      route: '/user-modificar',
    },
    {
      title: 'Eliminar cuenta propia',
      description: 'Elimina tu cuenta propia',
      icon: 'bi-people-fill',
      route: '/eliminar-micuenta',
    },
  ];

  logClick(route: string): void {
    console.log('Botón "Ir a ' + route + '" clicado.');
  }
}
