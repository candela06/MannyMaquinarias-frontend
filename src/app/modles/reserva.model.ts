// src/app/models/reserva.model.ts

import { Machinery } from './machinery.model'; // Asume que ya tienes este modelo

/**
 * @description Interfaz que define la estructura de una Reserva.
 * Incluye los detalles de la máquina asociada.
 */
export interface Reserva {
  id: number;
  precio: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  maquina_id: number;
  usuario_id: number;
  createdAt: string;
  updatedAt: string;
}
