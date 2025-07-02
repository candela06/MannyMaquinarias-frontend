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
  readonly MAX_PRICE_DEFAULT = 2000000;

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
    maxPrice: this.MAX_PRICE_DEFAULT, // Valor máximo por defecto para el slider de precio
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
   * @description Maneja los cambios en la barra de búsqueda.
   * El `[(ngModel)]` ya actualiza `activeFilters.searchTerm`.
   * Dispara la re-evaluación de los filtros.
   */
  onSearchTermChange(): void {
    // <-- ¡NUEVO MÉTODO!
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
    const { startDate, endDate, maxPrice } = this.activeFilters;
    const usarFiltradoBackend =
      !!startDate || maxPrice !== this.MAX_PRICE_DEFAULT;

    let baseMachineries$: Observable<Machinery[]>;

    if (usarFiltradoBackend) {
      baseMachineries$ =
        this.machineryService.getFilteredMachineriesByDateAndPrice(
          startDate,
          endDate,
          maxPrice
        );
    } else {
      baseMachineries$ = this.machineryService.getAvailableMachineries();
    }

    this.filteredMachineries$ = baseMachineries$.pipe(
      map((allMachineries) => {
        let filtered = allMachineries;

        // Filtros de tipo, ubicación y búsqueda en frontend
        if (this.activeFilters.tipo.length > 0) {
          filtered = filtered.filter((m) =>
            this.activeFilters.tipo.includes(m.nombre)
          );
        }

        if (this.activeFilters.ubicacion.length > 0) {
          filtered = filtered.filter(
            (m) =>
              m.sucursal &&
              this.activeFilters.ubicacion.includes(m.sucursal.localidad)
          );
        }

        if (this.activeFilters.searchTerm) {
          const searchTerm = this.activeFilters.searchTerm.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.marca.toLowerCase().includes(searchTerm) ||
              m.modelo.toLowerCase().includes(searchTerm) ||
              m.nombre.toLowerCase().includes(searchTerm)
          );
        }

        return filtered;
      }),
      startWith([])
    );
  }

  // Devuelve true si hay filtros activos
  hasActiveFilters(): boolean {
    const f = this.activeFilters;
    return (
      f.tipo.length > 0 ||
      f.ubicacion.length > 0 ||
      f.maxPrice !== 2000000 ||
      f.startDate !== null ||
      f.endDate !== null ||
      !!f.searchTerm
    );
  }

  // Elimina un valor individual (tipo o ubicación)
  removeFilterValue(filterKey: 'tipo' | 'ubicacion', value: string): void {
    this.activeFilters[filterKey] = this.activeFilters[filterKey].filter(
      (v) => v !== value
    );
    this.updateFilteredMachineries();
  }
}
