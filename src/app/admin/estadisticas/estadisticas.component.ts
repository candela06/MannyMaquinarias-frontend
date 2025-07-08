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

  categoriaChart: Chart | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generarAniosDisponibles();
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(hoy.getMonth() - 1);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceUnMes.toISOString().split('T')[0];

    this.renderDynamicChart();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.obtenerEstadisticasUsuarios();
    }, 200);

    setTimeout(() => {
      this.cargarEstadisticasMontos();
    }, 300);

    //tercer estadistica
    setTimeout(() => {
      this.renderDynamicChart();
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
            backgroundColor: 'rgb(255, 184, 53)',
            borderColor: 'rgb(248, 211, 143)',
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
    // Si no se ingresó ninguna fecha
    if (!this.fechaInicio && !this.fechaFin) {
      alert('Por favor, ingresá un rango de fechas para ver los ingresos.');
      return;
    }

    // Si solo se ingresó una fecha (caso inválido)
    if (
      (this.fechaInicio && !this.fechaFin) ||
      (!this.fechaInicio && this.fechaFin)
    ) {
      alert('Por favor, ingresá ambas fechas: desde y hasta.');
      return;
    }

    let backendUrl = 'http://localhost:3001/estadisticas/montos?';
    const params: string[] = [];

    if (this.fechaInicio) {
      params.push(`fechaInicio=${this.fechaInicio}`);
    }

    if (this.fechaFin) {
      params.push(`fechaFin=${this.fechaFin}`);
    }

    backendUrl += params.join('&');

    this.http
      .get<DatosMontosDia[]>(backendUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data: DatosMontosDia[]) => {
          const labels = data.map((item) => item.dia);
          const valores = data.map((item) => item.montoTotal);
          this.renderizarGraficoMontos(labels, valores);
        },
        error: (error: any) => {
          console.error('Detalles del error:', error);

          if (error.status === 404) {
            this.renderizarGraficoMontos([], []);
          } else if (error.status === 400 && error.error?.error) {
            // Mostramos el mensaje que viene desde el backend
            alert(error.error.error);
          } else {
            alert(
              `No se pudieron cargar las estadísticas de ingresos.\nCódigo: ${error.status}`
            );
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
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ingresos diarios ($)',
            data: valores,
            fill: true,
            borderColor: 'rgba(125, 155, 15, 0.6)', // Naranja suave
            backgroundColor: 'rgba(223, 238, 168, 0.6)',
            pointBackgroundColor: 'rgb(94, 121, 0)', // Puntos en naranja fuerte
            tension: 0.3, // Línea curva
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

  renderDynamicChart(): void {
    this.http
      .get<any[]>('http://localhost:3001/estadisticas/categorias')
      .subscribe({
        next: (categorias) => {
          const labels = categorias.map((c) => c.categoria);
          const data = categorias.map((c) => c.porcentaje);

          const colores = [
            'rgba(255, 175, 26, 0.6)',
            'rgba(255, 130, 203, 0.6)',
            'rgba(134, 255, 255, 0.6)',
            'rgba(231, 255, 143, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
          ];

          // Evitar duplicar el gráfico si ya fue creado
          const existingChart = Chart.getChart('categoriaChart');
          if (existingChart) {
            existingChart.destroy();
          }

          new Chart('categoriaChart', {
            type: 'pie',
            data: {
              labels,
              datasets: [
                {
                  label: 'Porcentaje por categoría',
                  data,
                  backgroundColor: colores.slice(0, labels.length),
                  borderColor: '#fff',
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#000',
                    font: {
                      size: 14,
                    },
                  },
                },
              },
            },
          });
        },
        error: (err) => {
          console.error('Error al obtener porcentajes:', err);
        },
      });
  }
}
