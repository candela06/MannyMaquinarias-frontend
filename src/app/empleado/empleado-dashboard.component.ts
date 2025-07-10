import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-empleado-dashboard',
  templateUrl: './empleado-dashboard.component.html',
  imports: [CommonModule, RouterModule, FormsModule],
})
export class empleadoDashboardComponent {
  mostrarFormularioCliente = false;
  hoy: string = new Date().toISOString().split('T')[0];
  edadValida: boolean | null = null;
  nuevoCliente = {
    email: '',
    edad: '',
  };
  mostrarFormularioSaldar = false;
  emailCliente = '';
  montoActual: number | null = null;
  cargandoMonto = false;
  errorMonto = '';

  employeeOptions = [
    {
      title: 'Gestionar Máquinas',
      description:
        'Recibir, entregar, iniciar y finalizar mantenimiento de máquina.',
      icon: 'bi-plus-circle-fill',
      route: '',
    },
    {
      title: 'Reservas',
      description:
        'Todas las reservas de todos los usuarios y cancelar reservas',
      icon: 'bi-list-ul',
      route: '/trabajador/reservas',
    },
    {
      title: 'Crear Cliente',
      description:
        '¡Crea un cliente para que pueda utilizar nuestro servicio! ',
      icon: 'bi-list-ul',
      route: '',
      accionLocal: 'crearCliente',
    },
    {
      title: 'Saldar Deuda',
      description: 'Salda la deuda de los clientes',
      icon: 'bi-list-ul',
      route: '',
      accionLocal: 'saldarDeuda',
    },
  ];

  constructor(private usuarioService: UsuarioService) {}

  logClick(option: any): void {
    if (option.accionLocal === 'crearCliente') {
      this.mostrarFormularioCliente = true;
    }
    if (option.accionLocal === 'saldarDeuda') {
      this.abrirFormularioSaldar();
    }
  }

  toggleFormulario(): void {
    this.mostrarFormularioCliente = !this.mostrarFormularioCliente;
  }

  validarEdad(): void {
    if (!this.nuevoCliente.edad) {
      this.edadValida = null;
      return;
    }

    const nacimiento = new Date(this.nuevoCliente.edad);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    this.edadValida = edad >= 18;
  }

  crearCliente() {
    if (
      !this.nuevoCliente.email ||
      !this.nuevoCliente.edad ||
      this.edadValida === false
    )
      return;

    const nacimiento = new Date(this.nuevoCliente.edad);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    const payload = {
      email: this.nuevoCliente.email,
      edad,
      rolCreador: 'trabajador',
    };

    this.usuarioService.crearUsuario(payload).subscribe({
      next: () => {
        Swal.fire(
          'Cliente creado',
          'El cliente se creó correctamente.',
          'success'
        );
        this.mostrarFormularioCliente = false;
        this.nuevoCliente = { email: '', edad: '' };
        this.edadValida = null;
      },
      error: (err) => {
        if (
          err.status === 400 &&
          err.error &&
          typeof err.error === 'object' &&
          err.error.error?.toLowerCase().includes('email')
        ) {
          Swal.fire({
            icon: 'error',
            title: 'Email en uso',
            text: 'Ya existe un usuario con ese correo electrónico.',
            confirmButtonColor: '#d33',
          });
        } else {
          Swal.fire('Error', 'No se pudo crear el cliente.', 'error');
        }
      },
    });
  }

  abrirFormularioSaldar(): void {
    this.mostrarFormularioSaldar = true;
    this.emailCliente = '';
    this.montoActual = null;
    this.errorMonto = '';
  }

  cerrarModal(event: MouseEvent): void {
    this.mostrarFormularioSaldar = false;
    this.emailCliente = '';
    this.montoActual = null;
    this.errorMonto = '';
  }

  buscarMonto(): void {
    if (!this.emailCliente.trim()) {
      this.errorMonto = 'Ingresá un email válido';
      return;
    }

    this.errorMonto = '';
    this.cargandoMonto = true;

    this.usuarioService.getMontoPorEmail(this.emailCliente).subscribe({
      next: (res) => {
        this.montoActual = res.monto;
        this.cargandoMonto = false;
      },
      error: (err) => {
        this.errorMonto = err?.error?.error || 'No se pudo obtener el monto';
        this.montoActual = null;
        this.cargandoMonto = false;
      },
    });
  }

  resetearMonto(): void {
    this.usuarioService.resetearMontoUsuario(this.emailCliente).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Monto reseteado a $0 correctamente.', 'success');
        this.mostrarFormularioSaldar = false;
      },
      error: (err) => {
        Swal.fire(
          'Error',
          err?.error?.error || 'No se pudo resetear el monto.',
          'error'
        );
      },
    });
  }
}
