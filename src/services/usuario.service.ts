// src/app/services/usuario.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
// Importa el Auth service si necesitas el token para las llamadas a la API de usuario
import { AuthService } from '../services/auth.service';
import { User } from '../app/modles/user.model';
@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3001/users'; // Ejemplo de endpoint para usuarios

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Ejemplo: Obtener el perfil del usuario logueado
  // (Asumiendo que necesitas enviar el token en los headers)
  getProfile(): Observable<any> {
    const token = this.authService.getToken();
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<any>(`${this.apiUrl}/profile`, { headers });
  }

  /**
   * @description Obtiene una lista de todos los usuarios del sistema.
   * @returns {Observable<User[]>} Un Observable que emite un array de usuarios.
   */
  getAllUsers(): Observable<User[]> {
    // Asumo que el backend tiene un endpoint GET /usuarios para listar todos los usuarios
    return this.http
      .get<User[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * @description Envía una petición DELETE al backend para marcar un usuario como eliminado lógicamente.
   * El backend espera el email como parámetro de URL.
   * @param {string} email - El email del usuario a eliminar de la base de datos principal.
   * @returns {Observable<any>} Un Observable que emite la respuesta del backend.
   */
  eliminarUsuario(email: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/eliminar/${email}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      console.error(
        `Código de error del backend: ${error.status}, ` +
          `Cuerpo: ${JSON.stringify(error.error)}`
      );

      // Manejo de errores específicos del backend según la especificación
      if (error.error && error.error.error) {
        errorMessage = error.error.error; // Este es el mensaje que viene del backend
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
