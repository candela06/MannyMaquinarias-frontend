import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface Usuario {
  email: string;
  contrasena: string;
  fechaNacimiento: string; 
}

@Component({
  standalone: true,
  selector: 'app-registrar',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './registrar.component.html',
  styleUrls: ['./registrar.component.css']
})
export class RegistrarComponent {
  registroForm: FormGroup;


  usuariosRegistrados: Usuario[] = [
    { email: 'enzobat07@gmail.com', contrasena: 'enzo05', fechaNacimiento: '2001-25-11' },
    { email: 'maria@gmail.com', contrasena: 'maria123', fechaNacimiento: '1985-06-12' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      fechaNacimiento: ['', [Validators.required, this.mayorDeEdadValidator]]
    });
  }

  registrar() {
    if (this.registroForm.invalid) {
      Swal.fire('Error', 'Por favor, complete todos los datos correctamente', 'error');
      return;
    }

    const { email, contrasena, fechaNacimiento } = this.registroForm.value;

    // Regla 1: Mail único
    const existeEmail = this.usuariosRegistrados.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (existeEmail) {
      Swal.fire('Error', 'El email ya se encuentra en nuestro sistema', 'error');
      return;
    }

    // Regla 2: Mínimo 6 caracteres -> ya validado en el form, pero verificamos por seguridad
    if (contrasena.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    // Regla 3: Mayor de 18 años -> ya validado por el validador pero chequeamos
    if (this.mayorDeEdadValidator({ value: fechaNacimiento }) !== null) {
      Swal.fire('Error', 'La persona tiene que ser mayor de 18 años', 'error');
      return;
    }
    this.usuariosRegistrados.push({ email, contrasena, fechaNacimiento });

    Swal.fire('Registro exitoso', 'Usuario registrado correctamente', 'success').then(() => {
      this.router.navigate(['/login']);
    });
  }

  mayorDeEdadValidator(control: any) {
    const fechaNacimiento = new Date(control.value);
    if (isNaN(fechaNacimiento.getTime())) {
      return { fechaInvalida: true };
    }

    const hoy = new Date();
    const edadDifMs = hoy.getTime() - fechaNacimiento.getTime();
    const edadDate = new Date(edadDifMs);
    const edad = Math.abs(edadDate.getUTCFullYear() - 1970);

    return edad >= 18 ? null : { menorDeEdad: true };
  }
}

