import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IPrincipalService } from '../services/i-principal.service';

@Component({
  selector: 'app-sustancias',
  imports: [CommonModule],
  templateUrl: './sustancias.component.html',
  styleUrl: './sustancias.component.css'
})
export class SustanciasComponent {
  constructor(private router: Router) { }

  private api = inject(IPrincipalService);
  sustancias: any[] = [];

  ngOnInit(): void{
    this.api.listarSustancias().subscribe({
      next: (res: any) => {
        this.sustancias = res.body || res;
      },
      error: (err) => console.error('error al obtener sustancias', err)
    });
  }

  volver(){
    // Redirigir a la página de inicio
    this.router.navigate(['inicio']);
  }
}
