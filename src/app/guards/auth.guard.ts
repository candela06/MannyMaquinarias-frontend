// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Asegúrate de que la ruta a tu AuthService sea correcta
import { map, take } from 'rxjs/operators';

/**
 * @description Un guard de ruta que verifica si el usuario está autenticado.
 * Si el usuario no está logueado, lo redirige a la página de login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Asumo que AuthService tiene un Observable isLoggedIn$ que emite true/false
  // o un método isLoggedIn() que devuelve un boolean.
  // Si tu AuthService tiene un método diferente para verificar el login, ajústalo aquí.
  return authService.isLoggedIn$.pipe(
    take(1), // Toma el primer valor y luego completa
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true; // El usuario está logueado, permite el acceso a la ruta
      } else {
        // El usuario no está logueado, redirige a la página de login
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
