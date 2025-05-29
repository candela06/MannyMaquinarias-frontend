// src/app/models/machinery.model.ts

export enum MachineryStatus {
    DISPONIBLE = 'disponible',
    ENTREGADO = 'entregado',
    EN_MANTENIMIENTO = 'en mantenimiento',
    CHECKEO = 'checkeo',
    // falta el estado 'reservado'
  }
  
  export interface Machinery {
    id: number;
    nombre: string;
    marca: string;
    modelo: string;
    estado: MachineryStatus;
    precio: number;
  
    // Estas son propiedades que el backend incluirá automáticamente si timestamps: true
    createdAt?: string; // Fechas como string 'YYYY-MM-DDTHH:mm:ss.sssZ'
    updatedAt?: string; // O Date si vas a parsearlas
    deletedAt?: string | null; // Para borrado lógico, puede ser null
  
    // Propiedades que el frontend usaba pero no existen directamente en el modelo Maquina de Sequelize
    // Las marcamos como opcionales (con ?) y las manejaremos con valores por defecto o derivadas
    // Si en el futuro el backend las provee (ej. a través de includes o nuevas columnas),
    // las haremos obligatorias.
  
    // 'location' del frontend probablemente sea 'sucursal.nombre' del backend
    // Si el backend incluye la sucursal, el JSON se verá así:
    // "sucursal": { "id": 1, "nombre": "Sucursal Centro", "direccion": "..." }
    sucursal?: {
      id: number;
      nombre: string;
      direccion: string;
    };
  
    // Otros campos que podrían ser necesarios si el backend los provee o se derivan
    // Si necesitas estos, y no están en el modelo Maquina, el BE debe añadirlos.
    imageUrl?: string; // Para mostrar una imagen en el frontend
    description?: string;
    availability?: boolean; // Puede derivarse de `estado === 'disponible'`
    isDeleted?: boolean; // Puede derivarse de `deletedAt !== null`
    cancellationPolicy?: string; // Si se relaciona con PoliticaCancelacion, el BE debe incluirla.
    nextAvailableDate?: string | null; // Si se relaciona con Reservas, el BE debe incluirlas.
  }