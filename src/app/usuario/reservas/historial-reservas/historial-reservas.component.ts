//src\app\usuario\reservas\historial-reservas\historial-reservas.component.ts
import { Component, OnInit } from '@angular/core';
import { Reserva } from '../../../modles/reserva.model';
import { Machinery } from '../../../modles/machinery.model';
import { Policy } from '../../../modles/policy.model';
import { ReservaService } from '../../../../services/reserva.service';
import { MachineryService } from '../../../../services/machinery.service';
import { PolicyService } from '../../../../services/policy.service';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../../../shared/star.component';

interface Resena {
  id: number;
  comentario: string;
  puntuacion: number;
  createdAt: number;
}

@Component({
  selector: 'app-ver-historial',
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: './historial-reservas.component.html',
})
export class HistorialReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  cargando: boolean = true;
  error: string | null = null;
  reservaSeleccionada: Reserva | null | undefined;
  maquinaSeleccionada: Machinery | null | undefined;
  politicaCancelacionSeleccionada: Policy | null | undefined;
  todasLasPoliticas: Policy[] = [];

  puntuacion: number = 0;
  comentario: string = '';
  mostrarModalResena: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private MachineryService: MachineryService,
    private PolicyService: PolicyService
  ) {}

  ngOnInit(): void {
    this.reservaService.getReservasPropias().subscribe({
      next: (res) => {
        this.reservas = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener reservas, msj del front', err);
        this.error = '';
        this.cargando = false;
      },
    });

    this.PolicyService.getPolicies().subscribe({
      next: (pols) => {
        this.todasLasPoliticas = pols;
      },
      error: (err) => {
        console.error('Error al obtener políticas', err);
      },
    });
  }
  seleccionarReserva(reserva: Reserva) {
    this.reservaSeleccionada = reserva;

    this.MachineryService.getMachineries().subscribe((machineries) => {
      const maquina = machineries.find((m) => m.id === reserva.maquina.id);
      this.maquinaSeleccionada = maquina ?? null;
      console.log('Máquina seleccionada:', this.maquinaSeleccionada);

      if (maquina?.cancellationPolicy) {
        this.politicaCancelacionSeleccionada = maquina.cancellationPolicy;
      } else if ((maquina as any)?.politica_cancelacion_id) {
        const id = (maquina as any).politica_cancelacion_id;
        this.politicaCancelacionSeleccionada =
          this.todasLasPoliticas.find((p) => p.id === id) ?? null;
      } else {
        this.politicaCancelacionSeleccionada = null;
        console.warn(
          'No se encontró política de cancelación para esta máquina.'
        );
      }
    });
  }

  cerrarDetalle() {
    this.reservaSeleccionada = null;
  }

  cancelarReserva(reserva: Reserva): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción aplicará la política de cancelación correspondiente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservaService.cancelarReserva(reserva.id).subscribe({
          next: (res) => {
            Swal.fire(
              'Cancelada',
              'La reserva fue cancelada exitosamente.',
              'success'
            );
            reserva.eliminado = true;
          },
          error: (err) => {
            console.error('Error completo recibido del backend:', err);
            let errorMessage =
              'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
            if (err && err.error) {
              if (typeof err.error === 'string') {
                errorMessage = err.error;
              } else if (err.error.message) {
                errorMessage = err.error.message;
              } else if (err.error.error) {
                errorMessage = err.error.error;
              } else if (err && err.message) {
                errorMessage = err.message;
              }
              Swal.fire('Error', errorMessage, 'error');
            }
          },
        });
      }
      this.cerrarDetalle();
      this.reservaService.getReservasPropias();
    });
  }

  abrirModalResena(): void {
    this.mostrarModalResena = true;
    this.comentario = '';
    this.puntuacion = 0;
  }

  cerrarModalResena(): void {
    this.mostrarModalResena = false;
    this.comentario = '';
    this.puntuacion = 0;
  }

  onPuntuacionChanged(newScore: number): void {
    this.puntuacion = newScore;
  }

  enviarResena(): void {
    if (!this.reservaSeleccionada) return;

    if (this.puntuacion === 0) {
      Swal.fire(
        'Atención',
        'Por favor, selecciona un puntaje para la reseña.',
        'warning'
      );
      return;
    }

    const payload = {
      reserva_id: this.reservaSeleccionada.id,
      comentario: this.comentario,
      puntuacion: this.puntuacion,
    };

    this.MachineryService.crearResena(payload).subscribe({
      next: (res) => {
        Swal.fire('Gracias!', 'Tu reseña fue enviada.', 'success');
        this.cerrarModalResena();
        if (this.reservaSeleccionada) {
          if (!this.reservaSeleccionada.resena) {
            this.reservaSeleccionada.resena = res; // Asume una estructura mínima
          }
        }
      },
      error: (err) => {
        console.error('Error completo recibido del backend:', err);
        let errorMessage =
          'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
        if (err && err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.error) {
            errorMessage = err.error.error;
          } else if (err && err.message) {
            errorMessage = err.message;
          }
          Swal.fire('Error', errorMessage, 'error');
        }
      },
    });
  }
}
