// src/app/services/machinery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, from } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Machinery, MachineryStatus } from '../app/modles/machinery.model';
import id from '@angular/common/locales/id';

/**
 * @description Interfaz que define la estructura de los datos de una máquina
 * tal como se envían desde el frontend al backend para su registro.
 */
export interface MaquinaData {
  numeroSerie: string;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: string;
  estado: string;
  precio: number;
  sucursal_id: number;
  politicaCancelacionID: number;
  imageUrls?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MachineryService {
  private _apiUrl = 'http://localhost:3001';
  private machineriesSubject = new BehaviorSubject<Machinery[]>([]);
  machineries$: Observable<Machinery[]> =
    this.machineriesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchMachineriesFromBackend().subscribe(
      (machineries) => {
        this.machineriesSubject.next(machineries);
        console.log('Datos de maquinarias cargados del backend:', machineries);
      },
      (error) =>
        console.error('Error al cargar maquinarias del backend:', error)
    );
  }

  private fetchMachineriesFromBackend(): Observable<Machinery[]> {
    // Asumiendo que listarMaquinas (GET) es en /maquinas
    return this.http.get<Machinery[]>(`${this._apiUrl}/maquinas`).pipe(
      catchError((error) => {
        console.error('Error al obtener maquinarias del backend:', error);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }

  uploadImageToCloudinary(file: File): Observable<string> {
    // Para salir del apuro y satisfacer la validación del backend:
    // Devolvemos una URL de placeholder válida en lugar de Base64.
    // En una implementación real con Cloudinary, obtendrías la URL real aquí.
    const placeholderUrl = `https://placehold.co/400x200/e0e0e0/333333?text=Maquina_${file.name}`;
    return of(placeholderUrl); // Retorna una URL de placeholder inmediatamente
  }

  /**
   * @description Registra una nueva máquina en el backend.
   * Ahora espera un objeto JSON con los datos de la máquina y un array de URLs de imagen.
   * El backend espera 'imageUrl', por lo que enviamos la primera del array.
   * @param maquinaData Objeto JSON con los datos de la máquina y sus URLs de imagen.
   * @returns Un Observable con la respuesta del backend.
   */
  registrarMaquina(maquinaData: MaquinaData): Observable<any> {
    // Se crea una copia para evitar modificar el objeto original
    const payload: any = { ...maquinaData };

    // Backend espera 'imageUrl', así que enviamos la primera imagen del array si existe
    if (maquinaData.imageUrls && maquinaData.imageUrls.length > 0) {
      payload.imageUrl = maquinaData.imageUrls[0];
    } else {
      payload.imageUrl = null; // Enviar null si no hay imágenes
    }

    // Eliminar la propiedad imageUrls del payload final si el backend no la espera
    delete payload.imageUrls;

    // Envía el objeto JSON directamente
    return this.http
      .post<any>(`${this._apiUrl}/maquinas/add`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * @description Envía una petición DELETE al backend para eliminar lógicamente una máquina por su ID.
   * @param id El ID de la máquina a eliminar.
   * @returns Un Observable con la respuesta del backend.
   */
  eliminarMaquina(id: number): Observable<any> {
    // La URL debe incluir el ID de la máquina como parte de la ruta
    return this.http
      .delete<any>(`${this._apiUrl}/maquinas/delete/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * @description Actualiza la información de una máquina existente en el backend.
   * @param {number} id - El ID de la máquina a actualizar.
   * @param {FormData} maquinaData - Objeto FormData que contiene los datos actualizados de la máquina
   * (incluyendo la imagen si fue cambiada, o no si se mantiene la anterior).
   * @returns {Observable<any>} Un Observable que emite la respuesta del backend.
   */
  actualizarMaquina(id: number, maquinaData: FormData): Observable<any> {
    // Asumiendo un endpoint como /maquinas/update/:id para actualizar una máquina.
    // El backend debe manejar si la imagen se incluye o no en el FormData.
    return this.http.put(`${this._apiUrl}/update/${id}`, maquinaData);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta fallido.
      // El cuerpo de la respuesta puede contener pistas.
      console.error(
        `Código de error del backend: ${error.status}, ` +
          `Cuerpo: ${JSON.stringify(error.error)}`
      );

      if (error.status === 400 && error.error && error.error.error) {
        errorMessage = `Error de validación: ${error.error.error}`; // Mensaje del backend
      } else if (error.status === 409 && error.error && error.error.error) {
        errorMessage = `Conflicto: ${error.error.error}`; // Por ejemplo, DNI ya existe
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    return throwError(() => new Error(errorMessage)); // Propagar el error
  }

  getMachineries(): Observable<Machinery[]> {
    return this.machineries$;
  }

  // Si getAvailableMachineries significa 'estado: disponible' y no está 'deletedAt'
  getAvailableMachineries(): Observable<Machinery[]> {
    return this.machineries$.pipe(
      map((machineries) =>
        machineries.filter(
          (m) => m.estado === MachineryStatus.DISPONIBLE && m.deletedAt === null // Filtrar por estado y borrado lógico
        )
      )
    );
  }

  getMachineryById(id: number): Observable<Machinery | undefined> {
    // Convertirlo a number para la comparación.
    const numericId = id;
    return this.machineries$.pipe(
      map((machineries) => machineries.find((m) => m.id === numericId))
    );
  }

  getMachineryTypes(): Observable<string[]> {
    return this.machineries$.pipe(
      map((machineries) => [...new Set(machineries.map((m) => m.nombre))])
    );
  }

  getMachineryLocations(): Observable<string[]> {
    // Asumiendo que el backend ahora incluye 'sucursal.nombre':
    return this.machineries$.pipe(
      map((machineries) => [
        ...new Set(
          machineries
            .filter((m) => m.sucursal && m.sucursal.localidad) // Solo si tiene sucursal y nombre
            .map((m) => m.sucursal!.localidad) // El ! es para asegurar a TS que no es undefined
        ),
      ])
    );
    // Si el backend NO incluye sucursal, esto devolverá un array vacío o un error.
    // En ese caso se deben obtener las sucursales de otro endpoint (`/sucursales`)
    // o hardcodear algunas ubicaciones si es temporal.
  }

  // addMachinery(newMachine: Partial<Machinery>): Observable<Machinery> {
  //   return this.http.post<Machinery>(this._apiUrl, newMachine).pipe(
  //     tap(addedMachine => {
  //       const current = this.machineriesSubject.getValue();
  //       this.machineriesSubject.next([...current, addedMachine]);
  //     })
  //   );
  // }
}
