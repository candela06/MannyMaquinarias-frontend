import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

export const trabajadorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isTrabajador) {
    return true;
  } else {
    Swal.fire(
      'Acceso Denegado',
      'No tienes permisos de trabajador para acceder a esta sección.',
      'error'
    );
    router.navigate(['/catalogo']);
    return false;
  }
};
