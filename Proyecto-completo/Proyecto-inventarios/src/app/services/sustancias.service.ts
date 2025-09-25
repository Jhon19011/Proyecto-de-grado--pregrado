import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SustanciasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/sustancias';

  constructor() { }

  listarSustancias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerSustancia(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearSustancia(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarSustancia(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarSustancia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
