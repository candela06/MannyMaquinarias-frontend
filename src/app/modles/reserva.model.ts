// src/app/models/reserva.model.ts

export interface Reserva {
  id: number;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_reserva: string;
  pagada: boolean;
  maquina: {
    id: number;
    nombre: string;
  };
  usuario: {
    id: number;
    email: string;
    apellido: string;
  };
}
