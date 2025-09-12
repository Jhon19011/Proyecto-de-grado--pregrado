import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { SustanciasComponent } from './sustancias/sustancias.component';
import { AuthGuard } from './auth.guard';
import { RegistroComponent } from './registro/registro.component';
import { UsuariosComponent } from './usuarios/usuarios.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'registro', component: RegistroComponent},
    {path: 'inicio', component: InicioComponent, canActivate: [AuthGuard]},
    {path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard]},
    {path: 'sustancias', component: SustanciasComponent, canActivate: [AuthGuard]},
    {path: '', redirectTo: '/login', pathMatch: 'full'}
];

export class AppRoutingModule { }
