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
  // Otros campos si fueran necesarios, como createdAt, updatedAt
  createdAt?: string;
  updatedAt?: string;
}
