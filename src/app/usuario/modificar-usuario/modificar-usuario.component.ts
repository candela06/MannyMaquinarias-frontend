// src/app/usuario/modificar-usuario/modificar-usuario.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { Router, RouterLink } from '@angular/router'; // Para la navegación
import { UsuarioService } from '../../../services/usuario.service'; // Asegúrate de la ruta correcta
import { User } from '../../modles/user.model'; // Asegúrate de la ruta correcta
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import Swal from 'sweetalert2'; // Para mensajes de éxito/error

@Component({
  standalone: true,
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.component.html',
  //  styleUrls: ['./modificar-usuario.component.css'],
  imports: [
    CommonModule,
    FormsModule, // Importa FormsModule para usar ngModel
    RouterLink,
  ],
})
export class ModificarUsuarioComponent implements OnInit {
  user: User | null = null; // Objeto para almacenar los datos del usuario
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string | undefined;
  fechaNacimiento: string = '';
  esMayorDeEdad: boolean = true;
  wantsToChangePassword = false;
  currentPassword: string = '';
  newPassword: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router // Inyecta Router para la navegación
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * @description Carga los datos del perfil del usuario logueado.
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = undefined;

    this.usuarioService
      .getPerfil()
      .pipe(
        tap((user) => {
          this.user = user;
          this.isLoading = false;
        }),
        catchError((error) => {
          console.error('Error al cargar el perfil:', error);
          this.isLoading = false;
          this.errorMessage =
            error.message ||
            'No se pudo cargar tu perfil. Por favor, inténtalo de nuevo.';
          Swal.fire('Error', this.errorMessage, 'error');
          return of(null); // Devuelve un Observable de null para que el pipe no falle
        })
      )
      .subscribe(); // Suscribe para que el Observable se ejecute
  }

  onFechaNacimientoChange(fecha: string): void {
    this.fechaNacimiento = fecha;
    const edadCalculada = this.calcularEdad(fecha);
    this.esMayorDeEdad = edadCalculada >= 18;

    if (this.user) {
      this.user.edad = edadCalculada;
    }
  }

  calcularEdad(fechaNacimiento: string): number {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * @description Guarda los cambios realizados en el perfil del usuario.
   */
  saveChanges(): void {
    if (!this.user) {
      this.errorMessage = 'No hay datos de usuario para guardar.';
      return;
    }

    if (!this.esMayorDeEdad) {
      Swal.fire(
        'Advertencia',
        'Debes ser mayor de 18 años para modificar tus datos.',
        'warning'
      );
      return;
    }

    if (this.wantsToChangePassword) {
      if (!this.currentPassword || !this.newPassword) {
        Swal.fire(
          'Advertencia',
          'Debes completar ambas contraseñas.',
          'warning'
        );
        return;
      }

      if (this.newPassword.length < 6) {
        Swal.fire(
          'Advertencia',
          'La nueva contraseña debe tener al menos 6 caracteres.',
          'warning'
        );
        return;
      }
    }

    this.isSaving = true;
    this.errorMessage = undefined;

    const updatedData: any = {
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      dni: this.user.dni,
      edad: this.user.edad,
      direccion: this.user.direccion,
    };

    if (this.wantsToChangePassword) {
      updatedData.currentPassword = this.currentPassword;
      updatedData.newPassword = this.newPassword;
    }

    this.usuarioService
      .updatePerfil(updatedData)
      .pipe(
        tap((response) => {
          Swal.fire(
            '¡Éxito!',
            response.message || 'Perfil actualizado correctamente.',
            'success'
          );
          this.isSaving = false;
          // Opcional: Redirigir al usuario a una página de confirmación o al inicio
          // this.router.navigate(['/']);
        }),
        catchError((error) => {
          this.isSaving = false;

          if (
            error.status === 401 &&
            error.error?.error === 'Contraseña actual incorrecta.'
          ) {
            this.errorMessage = error.error.error;
            Swal.fire('Error', this.errorMessage, 'error');
            return of(null); // no cierres la sesión
          }

          if (error.status === 401) {
            // Token vencido o no autorizado
            this.router.navigate(['/login']); // o lo que uses para cerrar sesión
            return of(null);
          }

          console.error('Error al actualizar el perfil:', error);
          this.errorMessage =
            error.message ||
            'Error al actualizar el perfil. Inténtalo de nuevo.';
          Swal.fire('Error', this.errorMessage, 'error');
          return of(null);
        })
      )
      .subscribe();
  }
}
