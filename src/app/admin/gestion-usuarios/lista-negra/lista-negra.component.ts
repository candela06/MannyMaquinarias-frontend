import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../../services/usuario.service';
import { User } from '../../../modles/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-negra',
  imports: [CommonModule],
  templateUrl: './lista-negra.component.html',
  //  styleUrls: ['./lista-negra.component.css'],
})
export class ListaNegraComponent implements OnInit {
  usuarios: User[] = [];

  constructor(private UsuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.UsuarioService.getBlacklistedUsers().subscribe({
      next: (data: User[]) => (this.usuarios = data),
      error: (err: any) => console.error('Error al cargar lista negra:', err),
    });
  }

  sacarDeListaNegra(email: string): void {
    Swal.fire({
      title: '¿Quitar de la lista negra?',
      text: `¿Seguro que deseas sacar a ${email} de la lista negra?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.UsuarioService.sacarDeListaNegra(email).subscribe({
          next: (resp) => {
            Swal.fire('Quitado', resp.message, 'success');
            this.UsuarioService.getBlacklistedUsers().subscribe({
              next: (data: User[]) => (this.usuarios = data),
              error: (err: any) =>
                console.error('Error al cargar lista negra:', err),
            });
          },
          error: (err) => {
            const msg =
              err.status === 400 || err.status === 404
                ? err.error?.error || 'No se pudo quitar.'
                : 'Error inesperado al quitar de la lista negra.';
            Swal.fire('Error', msg, 'error');
          },
        });
      }
    });
  }
}
