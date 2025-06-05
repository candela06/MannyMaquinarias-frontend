// src/app/services/reserva.service.ts

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Reserva } from '../app/modles/reserva.model'; // Asegúrate de que la ruta sea correcta
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = 'http://localhost:3001/reservas'; // URL base para las reservas

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Helper para obtener los headers con el token de autorización
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * @description Obtiene el historial de reservas del usuario autenticado desde el backend.
   * Utiliza el ID del usuario logueado como query parameter 'usuarioId'.
   * @returns {Observable<Reserva[]>} Un Observable que emite un array de objetos Reserva.
   */
  getHistorialReservas(): Observable<Reserva[]> {
    // Obtiene el objeto completo del usuario actual desde AuthService
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser ? currentUser.id : null; // Extrae el ID si el usuario existe

    if (!userId) {
      // Si no hay ID de usuario (no logueado o ID no disponible), lanza un error.
      // El componente HistorialReservasComponent lo capturará y mostrará un mensaje.
      return throwError(
        () =>
          new Error(
            'No se encontró ID de usuario para obtener el historial de reservas. Por favor, inicia sesión.'
          )
      );
    }

    // Construye la URL con el parámetro de consulta usuarioId
    const url = `${this.apiUrl}/?usuarioId=${userId}`;

    // Envía la petición GET incluyendo los headers de autorización
    // El interceptor AuthInterceptor también debería añadir el token automáticamente.
    return this.http
      .get<Reserva[]>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage =
      'Ocurrió un error desconocido al cargar el historial de reservas.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      console.error(
        `Código de error del backend: ${error.status}, ` +
          `Cuerpo: ${JSON.stringify(error.error)}`
      );
      if (error.status === 401 || error.status === 403) {
        errorMessage = 'No autorizado. Por favor, inicia sesión de nuevo.';
      } else if (error.error && error.error.error) {
        errorMessage = error.error.error; // Mensaje de error del backend
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage)); // Propagar el error
  }
}
