import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule,ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos correctamente.', 'error');
      return;
    }

    const { email, password } = this.loginForm.value;

    // Simulación de login exitoso
    if (email === 'enzo@gmail.com' && password === 'enzo05') {
      Swal.fire('¡Bienvenido!', 'Sesión iniciada correctamente', 'success').then(() => {
        this.router.navigate(['/']);
      });
    } else {
      Swal.fire('Error', 'Credenciales inválidas', 'error');
    }
  }
}

