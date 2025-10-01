import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api';

  constructor(private router: Router) { }

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { correo, password })
      .pipe(
        tap((res: any) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('rol', res.rol);
          localStorage.setItem('correo', res.usuario.correo);
          localStorage.setItem('nombre', res.usuario.nombre);
          localStorage.setItem('apellido', res.usuario.apellido);
          localStorage.setItem('telefono', res.usuario.telefono || '');
        })
      );
  }

  getRol() {
    return localStorage.getItem('rol');
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('correo');
    this.router.navigate(['/login']);
  }
}
