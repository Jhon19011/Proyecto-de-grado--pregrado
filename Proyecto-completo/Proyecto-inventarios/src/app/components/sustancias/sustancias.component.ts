import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SustanciasService } from '../../services/sustancias.service';
import { UnidadesService } from '../../services/unidades.service';
import { environment } from '../../../environments/environment';

declare var bootstrap: any;

@Component({
  selector: 'app-sustancias',
  imports: [CommonModule, FormsModule],
  templateUrl: './sustancias.component.html',
  styleUrl: './sustancias.component.css'
})
export class SustanciasComponent {

  @ViewChild('pdfSeguridadInput') pdfSeguridadInput!: ElementRef;
  @ViewChild('pdfTecnicoInput') pdfTecnicoInput!: ElementRef;

  private servicioSustancias = inject(SustanciasService);
  sustancias: any[] = [];
  baseUrl = environment.apiUrl;
  pdfSeguridadNombre = '';
  pdfTecnicoNombre = '';
  pdfSeguridadActual: string = '';
  pdfTecnicoActual: string = '';
  eliminarPdfSeguridad: boolean = false;
  eliminarPdfTecnico: boolean = false;
  unidades: any[] = [];
  nuevaUnidad: string = '';
  mostrarInputUnidad: boolean = false;

  filtro: any = {
    numero: '',
    nombreComercial: '',
    codigo: '',
    CAS: '',
    marca: '',
    lote: '',
    clasedepeligrosegunonu: '',
    categoriaIARC: '',
    estado: '',
    fechadevencimiento: '',
    presentacion: '',
    unidad: '',
    esControlada: ''
  };

  mostrarFiltros = false;

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
  unidad: number | null = null;
  pdfSeguridadFile: File | null = null;
  pdfTecnicoFile: File | null = null;
  PDF = '';
  esControlada: number | null = null;

  constructor(private router: Router, private servcicioUnidades: UnidadesService) { }

  ngOnInit(): void {
    this.listarSustancias();
    this.cargarUnidades();
  }

  listarSustancias() {
    this.servicioSustancias.listarSustancias().subscribe({
      next: (res: any) => {
        this.sustancias = res.body || res;
      },
      error: (err) => console.error('Error al listar sustancias:', err)
    });
  }

  buscarConFiltros() {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtro).filter(([_, v]) => v !== null && v !== '')
    );

    // Si no hay filtros, listar todo
    if (Object.keys(filtrosLimpios).length === 0) {
      this.listarSustancias();
      return;
    }

    this.servicioSustancias.buscarSustancias(filtrosLimpios).subscribe({
      next: (res: any) => {
        this.sustancias = res.body || res;
        console.log("Resultado filtro:", this.sustancias);
      },
      error: (err) => console.error('Error al buscar sustancias:', err)
    });
  }

  limpiarFiltros() {
    this.filtro = {
      numero: '',
      nombreComercial: '',
      codigo: '',
      CAS: '',
      marca: '',
      lote: '',
      clasedepeligrosegunonu: '',
      categoriaIARC: '',
      estado: '',
      fechadevencimiento: '',
      presentacion: '',
      unidad: '',
      esControlada: ''
    };

    this.listarSustancias();
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  guardarSustancia() {
    console.log("📌 guardarSustancia ejecutado", this.idsustancia);

    const formData = new FormData();

    formData.append('numero', this.numero?.toString() || '');
    formData.append('codigo', this.codigo);
    formData.append('nombreComercial', this.nombreComercial);
    formData.append('marca', this.marca);
    formData.append('lote', this.lote);
    formData.append('CAS', this.CAS);
    formData.append('clasedepeligrosegunonu', this.clasedepeligrosegunonu);
    formData.append('categoriaIARC', this.categoriaIARC);
    formData.append('estado', this.estado);
    formData.append('fechadevencimiento', this.fechadevencimiento);
    formData.append('presentacion', this.presentacion);
    formData.append('unidad', this.unidad ? this.unidad.toString() : '');
    formData.append('PDF', this.PDF);
    formData.append('esControlada', Number(this.esControlada).toString());

    if (this.pdfSeguridadFile) {
      formData.append('pdf_seguridad', this.pdfSeguridadFile);
    }

    if (this.pdfTecnicoFile) {
      formData.append('pdf_tecnico', this.pdfTecnicoFile);
    }

    if (this.eliminarPdfSeguridad) {
      formData.append('eliminar_pdf_seguridad', 'true');
    }

    if (this.eliminarPdfTecnico) {
      formData.append('eliminar_pdf_tecnico', 'true');
    }

    if (this.idsustancia) {
      this.servicioSustancias.actualizarSustancia(this.idsustancia, formData).subscribe({
        next: () => {
          alert('Sustancia actualizada con éxito');
          this.listarSustancias();
          this.resetForm();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar sustancia', err)
      });
    } else {
      this.servicioSustancias.crearSustancia(formData).subscribe({
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
    this.fechadevencimiento = s.fechadevencimiento
      ? s.fechadevencimiento.split('T')[0]
      : '';
    this.esControlada = s.esControlada;
    this.presentacion = s.presentacion;
    this.unidad = s.unidad;
    this.pdfSeguridadFile = null;
    this.pdfTecnicoFile = null;
    this.pdfSeguridadActual = s.pdf_seguridad;
    this.pdfTecnicoActual = s.pdf_tecnico;
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

  onPdfSeguridadChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pdfSeguridadFile = file;
      this.pdfSeguridadNombre = file.name;
      this.eliminarPdfSeguridad = false;
    }
  }

  onPdfTecnicoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pdfTecnicoFile = file;
      this.pdfTecnicoNombre = file.name;
      this.eliminarPdfTecnico = false;
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
    this.unidad = null;
    this.pdfSeguridadFile = null;
    this.pdfTecnicoFile = null
    this.pdfTecnicoNombre = '';
    this.pdfSeguridadNombre = '';
    this.pdfSeguridadActual = '';
    this.pdfTecnicoActual = '';
    this.eliminarPdfSeguridad = false;
    this.eliminarPdfTecnico = false;

    if (this.pdfSeguridadInput) {
      this.pdfSeguridadInput.nativeElement.value = '';
    }

    if (this.pdfTecnicoInput) {
      this.pdfTecnicoInput.nativeElement.value = '';
    }
  }

  crearUnidad() {
    this.servcicioUnidades.crear({ nombre: this.nuevaUnidad })
      .subscribe({
        next: () => {
          alert('Unidad creada');
          this.cargarUnidades();
          this.nuevaUnidad = '';
          this.mostrarInputUnidad = false;
        },
        error: err => console.error(err)
      });
  }

  cargarUnidades() {
    this.servcicioUnidades.listar().subscribe({
      next: (res: any) => {
        console.log(this.unidades);
        this.unidades = res.body || res;
      },
      error: (err) => console.error('Error al cargar unidades:', err)
    });
  }

  eliminarUnidad(id: number) {
    if (!confirm('¿Eliminar esta unidad?')) return;

    this.servcicioUnidades.eliminar(id).subscribe({
      next: () => {
        // recargar lista
        this.cargarUnidades();

        // si la unidad eliminada estaba seleccionada
        if (this.unidad === id) {
          this.unidad = null;
        }
      },
      error: err => {
        console.error(err);
        alert(err.error?.body || 'Error al eliminar');
      }
    });
  }

  eliminarPdf(tipo: 'seguridad' | 'tecnico') {
    if (tipo === 'seguridad') {
      this.pdfSeguridadActual = '';
      this.pdfSeguridadFile = null;
      this.eliminarPdfSeguridad = true;
    } else {
      this.pdfTecnicoActual = '';
      this.pdfTecnicoFile = null;
      this.eliminarPdfTecnico = true;
    }
  }

  confirmarEliminarPdf(tipo: 'seguridad' | 'tecnico') {
    const confirmacion = confirm('¿Seguro que deseas eliminar este PDF?');

    if (confirmacion) {
      this.eliminarPdf(tipo);
    }
  }

  volver() {
    this.router.navigate(['inicio']);
  }
}