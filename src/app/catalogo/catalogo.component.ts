// src/app/catalog/catalog-list/catalog-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para directivas como *ngIf, *ngFor, y pipes
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { RouterLink } from '@angular/router'; // Para [routerLink]
import { Machinery, MachineryStatus } from '../modles/machinery.model';
import { MachineryService } from '../../services/machinery.service';
import { Observable, combineLatest, of } from 'rxjs'; // Importa Observables y operadores necesarios
import { map, startWith } from 'rxjs/operators';

// Interfaz para tipar el objeto de filtros activos, usando nombres de propiedades del backend o mapeados
interface ActiveFilters {
  tipo: string[]; // Coincide con 'nombre' del backend para el tipo de maquinaria
  ubicacion: string[]; // Coincide con 'sucursal.nombre' del backend para la ubicación
  maxPrice: number;
  startDate: string | null;
  endDate: string | null;
  searchTerm: string | null; // Para la barra de búsqueda general
}

@Component({
  selector: 'app-catalog-list',
  standalone: true, // Indica que es un componente standalone
  imports: [CommonModule, FormsModule, RouterLink], // Módulos necesarios para la plantilla
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent implements OnInit {
  // Observables para las listas de maquinarias y opciones de filtro
  machineries$: Observable<Machinery[]> = of([]); // Todas las maquinarias disponibles (no borradas)
  filteredMachineries$: Observable<Machinery[]> = of([]); // Maquinarias después de aplicar filtros
  machineryTypes$: Observable<string[]> = of([]); // Tipos de maquinaria únicos
  machineryLocations$: Observable<string[]> = of([]); // Localidades únicas

  // Hace que el enum MachineryStatus sea accesible directamente en la plantilla HTML
  MachineryStatus = MachineryStatus;

  // Objeto que almacena los filtros activos, inicializado con valores por defecto
  activeFilters: ActiveFilters = {
    tipo: [], // Inicialmente sin tipos seleccionados
    ubicacion: [], // Inicialmente sin ubicaciones seleccionadas
    maxPrice: 2000000, // Valor máximo por defecto para el slider de precio
    startDate: null, // Fecha de inicio de alquiler no seleccionada
    endDate: null, // Fecha de fin de alquiler no seleccionada
    searchTerm: null, // Término de búsqueda vacío
  };

  constructor(private machineryService: MachineryService) {}

  ngOnInit(): void {
    // Carga las opciones de tipos y localidades desde el servicio
    this.machineryTypes$ = this.machineryService.getMachineryTypes();
    this.machineryLocations$ = this.machineryService.getMachineryLocations();

    // Obtiene todas las maquinarias disponibles (filtradas por isDeleted y availability en el servicio)
    this.machineries$ = this.machineryService.getAvailableMachineries();

    // Llama a la función de actualización de filtros para la carga inicial
    // Esto asegura que `filteredMachineries$` se inicialice con los filtros por defecto
    this.updateFilteredMachineries();
  }

  /**
   * Maneja los cambios en los checkboxes de tipo y ubicación.
   * Actualiza `activeFilters` y dispara la re-evaluación de los filtros.
   * @param filterKey 'tipo' o 'ubicacion'
   * @param value El valor del filtro (ej. 'Retroexcavadora', 'Quilmes')
   * @param event El evento de cambio del checkbox
   */
  onFilterChange(
    filterKey: 'tipo' | 'ubicacion',
    value: string,
    event: Event
  ): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      // Añade el valor si no está ya presente
      if (!this.activeFilters[filterKey].includes(value)) {
        this.activeFilters[filterKey].push(value);
      }
    } else {
      // Elimina el valor si está desmarcado
      this.activeFilters[filterKey] = this.activeFilters[filterKey].filter(
        (item) => item !== value
      );
    }
    this.updateFilteredMachineries(); // Vuelve a aplicar los filtros
  }

  /**
   * Maneja el cambio en el slider de rango de precios.
   * El `[(ngModel)]` ya actualiza `activeFilters.maxPrice`.
   * Dispara la re-evaluación de los filtros.
   */
  onPriceRangeChange(): void {
    this.updateFilteredMachineries(); // Vuelve a aplicar los filtros
  }

  /**
   * Maneja los cambios en los inputs de fecha (Desde/Hasta).
   * El `[(ngModel)]` ya actualiza `activeFilters.startDate` y `activeFilters.endDate`.
   * Dispara la re-evaluación de los filtros.
   */
  onDateChange(): void {
    this.updateFilteredMachineries(); // Vuelve a aplicar los filtros
  }

  /**
   * Limpia un filtro específico o un grupo de filtros.
   * @param filterKey La clave del filtro a remover (ej. 'tipo', 'maxPrice')
   */
  removeFilter(filterKey: keyof ActiveFilters): void {
    if (filterKey === 'tipo' || filterKey === 'ubicacion') {
      this.activeFilters[filterKey] = []; // Limpia el array de tipos o ubicaciones
    } else if (filterKey === 'maxPrice') {
      this.activeFilters.maxPrice = 2000000; // Restablece el precio máximo al valor por defecto
    } else if (filterKey === 'startDate' || filterKey === 'endDate') {
      this.activeFilters[filterKey] = null; // Limpia las fechas
    } else if (filterKey === 'searchTerm') {
      this.activeFilters.searchTerm = null; // Limpia el término de búsqueda
    }
    this.updateFilteredMachineries(); // Vuelve a aplicar los filtros
  }

  /**
   * Restablece todos los filtros a sus valores por defecto.
   * También se encarga de desmarcar los checkboxes en la UI.
   */
  clearAllFilters(): void {
    // Desmarcar todos los checkboxes de la sidebar (interacción con el DOM)
    document
      .querySelectorAll('.filters-sidebar input[type="checkbox"]')
      .forEach((element) => {
        const checkbox = element as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = false;
        }
      });

    // Restablecer el objeto activeFilters a sus valores iniciales
    this.activeFilters = {
      tipo: [],
      ubicacion: [],
      maxPrice: 2000000,
      startDate: null,
      endDate: null,
      searchTerm: null,
    };
    this.updateFilteredMachineries(); // Vuelve a aplicar los filtros
  }

  /**
   * Aplica la lógica de filtrado a la lista completa de maquinarias.
   * Este método se llama cada vez que un filtro cambia para re-evaluar la lista `filteredMachineries$`.
   */
  private updateFilteredMachineries(): void {
    // `combineLatest` se suscribe a `machineries$` (los datos base)
    // y a un observable que "dispara" cuando los filtros cambian.
    // Como `activeFilters` no es un BehaviorSubject, la forma de "disparar"
    // es re-evaluar la cadena de Observables desde `machineries$`.
    this.filteredMachineries$ = combineLatest([
      this.machineries$, // Observable de todas las maquinarias disponibles
      // Puedes añadir un observable dummy aquí si necesitas que combineLatest reaccione
      // a cambios en `activeFilters` sin que `machineries$` emita.
      // Por ejemplo, `of(this.activeFilters)` o un `BehaviorSubject<ActiveFilters>`
      // que se actualice en cada `onFilterChange` etc.
      // Para esta estructura, la lógica de filtrado se aplica en el `map`
      // cada vez que `machineries$` emite, o cuando `updateFilteredMachineries` es llamado.
    ]).pipe(
      map(([allMachineries]) => {
        let filtered = allMachineries;

        // 1. Filtrar por tipo (coincide con 'nombre' del backend)
        if (this.activeFilters.tipo.length > 0) {
          filtered = filtered.filter((m) =>
            this.activeFilters.tipo.includes(m.nombre)
          );
        }

        // 2. Filtrar por localidad (coincide con 'sucursal.nombre' del backend)
        if (this.activeFilters.ubicacion.length > 0) {
          filtered = filtered.filter(
            (m) =>
              m.sucursal &&
              this.activeFilters.ubicacion.includes(m.sucursal.localidad)
          );
        }

        // 3. Filtrar por precio máximo (coincide con 'precio' del backend)
        if (this.activeFilters.maxPrice !== 2000000) {
          // Si el slider no está en el máximo por defecto
          filtered = filtered.filter(
            (m) => m.precio <= this.activeFilters.maxPrice
          );
        }

        // 4. Filtrar por fechas (lógica de disponibilidad basada en 'estado' y 'nextAvailableDate')
        // Esta lógica es más compleja y depende de cómo el backend maneje la disponibilidad.
        // Aquí se asume una lógica simple: si la máquina está disponible, se muestra.
        // Si está reservada, se muestra si su próxima fecha disponible es antes del rango de búsqueda.
        if (this.activeFilters.startDate && this.activeFilters.endDate) {
          const start = new Date(this.activeFilters.startDate);
          const end = new Date(this.activeFilters.endDate);

          filtered = filtered.filter((m) => {
            // Si la máquina está disponible, siempre la incluimos (está lista para alquilar)
            if (m.estado === MachineryStatus.DISPONIBLE) {
              return true;
            }
            // Si la máquina está entregada o en checkeo (considerado 'reservado' en frontend)
            // y tiene una próxima fecha disponible (si el backend la provee)
            if (
              (m.estado === MachineryStatus.ENTREGADO ||
                m.estado === MachineryStatus.CHECKEO) &&
              m.nextAvailableDate
            ) {
              const machineAvailableDate = new Date(m.nextAvailableDate);
              // Solo se incluye si la máquina estará disponible ANTES o EN la fecha de inicio del filtro
              return machineAvailableDate <= start;
            }
            // Si está en mantenimiento, no está disponible
            if (m.estado === MachineryStatus.EN_MANTENIMIENTO) {
              return false;
            }
            return false; // Por defecto, no se incluye
          });
        }

        // 5. Filtrar por término de búsqueda (coincide con 'marca', 'modelo', 'nombre' del backend)
        if (this.activeFilters.searchTerm) {
          const searchTerm = this.activeFilters.searchTerm.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.marca.toLowerCase().includes(searchTerm) || // Busca en la marca
              m.modelo.toLowerCase().includes(searchTerm) || // Busca en el modelo
              m.nombre.toLowerCase().includes(searchTerm) || // Busca en el nombre (que usamos como tipo/descripción)
              // Si tuvieras una propiedad 'description' real del backend:
              // (m.description ?? '').toLowerCase().includes(searchTerm)
              false // Si no hay más campos relevantes para la búsqueda
          );
        }

        return filtered;
      }),
      startWith([]) // Emite un array vacío al inicio, antes de que los datos se carguen
    );
  }
}
