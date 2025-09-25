import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventariosService {
  constructor() { }

  private http = inject(HttpClient);
  private apiUrlInventarios = 'http://localhost:4000/api/inventarios';

  listarInventarios(): Observable<any> {
    return this.http.get(this.apiUrlInventarios);
  }

  obtenerInventario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlInventarios}/${id}`);
  }

  crearInventario(data: any): Observable<any> {
    return this.http.post(this.apiUrlInventarios, data);
  }

  actualizarInventario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrlInventarios}/${id}`, data);
  }

  eliminarInventario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlInventarios}/${id}`);
  }
}
