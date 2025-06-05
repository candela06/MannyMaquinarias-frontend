// src/app/public/historial-reservas/historial-reservas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para directivas como *ngIf, *ngFor
import { RouterLink } from '@angular/router'; // Para enlaces de navegación
import { ReservaService } from '../../../../services/reserva.service'; // Asegúrate de la ruta correcta
import { Reserva } from '../../../modles/reserva.model'; // Asegúrate de la ruta correcta
import { Observable, of } from 'rxjs'; // Importa Observable y of
import { catchError, tap } from 'rxjs/operators'; // Importa operadores
import Swal from 'sweetalert2'; // Para mensajes de error/éxito

@Component({
  standalone: true,
  selector: 'app-historial-reservas',
  templateUrl: './historial-reservas.component.html',
  //styleUrls: ['./historial-reservas.component.css'],
  imports: [
    CommonModule,
    RouterLink, // Necesario para el botón de "Volver al Catálogo"
  ],
})
export class HistorialReservasComponent implements OnInit {
  reservas$: Observable<Reserva[]> = of([]); // Observable para la lista de reservas
  isLoading: boolean = true;
  errorMessage: string | undefined = undefined;

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.loadReservas();
  }

  /**
   * @description Carga el historial de reservas del usuario desde el ReservaService.
   * Maneja el estado de carga y los mensajes de error/lista vacía.
   */
  loadReservas(): void {
    this.isLoading = true;
    this.errorMessage = undefined; // Limpiar cualquier mensaje de error previo

    this.reservaService
      .getHistorialReservas()
      .pipe(
        // Cambiado a llamar directamente al servicio
        tap((reservas) => {
          this.isLoading = false;
          if (reservas.length === 0) {
            this.errorMessage =
              'Actualmente no cuentas con reservas registradas.';
          }
          // Asignar las reservas al observable reservasList que se usa en el HTML
          this.reservas$ = of(reservas); // Vuelve a asignar el observable
        }),
        catchError((error) => {
          console.error('Error al cargar el historial de reservas:', error);
          this.isLoading = false;
          const msg =
            error.message ||
            'No se pudo cargar tu historial de reservas. Por favor, inténtalo de nuevo más tarde.';
          this.errorMessage = msg;
          Swal.fire('Error', msg, 'error');
          return of([]); // Devuelve un observable de array vacío en caso de error
        })
      )
      .subscribe(); // <-- ¡AÑADIDO: Suscríbete para ejecutar la petición!
  }
}
