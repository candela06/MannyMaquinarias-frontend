import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * @description Componente para gestionar las opciones de máquinas.
 * Este componente actúa como un menú intermedio, presentando al administrador
 * las sub-opciones para "Ver", "Modificar" y "Eliminar" máquinas.
 */
@Component({
  standalone: true,
  selector: 'app-gestionar-maquinas',
  templateUrl: './gestionar-maquinas.component.html',
  styleUrls: ['./gestionar-maquinas.component.css'],
  imports: [CommonModule, RouterModule],
})
export class GestionarMaquinasComponent {
  /**
   * @description Define las sub-opciones disponibles para la gestión de máquinas.
   * Cada objeto contiene el título, una descripción, un icono y la ruta a la que navega.
   * Las rutas específicas para 'Ver', 'Modificar' y 'Eliminar' serán creadas
   * con sus respectivos componentes más adelante.
   */
  gestionOptions = [
    /*{
      title: 'Ver Máquinas',
      description: 'Consultar el inventario completo de máquinas.',
      icon: 'bi-eye-fill', // Icono de Bootstrap Icons
      route: '/admin/maquinas/ver', // RUTA FUTURA: Crear componente 'VerMaquinasComponent'
    },*/
    {
      title: 'Modificar Máquinas',
      description: 'Actualizar los detalles de las máquinas existentes.',
      icon: 'bi-pencil-square',
      route: 'admin/maquinas/modificar', // RUTA FUTURA: Crear componente 'ModificarMaquinasComponent'
    },
    {
      title: 'Eliminar Máquinas',
      description: 'Remover máquinas del inventario.',
      icon: 'bi-trash-fill',
      route: '/admin/maquinas/eliminar', // RUTA FUTURA: Crear componente 'EliminarMaquinasComponent'
    },
  ];

  /**
   * @description Función para registrar el clic en consola.
   * Útil para depuración.
   * @param {string} route - La ruta asociada a la opción clicada.
   */
  logClick(route: string): void {
    console.log('Opción de gestión de máquinas "' + route + '" clicada.');
  }
}
