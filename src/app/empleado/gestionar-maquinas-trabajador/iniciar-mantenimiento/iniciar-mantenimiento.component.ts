import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MachineryService } from '../../../../services/machinery.service';
import { MachineryStatus } from '../../../modles/machinery.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-iniciar-mantenimiento',
  templateUrl: './iniciar-mantenimiento.component.html',
  styleUrls: ['./iniciar-mantenimiento.component.css'],
  imports: [CommonModule, FormsModule]
})
export class IniciarMantenimientoComponent implements OnInit {
  maquina: any = null;
  form = {
    nombre: '',
    descripcion: '',
    fechaFin: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private maquinariaService: MachineryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.maquinariaService.getMachineryById(+id).subscribe((maquina) => {
        if (maquina) {
          this.maquina = maquina;
        } else {
          Swal.fire('Error', 'Máquina no encontrada', 'error');
          this.router.navigate(['/trabajador-dashboard']);
        }
      });
    }
  }

 confirmarMantenimiento() {
  if (!this.maquina || this.maquina.estado !== 'disponible') {
    Swal.fire('No permitido', 'La máquina no se encuentra en el local', 'warning');
    return;
  }

  if (!this.form.nombre || !this.form.descripcion || !this.form.fechaFin) {
    Swal.fire('Faltan campos', 'Completa todos los campos', 'info');
    return;
  }

  const payload = {
  nombre: this.form.nombre,
  detalle: this.form.descripcion,
  fechaFin: this.form.fechaFin
};


  const token = localStorage.getItem('token'); // O ajustá si usás otra clave

  fetch('http://localhost:3001/mantenimientos/startMantenimiento/' + this.maquina.id, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
    body: JSON.stringify(payload)
  })
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Error al iniciar mantenimiento');
      }
      return res.json();
    })
    .then(() => {
      Swal.fire('Éxito', 'Mantenimiento iniciado correctamente', 'success');
      this.router.navigate(['/trabajador/maquinas/gestionar']);
    })
    .catch((err) => {
      Swal.fire('Error', err.message, 'error');
    });
}


}


