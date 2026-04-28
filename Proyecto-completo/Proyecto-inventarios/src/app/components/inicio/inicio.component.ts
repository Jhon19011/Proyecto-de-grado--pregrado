import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoginServiceService } from '../../services/login-service.service';
import { AlertasService } from '../../services/alertas.service';

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
  alertas: any[] = [];
  mostrarAlertas = false;

  constructor(private router: Router, private loginService: LoginServiceService, private alertasService: AlertasService) { }

  ngOnInit() {
    this.nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
    this.apellidoUsuario = localStorage.getItem('apellido') || 'Apellidos';
    this.rol = localStorage.getItem('rol') || '';

    if (this.esAdministrador) {
      this.cargarAlertas();
    }
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
  cargarAlertas() {
    if (!this.esAdministrador) return;

    this.alertasService.listar().subscribe({
      next: (res: any) => {
        this.alertas = res;
      },
      error: err => console.error(err)
    });
  }

  marcarLeida(alerta: any) {
    if (alerta.leida) return;

    this.alertasService.marcarLeida(alerta.idalerta).subscribe(() => {
      alerta.leida = true;
    });
  }


  toggleAlertas() {
    if (!this.esAdministrador) return;

    this.mostrarAlertas = !this.mostrarAlertas;
  }

  get alertasNoLeidas() {
    return this.alertas.filter(a => !a.leida);
  }

  get esAdministrador() {
    return this.rol === 'Administrador';
  }

  logout() {
    this.loginService.logout();
  }
}
