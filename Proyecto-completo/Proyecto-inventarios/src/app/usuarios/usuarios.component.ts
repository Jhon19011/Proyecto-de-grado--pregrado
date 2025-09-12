import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from '../services/login-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private api = inject(LoginServiceService);
  usuarios: any[] = [];

  constructor(private router: Router){}

  ngOnInit(): void {
    this.api.listarUsuarios().subscribe({
      next: (res: any) => {
        this.usuarios = res.body || res;
      },
      error: (err) => console.error('error al obtener usuarios,', err)
    });
  }

  volver(){
    this.router.navigate(['inicio']);
  }
}
