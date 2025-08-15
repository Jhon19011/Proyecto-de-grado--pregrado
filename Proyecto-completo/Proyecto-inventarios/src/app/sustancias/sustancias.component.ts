import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sustancias',
  imports: [CommonModule],
  templateUrl: './sustancias.component.html',
  styleUrl: './sustancias.component.css'
})
export class SustanciasComponent {
  constructor(private router: Router) { }

  volver(){
    // Redirigir a la página de inicio
    this.router.navigate(['inicio']);
  }
}
