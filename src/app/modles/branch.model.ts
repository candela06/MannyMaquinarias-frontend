// src/app/models/branch.model.ts

/**
 * @description Interfaz que define la estructura de una Sucursal en el frontend,
 * reflejando el modelo del backend (sin campo 'nombre' para la sucursal misma).
 */
export interface Branch {
  id?: number; // El ID es opcional al crear una nueva sucursal (se autogenera en el backend), y es numérico.
  localidad: string; // La localidad es un string directamente en el modelo de sucursal del backend.
  telefono: string; // Campo existente del backend
  direccion: string; // Campo existente del backend
}
