import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MachineryService } from '../services/machinery.service';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()), // SOLO FEATURES DE HIDRATACION
    provideHttpClient(withInterceptors([authInterceptor])), // Usa withInterceptors para registrar tu interceptor funcional
    MachineryService, // PROVEEDOR DEL SERVICIO
  ],
};
