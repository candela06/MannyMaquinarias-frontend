// src/app/services/branch.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../app/modles/branch.model'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  // **¡IMPORTANTE!** Reemplaza 'http://localhost:3000/api' con la URL base de tu backend.
  // Si tus endpoints son /api/sucursales, entonces la base es /api.
  private apiUrl = 'http://localhost:3000/api'; // Ejemplo: Cambia esto a la URL de tu API

  constructor(private http: HttpClient) {}

  /**
   * @description Obtiene todas las sucursales existentes.
   * Si el backend permite filtrar por localidad en el mismo endpoint, podemos añadir un parámetro.
   * Por ahora, asumo que devolverá todas y filtramos en el frontend las localidades únicas.
   */
  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/sucursales`);
  }

  /**
   * @description Agrega una nueva sucursal al backend.
   * @param branch Los datos de la nueva sucursal (sin ID).
   */
  addBranch(branch: Omit<Branch, 'id'>): Observable<Branch> {
    // Omit<Branch, 'id'> asegura que no enviamos el 'id' al backend al crear
    return this.http.post<Branch>(`${this.apiUrl}/sucursales`, branch);
  }
}
