import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventarioSustanciaService {

  constructor(private http: HttpClient) { }
  baseUrl = environment.apiUrl;
  private apiUrl = 'http://localhost:4000/api/inventario_sustancias';
  private apiUrlMov = 'http://localhost:4000/api/movimientos';


  listarPorInventario(
    inventarioId: number,
    page: number,
    limit: number,
    filtros: any = {}
  ): Observable<any> {

    let params: any = {
      page,
      limit
    };

    if (filtros.sustancia) params.sustancia = filtros.sustancia;
    if (filtros.codigo) params.codigo = filtros.codigo;
    if (filtros.ubicacion) params.ubicacion = filtros.ubicacion;
    if (filtros.cedula) params.cedula = filtros.cedula;
    if (filtros.estado_uso) params.estado_uso = filtros.estado_uso;
    if (filtros.unidad) params.unidad = filtros.unidad;
    if (filtros.lote) params.lote = filtros.lote;
    if (filtros.fecha_vencimiento) params.fecha_vencimiento = filtros.fecha_vencimiento;
    if (
      filtros.esControlada !== undefined &&
      filtros.esControlada !== null &&
      filtros.esControlada !== ''
    ) {
      params.esControlada = filtros.esControlada;
    }

    return this.http.get(`${this.apiUrl}/${inventarioId}`, { params });
  }

  crearAsignacion(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  trasladarSustancia(data: any) {
    return this.http.post(`${this.apiUrlMov}/trasladar`, data);
  }

  editarAsignacion(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarAsignacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
