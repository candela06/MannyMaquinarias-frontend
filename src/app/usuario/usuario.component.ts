import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngFor, *ngIf
import { RouterModule } from '@angular/router'; // Necesario para routerLink
import { UsuarioService } from '../../services/usuario.service';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  templateUrl: './usuario.component.html',
  //styleUrls: ['./usuario.component.css'],
  imports: [CommonModule, RouterModule], // Importar RouterModule
})
export class UsuarioDashboardComponent {
  montoPendiente: number = 0;

  UsuarioOptions = [
    {
      title: 'Ver Reservas',
      description: 'Consultar tu historial de reservas',
      icon: 'bi-plus-circle-fill', // Icono de Bootstrap Icons
      route: '/mis-reservas',
    },
    {
      title: 'Modificar usuario',
      description: 'Ver y modificar mi usuario.',
      icon: 'bi-list-ul',
      route: '/user-modificar',
    },
    {
      title: 'Eliminar cuenta propia',
      description: 'Elimina tu cuenta propia',
      icon: 'bi-people-fill',
      route: '/eliminar-micuenta',
    },
  ];

  logClick(route: string): void {
    console.log('Botón "Ir a ' + route + '" clicado.');
  }

  constructor(private usuarioService: UsuarioService) {}

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
}
