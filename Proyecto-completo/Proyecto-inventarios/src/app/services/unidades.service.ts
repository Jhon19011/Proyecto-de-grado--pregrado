import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnidadesService {

  private http = inject(HttpClient);

  constructor() { }

  listar(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/unidades`);
  }

  crear(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/unidades`, data);
  }

  eliminar(id: number) {
    return this.http.delete(`${environment.apiUrl}/unidades/${id}`);
  }
}
