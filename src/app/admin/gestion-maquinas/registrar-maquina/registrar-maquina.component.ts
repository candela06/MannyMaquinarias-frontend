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
import { MachineryService } from '../../../../services/machinery.service'; // Servicio para interactuar con la API de máquinas
import { BranchService } from '../../../../services/branch.service'; // Servicio para interactuar con la API de sucursales
import { PolicyService } from '../../../../services/policy.service'; // Servicio para interactuar con la API de políticas de cancelación
import { Branch } from '../../../modles/branch.model'; // Modelo de datos para una sucursal
import { Policy } from '../../../modles/policy.model'; // Modelo de datos para una política de cancelación
import { FormsModule } from '@angular/forms'; // Módulo para usar formularios de plantilla (aunque se usa principalmente ReactiveFormsModule aquí)

/**
 * @description Componente standalone para el registro de nuevas máquinas.
 * Este componente proporciona una interfaz de usuario para que el administrador
 * ingrese los detalles de una nueva máquina, la asocie a una sucursal existente
 * y le asigne una política de cancelación predefinida.
 *
 * No maneja la creación de nuevas sucursales ni políticas de cancelación;
 * en su lugar, carga listas de opciones existentes desde el backend.
 */
@Component({
  standalone: true, // Indica que este es un componente standalone y no requiere un NgModule
  selector: 'app-registrar-maquina', // Selector CSS para usar este componente en plantillas
  templateUrl: './registrar-maquina.component.html', // Ruta al archivo HTML de la plantilla
  styleUrls: ['./registrar-maquina.component.css'], // Rutas a los archivos CSS de estilos
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
   * @property {File | null} selectedFile - Almacena el archivo de imagen seleccionado por el usuario, o `null` si no hay ninguno.
   */
  selectedFile: File | null = null;

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
      imagen: ['', [Validators.required, this.imagenValidaValidator()]], // Campo obligatorio, con validador personalizado para la imagen
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
   * @description Getter para el control 'imagen' del formulario.
   * @returns {AbstractControl | null} El control del formulario 'imagen' o `null` si no existe.
   */
  get imagen(): AbstractControl | null {
    return this.maquinaForm.get('imagen');
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
   * @description Validador personalizado para el campo 'imagen'.
   * Verifica si se ha seleccionado un archivo en el control del formulario.
   * @returns {(control: AbstractControl) => { [key: string]: any } | null} Una función validadora.
   * Retorna `{ required: true }` si no hay archivo, o `null` si el archivo es válido.
   */
  imagenValidaValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const file = control.value;
      if (!file) {
        return { required: true }; // Retorna un error si no hay archivo seleccionado
      }
      return null; // El archivo es válido (en este caso, solo verifica si está presente)
    };
  }

  /**
   * @description Maneja el evento de selección de archivo en el input de imagen.
   * Guarda el archivo seleccionado en `selectedFile` y actualiza el valor del control 'imagen'
   * en el formulario reactivo con el nombre del archivo.
   * @param {Event} event - El evento de cambio (`change`) del input de tipo 'file'.
   * @returns {void}
   */
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      // Establece el valor del control 'imagen' con el nombre del archivo para mostrar en el formulario
      this.maquinaForm.controls['imagen'].setValue(
        this.selectedFile ? this.selectedFile.name : ''
      );
    } else {
      this.selectedFile = null;
      this.maquinaForm.controls['imagen'].setValue(''); // Limpia el valor si no se selecciona ningún archivo
    }
  }

  /**
   * @description Maneja la lógica para registrar una nueva máquina cuando el formulario es enviado.
   * Realiza validaciones finales, construye un objeto `FormData` con todos los datos
   * y el archivo de imagen, y envía esta información al `MachineryService`.
   * Muestra alertas de éxito o error con SweetAlert2.
   * @returns {void}
   */
  registrarMaquina(): void {
    this.isFormSubmitted = true; // Marca que se ha intentado enviar el formulario para activar la visualización de errores

    // 1. Validación del formulario
    if (this.maquinaForm.invalid) {
      this.maquinaForm.markAllAsTouched(); // Marca todos los campos como "tocados" para mostrar validaciones
      Swal.fire('Error', 'Complete todos los campos correctamente.', 'error');
      return;
    }

    // 2. Validación de la selección de imagen
    if (!this.selectedFile) {
      Swal.fire(
        'Error',
        'Debe seleccionar una imagen para la máquina.',
        'error'
      );
      return;
    }

    // 3. Creación del objeto FormData para enviar al backend
    const formData = new FormData();
    formData.append('numeroSerie', this.maquinaForm.value.numeroSerie);
    formData.append('nombre', this.maquinaForm.value.nombre);
    formData.append('marca', this.maquinaForm.value.marca);
    formData.append('modelo', this.maquinaForm.value.modelo);
    formData.append('categoria', this.maquinaForm.value.categoria);
    formData.append('estado', this.maquinaForm.value.estado);
    formData.append('precio', this.maquinaForm.value.precio);
    // Convertimos los IDs a string, ya que FormData trabaja con pares clave-valor de strings
    formData.append(
      'sucursal_id',
      this.maquinaForm.value.sucursal_id.toString()
    );
    formData.append(
      'politica_cancelacion_id',
      this.maquinaForm.value.politica_cancelacion_id.toString()
    );
    // Agregamos el archivo de imagen con su nombre
    formData.append('imagen', this.selectedFile!, this.selectedFile!.name);

    // 4. Envío de los datos al servicio de máquinas
    this.machineryService.registrarMaquina(formData).subscribe({
      next: () => {
        // Manejo de éxito
        Swal.fire(
          '¡Éxito!',
          'Máquina registrada correctamente.',
          'success'
        ).then(() => {
          // Resetear el formulario y los estados después de un envío exitoso
          this.maquinaForm.reset();
          this.selectedFile = null;
          this.isFormSubmitted = false;
          // Opcional: recargar listas de sucursales y políticas si podrían haber cambiado
          this.loadAllBranches();
          this.loadCancellationPolicies();
        });
      },
      error: (error) => {
        // Manejo de error
        let errorMessage = 'Error al registrar la máquina. Inténtelo de nuevo.';
        // Intentar obtener un mensaje de error más específico del backend
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        Swal.fire('Error', errorMessage, 'error');
        console.error('Error al registrar máquina:', error);
      },
    });
  }
}
