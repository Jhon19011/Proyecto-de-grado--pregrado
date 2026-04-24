import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private servicioUsuario = inject(UsuarioService);  
  usuarios: any[] = [];
  filtro: any = {};
  mostrarFiltros = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.servicioUsuario.listarUsuarios().subscribe({
      next: (res: any) => {
        this.usuarios = res.body || res;
      },
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
  }

  editarUsuario(usuario: any) {
    console.log('Editar usuario: ', usuario);
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.servicioUsuario.eliminarUsuario(id).subscribe({
        next: () => {
          alert('Usuario eliminado satisfactoriamente');
          this.usuarios = this.usuarios.filter(u => u.idUsuario !== id);
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('No se pudo eliminar el usuario');
        }
      });
    }
  }

  buscarUsuarios() {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtro).filter(([_, v]) => v !== null && v !== '')
    );

    this.servicioUsuario.buscarUsuarios(filtrosLimpios).subscribe({
      next: (res: any) => {
        this.usuarios = res.body || res;
      },
      error: (err) => console.error('Error al buscar usuarios:', err)
    });
  }

  limpiarFiltros() {
    this.filtro = {};
    this.cargarUsuarios();
  }

  toggleFiltros() {
  this.mostrarFiltros = !this.mostrarFiltros;
}

  volver() {
    this.router.navigate(['inicio']);
  }
}
