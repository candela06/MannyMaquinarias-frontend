import { Routes } from '@angular/router';
import { PantallaInicioComponent } from './pantalla-inicial/pantalla-inicial.component';
import { LoginComponent } from './login/login.component';
import { RegistrarComponent } from './registrar/registrar.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { SharedComponent } from './shared/shared.component';
import { DetalleMaquinariaComponent } from './detalle-maquinaria/detalle-maquinaria.component';
import { RegistrarMaquinaComponent } from './admin/gestion-maquinas/registrar-maquina/registrar-maquina.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { GestionarMaquinasComponent } from './admin/gestion-maquinas/gestionar-maquinas/gestionar-maquinas.component';
import { ListarUsuariosComponent } from './admin/gestion-usuarios/listar-usuarios.component';
import { ListaNegraComponent } from './admin/gestion-usuarios/lista-negra/lista-negra.component';
import { adminGuard } from './guards/admin.guard';
import { HistorialReservasComponent } from './usuario/reservas/historial-reservas/historial-reservas.component';
import { UsuarioDashboardComponent } from './usuario/usuario.component';
import { ModificarUsuarioComponent } from './usuario/modificar-usuario/modificar-usuario.component';
import { authGuard } from './guards/auth.guard';
import { RealizarReservaComponent } from './usuario/reservas/realizar-reservas/realizar-reserva.component';
import { EstadisticasComponent } from './admin/estadisticas/estadisticas.component';
import { empleadoDashboardComponent } from './empleado/empleado-dashboard.component';
import { trabajadorGuard } from './guards/trabajador.guard';
import { ListarReservasComponent } from './empleado/reservas/listar-reservas.component';
import { FailureComponent } from './failure/failure.component';
import { SuccessComponent } from './success/success.component';
import { GestionarMaquinasTrabajadorComponent } from './empleado/gestionar-maquinas-trabajador/gestionar-maquinas-trabajador.component';
import { IniciarMantenimientoComponent } from './empleado/gestionar-maquinas-trabajador/iniciar-mantenimiento/iniciar-mantenimiento.component';

export const routes: Routes = [
  { path: '', component: PantallaInicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrarComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'preguntas-frecuentes', component: SharedComponent },
  { path: 'detalle/:id', component: DetalleMaquinariaComponent },

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

  { path: 'pagos/success', component: SuccessComponent },
  { path: 'pagos/failure', component: FailureComponent },

  // Admin
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
  },
  {
    path: 'admin/estadisticas',
    component: EstadisticasComponent,
    canActivate: [adminGuard],
  },

  // Trabajador
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
  {
    path: 'trabajador/maquinas/gestionar',
    component: GestionarMaquinasTrabajadorComponent,
    canActivate: [trabajadorGuard],
  },
  {
    path: 'trabajador/maquinas/mantenimiento/iniciar',
    component: IniciarMantenimientoComponent,
    canActivate: [trabajadorGuard],
  },

  // Fallback
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
