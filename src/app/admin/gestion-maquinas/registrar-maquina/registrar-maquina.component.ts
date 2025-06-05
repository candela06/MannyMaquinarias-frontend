// src/app/admin/gestion-maquinas/registrar-maquina/registrar-maquina.component.ts

// Importaciones necesarias de Angular y librerías de terceros
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, // Para construir y gestionar formularios reactivos
  FormGroup, // Representa un grupo de controles de formulario
  Validators, // Validadores predefinidos para formularios
  AbstractControl, // Clase base para un control de formulario
  ReactiveFormsModule, // Módulo para usar formularios reactivos
} from '@angular/forms';
import { CommonModule } from '@angular/common'; // Módulo con directivas comunes de Angular (ej. *ngIf, *ngFor)
import { HttpClientModule } from '@angular/common/http'; // Módulo para realizar peticiones HTTP
import { RouterModule, Router } from '@angular/router'; // Módulos para enrutamiento
import Swal from 'sweetalert2'; // Librería para alertas personalizadas
import {
  MachineryService,
  MaquinaData,
} from '../../../../services/machinery.service'; // Importa el servicio de máquinas y la interfaz MaquinaData
import { BranchService } from '../../../../services/branch.service'; // Servicio para interactuar con la API de sucursales
import { PolicyService } from '../../../../services/policy.service'; // Servicio para interactuar con la API de políticas de cancelación
import { Branch } from '../../../modles/branch.model'; // Modelo de datos para una sucursal (corregida la ruta)
import { Policy } from '../../../modles/policy.model'; // Modelo de datos para una política de cancelación (corregida la ruta)
import { FormsModule } from '@angular/forms'; // Módulo para usar formularios de plantilla (aunque se usa principalmente ReactiveFormsModule aquí)
import { forkJoin } from 'rxjs'; // Importa forkJoin para manejar múltiples observables de imágenes

/**
 * @description Componente standalone para el registro de nuevas máquinas.
 * Este componente proporciona una interfaz de usuario para que el administrador
 * ingrese los detalles de una nueva máquina, la asocie a una sucursal existente
 * y le asigne una política de cancelación predefinida.
 *
 * Permite la selección de múltiples imágenes y simula la subida a Cloudinary (Base64).
 */
@Component({
  standalone: true, // Indica que este es un componente standalone y no requiere un NgModule
  selector: 'app-registrar-maquina', // Selector CSS para usar este componente en plantillas
  templateUrl: './registrar-maquina.component.html', // Ruta al archivo HTML de la plantilla
  //  styleUrls: ['./registrar-maquina.component.css'], // Rutas a los archivos CSS de estilos
  imports: [
    ReactiveFormsModule, // Habilita el uso de formularios reactivos
    CommonModule, // Proporciona directivas como *ngIf, *ngFor
    HttpClientModule, // Permite inyectar HttpClient para llamadas a la API
    RouterModule, // Permite el uso de directivas de enrutamiento como routerLink
    FormsModule, // Módulo para formularios de plantilla (incluido por si acaso, aunque el enfoque principal es reactivo)
  ],
})
export class RegistrarMaquinaComponent implements OnInit {
  /**
   * @property {FormGroup} maquinaForm - El grupo de controles del formulario reactivo para la máquina.
   * Se inicializa en `ngOnInit`.
   */
  maquinaForm!: FormGroup;

  /**
   * @property {File[]} selectedFiles - Array que almacena los archivos de imagen seleccionados por el usuario.
   */
  selectedFiles: File[] = [];

  /**
   * @property {string[]} imagePreviews - Array que almacena las URLs de las previsualizaciones de las imágenes (Base64).
   */
  imagePreviews: string[] = [];

  /**
   * @property {Branch[]} todasLasSucursales - Array que contendrá la lista de todas las sucursales cargadas desde el backend.
   */
  todasLasSucursales: Branch[] = [];

  /**
   * @property {Policy[]} politicasCancelacion - Array que contendrá la lista de todas las políticas de cancelación cargadas desde el backend.
   */
  politicasCancelacion: Policy[] = [];

  /**
   * @property {boolean} isFormSubmitted - Indicador booleano que se vuelve `true` una vez que se intenta enviar el formulario.
   * Se utiliza para mostrar mensajes de validación al usuario después del primer intento de envío.
   */
  isFormSubmitted: boolean = false;

  /**
   * @property {boolean} isUploadingImages - Indicador booleano que se vuelve `true` mientras las imágenes están siendo procesadas (simulando subida).
   */
  isUploadingImages: boolean = false;

  /**
   * @description Constructor del componente `RegistrarMaquinaComponent`.
   * Inyecta los servicios necesarios para construir el formulario, interactuar con las APIs
   * y manejar la navegación.
   * @param {FormBuilder} fb - Servicio para construir formularios reactivos.
   * @param {MachineryService} machineryService - Servicio para operaciones relacionadas con máquinas.
   * @param {BranchService} branchService - Servicio para operaciones relacionadas con sucursales.
   * @param {PolicyService} policyService - Servicio para operaciones relacionadas con políticas de cancelación.
   * @param {Router} router - Servicio para la navegación programática.
   */
  constructor(
    private fb: FormBuilder,
    private machineryService: MachineryService,
    private branchService: BranchService,
    private policyService: PolicyService,
    private router: Router
  ) {}

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente ha sido inicializado.
   * Aquí se inicializa `maquinaForm` con sus controles y validadores, y se cargan las listas de sucursales y políticas de cancelación.
   */
  ngOnInit(): void {
    // Inicialización del FormGroup con sus controles y validadores
    this.maquinaForm = this.fb.group({
      numeroSerie: [
        '', // Valor inicial
        [
          Validators.required, // Campo obligatorio
          Validators.pattern(/^[a-zA-Z0-9-]+$/), // Solo letras, números y guiones
          Validators.minLength(3), // Mínimo 3 caracteres
          Validators.maxLength(50), // Máximo 50 caracteres
        ],
      ],
      nombre: ['', Validators.required], // Campo obligatorio
      marca: ['', Validators.required], // Campo obligatorio
      modelo: ['', Validators.required], // Campo obligatorio
      categoria: ['', Validators.required], // Campo obligatorio
      estado: ['disponible', Validators.required], // Campo obligatorio con valor por defecto
      precio: ['', [Validators.required, Validators.min(0.01)]], // Campo obligatorio, valor mínimo 0.01
      // El campo 'imagen' ya no se controla directamente en el FormGroup.
      // Las imágenes se gestionan por separado en `selectedFiles` y `imagePreviews`.
      sucursal_id: ['', Validators.required], // Campo obligatorio (ID de sucursal existente)
      politica_cancelacion_id: ['', Validators.required], // Campo obligatorio (ID de política existente)
    });

    // Carga inicial de datos desde los servicios
    this.loadAllBranches();
    this.loadCancellationPolicies();
  }

  // --- Getters para fácil acceso a los controles del formulario desde la plantilla HTML ---

  /**
   * @description Getter para el control 'numeroSerie' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'numeroSerie' o `null` si no existe.
   */
  get numeroSerie(): AbstractControl | null {
    return this.maquinaForm.get('numeroSerie');
  }
  /**
   * @description Getter para el control 'nombre' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'nombre' o `null` si no existe.
   */
  get nombre(): AbstractControl | null {
    return this.maquinaForm.get('nombre');
  }
  /**
   * @description Getter para el control 'marca' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'marca' o `null` si no existe.
   */
  get marca(): AbstractControl | null {
    return this.maquinaForm.get('marca');
  }
  /**
   * @description Getter para el control 'modelo' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'modelo' o `null` si no existe.
   */
  get modelo(): AbstractControl | null {
    return this.maquinaForm.get('modelo');
  }
  /**
   * @description Getter para el control 'categoria' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'categoria' o `null` si no existe.
   */
  get categoria(): AbstractControl | null {
    return this.maquinaForm.get('categoria');
  }
  /**
   * @description Getter para el control 'estado' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'estado' o `null` si no existe.
   */
  get estado(): AbstractControl | null {
    return this.maquinaForm.get('estado');
  }
  /**
   * @description Getter para el control 'precio' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'precio' o `null` si no existe.
   */
  get precio(): AbstractControl | null {
    return this.maquinaForm.get('precio');
  }
  /**
   * @description Getter para el control 'sucursal_id' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'sucursal_id' o `null` si no existe.
   */
  get sucursal_id(): AbstractControl | null {
    return this.maquinaForm.get('sucursal_id');
  }
  /**
   * @description Getter para el control 'politica_cancelacion_id' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'politica_cancelacion_id' o `null` si no existe.
   */
  get politica_cancelacion_id(): AbstractControl | null {
    return this.maquinaForm.get('politica_cancelacion_id');
  }

  /**
   * @description Carga todas las sucursales disponibles desde el `BranchService` del backend.
   * Asigna los datos recibidos a la propiedad `todasLasSucursales`.
   * Muestra una alerta de error con SweetAlert2 si la carga falla.
   * @returns {void}
   */
  loadAllBranches(): void {
    this.branchService.getBranches().subscribe({
      next: (data) => {
        this.todasLasSucursales = data;
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
        Swal.fire('Error', 'No se pudieron cargar las sucursales.', 'error');
      },
    });
  }

  /**
   * @description Carga todas las políticas de cancelación disponibles desde el `PolicyService` del backend.
   * Asigna los datos recibidos a la propiedad `politicasCancelacion`.
   * Muestra una alerta de error con SweetAlert2 si la carga falla.
   * @returns {void}
   */
  loadCancellationPolicies(): void {
    this.policyService.getPolicies().subscribe({
      next: (data) => {
        this.politicasCancelacion = data;
      },
      error: (error) => {
        console.error('Error al cargar políticas de cancelación:', error);
        Swal.fire(
          'Error',
          'No se pudieron cargar las políticas de cancelación.',
          'error'
        );
      },
    });
  }

  /**
   * @description Maneja el evento de selección de archivos en el input de imagen.
   * Guarda los archivos seleccionados en `selectedFiles` y genera previsualizaciones para `imagePreviews`.
   * @param {Event} event - El evento de cambio (`change`) del input de tipo 'file'.
   * @returns {void}
   */
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      // Convertir FileList a un array de File y añadirlo a selectedFiles
      const newFiles = Array.from(fileList);
      this.selectedFiles.push(...newFiles);

      // Generar previsualizaciones para los nuevos archivos
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * @description Elimina una imagen seleccionada y su previsualización por su índice.
   * @param {number} index - El índice de la imagen a eliminar.
   * @returns {void}
   */
  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  /**
   * @description Maneja la lógica para registrar una nueva máquina cuando el formulario es enviado.
   * Realiza validaciones finales, sube las imágenes a Cloudinary (simulado),
   * construye un objeto `MaquinaData` con las URLs de las imágenes y lo envía al `MachineryService`.
   * Muestra alertas de éxito o error con SweetAlert2.
   * @returns {void}
   */
  registrarMaquina(): void {
    this.isFormSubmitted = true; // Marca que se ha intentado enviar el formulario para activar la visualización de errores

    // 1. Validación del formulario reactivo
    if (this.maquinaForm.invalid) {
      this.maquinaForm.markAllAsTouched(); // Marca todos los campos como "tocados" para mostrar validaciones
      Swal.fire('Error', 'Complete todos los campos correctamente.', 'error');
      return;
    }

    // 2. Validación de la selección de imágenes
    if (this.selectedFiles.length === 0) {
      Swal.fire(
        'Error',
        'Debe seleccionar al menos una imagen para la máquina.',
        'error'
      );
      return;
    }

    this.isUploadingImages = true; // Activar el spinner de subida de imágenes

    // 3. Subir todas las imágenes (simulado) y obtener sus URLs Base64
    const uploadObservables = this.selectedFiles.map((file) =>
      this.machineryService.uploadImageToCloudinary(file)
    );

    forkJoin(uploadObservables).subscribe({
      next: (imageUrls: string[]) => {
        this.isUploadingImages = false; // Desactivar spinner de subida de imágenes

        // 4. Preparar los datos de la máquina, incluyendo las URLs de las imágenes
        const maquinaData: MaquinaData = {
          numeroSerie: this.maquinaForm.value.numeroSerie,
          nombre: this.maquinaForm.value.nombre,
          marca: this.maquinaForm.value.marca,
          modelo: this.maquinaForm.value.modelo,
          categoria: this.maquinaForm.value.categoria,
          estado: this.maquinaForm.value.estado,
          precio: this.maquinaForm.value.precio,
          sucursal_id: this.maquinaForm.value.sucursal_id,
          politicaCancelacionID: this.maquinaForm.value.politica_cancelacion_id,
          imageUrls: imageUrls, // Array de URLs Base64 de las imágenes
        };

        // 5. Enviar los datos de la máquina al servicio
        this.machineryService.registrarMaquina(maquinaData).subscribe({
          next: () => {
            // Manejo de éxito
            Swal.fire(
              '¡Éxito!',
              'Máquina registrada correctamente.',
              'success'
            ).then(() => {
              // Resetear el formulario y los estados después de un envío exitoso
              this.maquinaForm.reset();
              this.selectedFiles = []; // Limpiar archivos seleccionados
              this.imagePreviews = []; // Limpiar previsualizaciones
              this.isFormSubmitted = false;
              // Opcional: recargar listas si podrían haber cambiado
              this.loadAllBranches();
              this.loadCancellationPolicies();
            });
          },
          error: (error) => {
            // Manejo de error al registrar la máquina
            let errorMessage =
              'Error al registrar la máquina. Inténtelo de nuevo.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            Swal.fire('Error', errorMessage, 'error');
            console.error('Error al registrar máquina:', error);
          },
        });
      },
      error: (error) => {
        // Manejo de error en la subida de imágenes
        this.isUploadingImages = false;
        console.error('Error al procesar imágenes:', error);
        Swal.fire(
          'Error',
          'No se pudieron procesar las imágenes. Inténtelo de nuevo.',
          'error'
        );
      },
    });
  }
}
