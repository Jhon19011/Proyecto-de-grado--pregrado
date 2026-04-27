import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  private apiUrl = `${environment.apiUrl}/alertas`;

  constructor(private http: HttpClient) { }

  listar() {
    return this.http.get(this.apiUrl);
  }

  marcarLeida(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/leida`, {});
  }
}
