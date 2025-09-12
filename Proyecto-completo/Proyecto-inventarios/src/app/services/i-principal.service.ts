import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IPrincipalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api';

  constructor() { }

  listarSustancias(){
    return this.http.get(`${this.apiUrl}/sustancia`);
  }
}
