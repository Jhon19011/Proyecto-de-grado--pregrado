import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) { }

  exportarInventario(params: any = {}) {
    return this.http.get(`${this.apiUrl}/inventario`, {
      params,
      responseType: 'blob'
    });
  }
}
