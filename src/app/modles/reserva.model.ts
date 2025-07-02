// src/app/models/reserva.model.ts

export interface Reserva {
  id: number;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_reserva: string;
  maquina: {
    id: number;
    nombre: string;
  };
}
