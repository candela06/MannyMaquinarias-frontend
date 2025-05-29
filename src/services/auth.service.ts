// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // ¡YA LO TIENES!
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    nombreUsuario?: string;
  };
}

// AÑADIR/ASEGURAR EL 'export' AQUÍ
export interface RegisterData {
  email: string;
  password: string;
  fechaNacimiento?: string; // Es opcional si el backend no lo requiere explícitamente como string obligatorio
  dni?: string; // Agregado
  nombreUsuario?: string; // Agregado
  nombre?: string; // Agregado
  apellido?: string; // Agregado
  direccion?: string; // Agregado
  edad?: number; // Agregado
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/auth';

  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();

  private _currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this._isLoggedIn.next(this.hasToken());
      this._currentUser.next(this.getStoredUser());
    }
  }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  private getStoredUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  login(credentials: {
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem(
              'currentUser',
              JSON.stringify(response.usuario)
            );
          }

          this._isLoggedIn.next(true);
          this._currentUser.next(response.usuario);

          Swal.fire(
            '¡Bienvenido!',
            'Sesión iniciada correctamente',
            'success'
          ).then(() => {
            this.router.navigate(['/catalogo']);
          });
        }),
        // Asegúrate de que el 'error' esté tipado con HttpErrorResponse
        catchError((error: HttpErrorResponse) => {
          // <--- AÑADE ': HttpErrorResponse' AQUÍ
          console.error('Error en el login:', error);
          let errorMessage = 'Error al iniciar sesión. Inténtelo de nuevo.';
          if (error.status === 401 || error.status === 400) {
            errorMessage =
              'Credenciales inválidas. Verifique su correo y contraseña.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          Swal.fire('Error', errorMessage, 'error');
          return of(null as any);
        })
      );
  }

  register(userData: RegisterData): Observable<any | null> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        console.log('Registro exitoso:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        // ¡YA LO TIENES!
        console.error('Error en el registro:', error);
        let errorMessage = 'Error al registrar usuario. Inténtelo de nuevo.';
        if (error.status === 400 && error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 409) {
          errorMessage = 'El email o DNI ya se encuentran registrados.';
        }
        Swal.fire('Error', errorMessage, 'error');
        return of(null);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }

    this._isLoggedIn.next(false);
    this._currentUser.next(null);

    this.router.navigate(['/login']);
    Swal.fire('Sesión Cerrada', 'Has cerrado sesión correctamente', 'info');
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getCurrentUser(): any {
    return this._currentUser.getValue();
  }
}
