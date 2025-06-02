import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // ¡IMPORTA EL OPERADOR MAP!
import { User } from '../app/modles/user.model';

/**
 * @description Servicio para interactuar con la API de la lista negra de usuarios.
 * Proporciona métodos para obtener la lista de usuarios bloqueados.
 */
@Injectable({
  providedIn: 'root',
})
export class BlackListService {
  private apiUrl = 'http://localhost:3001/listaNegra';

  constructor(private http: HttpClient) {}

  /**
   * @description Obtiene la lista de todos los usuarios que están en la lista negra.
   * @returns {Observable<User[]>} Un Observable que emite un array de objetos User.
   */
  getBlacklistedUsers(): Observable<User[]> {
    // El backend devuelve { usuarios: [...] }
    // Usamos .pipe(map()) para transformar la respuesta y emitir directamente el array de usuarios.
    return this.http.get<{ usuarios: User[] }>(this.apiUrl).pipe(
      map((response) => response.usuarios) // <-- ¡AQUÍ ESTÁ EL CAMBIO CLAVE!
    );
  }
  /**
   * @description Agrega un usuario a la lista negra enviando el email como parámetro de URL.
   * El backend espera el email en req.params.
   * @param email El email del usuario a agregar.
   * @returns Un Observable con la respuesta del backend (ej. { message: "..." }).
   */
  addBlacklistedUser(email: string): Observable<any> {
    // La URL construida será, por ejemplo: http://localhost:3001/listaNegra/usuario@ejemplo.com
    // El segundo argumento de HttpClient.post es el cuerpo de la petición, que aquí puede ser un objeto vacío {}
    // ya que el email va en la URL.
    return this.http.post<any>(`${this.apiUrl}/${email}`, {});
  }
}
