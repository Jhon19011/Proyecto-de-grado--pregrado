import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-perfil',
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent {
  nombres = localStorage.getItem('nombre') || '';
  apellidos = localStorage.getItem('apellido') || '';
  correo = localStorage.getItem('correo') || '';
  telefono = localStorage.getItem('telefono') || '';;

  constructor(private http: HttpClient, private router: Router){}

  guardar() {
    const token = localStorage.getItem('token');

    this.http.put('http://localhost:4000/api/usuarios/perfil', {
      nombres: this.nombres,
      apellidos: this.apellidos,
      correo: this.correo,
      telefono: this.telefono
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        alert(res.body.mensaje);
        localStorage.setItem('nombre', this.nombres);
        localStorage.setItem('apellido', this.apellidos);
        localStorage.setItem('correo', this.correo);
        localStorage.setItem('telefono', this.telefono);
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar perfil');
      }
    });
  }
}
