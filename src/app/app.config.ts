// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; 
import { routes } from './app.routes'; // Asumiendo que tus rutas están aquí

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient() // <-- ¡AGREGA ESTO EN PROVIDERS!
  ]
};