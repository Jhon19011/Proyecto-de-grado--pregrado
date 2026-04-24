import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute ,Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private servicioUsuarios: UsuarioService
  ) {}

  nombres = '';
  apellidos = '';
  correo = '';
  telefono = '';
  password = '';
  rol: number | null = null;
  sedeU: number | null = null;

  modoEdicion: boolean = false;
  idUsuario: number | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.modoEdicion = true;
        this.idUsuario = +id;

        this.servicioUsuarios.obtenerUsuario(this.idUsuario).subscribe(res => {
          const usuario = res.body || res;
          this.nombres = usuario.nombres;
          this.apellidos = usuario.apellidos;
          this.correo = usuario.correo;
          this.telefono = usuario.telefono;
          this.rol = usuario.rol;
          this.sedeU = usuario.sedeU;
        });
      }
    });
  }

  volver(){
    this.router.navigate(['inicio']);
  }

  registrar(){
    // Validación general
    if (!this.nombres || !this.apellidos || !this.correo || !this.telefono || this.rol === null || this.sedeU === null) {
      alert('Todos los campos son obligatorios');
      return;
    }

    // Validación extra para creación
    if (!this.modoEdicion && !this.password) {
      alert('La contraseña es obligatoria para crear usuario');
      return;
    }

    const data: any = {
      nombres: this.nombres,
      apellidos: this.apellidos,
      correo: this.correo,
      telefono: this.telefono,
      rol: this.rol,
      sedeU: this.sedeU
    };

    if (!this.modoEdicion) {
      // Crear usuario
      data.password = this.password;

      this.servicioUsuarios.crearUsuario(data).subscribe({
        next: () => {
          alert('Usuario registrado con éxito');
          this.router.navigate(['/usuarios']);
        },
        error: (err) => {
          console.error('Error al registrar', err);
          alert('No se pudo registrar el usuario');
        }
      });
    } else if (this.modoEdicion && this.idUsuario) {
      // Actualizar usuario
      this.servicioUsuarios.actualizarUsuario(this.idUsuario, data).subscribe({
        next: () => {
          alert("Usuario actualizado con éxito");
          this.router.navigate(['/usuarios']);
        },
        error:(err) => {
          console.error('Error al actualizar', err);
          alert('No se pudo actualizar el usuario');
        }
      });
    }
  }
}
