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
      title: 'Ver Lista Negra',
      description: 'Consultar la lista de clientes con restricciones.',
      icon: 'bi-person-fill-exclamation', // Icono para lista negra
      route: '/admin/usuarios/lista-negra', // <--- RUTA A LA LISTA NEGRA
    },
    {
      title: 'Agregar Usuario',
      description: 'Añadir un usuario a la lista negra.',
      icon: 'bi-person-plus-fill',
      route: '/admin/usuarios/agregar', // FUTURO: Componente para añadir usuario
    },
    {
      title: 'Modificar Permisos',
      description: 'Cambiar roles o permisos de usuarios.',
      icon: 'bi-person-gear',
      route: '/admin/usuarios/permisos', // FUTURO: Componente para modificar permisos
    },
    // Podrían agregarse más opciones aquí como "Listar todos los usuarios", etc.
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
