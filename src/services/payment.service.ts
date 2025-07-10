import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service'; // asegurate que el path sea correcto
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:3001/pagos';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  crearPreferenciaPago(data: { title: string; precio: number; idReserva: number }): Observable<{ init_point: string }> {
    const token = this.authService.getToken(); // Asegurate de tener este método
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<{ init_point: string }>(
      `${this.apiUrl}/checkout`,
      data,
      { headers }
    );
  }
}

