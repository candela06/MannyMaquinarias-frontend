import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common'; // Importa DatePipe
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Machinery, MachineryStatus } from '../models/machinery.model';
import { MachineryService } from '../services/machinery.service';

@Component({
  selector: 'app-detalle-maquinaria',
  standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe], // Añade DatePipe aquí
  templateUrl: './detalle-maquinaria.component.html',
  styleUrls: ['./detalle-maquinaria.component.css'],
  providers: [MachineryService],
})
export class DetalleMaquinariaComponent implements OnInit {
  machinery$: Observable<Machinery | undefined> = of(undefined);
  MachineryStatus = MachineryStatus; // Para usar el enum en el template
  activeTab: 'description' | 'availability' | 'policies' = 'description'; // Estado para las pestañas
  loadingInitial: boolean = true; // Para diferenciar entre "cargando" y "no encontrado"

  constructor(
    private route: ActivatedRoute,
    private machineryService: MachineryService
  ) {}

  ngOnInit(): void {
    this.machinery$ = this.route.paramMap.pipe(
      switchMap((params) => {
        this.loadingInitial = true; // Resetea a true cada vez que cambia el ID
        const id = params.get('id');
        if (id) {
          return this.machineryService.getMachineryById(id);
        } else {
          this.loadingInitial = false; // Si no hay ID, no estamos cargando
          return of(undefined);
        }
      })
    );

    // Opcional: Para saber cuándo la carga inicial ha terminado y mostrar el "no encontrado"
    this.machinery$.subscribe((machine) => {
      this.loadingInitial = false;
    });
  }

  // Si necesitas un botón de "volver", puedes implementar esto (requiere el Router para navegar)
  // goBack(): void {
  //   this.router.navigate(['/maquinarias']); // O la ruta a tu lista de maquinarias
  // }
}
