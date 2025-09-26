import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:4000/api/movimientos';

  registrarMovimiento(data: any): Observable<any>{
    return this.http.post(this.apiUrl, data);
  }

  listarMovimientos(invenatiosSustanciaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${invenatiosSustanciaId}`);
  }
}
