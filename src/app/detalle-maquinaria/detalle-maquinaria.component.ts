// src/app/detalle-maquinaria/detalle-maquinaria.component.ts
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineryService } from '../services/machinery.service';
import { Machinery } from '../models/machinery.model';
import { Observable, switchMap, of, Subscription } from 'rxjs';

// Define el enum directamente aquí!
export enum MachineryStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

@Component({
  selector: 'app-detalle-maquinaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-maquinaria.component.html',
  styleUrls: ['./detalle-maquinaria.component.css']
})
export class DetalleMaquinariaComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private machineryService = inject(MachineryService);

  machinery$?: Observable<Machinery | undefined>;
  currentMachinery?: Machinery;
  private machinerySubscription?: Subscription;

  startDate: string = '';
  endDate: string = '';

  MachineryStatus = MachineryStatus;

  ngOnInit() {
    this.machinery$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        // Aseguramos que machineryId sea string o null, no undefined
        const machineryId: string | null = params.get('id');

        if (machineryId) {
          return this.machineryService.getMachineries().pipe(
            switchMap((machineries: Machinery[]) => { // Aseguramos que 'machineries' sea un array de Machinery
              // El 'find' devuelve Machinery | undefined.
              // Asegúrate de que m.id y machineryId sean del mismo tipo (ej. ambos string).
              const foundMachine: Machinery | undefined = machineries.find(m => m.id === machineryId);
              return of(foundMachine);
            })
          );
        } else {
          // Si no hay ID en la URL, devolvemos un Observable de undefined
          return of(undefined);
        }
      })
      // Opcional: Si el error persiste sobre el tipo final, puedes forzarlo aquí:
      // as Observable<Machinery | undefined>
    );

    this.machinerySubscription = this.machinery$.subscribe(machine => {
      this.currentMachinery = machine;
    });
  }

  ngOnDestroy(): void {
    if (this.machinerySubscription) {
      this.machinerySubscription.unsubscribe();
    }
  }

  goBack(): void {
    this.router.navigate(['/catalogo']);
  }

  checkAvailability(): void {
    console.log('Fechas seleccionadas:', this.startDate, this.endDate);
    if (this.startDate && this.endDate) {
      if (this.startDate > this.endDate) {
        alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
        this.endDate = '';
      }
    }
  }

  onRentClick(): void {
    if (this.startDate && this.endDate) {
      if (this.currentMachinery) {
        alert(`Simulación: Máquina "${this.currentMachinery.brand} ${this.currentMachinery.model}" solicitada para alquilar desde ${this.startDate} hasta ${this.endDate}. ¡Funcionalidad real al conectar con el backend!`);
      } else {
        alert('Error: La maquinaria no está cargada. Por favor, inténtalo de nuevo.');
      }
    } else {
      alert('Por favor, selecciona las fechas de inicio y fin para el alquiler.');
    }
  }

  onFavoriteClick(): void {
    if (this.currentMachinery) {
      alert(`Simulación: Máquina "${this.currentMachinery.brand} ${this.currentMachinery.model}" añadida a favoritos. ¡Funcionalidad real al conectar con el backend!`);
    } else {
      alert('Error: No se pudo añadir a favoritos. La maquinaria no está cargada.');
    }
  }
}