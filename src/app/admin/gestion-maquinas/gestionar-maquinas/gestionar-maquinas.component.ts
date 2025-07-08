import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineryService } from '../../../../services/machinery.service';
import { Machinery } from '../../../modles/machinery.model';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listado-maquinas',
  templateUrl: './gestionar-maquinas.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class GestionarMaquinasComponent implements OnInit {
  maquinas: Machinery[] = [];
  maquinaSeleccionada: Machinery | null = null;
  mostrarEditor: boolean = false;

  constructor(private machineryService: MachineryService) {}

  ngOnInit(): void {
    this.cargarMaquinas();
  }

  cargarMaquinas(): void {
    this.machineryService.getMachineries().subscribe({
      next: (data) => {
        this.maquinas = data;
      },
      error: (err) => {
        console.error('Error al obtener las máquinas:', err);
      },
    });
  }

  editarMaquina(maquina: Machinery): void {
    this.maquinaSeleccionada = { ...maquina };
    this.mostrarEditor = true;
  }

  cerrarEditor(): void {
    this.maquinaSeleccionada = null;
    this.mostrarEditor = false;
  }

  guardarCambios(): void {
    if (!this.maquinaSeleccionada) return;

    const datosModificados = {
      numeroSerie: this.maquinaSeleccionada.numeroSerie,
      nombre: this.maquinaSeleccionada.nombre,
      marca: this.maquinaSeleccionada.marca,
      modelo: this.maquinaSeleccionada.modelo,
      precio: this.maquinaSeleccionada.precio,
      categoria: this.maquinaSeleccionada.categoria,
      imageUrl: this.maquinaSeleccionada.imageUrl,
      sucursal_id: this.maquinaSeleccionada.sucursal?.id,
    };

    this.machineryService
      .actualizarMaquina(this.maquinaSeleccionada.id, datosModificados)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Máquina actualizada',
            text: 'La máquina fue modificada correctamente.',
            confirmButtonColor: '#3085d6',
          });
          const index = this.maquinas.findIndex(
            (m) => m.id === this.maquinaSeleccionada!.id
          );
          if (index !== -1) {
            this.maquinas = [
              ...this.maquinas.slice(0, index),
              { ...this.maquinaSeleccionada! },
              ...this.maquinas.slice(index + 1),
            ];
          }
          this.mostrarEditor = false;
        },
        error: (err) => {
          console.error(err);
          if (err.status === 409) {
            const mensaje = err.error?.detalles || err.error?.error || '';
            if (mensaje.includes('reservas')) {
              Swal.fire({
                icon: 'error',
                title: 'No se puede modificar la máquina',
                text: 'La máquina tiene reservas pendientes activas.',
                confirmButtonColor: '#d33',
              });
            } else if (mensaje.includes('número de serie')) {
              Swal.fire({
                icon: 'error',
                title: 'Número de serie duplicado',
                text: 'Ese número de serie ya está asignado a otra máquina.',
                confirmButtonColor: '#d33',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje || 'Conflicto al actualizar la máquina.',
                confirmButtonColor: '#d33',
              });
            }
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al actualizar la máquina.',
              confirmButtonColor: '#d33',
            });
          }
        },
      });
  }
  eliminarMaquina(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.machineryService.eliminarMaquina(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'La máquina fue eliminada correctamente.',
              confirmButtonColor: '#3085d6',
            }).then(() => {
              this.maquinas = this.maquinas.filter((m) => m.id !== id);
            });
          },
          error: (err) => {
            console.error('Error al eliminar máquina:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la máquina.',
              confirmButtonColor: '#3085d6',
            });
          },
        });
      }
    });
  }
}
