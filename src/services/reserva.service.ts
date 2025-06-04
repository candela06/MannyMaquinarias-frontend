// src/app/services/reserva.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Reserva } from '../app/modles/reserva.model'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = 'http://localhost:3001/reservas'; // URL base para las reservas

  constructor(private http: HttpClient) {}

  /**
   * @description Obtiene el historial de reservas del usuario autenticado desde el backend.
   * @returns {Observable<Reserva[]>} Un Observable que emite un array de objetos Reserva.
   */
  getHistorialReservas(): Observable<Reserva[]> {
    // El backend debe usar el token de autenticación para identificar al usuario
    return this.http
      .get<Reserva[]>(`${this.apiUrl}/historial`)
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
