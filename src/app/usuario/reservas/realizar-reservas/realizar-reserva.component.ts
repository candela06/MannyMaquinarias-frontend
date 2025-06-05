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
  distinctUntilChanged,
} from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Machinery, MachineryStatus } from '../../../modles/machinery.model'; // <-- RUTA CORREGIDA AQUÍ
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
        distinctUntilChanged(), // Asegura que solo se dispara si los valores cambiaron
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
    console.log('calculatePrice: Iniciando cálculo de precio...');
    console.log('calculatePrice: machinery:', this.machinery);
    console.log(
      'calculatePrice: selectedStartDate (string):',
      this.selectedStartDate
    );
    console.log(
      'calculatePrice: selectedEndDate (string):',
      this.selectedEndDate
    );

    // Aseguramos que machinery y las fechas están presentes
    if (this.machinery && this.selectedStartDate && this.selectedEndDate) {
      const start = new Date(this.selectedStartDate);
      const end = new Date(this.selectedEndDate);

      console.log(
        'calculatePrice: Fecha inicio (Date obj):',
        start.toISOString()
      );
      console.log('calculatePrice: Fecha fin (Date obj):', end.toISOString());

      // Validar que las fechas sean válidas y que la fecha de inicio no sea posterior a la de fin
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        this.calculatedPrice = 0;
        console.warn(
          'calculatePrice: Fechas inválidas (NaN) o fecha de inicio es posterior a la fecha de fin. Precio = 0.'
        );
        // CORRECCIÓN: No se asigna directamente a isReservationButtonDisabled aquí.
        // El getter lo evaluará en cada ciclo de detección de cambios.
        return;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      // +1 para incluir el día de inicio en el conteo de días de alquiler
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      console.log('calculatePrice: Diferencia de tiempo (ms):', diffTime);
      console.log('calculatePrice: Días de alquiler (diffDays):', diffDays);

      // Aseguramos que machinery.precio es un número flotante antes de la multiplicación
      // Usamos parseFloat y toFixed para controlar la precisión
      const basePrice = parseFloat(this.machinery.precio.toString());
      console.log(
        'calculatePrice: Precio base de la máquina (parseFloat):',
        basePrice
      );

      this.calculatedPrice = parseFloat((basePrice * diffDays).toFixed(2)); // Redondea a 2 decimales
      console.log(
        'calculatePrice: Precio calculado FINAL:',
        this.calculatedPrice
      );
    } else {
      this.calculatedPrice = 0; // Si falta alguna fecha o la máquina, el precio es 0
      console.log(
        'calculatePrice: Faltan datos para calcular el precio (máquina o fechas). Precio = 0.'
      );
    }
    // Después de cualquier cálculo, aseguramos que el getter se evalúe de nuevo.
    console.log(
      'calculatePrice: isReservationButtonDisabled final state (después de cálculo):',
      this.isReservationButtonDisabled
    );
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
    const formattedDate = today.toISOString().split('T')[0];
    console.log('getMinStartDate: Retornando:', formattedDate);
    return formattedDate;
  }

  getMinEndDate(): string {
    // La fecha de fin no puede ser anterior a la de inicio.
    // Si selectedStartDate no está definida, usa la fecha mínima de inicio.
    const minEndDate = this.selectedStartDate || this.getMinStartDate();
    console.log('getMinEndDate: Retornando:', minEndDate);
    return minEndDate;
  }

  /**
   * @description Getter para determinar si el botón de reserva debe estar deshabilitado.
   * Esto centraliza la lógica para habilitar/deshabilitar el botón en el HTML.
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
      this.calculatedPrice <= 0 // Este es el punto que se ve afectado si calculatePrice devuelve 0
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

      console.log('isReservationButtonDisabled Getter: Comparando fechas:');
      console.log('  start (parsed):', start.toISOString());
      console.log('  end (parsed):', end.toISOString());
      console.log('  today (midnight):', today.toISOString());

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        isDisabled = true;
        reason = 'Fechas seleccionadas no son válidas.';
      } else if (start < today) {
        // Re-verifica que la fecha de inicio no esté en el pasado
        isDisabled = true;
        reason = 'La fecha de inicio no puede ser en el pasado.';
      } else if (start > end) {
        // Re-verifica que la fecha de inicio no sea posterior a la de fin
        isDisabled = true;
        reason =
          'La fecha de fin debe ser posterior o igual a la fecha de inicio.';
      }
    }

    console.log(
      'isReservationButtonDisabled Getter: Estado FINAL:',
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
      usuario_id: usuarioId, // <-- Ahora enviamos el ID numérico
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
          this.router.navigate(['/catalogo']); // Redirige al catálogo
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
