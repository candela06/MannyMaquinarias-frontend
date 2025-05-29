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
    // Mantén el formulario con los campos que tienes en tu HTML
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

    const { email, password, fechaNacimiento } = this.registroForm.value;

    // Aquí "autocompletamos" los datos que faltan con valores por defecto.
    // **¡Asegúrate de que estos nombres de campo coincidan exactamente con lo que tu backend espera!**
    // (basado en la captura de Postman)
    const userData: RegisterData = {
      email: email,
      password: password,
      fechaNacimiento: fechaNacimiento,
      dni: '00000000', // Valor por defecto. Puedes usar un valor genérico o un string vacío si tu backend lo permite.
      // Considera si tu backend valida unicidad para DNI; si es así, este valor fijo causará problemas.
      nombreUsuario: 'usuario_default', // Valor por defecto
      nombre: 'SinNombre', // Valor por defecto
      apellido: 'SinApellido', // Valor por defecto
      direccion: 'Direccion Desconocida', // Valor por defecto
      edad: 18, // Valor por defecto, o puedes calcularlo desde fechaNacimiento si lo necesitas y el backend no lo calcula.
      // Podrías poner 0 si el backend lo acepta, pero 18 asegura la validación de edad.
    };

    // Si tu backend espera 'password' en lugar de 'contrasena', ajusta aquí:
    // const userData: RegisterData = {
    //   email: email,
    //   password: contrasena, // <-- CAMBIAR SI EL BACKEND ESPERA 'password'
    //   fechaNacimiento: fechaNacimiento,
    //   dni: '00000000',
    //   nombreUsuario: 'usuario_default',
    //   nombre: 'SinNombre',
    //   apellido: 'SinApellido',
    //   direccion: 'Direccion Desconocida',
    //   edad: 18
    // };

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
        // El SweetAlert de error ya es manejado por el catchError en auth.service.ts.
        // La consola del navegador mostrará el error HTTP completo.
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
