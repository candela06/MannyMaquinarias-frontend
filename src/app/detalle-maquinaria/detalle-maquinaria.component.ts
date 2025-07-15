// src/app/detalle-maquinaria/detalle-maquinaria.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Machinery, MachineryStatus } from '../modles/machinery.model';
import { MachineryService } from '../../services/machinery.service';

@Component({
  selector: 'app-detalle-maquinaria',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detalle-maquinaria.component.html',
  styleUrls: ['./detalle-maquinaria.component.css'],
  //providers: [MachineryService], // <--- ¡AÑADE ESTA LÍNEA!
})
export class DetalleMaquinariaComponent implements OnInit {
  machinery$: Observable<Machinery | undefined> = of(undefined);
  MachineryStatus = MachineryStatus;

  maquinaId!: number;
  resenas: any[] = [];
  promedio: number = 0;

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
          this.obtenerResenasPorMaquina(numericId);
          return this.machineryService.getMachineryById(numericId);
        }
        return of(undefined);
      })
    );
  }

  obtenerResenasPorMaquina(maquinaId: number): void {
    this.machineryService.getResenasPorMaquina(maquinaId).subscribe({
      next: (res) => {
        this.resenas = res;
        this.promedio = this.calcularPromedio(res);
      },
      error: (err) => {
        console.error('Error al obtener reseñas:', err);
      },
    });
  }

  calcularPromedio(resenas: any[]): number {
    if (resenas.length === 0) return 0;
    const total = resenas.reduce((sum, r) => sum + r.puntuacion, 0);
    return parseFloat((total / resenas.length).toFixed(1));
  }

  obtenerEstrellas(puntuacion: number): string[] {
    const llenas = Math.floor(puntuacion);
    const vacías = 5 - llenas;
    return [...Array(llenas).fill('full'), ...Array(vacías).fill('empty')];
  }
}
