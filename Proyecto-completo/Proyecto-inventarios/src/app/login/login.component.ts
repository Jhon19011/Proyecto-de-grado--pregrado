import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { LoginServiceService } from '../services/login-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth = inject(LoginServiceService);
  correo = '';
  password = '';

  constructor(private router: Router) { }

  login() {

    if (!this.correo || !this.password) {
      alert('Todos los campos son obligatorios');
      return;
    }

    console.log('Intentando logearse con:', this.correo, this.password);

    this.auth.login(this.correo, this.password).subscribe({
      next: (res) => {
        console.log('Respuesta del servidor:', res); //respuesta completa
        if (res && res.token) {
          this.auth.guardarToken(res.token);
          console.log('Usuario autenticado:', res.usuario);
          this.router.navigate(['/inicio']);
        } else {
          console.error("Respuesta sin token:", res);
          alert('Error en la autenticación');
        }
      },
      error: (err) => {
        console.error('Error al logearse:', err);
        let mensaje = 'Error en el servidor';
        if (err.error?.mensaje) {
          mensaje = err.error.mensaje;
        } else if (err.error?.body) {
          mensaje = err.error.body;
        }
        alert(`Error al iniciar sesión: ${mensaje}`);
      }
    });
  }
}
