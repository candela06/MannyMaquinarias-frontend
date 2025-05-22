// src/app/routes.ts
import { Routes } from '@angular/router';

// Importa aquí los componentes que vamos a crear en los siguientes pasos
import { CatalogListComponent } from './catalog/catalog-list/catalog-list.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component'; // Añadimos este para la ruta de registro
import { FaqComponent } from './shared/faq/faq.component'; // Añadimos este para la ruta de preguntas frecuentes
import { ContactComponent } from './shared/contact/contact.component'; // Añadimos este para la ruta de contacto

export const routes: Routes = [
    { path: '', redirectTo: '/catalogo', pathMatch: 'full' }, // Redirige a la página principal
    { path: 'catalogo', component: CatalogListComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegisterComponent }, // Ruta para el componente de registro
    { path: 'preguntas-frecuentes', component: FaqComponent }, // Ruta para el componente de FAQ
    { path: 'contacto', component: ContactComponent }, // Ruta para el componente de contacto

    // Más rutas se añadirán aquí a medida que desarrollemos funcionalidades específicas
    // Por ejemplo:
    // { path: 'maquinaria/:id', component: MachineryDetailComponent },
    // { path: 'mi-historial', component: MyBookingsComponent },
    // { path: 'empleado', children: [ ... ] },
    // { path: 'dueño', children: [ ... ] },

    // Ruta wildcard para manejar rutas no encontradas (siempre al final)
    // { path: '**', component: NotFoundComponent } // Lo añadiremos más adelante
];