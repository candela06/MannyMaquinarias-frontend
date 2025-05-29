// src/app/detalle-maquinaria/detalle-maquinaria.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Machinery, MachineryStatus } from '../modles/machinery.model';
import { MachineryService } from '../../services/machinery.service';




@Component({
  selector: 'app-detalle-maquinaria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-maquinaria.component.html',
  styleUrls: ['./detalle-maquinaria.component.css'],
  providers: [MachineryService], // <--- ¡AÑADE ESTA LÍNEA!
})
export class DetalleMaquinariaComponent implements OnInit {
  machinery$: Observable<Machinery | undefined> = of(undefined);
  MachineryStatus = MachineryStatus;

  constructor(
    private route: ActivatedRoute,
    private machineryService: MachineryService
  ) {}

  ngOnInit(): void {
    this.machinery$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          return this.machineryService.getMachineryById(id);
        } else {
          return of(undefined);
        }
      })
    );
  }
}