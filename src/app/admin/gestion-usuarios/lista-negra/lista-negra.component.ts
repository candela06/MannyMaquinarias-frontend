import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../../services/usuario.service';
import { User } from '../../../modles/user.model';

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
}
