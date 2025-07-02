import { Component, OnInit } from '@angular/core';
import { Reserva } from '../../../modles/reserva.model';
import { ReservaService } from '../../../../services/reserva.service';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-historial',
  imports: [CommonModule],
  templateUrl: './historial-reservas.component.html',
})
export class HistorialReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  cargando: boolean = true;
  error: string | null = null;
  reservaSeleccionada: Reserva | null = null;

  seleccionarReserva(reserva: Reserva) {
    this.reservaSeleccionada = reserva;
  }

  cerrarDetalle() {
    this.reservaSeleccionada = null;
  }
  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.reservaService.getReservasPropias().subscribe({
      next: (res) => {
        this.reservas = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener reservas, msj del front', err);
        this.error = '';
        this.cargando = false;
      },
    });
  }
}
