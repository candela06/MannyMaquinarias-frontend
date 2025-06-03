//src\app\admin\gestion-usuarios\eliminar-usuario\eliminar-usuario.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { User } from '../../../modles/user.model'; // Asegúrate de que la ruta sea correcta
import { UsuarioService } from '../../../../services/usuario.service'; // <-- ¡Importa tu UsuarioService!

@Component({
  standalone: true,
  selector: 'app-gestionar-usuarios',
  templateUrl: './eliminar-usuario.component.html',
  // styleUrls: ['./eliminar-usuario.component.css'],
  imports: [CommonModule, RouterModule],
})
export class eliminarUsuario implements OnInit {
  users: User[] = []; // Lista de todos los usuarios del sistema
  isLoading: boolean = true;

  constructor(private usuarioService: UsuarioService) {} // <-- Inyecta UsuarioService

  ngOnInit(): void {
    this.loadAllUsers(); // Carga todos los usuarios al iniciar el componente
  }

  /**
   * @description Carga todos los usuarios del sistema desde el backend.
   * Asume que el backend tiene un endpoint GET /usuarios que devuelve todos los usuarios.
   */
  loadAllUsers(): void {
    this.isLoading = true;
    this.usuarioService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener la lista de usuarios:', error);
        Swal.fire('Error', 'No se pudo cargar la lista de usuarios.', 'error');
        this.isLoading = false;
      },
    });
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
    this.isLoading = true; // Activar un loader visual si lo tienes
    this.usuarioService.eliminarUsuario(email).subscribe({
      next: (response) => {
        Swal.fire(
          '¡Eliminado!',
          response.message, // Mensaje que viene del backend
          'success'
        );
        this.isLoading = false;
        this.loadAllUsers(); // Recargar la lista de usuarios para reflejar el cambio de estado
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        const errorMessage =
          error.message || 'Error desconocido al eliminar usuario.'; // Usa error.message del handleError
        Swal.fire('Error', errorMessage, 'error');
        this.isLoading = false;
      },
    });
  }
}
