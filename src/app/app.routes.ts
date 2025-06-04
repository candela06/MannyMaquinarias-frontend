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
import { ModificarMaquinaComponent } from './admin/gestion-maquinas/modificar-maquina/modificar-maquina.component'; // ¡NUEVO! Importamos el componente de modificación
import { GestionarUsuariosComponent } from './admin/gestion-usuarios/gestion-usuarios.component';
import { ListaNegraComponent } from './admin/gestion-usuarios/lista-negra/lista-negra.component';
import { adminGuard } from './guards/admin.guard';
import { eliminarUsuario } from './admin/gestion-usuarios/eliminar-usuario/eliminar-usuario.component';
//import { AsignarRol } from './admin/gestion-usuarios/asignar-rol/asignar-rol.component';
import { HistorialReservasComponent } from './reservas/historial-reservas/historial-reservas.component'; // <-- ¡Importa el nuevo componente!

export const routes: Routes = [
  { path: '', component: PantallaInicioComponent }, // ← Inicio principal
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrarComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'preguntas-frecuentes', component: SharedComponent },
  { path: 'detalle/:id', component: DetalleMaquinariaComponent },
  { path: 'mis-reservas', component: HistorialReservasComponent },

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
    path: 'admin/maquinas/modificar',
    component: ModificarMaquinaComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/usuarios/gestion',
    component: GestionarUsuariosComponent,
    canActivate: [adminGuard],
  }, // Ruta para el panel de gestión de usuarios
  {
    path: 'admin/usuarios/lista-negra',
    component: ListaNegraComponent,
    canActivate: [adminGuard],
  }, // Ruta para ver la lista negra
  {
    path: 'admin/usuarios/eliminar-usuario',
    component: eliminarUsuario,
    canActivate: [adminGuard],
  },
  //{ path: 'admin/usuarios/asignar-rol', component: AsignarRol, canActivate: [adminGuard]},
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
