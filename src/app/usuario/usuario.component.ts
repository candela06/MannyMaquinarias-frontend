import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngFor, *ngIf
import { RouterModule } from '@angular/router'; // Necesario para routerLink
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { tap, catchError, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  templateUrl: './usuario.component.html',
  //styleUrls: ['./usuario.component.css'],
  imports: [CommonModule, RouterModule], // Importar RouterModule
})
export class UsuarioDashboardComponent {
  montoPendiente: number = 0;
  isDeleting: boolean = false;

  UsuarioOptions = [
    {
      title: 'Ver Reservas',
      description: 'Consultar tu historial de reservas',
      icon: 'bi-list-ul',
      route: '/mis-reservas',
    },
    {
      title: 'Modificar usuario',
      description: 'Ver y modificar tus datos.',
      icon: 'bi-person-circle',
      route: '/user-modificar',
    },
    {
      title: 'Eliminar cuenta propia',
      description: 'No podés eliminar tu cuenta si tenés reservas pendientes',
      icon: 'bi-person-exclamation',
      accionLocal: 'eliminarCuenta',
    },
  ];

  logClick(option: any): void {
    if (option.accionLocal === 'eliminarCuenta') {
      this.eliminarCuenta();
    }
  }

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioService.getMontoUsuario().subscribe({
      next: (res) => {
        this.montoPendiente = res.monto;
      },
      error: (err) => {
        console.error('Error al obtener monto:', err);
      },
    });
  }

  eliminarCuenta(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si deseas dejar de usar nuestros servicios, puedes eliminar tu cuenta. Ten en cuenta que esta acción es irreversible y tu cuenta será marcada como eliminada.',
      icon: 'warning',
      color: '#ffffff',
      background: '#910202ff',
      backdrop: 'rgba(123, 0, 0, 0.4)',
      showCancelButton: true,
      confirmButtonColor: '#000000ff',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar mi cuenta',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting = true; // Activa el estado de carga del botón
        this.usuarioService
          .eliminarCuentaPropia()
          .pipe(
            tap((response) => {
              this.isDeleting = false;
              Swal.fire({
                title: '😥💔Adios...',
                text: 'Tu cuenta fue eliminada exitosamente',
                showCancelButton: false,
                showConfirmButton: false,
                timer: 3000,
              });
              this.authService.logout(true);
            }),
            catchError((error) => {
              this.isDeleting = false;
              console.error('Error al eliminar la cuenta:', error);
              const errorMessage =
                error.message ||
                'No se pudo eliminar tu cuenta. Por favor, inténtalo de nuevo.';
              Swal.fire('Error', errorMessage, 'error');
              return of(null);
            })
          )
          .subscribe();
      }
    });
  }
}
