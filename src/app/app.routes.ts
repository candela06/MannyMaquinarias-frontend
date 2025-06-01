// src/app/routes.ts
import { Routes } from '@angular/router';
import { PantallaInicioComponent } from './pantalla-inicial/pantalla-inicial.component';
import { LoginComponent } from './login/login.component';
import { RegistrarComponent } from './registrar/registrar.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { SharedComponent } from './shared/shared.component';
import { DetalleMaquinariaComponent } from './detalle-maquinaria/detalle-maquinaria.component';
import { RegistrarMaquinaComponent } from './admin/gestion-maquinas/registrar-maquina/registrar-maquina.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: PantallaInicioComponent }, // ← Inicio principal
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrarComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'preguntas-frecuentes', component: SharedComponent },
  { path: 'detalle/:id', component: DetalleMaquinariaComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin/maquinas/registrar', component: RegistrarMaquinaComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
