import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginServiceService } from '../services/login-service.service';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  private auth = inject(LoginServiceService);
  nombres = '';
  apellidos = '';
  correo = '';
  telefono = '';
  password = '';
  rol: number | null = null;
  sedeU: number | null = null;

  constructor(private router: Router) {}

  volver(){
    this.router.navigate(['inicio']);
  }

  registrar(){
    if(!this.nombres || !this.apellidos || !this.correo || !this.telefono || !this.password || !this.rol === null || !this.sedeU === null){
      alert('Los campos son obligatorios');
      return;
    }

    this.auth.registrar(this.nombres, this.apellidos, this.correo, this.telefono, this.password, this.rol!, this.sedeU!).subscribe({
      next: (res) => {
        console.log('Usuario registrado', res);
        alert('usuario registrado con exito');
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('Error al registrar', err);
        alert('No se pudo registrar el usuario');
      }
    });
  }
}
