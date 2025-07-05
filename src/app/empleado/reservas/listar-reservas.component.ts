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

  constructor(
    private reservaService: ReservaService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.obtenerReservas();
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
