import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiUrl}/rol`;

  constructor(private http: HttpClient) { }

  listarRoles(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  listarRol(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearRol(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
