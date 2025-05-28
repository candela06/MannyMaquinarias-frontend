// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http'; // ¡Importa esto!
import { MachineryService } from './app/services/machinery.service'; // ¡Importa tu servicio!
import { provideRouter } from '@angular/router'; // Si usas enrutamiento, ya debería estar
import { routes } from './app/app.routes'; // Tus rutas, si las tienes

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // PROPORCIONA EL CLIENTE HTTP
    provideRouter(routes), // Asegúrate de que tus rutas también estén aquí
    MachineryService, // PROPORCIONA TU SERVICIO
  ],
}).catch((err) => console.error(err));
