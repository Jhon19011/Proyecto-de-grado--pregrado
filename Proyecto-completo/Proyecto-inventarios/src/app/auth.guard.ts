import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginServiceService } from './services/login-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: LoginServiceService, private router: Router) {}

  canActivate(): boolean {
    const token = this.auth.obtenerToken();

    if (token) {
      return true; // si hay token, deja pasar
    } else {
      this.router.navigate(['/login']); // redirige al login
      return false;
    }
  }
}
