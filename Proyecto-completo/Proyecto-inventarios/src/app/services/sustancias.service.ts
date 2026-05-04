import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SustanciasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/sustancias`;

  constructor() { }

  listarSustancias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  listarSustanciasPaginadas(page: number, limit: number): Observable<any> {
    return this.http.get(this.apiUrl, { params: { page, limit } });
  }

  obtenerSustancia(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearSustancia(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarSustancia(id: number, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarSustancia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  listarControladas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/controladas`);
  }

  actualizarAutorizacion(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/autorizacion`, data);
  }

  buscarSustancias(filtros: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar`, { params: filtros });
  }

  buscarSustanciasPaginadas(filtros: any, page: number, limit: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/buscar`, {
      params: {
        ...filtros,
        page,
        limit
      }
    });
  }

  buscarControladas(filtros: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/controladas/buscar`, { params: filtros });
  }

}
