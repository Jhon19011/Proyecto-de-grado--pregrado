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
  baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
  pdfSeguridadNombre = '';
  pdfTecnicoNombre = '';
  pdfSeguridadActual: string = '';
  pdfTecnicoActual: string = '';
  eliminarPdfSeguridad: boolean = false;
  eliminarPdfTecnico: boolean = false;
  unidades: any[] = [];
  nuevaUnidad: string = '';
  mostrarInputUnidad: boolean = false;
  rol = localStorage.getItem('rol') || '';

  filtro: any = {
    numero: '',
    nombreComercial: '',
    codigo: '',
    CAS: '',
    marca: '',
    clasedepeligrosegunonu: '',
    categoriaIARC: '',
    estado: '',
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
  CAS = '';
  clasedepeligrosegunonu = '';
  categoriaIARC = '';
  estado = '';
  presentacion = '';
  unidad: number | null = null;
  pdfSeguridadFile: File | null = null;
  pdfTecnicoFile: File | null = null;
  PDF = '';
  esControlada: number | null = null;

  page = 1;
  limit = 5;
  totalPages = 1;
  totalRegistros = 0;

  get esAdministrador() {
    return this.rol === 'Administrador';
  }

  constructor(private router: Router, private servcicioUnidades: UnidadesService) { }

  ngOnInit(): void {
    this.listarSustancias();
    this.cargarUnidades();
  }

  listarSustancias() {
    this.servicioSustancias.listarSustanciasPaginadas(this.page, this.limit).subscribe({
      next: (res: any) => {
        this.aplicarRespuestaPaginada(res);
      },
      error: (err) => console.error('Error al listar sustancias:', err)
    });
  }

  buscarConFiltros() {
    this.page = 1;
    this.cargarSustancias();
  }

  cargarSustancias() {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtro).filter(([_, v]) => v !== null && v !== '')
    );

    // Si no hay filtros, listar todo
    if (Object.keys(filtrosLimpios).length === 0) {
      this.listarSustancias();
      return;
    }

    this.servicioSustancias.buscarSustanciasPaginadas(filtrosLimpios, this.page, this.limit).subscribe({
      next: (res: any) => {
        this.aplicarRespuestaPaginada(res);
        console.log("Resultado filtro:", this.sustancias);
      },
      error: (err) => console.error('Error al buscar sustancias:', err)
    });
  }

  private aplicarRespuestaPaginada(res: any) {
    const body = res?.body || res;
    const respuestaEsArreglo = Array.isArray(body);
    const dataCompleta = respuestaEsArreglo ? body : body?.data || [];
    const total = body?.total ?? dataCompleta.length;
    const offset = (this.page - 1) * this.limit;

    this.sustancias = respuestaEsArreglo
      ? dataCompleta.slice(offset, offset + this.limit)
      : dataCompleta;
    this.totalRegistros = total;
    this.totalPages = body?.totalPages || Math.ceil(total / this.limit) || 1;
    this.page = body?.page || this.page;
  }

  cambiarPagina(p: number) {
    if (p < 1 || p > this.totalPages) return;

    this.page = p;
    this.cargarSustancias();
  }

  cambiarLimite() {
    this.page = 1;
    this.cargarSustancias();
  }

  limpiarFiltros() {
    this.filtro = {
      numero: '',
      nombreComercial: '',
      codigo: '',
      CAS: '',
      marca: '',
      clasedepeligrosegunonu: '',
      categoriaIARC: '',
      estado: '',
      presentacion: '',
      unidad: '',
      esControlada: ''
    };

    this.page = 1;
    this.listarSustancias();
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  guardarSustancia() {
    console.log("📌 guardarSustancia ejecutado", this.idsustancia);

    const formData = new FormData();

    formData.append('codigo', this.codigo);
    formData.append('nombreComercial', this.nombreComercial);
    formData.append('marca', this.marca);
    formData.append('CAS', this.CAS);
    formData.append('clasedepeligrosegunonu', this.clasedepeligrosegunonu);
    formData.append('categoriaIARC', this.categoriaIARC);
    formData.append('estado', this.estado);
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
    this.CAS = s.CAS;
    this.clasedepeligrosegunonu = s.clasedepeligrosegunonu;
    this.categoriaIARC = s.categoriaIARC;
    this.estado = s.estado;
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
          alert(err.error?.body || 'No se pudo eliminar la sustancia');
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
    this.CAS = '';
    this.clasedepeligrosegunonu = '';
    this.categoriaIARC = '';
    this.estado = '';
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
