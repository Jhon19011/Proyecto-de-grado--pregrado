import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventarioService } from '../../services/inventarios.service';

declare var bootstrap: any;

@Component({
  selector: 'app-inventarios',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventarios.component.html',
  styleUrl: './inventarios.component.css'
})
export class InventariosComponent {
  private servicioInventarios = inject(InventarioService);
  inventarios: any[] = [];
  rol = localStorage.getItem('rol') || '';

  // formulario
  idtablas: number | null = null;
  nombretabla = '';
  principal: boolean = false;
  modalInventario: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.listarInventarios();
  }

  listarInventarios() {
    this.servicioInventarios.listarInventarios().subscribe({
      next: (res: any) => {
        this.inventarios = res.body || res;
      },
      error: (err: any) => console.error('Error al listar inventarios:', err)
    });
  }

  guardarInventario() {
    const data = {
      nombretabla: this.nombretabla,
      principal: this.principal
    };

    if (this.idtablas) {
      // actualizar inventario
      this.servicioInventarios.editarInventario(this.idtablas, data).subscribe({
        next: () => {
          alert('Inventario actualizado con éxito');
          this.listarInventarios();
          this.resetForm();
          this.cerrarModalInventario();
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
          this.cerrarModalInventario();
        },
        error: (err) => {
          console.error('Error al crear inventario', err);

          // Si el error es un string se parsea
          let mensaje = 'Error inesperado al crear inventario';

          if (err.error) {
            if (typeof err.error === 'string') {
              try {
                const parsed = JSON.parse(err.error);
                mensaje = parsed.body || mensaje;
              } catch {
                mensaje = err.error; // Si no es JSON se muestra tal cual
              }
            } else if (err.error.body) {
              mensaje = err.error.body;
            }
          }
          alert(mensaje);
        }
      });
    }
  }

  eliminarInventario(id: number) {
    const confirmacion = confirm(
      '¿Está seguro que desea eliminar este inventario?'
    );

    if (!confirmacion) return;

    this.servicioInventarios.eliminarInventario(id).subscribe({
      next: () => {
        alert('Inventario eliminado correctamente');
        this.listarInventarios();
      },
      error: (err) => {
        console.error(err);
        alert(err.error.body || 'No se pudo eliminar el inventario');
      }
    });
  }

  resetForm() {
    this.idtablas = null;
    this.nombretabla = '';
    this.principal = false;
  }

  abrirCrearInventario() {
    this.resetForm();
    this.abrirModalInventario();
  }

  abrirEditarInventario(inv: any) {
    this.idtablas = inv.idtablas;
    this.nombretabla = inv.nombretabla;
    this.principal = !!inv.principal;
    this.abrirModalInventario();
  }

  abrirModalInventario() {
    const modalEl = document.getElementById('modalInventario');
    if (!modalEl) return;

    this.modalInventario = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    this.modalInventario.show();
  }

  cerrarModalInventario() {
    const modalEl = document.getElementById('modalInventario');
    const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;

    modal?.hide();
  }

  volver() {
    this.router.navigate(['inicio']);
  }
}
