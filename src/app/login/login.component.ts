// src/app/login/login.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importa el AuthService
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http'; // Necesario para HttpClient

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule], // Agrega HttpClientModule
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Inyecta el AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      Swal.fire(
        'Error',
        'Por favor complete todos los campos correctamente.',
        'error'
      );
      return;
    }

    const { email, password } = this.loginForm.value;

    // Llama al servicio de autenticación
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        // La lógica de éxito (navegación y SweetAlert) se maneja en el AuthService
        // No es necesario hacer nada más aquí en el 'next'
      },
      error: (err) => {
        // La lógica de error (SweetAlert) también se maneja en el AuthService
        // Puedes añadir console.log(err) aquí si necesitas más detalles de depuración
      },
    });
  }
}
