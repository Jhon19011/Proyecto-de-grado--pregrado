import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioSustanciaService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:4000/api/inventario_sustancias'

  listarPorInventario(inventarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${inventarioId}`);
  }

  asignarSustancia(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarAsignacion(id: number, data: any):Observable<any>{
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarAsignacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
