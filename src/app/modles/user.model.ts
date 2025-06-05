/**
 * @description Interfaz que define la estructura de un objeto de Usuario.
 * Utilizada para tipar los datos de usuarios, incluyendo aquellos en la lista negra.
 */
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  dni: string;
  edad?: number;
  direccion: string;
  rol_id: number;
  rol?: {
    id: number;
    nombre: string;
  };
  // --- PROPIEDADES PARA BORRADO LÓGICO ---
  eliminado?: boolean; // True si el usuario está lógicamente eliminado
  fecha_eliminacion?: Date; // Fecha en que fue eliminado

  createdAt?: string;
  updatedAt?: string;
}
