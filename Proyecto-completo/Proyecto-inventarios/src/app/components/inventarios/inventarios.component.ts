import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventariosService } from '../../services/inventarios.service';

@Component({
  selector: 'app-inventarios',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventarios.component.html',
  styleUrl: './inventarios.component.css'
})
export class InventariosComponent {
  private servicioInventarios = inject(InventariosService);
  inventarios: any[] = [];

  // formulario
  idtablas: number | null = null;
  nombretabla = '';
  sedeT: number | null = null;
  principal: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.listarInventarios();
  }

  listarInventarios() {
    this.servicioInventarios.listarInventarios().subscribe({
      next: (res: any) => {
        this.inventarios = res.body || res;
      },
      error: (err) => console.error('Error al listar inventarios:', err)
    });
  }

  guardarInventario() {
    const data = {
      nombretabla: this.nombretabla,
      sedeT: this.sedeT,
      principal: this.principal
    };

    if (this.idtablas) {
      // actualizar inventario
      this.servicioInventarios.actualizarInventario(this.idtablas, data).subscribe({
        next: () => {
          alert('Inventario actualizado con éxito');
          this.listarInventarios();
          this.resetForm();
        },
        error: (err) => console.error('Error al actualizar inventario', err)
      });
    } else {
      // crear inventario
      this.servicioInventarios.crearInventario(data).subscribe({
        next: () => {
          alert('Inventario creado con éxito');
          this.listarInventarios();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error al crear inventario', err);

          // Si el error es un string se parsea
          let mensaje = 'Error inesperado al crear inventario';

          if(err.error){
            if(typeof err.error === 'string'){
              try {
                const parsed = JSON.parse(err.error);
                mensaje = parsed.body || mensaje;
              } catch {
                mensaje = err.error; // Si no es JSON se muestra tal cual
              }
            } else if (err.error.body){
              mensaje = err.error.body;
            }
          }
          alert(mensaje);
        }
      });
    }
  }

  eliminarInventario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este inventario?')) {
      this.servicioInventarios.eliminarInventario(id).subscribe({
        next: () => {
          alert('Inventario eliminado con éxito');
          this.listarInventarios();
        },
        error: (err) => console.error('Error al eliminar inventario', err)
      });
    }
  }

  resetForm() {
    this.idtablas = null;
    this.nombretabla = '';
    this.sedeT = null;
    this.principal = false;
  }

  volver() {
    this.router.navigate(['inicio']);
  }
}
