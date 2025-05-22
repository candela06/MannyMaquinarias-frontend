// src/app/models/booking.model.ts

export interface Booking {
    id: string;
    clientId: string;
    machineryId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    paymentMethod: string;
    cancellationStatus?: 'pending' | 'cancelled' | 'refunded';
    qualityRating?: number;
    type?: string;
    bookingDate: string;
}