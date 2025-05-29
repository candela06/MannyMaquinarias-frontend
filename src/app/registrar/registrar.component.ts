// src/app/registrar/registrar.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService, RegisterData } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-registrar',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css'],
})
export class RegistrarComponent implements OnInit {
  registroForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // El formulario solo contiene los campos que están en tu HTML
    this.registroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      fechaNacimiento: ['', [Validators.required, this.mayorDeEdadValidator()]],
    });
  }

  registrar() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      Swal.fire(
        'Error',
        'Por favor, complete todos los datos correctamente',
        'error'
      );
      return;
    }

    const userData: RegisterData = {
      email: this.registroForm.value.email,
      password: this.registroForm.value.contrasena,
      fechaNacimiento: this.registroForm.value.fechaNacimiento,
      // dni: '',
      // nombreUsuario: '',
      // nombre: '',
      // apellido: '',
      // direccion: '',
      // edad: 0
    };

    // Es crucial que tu interfaz RegisterData en auth.service.ts refleje esto
    // o que los campos opcionales estén marcados con '?'

    this.authService.register(userData).subscribe({
      next: (response) => {
        if (response) {
          Swal.fire(
            'Registro exitoso',
            'Usuario registrado correctamente',
            'success'
          ).then(() => {
            this.router.navigate(['/login']);
          });
        }
      },
      error: (err) => {
        // El SweetAlert de error ya es manejado por el catchError en auth.service.ts
        // La consola del navegador seguirá mostrando el error HTTP completo de la red.
        console.error(
          'Error en el registro desde el componente (esto no debería dispararse si el AuthService lo maneja):',
          err
        );
      },
    });
  }

  mayorDeEdadValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const fechaNacimientoStr = control.value;
      if (!fechaNacimientoStr) {
        return null;
      }

      const fechaNacimiento = new Date(fechaNacimientoStr);
      if (isNaN(fechaNacimiento.getTime())) {
        return { fechaInvalida: true };
      }

      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      const dia = hoy.getDate() - fechaNacimiento.getDate();

      if (mes < 0 || (mes === 0 && dia < 0)) {
        edad--;
      }

      return edad >= 18 ? null : { menorDeEdad: true };
    };
  }
}
