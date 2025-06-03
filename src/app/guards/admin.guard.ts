// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Asegúrate de que la ruta sea correcta
import Swal from 'sweetalert2';

/**
 * @description Guardia de ruta para proteger las rutas de administración.
 * Permite el acceso solo si el usuario autenticado tiene el rol de 'admin'.
 * En caso contrario, redirige al usuario y muestra un mensaje de acceso denegado.
 * @returns {boolean} True si el usuario es administrador, false en caso contrario.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin) {
    return true; // El usuario es admin, permite el acceso
  } else {
    Swal.fire(
      'Acceso Denegado',
      'No tienes permisos de administrador para acceder a esta sección.',
      'error'
    );
    router.navigate(['/catalogo']); // Redirige a una página a la que sí tenga acceso
    return false; // Bloquea el acceso
  }
};
