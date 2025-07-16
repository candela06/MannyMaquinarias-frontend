// src/app/catalog/catalog-list/catalog-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Machinery, MachineryStatus } from '../modles/machinery.model';
import { MachineryService } from '../../services/machinery.service';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface ActiveFilters {
  tipo: string[];
  ubicacion: string[];
  maxPrice: number;
  startDate: string | null;
  endDate: string | null;
  searchTerm: string | null;
}

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent implements OnInit {
  readonly MAX_PRICE_DEFAULT = 5000;

  machineries$: Observable<Machinery[]> = of([]);
  filteredMachineries$: Observable<Machinery[]> = of([]);
  machineryTypes$: Observable<string[]> = of([]);
  machineryLocations$: Observable<string[]> = of([]);

  MachineryStatus = MachineryStatus;

  activeFilters: ActiveFilters = {
    tipo: [],
    ubicacion: [],
    maxPrice: this.MAX_PRICE_DEFAULT,
    startDate: null,
    endDate: null,
    searchTerm: null,
  };

  constructor(private machineryService: MachineryService) {}

  ngOnInit(): void {
    this.machineryTypes$ = this.machineryService.getMachineryTypes();
    this.machineryLocations$ = this.machineryService.getMachineryLocations();
    this.machineries$ = this.machineryService.getMachineries();
    this.updateFilteredMachineries();
  }

  onFilterChange(
    filterKey: 'tipo' | 'ubicacion',
    value: string,
    event: Event
  ): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.activeFilters[filterKey].includes(value)) {
        this.activeFilters[filterKey].push(value);
      }
    } else {
      this.activeFilters[filterKey] = this.activeFilters[filterKey].filter(
        (item) => item !== value
      );
    }
    this.updateFilteredMachineries();
  }

  onPriceRangeChange(): void {
    this.updateFilteredMachineries();
  }

  onDateChange(): void {
    const { startDate, endDate } = this.activeFilters;

    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en las fechas',
        text: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
        confirmButtonText: 'Entendido',
      });
      this.activeFilters.startDate = null;
      this.activeFilters.endDate = null;

      this.updateFilteredMachineries();
      return;
    }
    this.updateFilteredMachineries();
  }

  onSearchTermChange(): void {
    this.updateFilteredMachineries();
  }

  removeFilter(filterKey: keyof ActiveFilters): void {
    if (filterKey === 'tipo' || filterKey === 'ubicacion') {
      this.activeFilters[filterKey] = [];
    } else if (filterKey === 'maxPrice') {
      this.activeFilters.maxPrice = 5000;
    } else if (filterKey === 'startDate' || filterKey === 'endDate') {
      this.activeFilters[filterKey] = null;
    } else if (filterKey === 'searchTerm') {
      this.activeFilters.searchTerm = null;
    }
    this.updateFilteredMachineries();
  }

  clearAllFilters(): void {
    document
      .querySelectorAll('.filters-sidebar input[type="checkbox"]')
      .forEach((element) => {
        const checkbox = element as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = false;
        }
      });

    this.activeFilters = {
      tipo: [],
      ubicacion: [],
      maxPrice: 5000,
      startDate: null,
      endDate: null,
      searchTerm: null,
    };
    this.updateFilteredMachineries();
  }

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
      baseMachineries$ = this.machineryService.getMachineries();
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
      f.maxPrice !== 5000 ||
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
