import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * @description Componente del panel de gestión de usuarios.
 * Sirve como punto central para que los administradores accedan a las diferentes
 * funcionalidades de gestión de usuarios, como ver la lista negra, añadir/eliminar usuarios, etc.
 */
@Component({
  standalone: true,
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.css'],
  imports: [CommonModule, RouterModule],
})
export class GestionarUsuariosComponent {
  /**
   * @description Define las opciones disponibles dentro de la gestión de usuarios.
   */
  userManagementOptions = [
    {
      title: 'Lista Negra',
      description: 'Consultar la lista de clientes con restricciones.',
      icon: 'bi-person-fill-exclamation', // Icono para lista negra
      route: '/admin/usuarios/lista-negra', // <--- RUTA A LA LISTA NEGRA
    },

    {
      title: 'Usuarios',
      description: 'Ver, eliminar, crear usuarios y asignarles permisos',
      icon: 'bi-person-gear',
      route: '/admin/usuarios/eliminar-usuario',
    },
  ];

  /**
   * @description Función para registrar el clic en consola.
   * Útil para depuración.
   * @param {string} route - La ruta asociada a la opción clicada.
   */
  logClick(route: string): void {
    console.log('Opción de gestión de usuarios "' + route + '" clicada.');
  }
}
