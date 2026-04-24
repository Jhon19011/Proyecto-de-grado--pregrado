import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginServiceService } from '../../services/login-service.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  nombreUsuario = '';
  apellidoUsuario = '';
  rol = '';

  constructor(private router: Router, private loginService: LoginServiceService) { }

  ngOnInit() {
    this.nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
    this.apellidoUsuario = localStorage.getItem('apellido') || 'Apellidos';
    this.rol = localStorage.getItem('rol') || '';
  }

  administrarInventarios() {
    // Redirigir a la página de administración de sustancias
    this.router.navigate(['inventarios']);
  }

  listarUsuarios() {
    this.router.navigate(['usuarios']);
  }

  agregarUsuarios() {
    this.router.navigate(['registro']);
  }

  sustancias() {
    this.router.navigate(['sustancias']);
  }

  controladas() {
    this.router.navigate(['controladas']);
  }

  logout() {
    this.loginService.logout();
  }
}
