import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = 'http://localhost:4000/api/rol';

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
