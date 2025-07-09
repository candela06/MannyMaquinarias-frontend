import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common'; // ⬅️ IMPORTANTE
import { Reserva } from '../../modles/reserva.model';
import { ReservaService } from '../../../services/reserva.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../modles/user.model';
import { UsuarioService } from '../../../services/usuario.service';
import { MachineryService } from '../../../services/machinery.service';
import { Machinery } from '../../modles/machinery.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-reservas',
  standalone: true,
  templateUrl: './listar-reservas.component.html',
  imports: [CommonModule, FormsModule],
})
export class ListarReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  emailBusqueda: string = '';
  cargando = true;
  isLoading: boolean = true;
  error: string | null = null;
  usuarios: User[] = [];
  emailsUnicos: string[] = [];
  sugerencias: string[] = [];
  fecha_inicio: string = '';
  fecha_fin: string = '';

  maquinas: Machinery[] = [];
  mostrarFormulario = false;
  reserva = {
    email: '',
    fecha_inicio: '',
    fecha_fin: '',
    maquina_id: 0,
    precio: 0,
  };

  constructor(
    private reservaService: ReservaService,
    private usuarioService: UsuarioService,
    private maquinaService: MachineryService
  ) {}

  ngOnInit(): void {
    this.obtenerReservas();
    this.maquinaService.getMachineries().subscribe((maquinas) => {
      this.maquinas = maquinas;
    });
  }

  abrirFormulario(): void {
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.reserva = {
      email: '',
      fecha_inicio: '',
      fecha_fin: '',
      maquina_id: 0,
      precio: 0,
    };
  }

  calcularPrecio(): void {
    const inicio = new Date(this.reserva.fecha_inicio);
    const fin = new Date(this.reserva.fecha_fin);

    if (
      !this.reserva.maquina_id ||
      isNaN(inicio.getTime()) ||
      isNaN(fin.getTime()) ||
      fin < inicio
    ) {
      this.reserva.precio = 0;
      return;
    }

    const maquinaSeleccionada = this.maquinas.find(
      (m) => m.id === this.reserva.maquina_id
    );

    if (maquinaSeleccionada) {
      const dias =
        Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      const precioPorDia = maquinaSeleccionada.precio;
      this.reserva.precio = +(dias * precioPorDia).toFixed(2); // redondeado a 2 decimales
    }
  }

  obtenerReservas(): void {
    this.isLoading = true;
    this.reservaService.getReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        this.isLoading = false;
        const emails = data
          .map((reserva: any) => reserva.usuario?.email) // asegúrate de que venga el usuario con email
          .filter((email: string | undefined): email is string => !!email);

        this.emailsUnicos = [...new Set(emails)];
      },

      error: (error) => {
        console.error('Error al obtener reservas', error);
        this.isLoading = false;
      },
    });
  }

  buscarPorEmail(): void {
    if (!this.emailBusqueda.trim()) return;

    this.isLoading = true;
    this.sugerencias = [];

    this.reservaService.getReservasUsuario(this.emailBusqueda).subscribe({
      next: (data) => {
        this.reservas = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al buscar reservas por email:', error);
        this.reservas = [];
        this.isLoading = false;
      },
    });
  }

  actualizarSugerencias(): void {
    const input = this.emailBusqueda.toLowerCase();
    this.sugerencias = this.emailsUnicos
      .filter((email) => email.toLowerCase().includes(input))
      .slice(0, 5);
  }

  seleccionarEmail(email: string): void {
    this.emailBusqueda = email;
    this.sugerencias = [];
    this.buscarPorEmail();
  }

  mostrarTodasLasReservas(): void {
    this.emailBusqueda = '';
    this.sugerencias = [];
    this.obtenerReservas();
  }

  filtrarPorFechas() {
    if (!this.fecha_inicio || !this.fecha_fin) return;

    const inicio = new Date(this.fecha_inicio);
    const fin = new Date(this.fecha_fin);

    if (fin < inicio) {
      Swal.fire(
        'Fechas inválidas',
        'La fecha de fin no puede ser anterior a la fecha de inicio.',
        'warning'
      );
      return;
    }

    this.reservaService
      .getReservasPorFecha(this.fecha_inicio, this.fecha_fin)
      .subscribe({
        next: (reservas) => {
          this.reservas = reservas;
        },
        error: (err) => {
          console.error('Error al obtener reservas por fecha:', err);
          Swal.fire(
            'Error',
            'No se encontraron reservas en ese rango o ocurrió un problema.',
            'error'
          );
        },
      });
  }

  crearReserva(): void {
    const { email, fecha_inicio, fecha_fin, maquina_id, precio } = this.reserva;

    if (!email || !fecha_inicio || !fecha_fin || !maquina_id || !precio) {
      Swal.fire(
        'Campos incompletos',
        'Por favor completa todos los campos antes de confirmar.',
        'warning'
      );
      return;
    }

    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (fin < inicio) {
      Swal.fire(
        'Fechas inválidas',
        'La fecha de fin no puede ser anterior a la fecha de inicio.',
        'warning'
      );
      return;
    }

    this.reservaService.crearReservaEmpleado(this.reserva).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Reserva creada correctamente.', 'success');
        this.reserva = {
          email: '',
          fecha_inicio: '',
          fecha_fin: '',
          maquina_id: 0,
          precio: 0,
        };
        this.mostrarFormulario = false;
        this.obtenerReservas();
      },
      error: (error) => {
        Swal.fire(
          'Error',
          error?.error?.error || 'No se pudo crear la reserva.',
          'error'
        );
      },
    });
  }

  eliminarReserva(reservaId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará tu reserva y te devolverá el monto correspondiente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservaService.eliminarReserva(reservaId).subscribe({
          next: (res) => {
            Swal.fire('Eliminada', res.message, 'success');
            this.reservas = this.reservas.filter((r) => r.id !== reservaId);
          },
          error: (err) => {
            const mensaje =
              err.status === 404
                ? 'La reserva no fue encontrada.'
                : err.status === 400
                ? 'La reserva ya estaba eliminada.'
                : 'No se pudo eliminar la reserva.';
            Swal.fire('Error', mensaje, 'error');
          },
        });
      }
    });
  }

  @ViewChild('sugerenciasContainer') sugerenciasContainer!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (
      this.sugerenciasContainer &&
      !this.sugerenciasContainer.nativeElement.contains(event.target)
    ) {
      this.sugerencias = [];
    }
  }
}
