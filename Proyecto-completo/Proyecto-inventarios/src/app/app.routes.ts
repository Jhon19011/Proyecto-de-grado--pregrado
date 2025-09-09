import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { LoginComponent } from './login/login.component';
import { SustanciasComponent } from './sustancias/sustancias.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'inicio', component: InicioComponent, canActivate: [AuthGuard]},
    {path: 'sustancias', component: SustanciasComponent, canActivate: [AuthGuard]},
    {path: '', redirectTo: '/login', pathMatch: 'full'}
];

export class AppRoutingModule { }
