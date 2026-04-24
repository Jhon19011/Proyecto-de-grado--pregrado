import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api/movimientos';

  listarMovimientos(idInventarioSustancia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idInventarioSustancia}`);
  }

  registrarMovimiento(data: any): Observable<any> {
    // para el principal
    return this.http.post(this.apiUrl, data);
  }

  registrarMovimientoSecundario(data: any): Observable<any> {
    // para los secundarios
    return this.http.post(`${this.apiUrl}/secundario`, data);
  }
}
