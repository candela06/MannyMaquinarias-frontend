// src/app/services/machinery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Machinery, MachineryStatus } from '../app/modles/machinery.model';




@Injectable({
  providedIn: 'root',
})
export class MachineryService {
  private _apiUrl = 'http://localhost:3001/maquinas'; // Tu endpoint del backend
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
    return this.http.get<Machinery[]>(this._apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener maquinarias del backend:', error);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
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

  getMachineryById(id: string): Observable<Machinery | undefined> {
    // Convertirlo a number para la comparación.
    const numericId = parseInt(id, 10);
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
            .filter((m) => m.sucursal && m.sucursal.nombre) // Solo si tiene sucursal y nombre
            .map((m) => m.sucursal!.nombre) // El ! es para asegurar a TS que no es undefined
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