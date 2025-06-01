import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Policy } from '../app/modles/policy.model';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  private apiUrl = 'http://localhost:3001';
  constructor(private http: HttpClient) {}

  // Asumimos un endpoint como /politicas_cancelacion que devuelve la lista
  getPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.apiUrl}/politicas_cancelacion`);
  }
}
