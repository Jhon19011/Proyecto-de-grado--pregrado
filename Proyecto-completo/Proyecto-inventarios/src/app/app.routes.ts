import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { SustanciasComponent } from './components/sustancias/sustancias.component';
import { AuthGuard } from './auth.guard';
import { RegistroComponent } from './components/registro/registro.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { InventariosComponent } from './components/inventarios/inventarios.component';
import { InventarioDetalleComponent } from './components/inventario-detalle/inventario-detalle.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'registro', component: RegistroComponent},
    {path: 'registro/:id', component: RegistroComponent},
    {path: 'inicio', component: InicioComponent, canActivate: [AuthGuard]},
    {path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard]},
    {path: 'sustancias', component: SustanciasComponent, canActivate: [AuthGuard]},
    {path: 'inventarios', component: InventariosComponent, canActivate: [AuthGuard]},
    {path: 'inventarios/:id', component: InventarioDetalleComponent, canActivate: [AuthGuard]},
    {path: '', redirectTo: '/login', pathMatch: 'full'}
];

export class AppRoutingModule { }
