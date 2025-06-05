// src/app/usuario/reservas/realizar-reservas/realizar-reserva.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import {
  switchMap,
  tap,
  catchError,
  debounceTime,
  distinctUntilChanged, // <-- Asegúrate de que esto esté importado
} from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Machinery, MachineryStatus } from '../../../modles/machinery.model'; // <-- CORREGIDO: 'models' en lugar de 'modles'
import { MachineryService } from '../../../../services/machinery.service';
import {
  ReservaService,
  ReservaData,
} from '../../../../services/reserva.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './realizar-reserva.component.html',
  // styleUrls: ['./reservar.component.css'], // Si tienes un archivo CSS para este componente, descomenta esta línea
})
export class RealizarReservaComponent implements OnInit {
  machineId: number | null = null;
  machinery: Machinery | undefined;
  MachineryStatus = MachineryStatus; // Para usar en la plantilla

  selectedStartDate: string = '';
  selectedEndDate: string = '';
  calculatedPrice: number = 0;
  isMakingReservation: boolean = false;
  isLoadingMachine: boolean = true;

  // No inicializamos isReservationButtonDisabled aquí como una propiedad,
  // sino que usamos el getter de abajo para su estado dinámico.

  private datesChangeSubject = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machineryService: MachineryService,
    private reservaService: ReservaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit: Componente RealizarReserva iniciado.');
    this.route.paramMap
      .pipe(
        tap((params) =>
          console.log(
            'ngOnInit: Parámetros de ruta recibidos, ID:',
            params.get('id')
          )
        ),
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.machineId = Number(id);
            this.isLoadingMachine = true;
            console.log(
              'ngOnInit: Intentando cargar máquina con ID:',
              this.machineId
            );
            return this.machineryService.getMachineryById(this.machineId).pipe(
              tap((machine) => {
                this.machinery = machine;
                this.isLoadingMachine = false;
                if (machine) {
                  console.log('ngOnInit: Máquina cargada:', machine);

                  // Inicializa las fechas mínimas para el date picker
                  const today = new Date();
                  today.setDate(today.getDate() + 1); // Empieza a partir de mañana
                  this.selectedStartDate = today.toISOString().split('T')[0];
                  this.selectedEndDate = this.selectedStartDate; // Por defecto, la fecha de fin es la misma que la de inicio

                  console.log(
                    'ngOnInit: Fechas iniciales - Inicio:',
                    this.selectedStartDate,
                    'Fin:',
                    this.selectedEndDate
                  );
                  this.calculatePrice(); // Calcula el precio inicial al cargar la máquina
                } else {
                  console.error(
                    'ngOnInit: Máquina no encontrada para ID:',
                    this.machineId
                  );
                  Swal.fire('Error', 'Máquina no encontrada.', 'error').then(
                    () => {
                      this.router.navigate(['/catalogo']); // Redirige si la máquina no existe
                    }
                  );
                }
              }),
              catchError((error) => {
                this.isLoadingMachine = false;
                console.error(
                  'ngOnInit: Error al cargar detalle de máquina para reserva:',
                  error
                );
                Swal.fire(
                  'Error',
                  'No se pudo cargar la máquina para la reserva.',
                  'error'
                ).then(() => {
                  this.router.navigate(['/catalogo']); // Redirige en caso de error de carga
                });
                return of(undefined);
              })
            );
          } else {
            console.error(
              'ngOnInit: ID de máquina no proporcionado en la ruta.'
            );
            Swal.fire(
              'Error',
              'ID de máquina no proporcionado para la reserva.',
              'error'
            ).then(() => {
              this.router.navigate(['/catalogo']); // Redirige si no hay ID
            });
            return of(undefined);
          }
        })
      )
      .subscribe();

    // Suscribe el subject para recalcular el precio y actualizar el estado del botón
    this.datesChangeSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(), // <-- Asegúrate de que esto esté aquí para evitar recálculos innecesarios
        tap(() => {
          console.log(
            'onDatesChange (debounced): Fechas cambiaron, recalculando precio.'
          );
          this.calculatePrice();
        })
      )
      .subscribe();
  }

  /**
   * @description Calcula el precio total de la reserva basado en las fechas seleccionadas
   * y el precio diario de la máquina.
   */
  calculatePrice(): void {
    if (this.machinery && this.selectedStartDate && this.selectedEndDate) {
      const start = new Date(this.selectedStartDate);
      const end = new Date(this.selectedEndDate);

      if (start > end) {
        this.calculatedPrice = 0;
        this.isReservationButtonDisabled;
        return;
      }

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      this.calculatedPrice = diffDays * this.machinery.precio;
    }
  }

  onDatesChange(): void {
    console.log(
      'onDatesChange: Cambio en fechas detectado. Disparando recálculo.'
    );
    this.datesChangeSubject.next();
  }

  getMinStartDate(): string {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Empieza desde mañana
    return today.toISOString().split('T')[0];
  }

  getMinEndDate(): string {
    // La fecha de fin no puede ser anterior a la de inicio.
    // Si selectedStartDate no está definida, usa la fecha mínima de inicio.
    return this.selectedStartDate || this.getMinStartDate();
  }

  /**
   * @description Getter para determinar si el botón de reserva debe estar deshabilitado.
   * Esto centraliza la lógica para habilitar/deshabilitar el botón en el HTML.
   * IMPORTANTE: No inicializar como propiedad, sino como getter.
   */
  get isReservationButtonDisabled(): boolean {
    let isDisabled = false;
    let reason = '';

    // 1. Si la máquina se está cargando
    if (this.isLoadingMachine) {
      isDisabled = true;
      reason = 'Cargando máquina...';
    }
    // 2. Si la máquina no se ha encontrado o no está definida
    else if (!this.machinery) {
      isDisabled = true;
      reason = 'Máquina no encontrada.';
    }
    // 3. Si la máquina no está disponible para alquiler
    else if (this.machinery.estado !== MachineryStatus.DISPONIBLE) {
      isDisabled = true;
      reason = `Máquina no disponible (${this.machinery.estado}).`;
    }
    // 4. Si la reserva ya está en proceso
    else if (this.isMakingReservation) {
      isDisabled = true;
      reason = 'Realizando reserva...';
    }
    // 5. Si las fechas no están seleccionadas o el precio calculado es cero o negativo
    else if (
      !this.selectedStartDate ||
      !this.selectedEndDate ||
      this.calculatedPrice <= 0
    ) {
      isDisabled = true;
      reason = 'Fechas no seleccionadas o precio no calculado (>0).';
    }
    // 6. Si las fechas son inválidas (fecha de inicio en el pasado o inicio > fin)
    else {
      const start = new Date(this.selectedStartDate);
      const end = new Date(this.selectedEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Para comparar solo la fecha

      if (start < today) {
        isDisabled = true;
        reason = 'La fecha de inicio no puede ser en el pasado.';
      } else if (start > end) {
        isDisabled = true;
        reason =
          'La fecha de fin debe ser posterior o igual a la fecha de inicio.';
      }
    }

    console.log(
      'isReservationButtonDisabled Getter: Estado:',
      isDisabled,
      'Razón:',
      reason
    );
    return isDisabled;
  }

  makeReservation(): void {
    // Usar el getter para verificar si el botón está deshabilitado
    if (this.isReservationButtonDisabled) {
      console.warn(
        'makeReservation: Botón deshabilitado, no se puede proceder con la reserva. Razón:',
        this.isReservationButtonDisabled
      );
      Swal.fire(
        'Atención',
        'Por favor, completa todos los datos válidos y asegúrate de que la máquina esté disponible.',
        'warning'
      );
      return;
    }

    // Obtener el ID del usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      Swal.fire(
        'Error',
        'Debes iniciar sesión para realizar una reserva.',
        'error'
      );
      console.error('makeReservation: Usuario no logueado o ID no disponible.');
      return;
    }
    const usuarioId = currentUser.id; // <-- Obtenemos el ID del usuario como un number

    this.isMakingReservation = true;
    console.log('makeReservation: Iniciando proceso de reserva...');

    const reservaData: ReservaData = {
      precio: this.calculatedPrice,
      fecha_inicio: this.selectedStartDate,
      fecha_fin: this.selectedEndDate,
      usuario_id: usuarioId, // <-- CORREGIDO: Ahora enviamos el ID numérico
      maquina_id: this.machineId!, // ! para asegurar que no es null en este punto
    };
    console.log('makeReservation: Datos de reserva a enviar:', reservaData);

    this.reservaService.crearReserva(reservaData).subscribe({
      next: (response) => {
        this.isMakingReservation = false;
        console.log('makeReservation: Reserva exitosa:', response);
        Swal.fire(
          '¡Reserva Exitosa!',
          response.message ||
            `Tu reserva ha sido confirmada. Número de reserva: ${
              response.numeroReserva || 'N/A'
            }.`,
          'success'
        ).then(() => {
          this.router.navigate(['/catalogo']); // <-- Redirige al catálogo, como se solicitó
        });
      },
      error: (error) => {
        this.isMakingReservation = false;
        console.error('makeReservation: Error al realizar reserva:', error);
        let errorMessage =
          'Error al realizar la reserva. Por favor, inténtalo de nuevo.';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error; // <-- Muestra el mensaje específico del backend
        }
        Swal.fire('Error', errorMessage, 'error');
      },
    });
  }
}
