// src/app/services/machinery.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // <-- ¡IMPORTANTE! Vuelve a importar 'of'
// import { HttpClient } from '@angular/common/http'; // Ya no es necesario si usas datos locales
import { map } from 'rxjs/operators';
import { Machinery, MachineryStatus } from '../models/machinery.model';

@Injectable({
    providedIn: 'root'
})
export class MachineryService {

    // Vuelven a estar tus datos de maquinaria definidos directamente en el servicio
    private machines: Machinery[] = [
        {
            id: 'M001',
            brand: 'Caterpillar',
            model: '420F',
            type: 'Retroexcavadora',
            pricePerDay: 150,
            availability: true,
            status: MachineryStatus.AVAILABLE,
            cancellationPolicy: 'full',
            imageUrl: '', 
            location: 'Quilmes',
            nextAvailableDate: 'Inmediato'
        },
        {
            id: 'M002',
            brand: 'Bobcat',
            model: 'S70',
            type: 'Minicargadora',
            pricePerDay: 120,
            availability: false,
            status: MachineryStatus.RESERVED,
            cancellationPolicy: 'percentage',
            imageUrl: '',
            location: 'Florencio Varela',
            nextAvailableDate: '2025-06-15'
        },
        {
            id: 'M003',
            brand: 'Dynapac',
            model: 'CA250',
            type: 'Compactadora',
            pricePerDay: 200,
            availability: false,
            status: MachineryStatus.AVAILABLE,  
            cancellationPolicy: 'full',
            imageUrl: '',
            location: 'La Plata',
            nextAvailableDate: 'No disponible'
        },
        {
            id: 'M004',
            brand: 'JLG',
            model: '20MVL',
            type: 'Plataforma Elevadora',
            pricePerDay: 180,
            availability: true,
            status: MachineryStatus.AVAILABLE,
            cancellationPolicy: 'full',
            imageUrl: '',
            location: 'La Plata',
            nextAvailableDate: 'Inmediato'
        },
        {
            id: 'M005',
            brand: 'John Deere',
            model: '310SL',
            type: 'Retroexcavadora',
            pricePerDay: 160,
            availability: true,
            status: MachineryStatus.AVAILABLE,
            cancellationPolicy: 'full',
            imageUrl: '',
            location: 'Berazategui',
            nextAvailableDate: 'Inmediato'
        }
    ];

    // La URL del backend ya no es necesaria por ahora
    // private apiUrl = 'http://localhost:3001/api/machineries';

    // ¡IMPORTANTE! Quita la inyección de HttpClient del constructor
    // Si no usas HttpClient, no lo inyectes
    // constructor(private http: HttpClient) { } // <-- ELIMINA ESTA LÍNEA

    constructor() { } // <-- Vuelve a un constructor vacío o sin parámetros

    getMachineries(): Observable<Machinery[]> {
        // Usa 'of' para retornar un Observable de tus datos locales
        return of(this.machines).pipe(
            map(machines => machines.filter(m => m.status !== MachineryStatus.OUT_OF_SERVICE))
        );
    }

    getMachineryTypes(): Observable<string[]> {
        // Usa 'of' para retornar un Observable de tus datos locales
        return of(this.machines).pipe(
            map(machines => [...new Set(machines.map(m => m.type))])
        );
    }

    getMachineryLocations(): Observable<string[]> {
        // Usa 'of' para retornar un Observable de tus datos locales
        return of(this.machines).pipe(
            map(machines => [...new Set(machines.map(m => m.location))].sort())
        );
    }
    
}