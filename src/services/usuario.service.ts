// src/app/services/usuario.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// Importa el Auth service si necesitas el token para las llamadas a la API de usuario
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3001/users'; // Ejemplo de endpoint para usuarios

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Ejemplo: Obtener el perfil del usuario logueado
  // (Asumiendo que necesitas enviar el token en los headers)
  getProfile(): Observable<any> {
    const token = this.authService.getToken();
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<any>(`${this.apiUrl}/profile`, { headers });
  }

  // Puedes añadir más métodos aquí para otras operaciones CRUD de usuario
}
