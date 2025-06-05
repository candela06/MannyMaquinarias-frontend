// src/app/admin/gestion-usuarios/eliminar-usuario/eliminar-usuario.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importar RouterModule si se usa routerLink
import Swal from 'sweetalert2';

import { User } from '../../../modles/user.model'; // <-- CORREGIDO: 'models' en lugar de 'modles'
import { UsuarioService } from '../../../../services/usuario.service'; // Importa tu UsuarioService

@Component({
  standalone: true,
  selector: 'app-eliminar-usuario', // Selector específico para este componente
  templateUrl: './eliminar-usuario.component.html',
  // styleUrls: ['./eliminar-usuario.component.css'], // Descomenta si tienes un archivo CSS para este componente
  imports: [CommonModule, RouterModule],
})
export class eliminarUsuario implements OnInit {
  // <-- Renombrado a EliminarUsuarioComponent
  isLoading: boolean = false; // Estado para el spinner de la operación de eliminación

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    // Ya no cargamos todos los usuarios al inicio del componente
    // console.log('Componente EliminarUsuarioComponent iniciado.');
  }

  // --- FUNCIONES PARA ELIMINAR USUARIO DEL SISTEMA ---

  /**
   * @description Abre un SweetAlert para que el administrador ingrese el email del usuario
   * a eliminar lógicamente del sistema.
   */
  async openDeleteUserConfirmationInput(): Promise<void> {
    const { value: email } = await Swal.fire({
      title: 'Eliminar Usuario del Sistema',
      input: 'email',
      inputLabel: 'Ingrese el email del usuario a eliminar',
      inputPlaceholder: 'cliente@mail.com', // Ejemplo de email
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas ingresar un email!';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Por favor, ingrese un email válido.';
        }
        return null;
      },
    });

    if (email) {
      this.confirmDeleteUser(email);
    }
  }

  /**
   * @description Muestra un SweetAlert de confirmación antes de eliminar lógicamente al usuario.
   * @param email El email del usuario a confirmar para eliminar.
   */
  async confirmDeleteUser(email: string): Promise<void> {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar al usuario con email "${email}" del sistema? Esta acción es un borrado lógico y el usuario NO podrá iniciar sesión.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para eliminar
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      this.callDeleteUserBackend(email);
    }
  }

  /**
   * @description Envía la petición al servicio para marcar el usuario como eliminado en el backend.
   * @param email El email del usuario a eliminar.
   */
  callDeleteUserBackend(email: string): void {
    this.isLoading = true; // Activar el loader visual
    this.usuarioService.eliminarUsuario(email).subscribe({
      next: (response) => {
        Swal.fire(
          '¡Eliminado!',
          response.message || 'Usuario eliminado lógicamente con éxito.', // Mensaje que viene del backend o uno por defecto
          'success'
        );
        this.isLoading = false;
        // No es necesario recargar usuarios aquí si solo se eliminan y no se muestran.
        // Si necesitas alguna acción post-eliminación (ej. actualizar una lista global en otro componente),
        // podrías emitir un evento.
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        // Usamos el mensaje de error que viene del servicio o un mensaje genérico
        const errorMessage =
          error.message || 'Error desconocido al eliminar usuario.';
        Swal.fire('Error', errorMessage, 'error');
        this.isLoading = false;
      },
    });
  }
}
