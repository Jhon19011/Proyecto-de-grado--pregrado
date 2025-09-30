import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecuperarPassService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/usuarios';

  solicitarRecuperacion(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar`, { correo });
  }

  restablecerContrasena(token: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/restablecer`, { token, nuevaContrasena });
  }
}
