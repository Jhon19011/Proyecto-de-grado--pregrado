import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private apiUrl = 'http://localhost:4000/api/reportes';

  constructor(private http: HttpClient) { }

  exportarInventario() {
    return this.http.get(`${this.apiUrl}/inventario`, {
      responseType: 'blob'
    });
  }
}
