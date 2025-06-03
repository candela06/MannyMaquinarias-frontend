// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // ¡YA LO TIENES!
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    nombreUsuario?: string;
  };
}

export interface DecodedToken {
  id: number;
  rol_id: number;
  rol_nombre: string;
  nombre: string;
  nombreUsuario?: string;
  email: string;
  iat: number; // Issued At (timestamp)
  exp: number; // Expiration Time (timestamp)
}

// AÑADIR/ASEGURAR EL 'export' AQUÍ
export interface RegisterData {
  email: string;
  password: string;
  fechaNacimiento: string; // Es opcional si el backend no lo requiere explícitamente como string obligatorio
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

  //private _isAdmin = new BehaviorSubject<boolean>(false);
  // isAdmin$ = this._isAdmin.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this._isLoggedIn.next(this.hasToken());
      this._currentUser.next(this.getStoredUser());
      // Lógica temporal: si hay token, asumimos que es admin para desarrollo
      //this._isAdmin.next(this.hasToken()); // Asume admin si hay token
    }
  }

  /**
   * @description Verifica si hay un token JWT almacenado en el localStorage.
   * @returns {boolean} True si hay un token, false en caso contrario.
   */

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  /**
   * @description Obtiene la información del usuario almacenada en el localStorage.
   * Si hay un token, intenta decodificarlo para obtener el rol del usuario.
   * @returns {any | null} Objeto con la información del usuario (incluyendo rol) o null.
   */

  private getStoredUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');

      if (userString) {
        const user = JSON.parse(userString);
        // Si el usuario no tiene rol_nombre (ej. de una sesión antigua),
        // intentar obtenerlo del token si existe
        if (!user.rol_nombre && token) {
          try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            user.rol_nombre = decodedToken.rol_nombre;
          } catch (e) {
            console.error('Error al decodificar token al cargar usuario:', e);
            // Si el token es inválido, limpiar la sesión
            this.logout();
            return null;
          }
        }
        return user;
      }
    }
    return null;
  }
  /**
   * @description Maneja el inicio de sesión del usuario.
   * Almacena el token JWT y la información del usuario (incluyendo el rol) en el localStorage.
   * @param credentials Objeto con email y password del usuario.
   * @returns Un Observable con la respuesta de autenticación.
   */

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
            // Decodificar el token para obtener el rol_nombre
            const decodedToken = jwtDecode<DecodedToken>(response.token);
            const userWithRole = {
              ...response.usuario,
              rol_nombre: decodedToken.rol_nombre, // Añadir el rol al objeto de usuario
            };
            localStorage.setItem(
              'currentUser',
              JSON.stringify(userWithRole) // Guardar el usuario con su rol
            );
          }

          this._isLoggedIn.next(true);
          // Actualizar _currentUser con la información del rol
          const decodedToken = jwtDecode<DecodedToken>(response.token);
          this._currentUser.next({
            ...response.usuario,
            rol_nombre: decodedToken.rol_nombre,
          });

          console.log(
            'AuthService: Login exitoso. Rol del usuario:',
            decodedToken.rol_nombre
          );

          Swal.fire(
            '¡Bienvenido!',
            'Sesión iniciada correctamente',
            'success'
          ).then(() => {
            this.router.navigate(['/catalogo']);
          });
        }),
        catchError((error: HttpErrorResponse) => {
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

  /**
   * @description Maneja el registro de un nuevo usuario.
   * @param userData Objeto con los datos del nuevo usuario.
   * @returns Un Observable con la respuesta del registro.
   */
  register(userData: RegisterData): Observable<any | null> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        console.log('Registro exitoso:', response);
      }),
      catchError((error: HttpErrorResponse) => {
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

  /**
   * @description Obtiene el token JWT almacenado en el localStorage.
   * @returns {string | null} El token JWT o null si no está presente.
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * @description Obtiene la información actual del usuario logueado desde el BehaviorSubject.
   * @returns {any | null} Un objeto con la información del usuario (incluyendo rol) o null.
   */
  getCurrentUser(): any {
    return this._currentUser.getValue();
  }

  /**
   * @description Obtiene la información actual del usuario logueado desde el BehaviorSubject.
   * @returns {any | null} Un objeto con la información del usuario (incluyendo rol) o null.
   */

  get isAdmin(): boolean {
    const currentUser = this.getCurrentUser();
    const isUserAdmin = !!currentUser && currentUser.rol_nombre === 'admin';
    console.log('AuthService: isAdmin check', { currentUser, isUserAdmin });

    return isUserAdmin;
  }
}
