// src/app/admin/gestion-maquinas/eliminar-maquina/eliminar-maquina.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { RouterModule, Router } from '@angular/router'; // Para routerLink y navegación
import Swal from 'sweetalert2'; // Para alertas de usuario

import { MachineryService } from '../../../../services/machinery.service'; // Asegúrate de la ruta correcta

@Component({
  standalone: true,
  selector: 'app-eliminar-maquina',
  templateUrl: './eliminar-maquina.component.html',
  //  styleUrls: ['./eliminar-maquina.component.css'], // Crea este archivo si necesitas estilos específicos
  imports: [CommonModule, FormsModule, RouterModule],
})
export class EliminarMaquinaComponent implements OnInit {
  machineIdToDelete: number | null = null; // Para el input del ID de la máquina
  isLoading: boolean = false; // Para el estado del spinner del botón

  constructor(
    private machineryService: MachineryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // No hay carga inicial de datos aquí, ya que solo eliminamos una máquina por ID.
  }

  /**
   * @description Abre un SweetAlert para que el administrador ingrese el ID de la máquina
   * a eliminar.
   */
  async openDeleteMachineConfirmationInput(): Promise<void> {
    const { value: idString } = await Swal.fire({
      title: 'Eliminar Máquina del Sistema',
      input: 'text',
      inputLabel: 'Ingrese el ID de la máquina a eliminar',
      inputPlaceholder: 'Ej: 123',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas ingresar un ID!';
        }
        const id = Number(value);
        if (isNaN(id) || id <= 0) {
          return 'Por favor, ingrese un ID numérico válido.';
        }
        return null;
      },
    });

    if (idString) {
      this.machineIdToDelete = Number(idString);
      this.confirmDeleteMachine(this.machineIdToDelete);
    }
  }

  /**
   * @description Muestra un SweetAlert de confirmación antes de eliminar lógicamente la máquina.
   * @param machineId El ID de la máquina a confirmar para eliminar.
   */
  async confirmDeleteMachine(machineId: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar la máquina con ID "${machineId}" del sistema? Esta acción es un borrado lógico y la máquina NO estará disponible para alquiler.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para eliminar
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      this.callDeleteMachineBackend(machineId);
    }
  }

  /**
   * @description Envía la petición al servicio para eliminar la máquina en el backend.
   * @param machineId El ID de la máquina a eliminar.
   */
  callDeleteMachineBackend(machineId: number): void {
    this.isLoading = true; // Activar el spinner visual
    this.machineryService.eliminarMaquina(machineId).subscribe({
      next: (response) => {
        Swal.fire(
          '¡Eliminado!',
          response.message || 'Máquina eliminada lógicamente con éxito.', // Mensaje que viene del backend o uno por defecto
          'success'
        );
        this.isLoading = false;
        // Opcional: Podrías redirigir al listado de máquinas o limpiar el input
        // this.router.navigate(['/admin/maquinas/listar']);
        this.machineIdToDelete = null; // Limpiar el input después de una eliminación exitosa
      },
      error: (error) => {
        console.error('Error al eliminar máquina:', error);
        // Usamos el mensaje de error que viene del servicio o un mensaje genérico
        const errorMessage =
          error.message || 'Error desconocido al eliminar máquina.';
        Swal.fire('Error', errorMessage, 'error');
        this.isLoading = false;
      },
    });
  }
}
