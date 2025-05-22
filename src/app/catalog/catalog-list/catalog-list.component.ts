// src/app/catalog/catalog-list/catalog-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para ngModel en inputs de fecha
import { Machinery, MachineryStatus } from '../../models/machinery.model';
import { MachineryService } from '../../services/machinery.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // añadir FormsModule aquí
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.css'
})
export class CatalogListComponent implements OnInit {
  allMachineries: Machinery[] = [];
  filteredMachineries: Machinery[] = [];
  machineryTypes: string[] = [];
  machineryLocations: string[] = []; // Nueva propiedad para las localidades
  MachineryStatus = MachineryStatus;

  activeFilters: {
    type?: string;
    location?: string; // Nuevo filtro para localidad
    startDate?: string; // Nuevo filtro para fecha de inicio
    endDate?: string;   // Nuevo filtro para fecha de fin
  } = {};

  constructor(private machineryService: MachineryService) { }

  ngOnInit(): void {
    this.machineryService.getMachineries().subscribe(data => {
      this.allMachineries = data;
      this.applyFilters();
    });

    this.machineryService.getMachineryTypes().subscribe(types => {
      this.machineryTypes = types;
    });

    // --- NUEVA SUSCRIPCIÓN PARA LOCALIDADES ---
    this.machineryService.getMachineryLocations().subscribe(locations => {
      this.machineryLocations = locations;
    });
  }

  onFilterChange(filterName: 'type' | 'location', value: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (filterName === 'type') {
      if (isChecked) {
        this.activeFilters.type = value;
      } else if (this.activeFilters.type === value) {
        delete this.activeFilters.type;
      }
    } else if (filterName === 'location') { // --- Lógica para filtro de localidad ---
      if (isChecked) {
        this.activeFilters.location = value;
      } else if (this.activeFilters.location === value) {
        delete this.activeFilters.location;
      }
    }
    this.applyFilters();
  }

  // --- NUEVO MÉTODO para manejar cambios en inputs de fecha ---
  onDateChange() {
    this.applyFilters();
  }

  removeFilter(filterName: 'type' | 'location' | 'startDate' | 'endDate') {
    if (filterName === 'type') {
      delete this.activeFilters.type;
    } else if (filterName === 'location') {
      delete this.activeFilters.location;
    } else if (filterName === 'startDate') {
      delete this.activeFilters.startDate;
    } else if (filterName === 'endDate') {
      delete this.activeFilters.endDate;
    }
    this.applyFilters();
  }

  private applyFilters() {
    let tempMachineries = [...this.allMachineries];

    // --- Aplicar filtro por tipo ---
    if (this.activeFilters.type) {
      tempMachineries = tempMachineries.filter(machine => machine.type === this.activeFilters.type);
    }

    // --- Aplicar filtro por localidad ---
    if (this.activeFilters.location) {
      tempMachineries = tempMachineries.filter(machine => machine.location === this.activeFilters.location);
    }

    // --- Aplicar filtro por fechas (simulado) ---
    const startDate = this.activeFilters.startDate ? new Date(this.activeFilters.startDate) : null;
    const endDate = this.activeFilters.endDate ? new Date(this.activeFilters.endDate) : null;

    if (startDate || endDate) {
      tempMachineries = tempMachineries.filter(machine => {
        // Lógica de disponibilidad simplificada para el mock:
        // Si la máquina no está disponible de inmediato y tiene una fecha de disponibilidad
        if (machine.status === MachineryStatus.AVAILABLE && machine.nextAvailableDate === 'Inmediato') {
          return true; // Si está disponible de inmediato, pasa el filtro de fecha simple
        }
        if (machine.nextAvailableDate && machine.nextAvailableDate !== 'Inmediato' && machine.nextAvailableDate !== 'No disponible') {
          const machineAvailableDate = new Date(machine.nextAvailableDate);
          // Si hay fecha de inicio y la máquina está disponible después o en la fecha de inicio
          if (startDate && machineAvailableDate < startDate) {
            return false; // La máquina no está disponible lo suficientemente pronto
          }
          // Si hay fecha de fin y la máquina está disponible antes o en la fecha de fin
          if (endDate && machineAvailableDate > endDate) {
            return false; // La máquina no está disponible hasta después de la fecha de fin
          }
          return true; // Pasa el filtro si cumple las condiciones de fecha
        }
        return false; // Por defecto, si no tiene nextAvailableDate o es "No disponible", no pasa.
      });
    }

    this.filteredMachineries = tempMachineries;
  }

  clearAllFilters() {
    document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach((element) => {
      const checkbox = element as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = false;
      }
    });
    // Limpiar también los inputs de fecha
    this.activeFilters = {};
    this.applyFilters();
  }
}