import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MachineryService } from '../../../services/machinery.service';
import { Machinery, MachineryStatus } from '../../modles/machinery.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-gestionar-maquinas-trabajador',
  templateUrl: './gestionar-maquinas-trabajador.component.html',
  styleUrls: ['./gestionar-maquinas-trabajador.component.css'],
  imports: [CommonModule, FormsModule],
})
export class GestionarMaquinasTrabajadorComponent implements OnInit {
  maquinas: Machinery[] = [];

  constructor(
    private machineryService: MachineryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerMaquinas();

    // Verificamos si venimos del mantenimiento con un cambio de estado
    const state = history.state;
    if (state && state.id && state.nuevoEstado) {
      this.actualizarEstadoLocal(state.id, state.nuevoEstado);
      this.obtenerMaquinas();
    }
  }

  obtenerMaquinas() {
    this.machineryService.getMachineries().subscribe({
      next: (res) => {
        this.maquinas = res;
      },
      error: (err) => {
        console.error('Error al obtener máquinas:', err);
      },
    });
  }

  entregarMaquina(maquina: Machinery) {
    if (maquina.estado !== MachineryStatus.DISPONIBLE) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede entregar la máquina',
        text: 'La máquina no se encuentra disponible',
      });
      return;
    }

    this.machineryService
      .cambiarEstadoMaquina(maquina.id, MachineryStatus.ENTREGADO)
      .subscribe({
        next: (res) => {
          console.log('Máquina entregada:', res);
          maquina.estado = MachineryStatus.ENTREGADO;
          Swal.fire({
            icon: 'success',
            title: 'Máquina entregada correctamente',
            showConfirmButton: false,
            timer: 1500,
          });
        },
        error: (err) => {
          console.error('Error al entregar la máquina:', err);
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

  recibirMaquina(maquina: Machinery) {
    if (maquina.estado !== MachineryStatus.ENTREGADO) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede recibir',
        text: 'La máquina aun no ha sido entregada',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    this.machineryService.recibirMaquina(maquina.id).subscribe({
      next: (res) => {
        console.log('Máquina recibida correctamente:', res);
        maquina.estado = MachineryStatus.DISPONIBLE; // Actualiza el estado local
        Swal.fire({
          icon: 'success',
          title: 'Máquina recibida correctamente',
          text:
            res.montoAjustado > 0
              ? `Se aplicó un recargo por atraso de $${res.montoAjustado.toFixed(
                  2
                )}`
              : '',
          showConfirmButton: false,
          timer: 3000,
        });
        this.obtenerMaquinas(); // Recargar la lista para actualizar estados/datos
      },
      error: (err) => {
        console.error('Error al recibir máquina:', err);
        let errorMessage = 'No se pudo recibir la máquina.';
        if (err.error && err.error.error) {
          errorMessage = err.error.error;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
      },
    });
  }

  iniciarMantenimiento(maquina: Machinery) {
    this.router.navigate(['/trabajador/maquinas/mantenimiento/iniciar'], {
      queryParams: { id: maquina.id },
    });
  }

  finalizarMantenimiento(maquina: Machinery) {
    if (maquina.estado !== MachineryStatus.EN_MANTENIMIENTO) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede finalizar el mantenimiento',
        text: 'La máquina no se encuentra en mantenimiento',
      });
      return;
    }

    this.machineryService.finalizarMantenimiento(maquina.id).subscribe({
      next: (res) => {
        console.log('Mantenimiento finalizado:', res);
        maquina.estado = MachineryStatus.DISPONIBLE;
        Swal.fire({
          icon: 'success',
          title: 'Mantenimiento finalizado',
          showConfirmButton: false,
          timer: 1500,
        });
      },
      error: (err) => {
        console.error('Error al finalizar mantenimiento:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo finalizar el mantenimiento.',
        });
      },
    });
  }

  actualizarEstadoLocal(id: number, nuevoEstado: MachineryStatus | string) {
    const maquina = this.maquinas.find((m) => m.id === id);
    if (maquina) {
      maquina.estado = nuevoEstado as MachineryStatus;
    }
  }
}
