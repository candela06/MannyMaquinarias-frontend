import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import 'chartjs-adapter-date-fns';

interface DatosUsuariosPorMes {
  mes: string;
  cantidad: number;
}

interface DatosMontosDia {
  dia: string;
  montoTotal: number;
}

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  chartUsuarios: Chart | undefined;
  anioSeleccionado: number = new Date().getFullYear();
  aniosDisponibles: number[] = [];

  chartMontos: Chart | undefined;
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generarAniosDisponibles();
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceUnMes.toISOString().split('T')[0];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.obtenerEstadisticasUsuarios();
    }, 200);

    setTimeout(() => {
      this.cargarEstadisticasMontos();
    }, 300);
  }
  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }
  generarAniosDisponibles(): void {
    const anioActual = new Date().getFullYear();
    const anioInicio = anioActual - 3;
    for (let i = anioInicio; i <= anioActual + 1; i++) {
      this.aniosDisponibles.push(i);
    }
    this.anioSeleccionado = anioActual;
  }

  obtenerEstadisticasUsuarios(): void {
    const backendUrl = `http://localhost:3001/estadisticas/users?anio=${this.anioSeleccionado}`;

    console.log(`Realizando petición GET a: ${backendUrl}`);

    this.http.get<DatosUsuariosPorMes[]>(backendUrl).subscribe({
      next: (data: DatosUsuariosPorMes[]) => {
        console.log('Datos recibidos del backend (Usuarios):', data);

        const nombresMeses = [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ];

        const datosMapeados: { [key: string]: number } = {};
        data.forEach((item) => {
          datosMapeados[item.mes.toLowerCase()] = item.cantidad;
        });

        const labelsCompletos: string[] = [];
        const valoresCompletos: number[] = [];

        nombresMeses.forEach((nombreMes) => {
          labelsCompletos.push(
            nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)
          );
          valoresCompletos.push(datosMapeados[nombreMes] || 0); // Si no hay dato, es 0
        });

        this.renderizarGraficoUsuarios(labelsCompletos, valoresCompletos);
      },
      error: (error: any) => {
        console.error('Error al obtener estadísticas de usuarios:', error);
        alert(
          'No se pudieron cargar las estadísticas de usuarios. Verifica la consola para más detalles (errores de CORS o backend).'
        );
      },
    });
  }

  renderizarGraficoUsuarios(labels: string[], valores: number[]): void {
    if (this.chartUsuarios) {
      this.chartUsuarios.destroy();
    }

    const canvasElement = document.getElementById(
      'usuariosChart'
    ) as HTMLCanvasElement;
    if (!canvasElement) {
      console.error(
        'No se encontró el elemento canvas con ID "usuariosChart".'
      );
      return;
    }
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      console.error(
        'No se pudo obtener el contexto 2D del canvas para usuarios.'
      );
      return;
    }

    this.chartUsuarios = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Usuarios registrados',
            data: valores,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `Usuarios registrados por mes en ${this.anioSeleccionado}`,
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });
  }

  cargarEstadisticasMontos(): void {
    const backendUrl = `http://localhost:3001/estadisticas/montos?fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}`;

    console.log(`Realizando petición GET a: ${backendUrl}`);

    this.http
      .get<DatosMontosDia[]>(backendUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data: DatosMontosDia[]) => {
          const labels = data.map((item) => item.dia);
          const valores = data.map((item) => item.montoTotal);
          this.renderizarGraficoMontos(labels, valores);
        },
        error: (error: any) => {
          if (error.status === 404) {
            // Si no hay datos, renderiza gráfico vacío
            this.renderizarGraficoMontos([], []);
          } else {
            console.error('Error al obtener estadísticas de montos:', error);
            alert('No se pudieron cargar las estadísticas de ingresos.');
          }
        },
      });
  }

  renderizarGraficoMontos(labels: string[], valores: number[]): void {
    if (this.chartMontos) {
      this.chartMontos.destroy();
    }

    const canvasElement = document.getElementById(
      'montosChart'
    ) as HTMLCanvasElement;
    if (!canvasElement) {
      console.error('No se encontró el elemento canvas con ID "montosChart".');
      return;
    }

    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      console.error(
        'No se pudo obtener el contexto 2D del canvas para montos.'
      );
      return;
    }

    this.chartMontos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ingresos diarios ($)',
            data: valores,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `Ingresos entre ${this.fechaInicio} y ${this.fechaFin}`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
          x: {
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
      },
    });
  }
}
