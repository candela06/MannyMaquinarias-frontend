// src/app/detalle-maquinaria/detalle-maquinaria.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Machinery, MachineryStatus } from '../modles/machinery.model';
import { MachineryService } from '../../services/machinery.service';

@Component({
  selector: 'app-detalle-maquinaria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-maquinaria.component.html',
  styleUrls: ['./detalle-maquinaria.component.css'],
  //providers: [MachineryService], // <--- ¡AÑADE ESTA LÍNEA!
})
export class DetalleMaquinariaComponent implements OnInit {
  onRentNow(arg0: number) {
    throw new Error('Method not implemented.');
  }
  goBack() {
    throw new Error('Method not implemented.');
  }
  machinery$: Observable<Machinery | undefined> = of(undefined);
  MachineryStatus = MachineryStatus;

  constructor(
    private route: ActivatedRoute,
    private machineryService: MachineryService
  ) {}

  ngOnInit(): void {
    this.machinery$ = this.route.paramMap.pipe(
      tap((params) =>
        console.log(
          'DetalleMaquinariaComponent: Parámetros de ruta recibidos:',
          params.get('id')
        )
      ), // LOG 1
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          const numericId = Number(id);
          console.log(
            'DetalleMaquinariaComponent: Buscando máquina con ID:',
            numericId
          ); // LOG 2
          return this.machineryService.getMachineryById(numericId).pipe(
            tap((machine) => {
              if (machine) {
                console.log(
                  'DetalleMaquinariaComponent: Máquina encontrada:',
                  machine
                ); // LOG 3 (Éxito)
              } else {
                console.log(
                  'DetalleMaquinariaComponent: Máquina NO encontrada para ID:',
                  numericId
                ); // LOG 3 (No encontrada)
              }
            })
          );
        } else {
          console.log(
            'DetalleMaquinariaComponent: No se encontró ID en los parámetros de ruta.'
          ); // LOG 4
          return of(undefined);
        }
      })
    );
  }
}
