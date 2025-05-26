// src/app/catalog/catalog-list/catalog-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Asegúrate de importar FormsModule
import { Machinery, MachineryStatus } from '../../models/machinery.model';
import { MachineryService } from '../../services/machinery.service';
import { RouterLink } from '@angular/router';
import { FilterService } from '../../services/filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe], // Asegúrate de tener FormsModule y DatePipe
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.css'
})
export class CatalogListComponent implements OnInit, OnDestroy {
  allMachineries: Machinery[] = [];
  filteredMachineries: Machinery[] = [];
  machineryTypes: string[] = [];
  machineryLocations: string[] = [];  
  MachineryStatus = MachineryStatus;

  // --- ACTUALIZAR LA INTERFAZ DE FILTROS ---
  activeFilters: {
    type: string[];
    location: string[];
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
    minPrice: number; // <-- ¡NUEVO!
    maxPrice: number; // <-- ¡NUEVO!
  } = {
    type: [],
    location: [],
    searchTerm: '',
    minPrice: 0,   // <-- Valor inicial por defecto para el slider
    maxPrice: 1000 // <-- Valor inicial por defecto para el slider (asegúrate que coincida con el 'max' del HTML)
  };

  private searchSubscription!: Subscription;

  constructor(
    private machineryService: MachineryService,
    private filterService: FilterService
  ) { }

  ngOnInit(): void {
    this.machineryService.getMachineries().subscribe(data => {
      this.allMachineries = data;
      this.applyFilters(); // Aplica los filtros iniciales una vez que los datos se cargan
    });

    this.machineryService.getMachineryTypes().subscribe(types => {
      this.machineryTypes = types;
    });

    this.machineryService.getMachineryLocations().subscribe(locations => {
      this.machineryLocations = locations;
    });

    // Suscribirse al término de búsqueda del FilterService
    this.searchSubscription = this.filterService.searchTerm$.subscribe(term => {
      this.activeFilters.searchTerm = term;
      this.applyFilters(); // Vuelve a aplicar todos los filtros cuando el término de búsqueda cambia
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onFilterChange(filterName: 'type' | 'location', value: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (filterName === 'type') {
      if (isChecked) {
        if (!this.activeFilters.type.includes(value)) {
          this.activeFilters.type.push(value);
        }
      } else {
        this.activeFilters.type = this.activeFilters.type.filter(type => type !== value);
      }
    } else if (filterName === 'location') {
      if (isChecked) {
        if (!this.activeFilters.location.includes(value)) {
          this.activeFilters.location.push(value);
        }
      } else {
        this.activeFilters.location = this.activeFilters.location.filter(loc => loc !== value);
      }
    }
    this.applyFilters(); // Aplicar filtros cada vez que un checkbox cambia
  }

  // --- Nuevo método para manejar el cambio del rango de precios ---
  onPriceRangeChange(): void {
    // [(ngModel)] ya actualiza activeFilters.maxPrice (y minPrice si lo añades)
    // Solo necesitamos llamar a applyFilters para refrescar la lista
    this.applyFilters();
  }

  onDateChange() {
    this.applyFilters();
  }

  removeFilter(filterName: 'type' | 'location' | 'startDate' | 'endDate' | 'searchTerm' | 'maxPrice', value?: string) {
    if (filterName === 'type') {
      if (value) {
        this.activeFilters.type = this.activeFilters.type.filter(type => type !== value);
      } else {
        this.activeFilters.type = [];
      }
    } else if (filterName === 'location') {
      if (value) {
        this.activeFilters.location = this.activeFilters.location.filter(loc => loc !== value);
      } else {
        this.activeFilters.location = [];
      }
    } else if (filterName === 'startDate') {
      delete this.activeFilters.startDate;
    } else if (filterName === 'endDate') {
      delete this.activeFilters.endDate;
    } else if (filterName === 'searchTerm') {
      this.filterService.setSearchTerm(''); // Limpiar el término de búsqueda a través del servicio
    } else if (filterName === 'maxPrice') { // <-- Lógica para limpiar el filtro de precio
        this.activeFilters.maxPrice = 1000; // Restablecer al valor máximo por defecto
        // O si tuvieras minPrice, también lo reiniciarías: this.activeFilters.minPrice = 0;
    }
    this.applyFilters();
  }

  // --- Lógica principal de filtrado ---
  private applyFilters() {
    let tempMachineries = [...this.allMachineries];

    // 1. Filtro por búsqueda de texto
    if (this.activeFilters.searchTerm && this.activeFilters.searchTerm.trim() !== '') {
      const searchTermLower = this.activeFilters.searchTerm.toLowerCase().trim();
      tempMachineries = tempMachineries