// src/app/services/machinery.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // 'of' ya no será necesario si tengo todo por HTTP
import { HttpClient } from '@angular/common/http'; // <-- ¡IMPORTANTE! Importa HttpClient
import { map } from 'rxjs/operators'; // <-- Necesario para el operador map si filtro en frontend
import { Machinery, MachineryStatus } from '../models/machinery.model';

@Injectable({
    providedIn: 'root'
})
export class MachineryService {


    // private machines: Machinery[] = [
    //     {
    //         id: 'M001',
    //         brand: 'Caterpillar',
    //         model: '420F',
    //         type: 'Retroexcavadora',
    //         pricePerDay: 150,
    //         availability: true,
    //         status: MachineryStatus.AVAILABLE,
    //         cancellationPolicy: 'full',
    //         imageUrl: '', 
    //         location: 'Quilmes',
    //         nextAvailableDate: 'Inmediato'
    //     },
    //     {
    //         id: 'M002',
    //         brand: 'Bobcat',
    //         model: 'S70',
    //         type: 'Minicargadora',
    //         pricePerDay: 120,
    //         availability: false,
    //         status: MachineryStatus.RESERVED,
    //         cancellationPolicy: 'percentage',
    //         imageUrl: '',
    //         location: 'Florencio Varela',
    //         nextAvailableDate: '2025-06-15'
    //     },
    //     {
    //         id: 'M003',
    //         brand: 'Dynapac',
    //         model: 'CA250',
    //         type: 'Compactadora',
    //         pricePerDay: 200,
    //         availability: false,
    //         status: MachineryStatus.AVAILABLE,  
    //         cancellationPolicy: 'full',
    //         imageUrl: '',
    //         location: 'La Plata',
    //         nextAvailableDate: 'No disponible'
    //     },
    //     {
    //         id: 'M004',
    //         brand: 'JLG',
    //         model: '20MVL',
    //         type: 'Plataforma Elevadora',
    //         pricePerDay: 180,
    //         availability: true,
    //         status: MachineryStatus.AVAILABLE,
    //         cancellationPolicy: 'full',
    //         imageUrl: '',
    //         location: 'La Plata',
    //         nextAvailableDate: 'Inmediato'
    //     },
    //     {
    //         id: 'M005',
    //         brand: 'John Deere',
    //         model: '310SL',
    //         type: 'Retroexcavadora',
    //         pricePerDay: 160,
    //         availability: true,
    //         status: MachineryStatus.AVAILABLE,
    //         cancellationPolicy: 'full',
    //         imageUrl: '',
    //         location: 'Berazategui',
    //         nextAvailableDate: 'Inmediato'
    //     }
    // ];

    // **IMPORTANTE**: Define la URL del backend aquí.
    // Confirma con mis compañero el puerto y el endpoint exacto para las maquinarias.
    // El puerto más común para un backend Node.js es 3001. El endpoint para una lista
    // de recursos suele ser algo como '/machineries' o '/api/machineries'.
    private apiUrl = 'http://localhost:3001/api/machineries';

    // Inyecta HttpClient en el constructor
    constructor(private http: HttpClient) { }

    getMachineries(): Observable<Machinery[]> {

        return this.http.get<Machinery[]>(this.apiUrl).pipe(
            map(machines => machines.filter(m => m.status !== MachineryStatus.OUT_OF_SERVICE))
        );
    }


    getMachineryTypes(): Observable<string[]> {
        return this.http.get<Machinery[]>(this.apiUrl).pipe(
            map(machines => [...new Set(machines.map(m => m.type))])
        );
    }

    getMachineryLocations(): Observable<string[]> {
        return this.http.get<Machinery[]>(this.apiUrl).pipe(
            map(machines => [...new Set(machines.map(m => m.location))].sort())
        );
    }
}