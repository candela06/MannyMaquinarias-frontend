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
import { GestionarMaquinasComponent } from './admin/gestion-maquinas/gestionar-maquinas/gestionar-maquinas.component'; // ¡NUEVO! Importamos el componente
import { ListarUsuariosComponent } from './admin/gestion-usuarios/listar-usuarios.component';
import { ListaNegraComponent } from './admin/gestion-usuarios/lista-negra/lista-negra.component';
import { adminGuard } from './guards/admin.guard';
//import { AsignarRol } from './admin/gestion-usuarios/asignar-rol/asignar-rol.component';
import { HistorialReservasComponent } from './usuario/reservas/historial-reservas/historial-reservas.component'; // <-- ¡Importa el nuevo componente!
import { UsuarioDashboardComponent } from './usuario/usuario.component';
import { ModificarUsuarioComponent } from './usuario/modificar-usuario/modificar-usuario.component';
import { authGuard } from './guards/auth.guard';
import { EliminarCuentaPropiaComponent } from './usuario/eliminar-usuario/eliminar-usuario.component'; // <-- ¡NUEVO!
import { RealizarReservaComponent } from './usuario/reservas/realizar-reservas/realizar-reserva.component';
import { EstadisticasComponent } from './admin/estadisticas/estadisticas.component';
import { empleadoDashboardComponent } from './empleado/empleado-dashboard.component';
import { trabajadorGuard } from './guards/trabajador.guard';
import { ListarReservasComponent } from './empleado/reservas/listar-reservas.component';
import { Component } from '@angular/core';

export const routes: Routes = [
  { path: '', component: PantallaInicioComponent }, // ← Inicio principal
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrarComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'preguntas-frecuentes', component: SharedComponent },
  { path: 'detalle/:id', component: DetalleMaquinariaComponent },
  {
    path: 'eliminar-micuenta',
    component: EliminarCuentaPropiaComponent,
    canActivate: [authGuard],
  },

  {
    path: 'mis-reservas',
    component: HistorialReservasComponent,
    canActivate: [authGuard],
  },

  {
    path: 'realizar-reserva/:id',
    component: RealizarReservaComponent,
    canActivate: [authGuard],
  },

  {
    path: 'user-dashboard',
    component: UsuarioDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'user-modificar',
    component: ModificarUsuarioComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/maquinas/registrar',
    component: RegistrarMaquinaComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/maquinas/listar',
    component: GestionarMaquinasComponent,
    canActivate: [adminGuard],
  },

  {
    path: 'admin/usuarios/listar',
    component: ListarUsuariosComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/usuarios/lista-negra',
    component: ListaNegraComponent,
    canActivate: [adminGuard],
  }, // Ruta para ver la lista negra

  {
    path: 'admin/estadisticas',
    component: EstadisticasComponent,
    canActivate: [adminGuard],
  },

  {
    path: 'trabajador-dashboard',
    component: empleadoDashboardComponent,
    canActivate: [trabajadorGuard],
  },
  {
    path: 'trabajador/reservas',
    component: ListarReservasComponent,
    canActivate: [trabajadorGuard],
  },
  //{ path: 'admin/usuarios/asignar-rol', component: AsignarRol, canActivate: [adminGuard]},
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
