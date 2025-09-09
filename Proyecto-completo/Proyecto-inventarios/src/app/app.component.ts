import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Proyecto-inventarios';
  private http = inject(HttpClient);
  roles: any[] = [];
  apiUrl = 'http://localhost:4000/api/rol';

  ngOnInit(){
    this.listarRoles();
  }

  listarRoles() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => this.roles = data.body,
      error: (err) => console.error('Error al listar los roles:', err)
    });
  }  
}
