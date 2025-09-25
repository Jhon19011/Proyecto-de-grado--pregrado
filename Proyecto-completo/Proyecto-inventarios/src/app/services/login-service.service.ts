import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api';

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { correo, password });
  }

  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
