// src/app/services/reserva.service.ts

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Reserva } from '../app/modles/reserva.model';
import { AuthService } from './auth.service'; // Importa el AuthService

// Interfaz para los datos que se envían al backend para crear una reserva
export interface ReservaData {
  precio?: number;
  fecha_inicio: string; // Formato YYYY-MM-DD para compatibilidad con input type="date" y backend
  fecha_fin: string; // Formato YYYY-MM-DD
  maquina_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = 'http://localhost:3001/reservas'; // URL base para las reservas

  constructor(
    private http: HttpClient,
    private authService: AuthService // Inyecta AuthService para obtener el token
  ) {}

  // Helper para obtener los headers con el token de autorización
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('AuthService: No se encontró token de autenticación.');
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * @description Crea una nueva reserva en el backend.
   * @param {ReservaData} reservaData - Objeto con los datos de la reserva (precio, fechas, id_usuario, id_maquina).
   * @returns {Observable<any>} Un Observable que emite la respuesta del backend.
   */
  crearReserva(reservaData: ReservaData): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/add`, reservaData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleErrorCrearReserva));
  }

  /**
   * @description Obtiene el historial de reservas del usuario autenticado desde el backend.
   * Utiliza el ID del usuario logueado como query parameter 'usuarioId'.
   * @returns {Observable<Reserva[]>} Un Observable que emite un array de objetos Reserva.
   */
  getHistorialReservas(): Observable<Reserva[]> {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser ? currentUser.id : null;

    if (!userId) {
      return throwError(
        () =>
          new Error(
            'No se encontró ID de usuario para obtener el historial de reservas. Por favor, inicia sesión.'
          )
      );
    }

    const url = `${this.apiUrl}/?usuarioId=${userId}`;
    return this.http
      .get<Reserva[]>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleErrorHistorial));
  }

  // Manejador de errores para la creación de reservas
  private handleErrorCrearReserva(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error al intentar realizar la reserva.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      console.error(
        `Código de error del backend (crearReserva): ${error.status}, ` +
          `Cuerpo: ${JSON.stringify(error.error)}`
      );
      if (error.status === 400 && error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status === 401 || error.status === 403) {
        errorMessage =
          'No autorizado para realizar la reserva. Por favor, inicia sesión.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  // Manejador de errores para el historial de reservas
  private handleErrorHistorial(error: HttpErrorResponse) {
    let errorMessage =
      'Ocurrió un error desconocido al cargar el historial de reservas.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      console.error(
        `Código de error del backend (historial): ${error.status}, ` +
          `Cuerpo: ${JSON.stringify(error.error)}`
      );
      if (error.status === 401 || error.status === 403) {
        errorMessage = 'No autorizado. Por favor, inicia sesión de nuevo.';
      } else if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
