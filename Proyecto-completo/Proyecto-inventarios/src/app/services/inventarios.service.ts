import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private apiUrl = 'http://localhost:4000/api/inventarios';

  constructor(private http: HttpClient) {}

  // Listar todos los inventarios (principal + secundarios)
  listarInventarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Listar solo inventarios secundarios
  listarSecundarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/secundarios`);
  }

  // Obtener un inventario específico (por ID)
  obtenerInventario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo inventario
  crearInventario(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Editar un inventario
  editarInventario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar un inventario
  eliminarInventario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
