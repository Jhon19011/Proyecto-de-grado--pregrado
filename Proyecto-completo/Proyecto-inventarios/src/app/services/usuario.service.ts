import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor() { }

  private http = inject(HttpClient);
  private apiUrl = `http://localhost:4000/api/usuarios`;

  listarUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarUsuario(id: number, data: any): Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarUsuario(id: number): Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
