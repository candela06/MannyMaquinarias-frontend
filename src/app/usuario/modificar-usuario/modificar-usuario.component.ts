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

  /**
   * @description Guarda los cambios realizados en el perfil del usuario.
   */
  saveChanges(): void {
    // Renombrado de saveProfile a saveChanges
    if (!this.user) {
      this.errorMessage = 'No hay datos de usuario para guardar.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = undefined;

    // Creamos un objeto con solo los campos que se pueden modificar y enviar al backend
    const updatedData: Partial<User> = {
      nombre: this.user.nombre,
      apellido: this.user.apellido,
      dni: this.user.dni,
      edad: this.user.edad,
      nombreUsuario: this.user.nombreUsuario,
      direccion: this.user.direccion,
      // El email y password no se modifican desde aquí por seguridad
    };

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
          console.error('Error al actualizar el perfil:', error);
          this.isSaving = false;
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
