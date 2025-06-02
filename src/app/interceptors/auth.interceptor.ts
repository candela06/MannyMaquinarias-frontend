// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Asegúrate que la ruta sea correcta
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2'; // Asumiendo que ya tienes SweetAlert2 instalado y funcionando

/**
 * @description Interceptor HTTP para añadir un token de autenticación a las peticiones salientes
 * y manejar errores de autenticación (401/403).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authToken = authService.getToken(); // Obtiene el token JWT del AuthService

  // Clona la petición y añade el encabezado de autorización si existe un token
  if (authToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`, // Formato estándar: "Bearer TokenJWT"
      },
    });
  }

  // Pasa la petición modificada (o la original si no había token) al siguiente manejador
  return next(req).pipe(
    catchError((error) => {
      // Si el error es 401 (No Autorizado) o 403 (Prohibido),
      // significa que la sesión ha expirado o no tiene permisos.
      if (error.status === 401 || error.status === 403) {
        // Limpia la sesión y redirige al usuario a la página de login
        authService.logout(); // Llama al método logout de tu AuthService
        router.navigate(['/login']);
        Swal.fire(
          'Sesión Expirada',
          'Su sesión ha expirado o no tiene permisos. Por favor, inicie sesión de nuevo.',
          'warning'
        );
      }
      // Re-lanza el error para que sea manejado por el componente que hizo la petición
      return throwError(() => error);
    })
  );
};
