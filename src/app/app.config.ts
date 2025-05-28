// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ¡Importa esto!

import { routes } from './app.routes';
import { MachineryService } from './services/machinery.service'; // ¡Importa tu servicio!

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // PROPORCIONA EL CLIENTE HTTP
    MachineryService, // PROPORCIONA TU SERVICIO
  ],
};
