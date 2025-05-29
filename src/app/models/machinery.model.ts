// src/app/models/machinery.model.ts

export enum MachineryStatus {
  DISPONIBLE = 'disponible',
  ENTREGADO = 'entregado',
  EN_MANTENIMIENTO = 'en mantenimiento',
  CHECKEO = 'checkeo',
  // Si tu backend usa 'reservado', agrégalo aquí:
  // RESERVADO = 'reservado',
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  // Añade cualquier otra propiedad de la sucursal que tu backend envíe
}

export interface Machinery {
  id: number;
  nombre: string; // Tipo de maquinaria (ej. "Excavadora")
  marca: string;
  modelo: string;
  estado: MachineryStatus;
  precio: number;

  // Propiedades del backend (confirmadas por Postman y tus comentarios)
  createdAt?: string;
  updatedAt?: string;
  deletedAt: string | null; // Es importante que sea 'string | null'

  // Propiedades que deberías confirmar si tu backend las envía:
  imageUrl: string; // Si no la envía, el frontend debe manejar un placeholder
  description: string;
  cancellationPolicy: string;
  sucursal: Sucursal; // Debe ser el objeto Sucursal completo
  nextAvailableDate: string | null; // Debe ser string para fechas ISO del backend o null
}
