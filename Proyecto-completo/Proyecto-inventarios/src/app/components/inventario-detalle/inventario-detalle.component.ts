import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { InventarioSustanciaService } from '../../services/inventario-sustancia.service';
import { SustanciasService } from '../../services/sustancias.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
declare var bootstrap: any;

@Component({
  selector: 'app-inventario-detalle',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-detalle.component.html',
  styleUrl: './inventario-detalle.component.css'
})
export class InventarioDetalleComponent implements OnInit {

  constructor(private route: ActivatedRoute, private servicioAsignacion: InventarioSustanciaService, private servicioSustancias: SustanciasService) { }

  tabla!: number;
  sustanciasAsignadas: any[] = [];
  sustanciasDisponibles: any[] = [];
  asignacionSeleccionada: any = null;
  modalRef: any;

  // para asignar
  sustancia: number | null = null;
  cantidad: number | null = null;
  cantidadremanente: number | null = null;
  gastototal: number | null = null;
  ubicaciondealmacenamiento = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tabla = +params.get('id')!;
      this.cargarSustancias();
      this.cargarDisponibles();
    });

  }

  cargarSustancias() {
    this.servicioAsignacion.listarPorInventario(this.tabla).subscribe({
      next: (res: any) => this.sustanciasAsignadas = [...(Array.isArray(res) ? res: res.body)],
      error: (err) => console.error('Error al listar sustancias asignadas:', err)
    });
  }

  cargarDisponibles() {
    this.servicioSustancias.listarSustancias().subscribe({
      next: (res: any) => this.sustanciasDisponibles = res.body || res,
      error: (err) => console.error('Error al listar sustancias disponibles:', err)
    });
  }

  asignarSustancia() {
    if (!this.sustancia || !this.cantidad || !this.cantidadremanente || !this.gastototal || !this.ubicaciondealmacenamiento) {
      alert('Todos los campos son obligatorios');
      return;
    }

    this.servicioAsignacion.asignarSustancia({
      tabla: this.tabla,
      sustancia: this.sustancia,
      cantidad: this.cantidad,
      cantidadremanente: this.cantidadremanente,
      gastototal: this.gastototal,
      ubicaciondealmacenamiento: this.ubicaciondealmacenamiento
    }).subscribe({
      next: () => {
        alert('Sustancia asignada con éxito');
        this.cargarSustancias();
        this.sustancia = null;
        this.cantidad = null;
        this.cantidadremanente = null;
        this.gastototal = null;
        this.ubicaciondealmacenamiento = '';
      },
      error: (err) => {
        console.error('Error al asignar:', err);
        alert(err.error.body || 'Error al asignar sustancia');
      }
    });
  }

  editarAsignacion(asignacion: any) {
    this.servicioAsignacion.editarAsignacion(asignacion.idinventario_sustancia, {
      cantidad: asignacion.cantidad,
      cantidadremanente: asignacion.cantidadremanente,
      gastototal: asignacion.gastototal,
      ubicaciondealmacenamiento: asignacion.ubicaciondealmacenamiento
    }).subscribe({
      next: () => {
        alert('Asignación actualizada con éxito');
        this.cargarSustancias();
      },
      error: (err) => {
        console.error('Error al actualizar asignación:', err);
        alert(err.error.body || 'Error al actalizar asignación');
      }
    });
  }

  guardarEdicion() {
    this.servicioAsignacion.editarAsignacion(this.asignacionSeleccionada.idinventario_sustancia, {
      cantidad: this.asignacionSeleccionada.cantidad,
      cantidadremanente: this.asignacionSeleccionada.cantidadremanente,
      gastototal: this.asignacionSeleccionada.gastototal,
      ubicaciondealmacenamiento: this.asignacionSeleccionada.ubicaciondealmacenamiento
    }).subscribe({
      next: () => {
        alert('Asignación actualizada con éxito');
        this.modalRef.hide();
        this.cargarSustancias();
      },
      error: (err) => {
        console.error('Error al actualizar asignación:', err);
        alert(err.error.body || 'Error al actualizar asignación');
      }
    });
  }

  abrirEdicion(asignacion: any) {
    this.asignacionSeleccionada = { ...asignacion };
    const modal = document.getElementById('modalEdicion');
    this.modalRef = new bootstrap.Modal(modal!);
    this.modalRef.show();
  }

  eliminarAsignacion(id: number) {
    if (confirm('¿Seguro que desea eliminar esta sustancia del inventario?')) {
      this.servicioAsignacion.eliminarAsignacion(id).subscribe({
        next: () => {
          alert('sustancia eliminada con éxito');
          this.cargarSustancias();
        },
        error: (err) => {
          console.error('Error al eliminar asignación:', err);
          alert(err.error.body || 'Error al eliminar asignación');
        }
      });
    }
  }
}
