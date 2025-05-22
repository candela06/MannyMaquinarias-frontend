// src/app/models/machinery.model.ts

export enum MachineryStatus {
    RESERVED = 'Reservada',
    DELIVERED = 'Entregada',
    OUT_OF_SERVICE = 'Fuera de Servicio',
    AVAILABLE = 'Disponible'
}

export interface Machinery {
    id: string;
    brand: string;
    model: string;
    type: string;
    pricePerDay: number;
    availability: boolean;
    status: MachineryStatus;
    cancellationPolicy: 'full' | 'percentage';
    lastMaintenance?: string;
    imageUrl: string;
    // --- NUEVAS PROPIEDADES ---
    location: string; // Nueva propiedad para la localidad (ej. 'Buenos Aires', 'Córdoba')
    // Para una implementación real de fechas, se usaría un tipo de dato de fecha:
    // availableDateRanges?: { startDate: string; endDate: string; }[];
    // Por ahora, para simplificar el mock, solo un indicador de disponibilidad futura
    nextAvailableDate?: string; // Ejemplo: '2025-06-01'
}