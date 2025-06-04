// src/app/usuario/eliminar-usuario/eliminar-usuario.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Importa Router
import { UsuarioService } from '../../../services/usuario.service'; // Asegúrate de la ruta correcta
import { AuthService } from '../../../services/auth.service'; // Importa AuthService para logout
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import Swal from 'sweetalert2'; // Para mensajes de confirmación/éxito/error

@Component({
  standalone: true,
  selector: 'app-eliminar-usuario',
  templateUrl: './eliminar-usuario.component.html',
  //  styleUrls: ['./eliminar-usuario.component.css'],
  imports: [
    CommonModule,
    RouterLink, // Para el botón de volver
  ],
})
export class EliminarCuentaPropiaComponent {
  isDeleting: boolean = false; // Estado para el botón de eliminar

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService, // Inyecta AuthService
    private router: Router // Inyecta Router
  ) {}

  /**
   * @description Maneja la eliminación de la cuenta del propio usuario.
   * Muestra una confirmación y maneja la respuesta del backend.
   */
  eliminarCuenta(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto! Tu cuenta será marcada como eliminada y no podrás iniciar sesión.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar mi cuenta',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting = true; // Activa el estado de carga del botón
        this.usuarioService
          .eliminarCuentaPropia()
          .pipe(
            tap((response) => {
              this.isDeleting = false;
              Swal.fire(
                '¡Eliminada!',
                response.message || 'Tu cuenta ha sido eliminada exitosamente.',
                'success'
              );
              // Escenario 1: Baja exitosa. Redirige al inicio y cierra sesión.
              this.authService.logout(); // Cierra la sesión del usuario
              this.router.navigate(['/']); // Redirige al inicio
            }),
            catchError((error) => {
              this.isDeleting = false;
              console.error('Error al eliminar la cuenta:', error);
              const errorMessage =
                error.message ||
                'No se pudo eliminar tu cuenta. Por favor, inténtalo de nuevo.';
              Swal.fire('Error', errorMessage, 'error');
              // Escenario 2: Baja fallida por reserva en curso. El mensaje ya lo maneja SweetAlert.
              return of(null);
            })
          )
          .subscribe();
      }
      // Escenario 3: Cancelación de baja. No se hace nada y el usuario permanece en la página.
    });
  }
}
