import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Importa ActivatedRoute
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

// Servicios y modelos
import { MachineryService } from '../../../../services/machinery.service';
import { BranchService } from '../../../../services/branch.service';
import { PolicyService } from '../../../../services/policy.service';
import { Machinery } from '../../../modles/machinery.model'; // Modelo de máquina
import { Branch } from '../../../modles/branch.model';
import { Policy } from '../../../modles/policy.model';

/**
 * @description Componente standalone para modificar la información de una máquina existente.
 * Permite al administrador cargar los datos de una máquina por su ID, modificar sus campos
 * y opcionalmente actualizar su imagen.
 */
@Component({
  standalone: true,
  selector: 'app-modificar-maquina',
  templateUrl: './modificar-maquina.component.html',
  styleUrls: ['./modificar-maquina.component.css'],
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, RouterModule],
})
export class ModificarMaquinaComponent implements OnInit {
  modificarMaquinaForm!: FormGroup;
  maquinaId: number | null = null; // ID de la máquina a modificar
  currentMaquina: Machinery | undefined | null; // Datos de la máquina actualmente cargada
  selectedFile: File | null = null; // Nuevo archivo de imagen seleccionado
  currentImageUrl: string | undefined | null; // URL de la imagen actual de la máquina

  todasLasSucursales: Branch[] = [];
  politicasCancelacion: Policy[] = [];

  isFormSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute, // Para obtener parámetros de la URL
    private router: Router,
    private machineryService: MachineryService,
    private branchService: BranchService,
    private policyService: PolicyService
  ) {}

  /**
   * @description Inicializa el componente. Obtiene el ID de la máquina de la ruta,
   * inicializa el formulario y carga las listas de sucursales y políticas,
   * y los datos de la máquina a modificar.
   */
  ngOnInit(): void {
    // Inicialización del formulario con validadores
    this.modificarMaquinaForm = this.fb.group({
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
      estado: ['disponible', Validators.required],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      // La validación de imagen aquí solo verifica si el campo está presente si se selecciona una nueva imagen.
      // La validación de tipo de archivo se hará en onFileSelected y en el validador personalizado.
      imagen: [null as string | null], // CAMBIO CLAVE AQUÍ
      sucursal_id: ['', Validators.required],
      politica_cancelacion_id: ['', Validators.required],
    });

    // Obtener el ID de la máquina de los parámetros de la URL
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.maquinaId = +idParam; // Convierte el string a número
        this.loadMaquinaData(this.maquinaId); // Carga los datos de la máquina
      } else {
        // Manejo si no se proporciona un ID (ej. redirigir o mostrar error)
        Swal.fire('Error', 'ID de máquina no proporcionado.', 'error');
        this.router.navigate(['/admin/maquinas/listar']); // Redirigir a la lista o gestión
      }
    });

    // Cargar listas para dropdowns
    this.loadAllBranches();
    this.loadCancellationPolicies();
  }

  // --- Getters para fácil acceso a los controles del formulario ---
  get numeroSerie(): AbstractControl | null {
    return this.modificarMaquinaForm.get('numeroSerie');
  }
  get nombre(): AbstractControl | null {
    return this.modificarMaquinaForm.get('nombre');
  }
  get marca(): AbstractControl | null {
    return this.modificarMaquinaForm.get('marca');
  }
  get modelo(): AbstractControl | null {
    return this.modificarMaquinaForm.get('modelo');
  }
  get categoria(): AbstractControl | null {
    return this.modificarMaquinaForm.get('categoria');
  }
  get estado(): AbstractControl | null {
    return this.modificarMaquinaForm.get('estado');
  }
  get precio(): AbstractControl | null {
    return this.modificarMaquinaForm.get('precio');
  }
  get imagen(): AbstractControl | null {
    return this.modificarMaquinaForm.get('imagen');
  }
  get sucursal_id(): AbstractControl | null {
    return this.modificarMaquinaForm.get('sucursal_id');
  }
  get politica_cancelacion_id(): AbstractControl | null {
    return this.modificarMaquinaForm.get('politica_cancelacion_id');
  }

  /**
   * @description Carga los datos de la máquina especificada por su ID desde el backend
   * y pre-llena el formulario con esta información.
   * @param {number} id - El ID de la máquina a cargar.
   */
  loadMaquinaData(id: number): void {
    this.machineryService.getMachineryById(id).subscribe({
      next: (data) => {
        this.currentMaquina = data;
        this.currentImageUrl = data?.imageUrl; // Guarda la URL de la imagen actual
        // Rellenar el formulario con los datos de la máquina
        this.modificarMaquinaForm.patchValue({
          numeroSerie: data?.numeroSerie,
          nombre: data?.nombre,
          marca: data?.marca,
          modelo: data?.modelo,
          categoria: data?.categoria,
          estado: data?.estado,
          precio: data?.precio,
          sucursal_id: data?.id,
          politica_cancelacion_id: data?.cancellationPolicy,
          // No se hace patchValue para 'imagen' ya que es un campo de archivo
        });
      },
      error: (error) => {
        console.error('Error al cargar datos de la máquina:', error);
        Swal.fire(
          'Error',
          'No se pudieron cargar los datos de la máquina.',
          'error'
        ).then(() => {
          this.router.navigate(['/admin/maquinas/listar']); // Volver si la máquina no se carga
        });
      },
    });
  }

  /**
   * @description Carga todas las sucursales desde el backend para el dropdown.
   */
  loadAllBranches(): void {
    this.branchService.getBranches().subscribe({
      next: (data) => {
        this.todasLasSucursales = data;
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
        // No bloquea la UI, el error ya se maneja en el Swal en loadMaquinaData
      },
    });
  }

  /**
   * @description Carga todas las políticas de cancelación desde el backend para el dropdown.
   */
  loadCancellationPolicies(): void {
    this.policyService.getPolicies().subscribe({
      next: (data) => {
        this.politicasCancelacion = data;
      },
      error: (error) => {
        console.error('Error al cargar políticas de cancelación:', error);
        // No bloquea la UI
      },
    });
  }

  /**
   * @description Validador personalizado para el formato de la imagen.
   * Permite solo archivos JPG o PNG.
   * @param {File} file - El archivo a validar.
   * @returns {{ invalidFormat: boolean } | null} Error si el formato no es válido, o null si es válido.
   */
  private imageFormatValidator(file: File): { [key: string]: any } | null {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (file && !allowedTypes.includes(file.type)) {
      return { invalidFormat: true };
    }
    return null;
  }

  /**
   * @description Maneja el evento de selección de un nuevo archivo de imagen.
   * Almacena el archivo seleccionado y actualiza el estado de la imagen en el formulario.
   * Realiza validación del formato.
   * @param {Event} event - El evento de cambio del input de tipo 'file'.
   */
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const validationError = this.imageFormatValidator(file);

      if (validationError) {
        this.modificarMaquinaForm.controls['imagen'].setErrors(validationError);
        this.selectedFile = null; // No guardar el archivo inválido
        this.modificarMaquinaForm.controls['imagen'].setValue(null); // Usar 'null' consistentemente
        Swal.fire(
          'Error',
          'Formato de imagen inválido. Solo se permiten JPG y PNG.',
          'error'
        );
      } else {
        this.selectedFile = file;
        // Solo para mostrar el nombre del archivo, el valor real es selectedFile
        this.modificarMaquinaForm.controls['imagen'].setValue(file.name);
        this.modificarMaquinaForm.controls['imagen'].setErrors(null); // Limpiar errores si había
      }
    } else {
      this.selectedFile = null;
      this.modificarMaquinaForm.controls['imagen'].setValue('');
      this.modificarMaquinaForm.controls['imagen'].setErrors(null); // Limpiar errores
    }
  }

  /**
   * @description Maneja el envío del formulario para actualizar la máquina.
   * Valida el formulario, construye el FormData y llama al servicio de actualización.
   */
  actualizarMaquina(): void {
    this.isFormSubmitted = true;

    if (this.modificarMaquinaForm.invalid) {
      this.modificarMaquinaForm.markAllAsTouched();
      Swal.fire('Error', 'Complete todos los campos correctamente.', 'error');
      return;
    }

    if (this.maquinaId === null) {
      Swal.fire(
        'Error',
        'ID de máquina no encontrado para la actualización.',
        'error'
      );
      return;
    }

    const formData = new FormData();
    // Añadir todos los campos del formulario, incluso si no han cambiado,
    // para asegurar que el backend reciba la información completa.
    formData.append('numeroSerie', this.modificarMaquinaForm.value.numeroSerie);
    formData.append('nombre', this.modificarMaquinaForm.value.nombre);
    formData.append('marca', this.modificarMaquinaForm.value.marca);
    formData.append('modelo', this.modificarMaquinaForm.value.modelo);
    formData.append('categoria', this.modificarMaquinaForm.value.categoria);
    formData.append('estado', this.modificarMaquinaForm.value.estado);
    formData.append('precio', this.modificarMaquinaForm.value.precio);
    formData.append(
      'sucursal_id',
      this.modificarMaquinaForm.value.sucursal_id.toString()
    );
    formData.append(
      'politica_cancelacion_id',
      this.modificarMaquinaForm.value.politica_cancelacion_id.toString()
    );

    // Si se seleccionó un nuevo archivo, adjuntarlo.
    // Si selectedFile es null, significa que no se cambió la imagen y el backend debería mantener la existente.
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile, this.selectedFile.name);
    }
    // NOTA: Si el backend requiere un campo 'imagen' incluso cuando no se cambia (ej. con un valor nulo o una bandera),
    // deberías añadir lógica aquí para append un valor específico cuando `selectedFile` es null.
    // Pero la práctica común para FormData es omitir el campo si no hay un nuevo archivo.

    this.machineryService
      .actualizarMaquina(this.maquinaId, formData)
      .subscribe({
        next: () => {
          Swal.fire(
            '¡Éxito!',
            'Máquina actualizada correctamente.',
            'success'
          ).then(() => {
            this.router.navigate(['/admin/maquinas/listar']); // Navegar a la lista de máquinas o a una vista de detalle
          });
        },
        error: (error) => {
          let errorMessage =
            'Error al actualizar la máquina. Inténtelo de nuevo.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          Swal.fire('Error', errorMessage, 'error');
          console.error('Error al actualizar máquina:', error);
        },
      });
  }
}
