import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private servicioUsuario = inject(UsuarioService);
  usuarios: any[] = [];

  constructor(private router: Router){}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(){
    this.servicioUsuario.listarUsuarios().subscribe({
      next: (res: any) => {
        this.usuarios = res.body || res;
      },
      error: (err) => console.error('Error al obtener usuarios:', err)
    });
  }

  editarUsuario(usuario: any){
    console.log('Editar usuario: ', usuario);
  }

  eliminarUsuario(id: number){
    if(confirm('¿Seguro que deseas eliminar este usuario?')){
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

  volver(){
    this.router.navigate(['inicio']);
  }
}
