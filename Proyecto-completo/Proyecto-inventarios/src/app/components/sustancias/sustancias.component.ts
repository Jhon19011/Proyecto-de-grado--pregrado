import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SustanciasService } from '../../services/sustancias.service';

declare var bootstrap: any;

@Component({
  selector: 'app-sustancias',
  imports: [CommonModule, FormsModule],
  templateUrl: './sustancias.component.html',
  styleUrl: './sustancias.component.css'
})
export class SustanciasComponent {
  private servicioSustancias = inject(SustanciasService);
  sustancias: any[] = [];

  // formulario
  idsustancia: number | null = null;
  numero: number | null = null;
  codigo = '';
  nombreComercial = '';
  marca = '';
  lote = '';
  CAS = '';
  clasedepeligrosegunonu = '';
  categoriaIARC = '';
  estado = '';
  fechadevencimiento = '';
  presentacion = '';
  unidad = '';
  PDF = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.listarSustancias();
  }

  listarSustancias() {
    this.servicioSustancias.listarSustancias().subscribe({
      next: (res: any) => {
        this.sustancias = res.body || res;
      },
      error: (err) => console.error('Error al listar sustancias:', err)
    });
  }

  guardarSustancia() {
    console.log("📌 guardarSustancia ejecutado", this.idsustancia);
    const data = {
      numero: this.numero,
      codigo: this.codigo,
      nombreComercial: this.nombreComercial,
      marca: this.marca,
      lote: this.lote,
      CAS: this.CAS,
      clasedepeligrosegunonu: this.clasedepeligrosegunonu,
      categoriaIARC: this.categoriaIARC,
      estado: this.estado,
      fechadevencimiento: this.fechadevencimiento,
      presentacion: this.presentacion,
      unidad: this.unidad,
      PDF: this.PDF
    };

    if (this.idsustancia) {
      this.servicioSustancias.actualizarSustancia(this.idsustancia, data).subscribe({
        next: () => {
          alert('Sustancia actualizada con éxito');
          this.listarSustancias();
          this.resetForm();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar sustancia', err)
      });
    } else {
      this.servicioSustancias.crearSustancia(data).subscribe({
        next: () => {
          alert('Sustancia creada con éxito');
          this.listarSustancias();
          this.cerrarModal();
          this.resetForm();
        },
        error: (err) => console.error('Error al crear sustancia', err)
      });
    }
  }

  cerrarModal() {
    const modalEl = document.getElementById('crearSustanciaModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
      console.log('Modal cerrado manualmente');
    }
  }

  editarSustancia(s: any) {
    this.idsustancia = s.idsustancia;
    this.numero = s.numero;
    this.codigo = s.codigo;
    this.nombreComercial = s.nombreComercial;
    this.marca = s.marca;
    this.lote = s.lote;
    this.CAS = s.CAS;
    this.clasedepeligrosegunonu = s.clasedepeligrosegunonu;
    this.categoriaIARC = s.categoriaIARC;
    this.estado = s.estado;
    this.fechadevencimiento = s.fechadevencimiento;
    this.presentacion = s.presentacion;
    this.unidad = s.unidad;
    this.PDF = s.PDF;
  }

  eliminarSustancia(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta sustancia?')) {
      this.servicioSustancias.eliminarSustancia(id).subscribe({
        next: () => {
          alert('Sustancia eliminada con éxito');
          this.listarSustancias();
        },
        error: (err) => {
          console.error('Error al eliminar sustancia', err);
        }
      });
    }
  }

  resetForm() {
    this.idsustancia = null;
    this.numero = null;
    this.codigo = '';
    this.nombreComercial = '';
    this.marca = '';
    this.lote = '';
    this.CAS = '';
    this.clasedepeligrosegunonu = '';
    this.categoriaIARC = '';
    this.estado = '';
    this.fechadevencimiento = '';
    this.presentacion = '';
    this.unidad = '';
    this.PDF = '';
  }

  volver() {
    this.router.navigate(['inicio']);
  }
}
