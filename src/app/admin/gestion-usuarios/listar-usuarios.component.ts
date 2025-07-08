// src/app/admin/gestion-usuarios/eliminar-usuario/eliminar-usuario.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { User } from '../../modles/user.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  standalone: true,
  selector: 'app-listar-usuario', // Selector específico para este componente
  templateUrl: './listar-usuarios.component.html',
  // styleUrls: ['./eliminar-usuario.component.css'], // Descomenta si tienes un archivo CSS para este componente
  imports: [CommonModule, RouterModule, FormsModule],
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: User[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  mostrarFormularioEmpleado: boolean = false;
  hoy: string = new Date().toISOString().split('T')[0];
  edadValida: boolean | null = null;
  nuevoEmpleado = {
    email: '',
    edad: '',
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.usuarioService.getUsersByRole('').subscribe({
      next: (res) => {
        this.usuarios = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.isLoading = false;
      },
    });
  }

  eliminarUsuario(email: string): void {
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
        this.usuarioService.eliminarUsuario(email).subscribe({
          next: () => {
            this.usuarios = this.usuarios.filter((u) => u.email !== email);
            Swal.fire(
              'Eliminado',
              'El usuario ha sido eliminado correctamente.',
              'success'
            );
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
          },
        });
      }
    });
  }

  agregarListaNegra(email: string): void {
    Swal.fire({
      title: '¿Agregar a lista negra?',
      text: 'Este usuario no podrá realizar ninguna reserva',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.addBlacklistedUser(email).subscribe({
          next: () => {
            Swal.fire(
              'Agregado',
              'El usuario fue enviado a la lista negra.',
              'success'
            );
            this.cargarUsuarios(); // Actualizamos la lista si querés ocultarlo de la principal
          },
          error: () => {
            Swal.fire('Error', 'No se pudo agregar a la lista negra.', 'error');
          },
        });
      }
    });
  }

  validarEdad(): void {
    if (!this.nuevoEmpleado.edad) {
      this.edadValida = null;
      return;
    }

    const nacimiento = new Date(this.nuevoEmpleado.edad);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    this.edadValida = edad >= 18;
  }

  crearEmpleado() {
    if (
      !this.nuevoEmpleado.email ||
      !this.nuevoEmpleado.edad ||
      this.edadValida === false
    )
      return;

    const nacimiento = new Date(this.nuevoEmpleado.edad);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    const payload = {
      email: this.nuevoEmpleado.email,
      edad,
      rolCreador: 'admin',
    };

    this.usuarioService.crearEmpleado(payload).subscribe({
      next: () => {
        Swal.fire(
          'Empleado creado',
          'El empleado se creó correctamente.',
          'success'
        );
        this.mostrarFormularioEmpleado = false;
        this.nuevoEmpleado = { email: '', edad: '' };
        this.edadValida = null;
        this.cargarUsuarios();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo crear el empleado.', 'error');
      },
    });
  }
}
