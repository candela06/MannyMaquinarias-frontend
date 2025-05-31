import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MachineryService } from '../../../../services/machinery.service';
import Swal from 'sweetalert2';
import {
  Router,
  RouterModule, // Asegúrate de que RouterModule esté importado
  RouterOutlet, // Asegúrate de que RouterOutlet esté importado
  RouterLink, // Asegúrate de que RouterLink esté importado
} from '@angular/router';

/**
 * @description Componente para el registro de nuevas máquinas en el sistema.
 * Permite a los administradores ingresar los datos de una máquina, incluyendo
 * un número de serie único y una imagen, para su posterior gestión y alquiler.
 */
@Component({
  standalone: true,
  selector: 'app-registrar-maquina',
  templateUrl: './registrar-maquina.component.html',
  styleUrls: ['./registrar-maquina.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule, // <-- ¡Importante! Asegúrate de que esté aquí
    RouterOutlet, // <-- Importante si usas <router-outlet> en este componente
    RouterLink, // <-- Importante si usas [routerLink] en este componente
  ],
})
export class RegistrarMaquinaComponent implements OnInit {
  /**
   * @description Formulario reactivo para la captura de los datos de la máquina.
   * Contiene validadores para asegurar la integridad de la información.
   */
  maquinaForm!: FormGroup;

  /**
   * @description Almacena el archivo de imagen seleccionado por el usuario.
   * Es de tipo File o null si no se ha seleccionado ninguno.
   */
  selectedFile: File | null = null;

  /**
   * @description Constructor del componente `RegistrarMaquinaComponent`.
   * @param {FormBuilder} fb - Servicio para construir formularios reactivos.
   * @param {MachineryService} machineryService - Servicio para interactuar con la API de máquinas.
   * @param {Router} router - Servicio para la navegación entre rutas.
   */
  constructor(
    private fb: FormBuilder,
    private machineryService: MachineryService,
    private router: Router
  ) {}

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * ha sido inicializado. Aquí se inicializa el formulario de la máquina con sus validadores.
   */
  ngOnInit(): void {
    this.maquinaForm = this.fb.group({
      numeroSerie: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9-]+$/),
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      nombre: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      categoria: ['', Validators.required],
      anio: [
        '',
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(new Date().getFullYear() + 5),
        ],
      ],
      porcentajeDevolucion: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      imagen: ['', [Validators.required, this.imagenValidaValidator()]],
    });
  }

  /**
   * @description Getter para el control 'numeroSerie' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'numeroSerie' o null si no existe.
   */
  get numeroSerie(): AbstractControl | null {
    return this.maquinaForm.get('numeroSerie');
  }

  /**
   * @description Getter para el control 'nombre' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'nombre' o null si no existe.
   */
  get nombre(): AbstractControl | null {
    return this.maquinaForm.get('nombre');
  }

  /**
   * @description Getter para el control 'marca' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'marca' o null si no existe.
   */
  get marca(): AbstractControl | null {
    return this.maquinaForm.get('marca');
  }

  /**
   * @description Getter para el control 'modelo' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'modelo' o null si no existe.
   */
  get modelo(): AbstractControl | null {
    return this.maquinaForm.get('modelo');
  }

  /**
   * @description Getter para el control 'categoria' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'categoria' o null si no existe.
   */
  get categoria(): AbstractControl | null {
    return this.maquinaForm.get('categoria');
  }

  /**
   * @description Getter para el control 'anio' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'anio' o null si no existe.
   */
  get anio(): AbstractControl | null {
    return this.maquinaForm.get('anio');
  }

  /**
   * @description Getter para el control 'porcentajeDevolucion' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'porcentajeDevolucion' o null si no existe.
   */
  get porcentajeDevolucion(): AbstractControl | null {
    return this.maquinaForm.get('porcentajeDevolucion');
  }

  /**
   * @description Getter para el control 'precio' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'precio' o null si no existe.
   */
  get precio(): AbstractControl | null {
    return this.maquinaForm.get('precio');
  }

  /**
   * @description Getter para el control 'imagen' del formulario.
   * Facilita el acceso al control y sus propiedades de validación en la plantilla.
   * @returns {AbstractControl | null} El control 'imagen' o null si no existe.
   */
  get imagen(): AbstractControl | null {
    return this.maquinaForm.get('imagen');
  }

  /**
   * @description Validador personalizado para el campo 'imagen'.
   * Verifica que el archivo seleccionado tenga una extensión válida (JPG, JPEG, PNG).
   * @returns {ValidatorFn} Una función validadora que devuelve un objeto de error
   * si el formato de la imagen es inválido, o null si es válido.
   */
  imagenValidaValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // No hay archivo, la validación de 'required' se encarga.
      }
      const fileName = control.value;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png'];

      if (fileExtension && validExtensions.includes(fileExtension)) {
        return null; // Válido
      } else {
        return { formatoImagenInvalido: true }; // Inválido
      }
    };
  }

  /**
   * @description Manejador de evento para cuando se selecciona un archivo de imagen.
   * Almacena el archivo seleccionado y actualiza el valor del control 'imagen' en el formulario.
   * @param {Event} event - El evento de cambio del input de tipo 'file'.
   */
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      // Solo actualiza el nombre del archivo en el formulario para la validación visual.
      // El archivo real se enviará a través de FormData.
      this.maquinaForm.patchValue({ imagen: this.selectedFile.name });
      this.maquinaForm.get('imagen')?.updateValueAndValidity(); // Recalcula la validez
    } else {
      this.selectedFile = null;
      this.maquinaForm.patchValue({ imagen: null });
      this.maquinaForm.get('imagen')?.updateValueAndValidity(); // Recalcula la validez
    }
  }

  /**
   * @description Maneja la lógica para registrar una nueva máquina.
   * Valida el formulario, construye un objeto FormData con los datos y la imagen,
   * y llama al servicio `MachineryService` para enviar la solicitud al backend.
   * Muestra alertas SweetAlert2 según el resultado de la operación.
   */
  registrarMaquina(): void {
    if (this.maquinaForm.invalid) {
      this.maquinaForm.markAllAsTouched(); // Marca todos los campos como 'touched' para mostrar errores
      Swal.fire(
        'Error',
        'Por favor, complete todos los campos correctamente.',
        'error'
      );
      return;
    }

    if (!this.selectedFile) {
      Swal.fire(
        'Error',
        'Debe seleccionar una imagen para la máquina.',
        'error'
      );
      return;
    }

    const formData = new FormData();
    formData.append('numeroSerie', this.maquinaForm.value.numeroSerie);
    formData.append('nombre', this.maquinaForm.value.nombre);
    formData.append('marca', this.maquinaForm.value.marca);
    formData.append('modelo', this.maquinaForm.value.modelo);
    formData.append('categoria', this.maquinaForm.value.categoria);
    formData.append('anio', this.maquinaForm.value.anio);
    formData.append(
      'porcentajeDevolucion',
      this.maquinaForm.value.porcentajeDevolucion
    );
    formData.append('precio', this.maquinaForm.value.precio);
    formData.append('imagen', this.selectedFile, this.selectedFile.name);

    this.machineryService.registrarMaquina(formData).subscribe({
      next: (response) => {
        Swal.fire(
          '¡Éxito!',
          'Máquina registrada correctamente.',
          'success'
        ).then(() => {
          this.maquinaForm.reset(); // Reinicia el formulario
          this.selectedFile = null; // Limpia el archivo seleccionado
          this.router.navigate(['/catalogo']); // Navega al catálogo de máquinas
        });
      },
      error: (error: any) => {
        let errorMessage = 'Error al registrar la máquina. Inténtelo de nuevo.';
        // Si el backend devuelve un mensaje de error específico, lo usamos
        if (error.message) {
          errorMessage = error.message;
        }
        Swal.fire('Error', errorMessage, 'error');
        console.error('Error al registrar máquina:', error);
      },
    });
  }
}
