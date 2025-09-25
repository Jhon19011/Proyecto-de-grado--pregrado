import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

  constructor(private router: Router) {}

  administrarInventarios(){
    // Redirigir a la página de administración de sustancias
    this.router.navigate(['inventarios']);
  }

  listarUsuarios(){
    this.router.navigate(['usuarios']);
  }

  agregarUsuarios(){
    this.router.navigate(['registro']);
  }
  sustancias(){
    this.router.navigate(['sustancias']);
  }
}
