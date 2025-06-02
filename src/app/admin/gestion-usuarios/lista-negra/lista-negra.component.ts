import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { User } from '../../../modles/user.model'; // Importa el modelo de User
import { BlackListService } from '../../../../services/black-list.service'; // Importa el servicio de lista negra

/**
 * @description Componente para visualizar la lista negra de clientes.
 * Permite al administrador ver un listado de todos los usuarios bloqueados
 * o un mensaje si la lista está vacía. También incluye placeholders
 * para acciones futuras como agregar o eliminar.
 */
@Component({
  standalone: true,
  selector: 'app-lista-negra',
  templateUrl: './lista-negra.component.html',
  styleUrls: ['./lista-negra.component.css'],
  imports: [CommonModule, RouterModule],
})
export class ListaNegraComponent implements OnInit {
  blacklistedUsers: User[] = [];
  isLoading: boolean = true; // Para indicar si la lista está cargando

  constructor(private blackListService: BlackListService) {}

  /**
   * @description Hook del ciclo de vida de Angular.
   * Al inicializar el componente, carga la lista de usuarios en la lista negra.
   */
  ngOnInit(): void {
    this.getBlacklistedUsers();
  }

  /**
   * @description Obtiene la lista de usuarios en la lista negra desde el `BlackListService`.
   * Actualiza la propiedad `blacklistedUsers` y maneja los estados de carga y error.
   */
  // src/app/admin/gestion-usuarios/lista-negra/lista-negra.component.ts

  // ... (tus imports existentes)

  // src/app/admin/usuarios/lista-negra/lista-negra.component.ts

  // ... (tus imports y el resto de tu código)

  getBlacklistedUsers(): void {
    this.isLoading = true; // Inicia el estado de carga
    this.blackListService.getBlacklistedUsers().subscribe({
      next: (users) => {
        // El backend devuelve { usuarios: [...] }, así que accedemos a la propiedad 'usuarios'
        this.blacklistedUsers = users;
        this.isLoading = false; // Finaliza el estado de carga
      },
      error: (error) => {
        console.error('Error al obtener la lista negra:', error);
        // ¡DESCOMENTA ESTE BLOQUE PARA QUE EL SWEETALERT VUELVA A APARECER!
        Swal.fire(
          'Error',
          'No se pudo cargar la lista negra de clientes.',
          'error'
        );
        this.isLoading = false; // Finaliza el estado de carga incluso si hay error
      },
    });
  }
  /**
   * @description Abre un SweetAlert para que el administrador ingrese el email del usuario
   * a agregar a la lista negra. Incluye validación básica.
   */
  async openAddUserToBlackListInput(): Promise<void> {
    const { value: email } = await Swal.fire({
      title: 'Agregar usuario a la lista negra',
      input: 'email', // Tipo de input para email
      inputLabel: 'Ingrese el email del usuario',
      inputPlaceholder: 'ejemplo@dominio.com',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Volver atrás',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas ingresar un email!';
        }
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Por favor, ingrese un email válido.';
        }
        return null; // Si la validación es exitosa
      },
    });

    if (email) {
      // Si el usuario ingresó un email y presionó "Aceptar" en el primer SweetAlert
      this.confirmAddUserToBlackList(email);
    }
  }

  /**
   * @description Muestra un SweetAlert de confirmación antes de agregar realmente al usuario.
   * @param email El email del usuario a confirmar para agregar.
   */
  async confirmAddUserToBlackList(email: string): Promise<void> {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea agregar a ${email} a la lista negra? Esta acción limitará sus permisos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      this.addBlacklistedUserToBackend(email); // Cambié el nombre para evitar confusión con el placeholder
    }
  }

  /**
   * @description Envía la petición al servicio para agregar el usuario a la lista negra del backend.
   * @param email El email del usuario a agregar.
   */
  addBlacklistedUserToBackend(email: string): void {
    this.isLoading = true; // Opcional, puedes poner un loader específico para esta acción
    this.blackListService.addBlacklistedUser(email).subscribe({
      next: (response) => {
        Swal.fire(
          '¡Agregado!',
          response.message, // El mensaje del backend: "Usuario agregado a la lista negra."
          'success'
        );
        this.isLoading = false;
        this.getBlacklistedUsers(); // Recargar la lista para ver el usuario recién agregado
      },
      error: (error) => {
        console.error('Error al agregar usuario a la lista negra:', error);
        // Intenta obtener el mensaje de error del backend (ej. si el usuario no existe, ya está en lista negra)
        const errorMessage =
          error.error?.error || 'Error desconocido al agregar usuario.';
        Swal.fire('Error', errorMessage, 'error');
        this.isLoading = false;
      },
    });
  }

  /**
   * @description Placeholder para la función de eliminar un usuario de la lista negra.
   * Se mostrará en la UI, pero su lógica aún no está implementada.
   */
  removeBlacklistedUser(): void {
    Swal.fire(
      'Información',
      'Funcionalidad "Eliminar usuario" en desarrollo.',
      'info'
    );
    // Lógica futura para eliminar usuario
  }
}
