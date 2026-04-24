import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventarioSustanciaService } from '../../services/inventario-sustancia.service';
import { SustanciasService } from '../../services/sustancias.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovimientosService } from '../../services/movimientos.service';
import { InventarioService } from '../../services/inventarios.service';

declare var bootstrap: any;

@Component({
  selector: 'app-inventario-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-detalle.component.html',
  styleUrl: './inventario-detalle.component.css'
})
export class InventarioDetalleComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private servicioAsignacion: InventarioSustanciaService, private servicioSustancias: SustanciasService, private servicioMovimientos: MovimientosService, private servicioInventario: InventarioService) { }

  rol = localStorage.getItem('rol') || '';
  tabla!: number;
  inventariosSecundarios: any[] = [];
  inventarioDestino: number | null = null;
  historial: any[] = [];
  historialSustancia: any = null;
  modalHistorial: any;
  cantidadTraslado: number | null = null;
  sustanciaSeleccionada: any = null;
  sustanciasAsignadas: any[] = [];
  sustanciasDisponibles: any[] = [];
  asignacionSeleccionada: any = {
    idinventario_sustancia: 0,
    cantidad: 0,
    cantidadremanente: 0,
    gastototal: 0,
    ubicaciondealmacenamiento: ''
  };

  movimientos: any[] = [];
  movimientoSeleccionado: any = {
    idinventario_sustancia: 0,
    nombre_sustancia: '',
    tipo: 'entrada',
    cantidad: 0,
    motivo: '',
    usuario: ''
  };

  formAsignacion = {
    sustancia_id: null,
    cantidad: null,
    ubicaciondealmacenamiento: '',
    lote: '',
    fechadevencimiento: ''
  };

  modalMov: any;
  modalRef: any;
  esPrincipal: boolean = false;

  sustancia: number | null = null;
  cantidad: number | null = null;
  cantidadremanente: number | null = null;
  gastototal: number | null = null;
  ubicaciondealmacenamiento = '';
  nombreSeleccionado: string = '';
  sustanciasFiltradas: any[] = [];

  idInventario: number = 0;
  filtro: any = {};
  mostrarFiltros = false;
  nombreInventario: string = '';

  busquedaSustancia: string = '';
  mostrarDropdown: boolean = false;
  sustanciasFiltradasDropdown: any[] = [];
  sustanciaSeleccionadaObj: any = null;
  ubicacionTraslado: string = '';

  ngOnInit(): void {
    this.idInventario = Number(this.route.snapshot.paramMap.get('id'));
    this.route.paramMap.subscribe(params => {
      this.tabla = +params.get('id')!;

      this.cargarInfoInventario();
      this.cargarSustancias();

      this.cargarDisponibles();
      console.log(this.sustanciasAsignadas);
    });

  }

  cargarSustancias() {
    this.servicioAsignacion.listarPorInventario(this.tabla).subscribe({
      next: (res: any) => {
        const lista = res.body || res;
        console.log('DATA BACKEND:', lista);
        this.sustanciasAsignadas = [...lista];

        if (lista.length > 0) {
          this.esPrincipal = lista[0].principal === 1;
        }
      },
      error: (err: any) => console.error('Error al listar sustancias asignadas:', err)
    });
  }



  cargarDisponibles() {
    this.servicioSustancias.listarSustancias().subscribe({
      next: (res: any) => {
        const todas = res.body || res;

        // Filtrar las que ya están asignadas al inventario actual
        const idsAsignadas = this.sustanciasAsignadas.map(s => s.idsustancia);
        this.sustanciasDisponibles = todas.filter((s: any) => !idsAsignadas.includes(s.idsustancia));

        console.log('Sustancias disponibles para asignar:', this.sustanciasDisponibles);
      },
      error: (err: any) => console.error('Error al listar sustancias disponibles:', err)
    });
  }


  asignarSustancia() {

    if (!this.sustancia || !this.cantidad || !this.ubicaciondealmacenamiento) {
      alert('Todos los campos son obligatorios');
      return;
    }

    this.servicioAsignacion.crearAsignacion({
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

        this.resetFormularioAsignacion();

        // cerrar modal correctamente
        const modalEl = document.getElementById('modalAsignacion');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      },
      error: (err: any) => {
        console.error('Error al asignar:', err);
        alert(err.error.body || 'Error al asignar sustancia');
      }
    });
  }

  abrirMovimientos(asignacion: any) {
    if (!asignacion) return;


    const nombre =
      asignacion.nombre_sustancia ||
      asignacion.nombreComercial
    '(sin nombre)';

    this.movimientoSeleccionado = {
      idinventario_sustancia: asignacion.idinventario_sustancia,
      nombre_sustancia: nombre,
      unidad: asignacion.unidad,
      tipo: 'entrada',
      cantidad: 0,
      motivo: '',
      usuario: ''
    };

    console.log('🧩 Movimientos de ID inventario_sustancia:', asignacion.idinventario_sustancia);



    setTimeout(() => {
      const modalEl = document.getElementById('modalMov');
      if (!modalEl) return;
      this.modalMov = new bootstrap.Modal(modalEl);
      this.modalMov.show();
    }, 10);


    this.servicioMovimientos
      .listarMovimientos(asignacion.idinventario_sustancia)
      .subscribe({
        next: (res: any) => (this.movimientos = res.body || res),
        error: (err: any) =>
          console.error('Error al listar movimientos:', err)
      });
  }

  registrarMovimiento() {
    const mov = {
      inventario_sustancia_id: this.movimientoSeleccionado.idinventario_sustancia,
      tipo: this.movimientoSeleccionado.tipo,
      cantidad: this.movimientoSeleccionado.cantidad,
      motivo: this.movimientoSeleccionado.motivo,
      usuario: this.movimientoSeleccionado.usuario,
      fecha: this.movimientoSeleccionado.fecha
    };

    const observable = this.esPrincipal
      ? this.servicioMovimientos.registrarMovimiento(mov) // principal
      : this.servicioMovimientos.registrarMovimientoSecundario(mov); // secundario

    observable.subscribe({
      next: (res: any) => {
        alert(res.mensaje || 'Movimiento registrado con éxito');
        this.cargarSustancias();
        this.abrirMovimientos(this.movimientoSeleccionado);
        if (this.modalMov) {
          this.modalMov.hide();
          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('padding-right');
        }
      },
      error: (err: any) => {
        console.error('Error al registrar movimiento:', err);
        alert(err.error.body || 'Error al registrar movimiento');
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
      error: (err: any) => {
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
      error: (err: any) => {
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
        error: (err: any) => {
          console.error('Error al eliminar asignación:', err);
          alert(err.error.body || 'Error al eliminar asignación');
        }
      });
    }
  }

  // Abrir modal de traslado
  abrirTraslado(item: any) {
    this.sustanciaSeleccionada = item;
    this.inventarioDestino = null;
    this.cantidadTraslado = null;
    this.ubicacionTraslado = '';

    // Mostrar el modal
    const modalEl = document.getElementById('modalTraslado');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();

    this.servicioInventario.listarInventarios().subscribe({
      next: (res: any) => {
        const lista = res.body || res;

        // Excluir el inventario actual
        this.inventariosSecundarios = lista.filter(
          (inv: any) => inv.idtablas !== this.tabla
        );

        console.log('Inventarios disponibles para traslado:', this.inventariosSecundarios);
      },
      error: (err: any) => {
        console.error('Error al listar inventarios:', err);
      }
    });
  }

  // Confirmar traslado
  confirmarTraslado() {

    if (!this.inventarioDestino || !this.cantidadTraslado || !this.ubicacionTraslado) {
      alert('Todos los campos son obligatorios');
      return;
    }

    // Detectar ID correcto de sustancia
    const idSustancia = this.sustanciaSeleccionada.idsustancia;

    if (!idSustancia) {
      alert('No se encontró el ID de la sustancia.');
      console.log('Objeto sustanciaSeleccionada:', this.sustanciaSeleccionada);
      return;
    }

    const datos = {
      origen_id: this.tabla,
      destino_id: this.inventarioDestino,
      sustancia_id: idSustancia,
      cantidad: this.cantidadTraslado,
      ubicaciondealmacenamiento: this.ubicacionTraslado
    };

    console.log('Enviando al backend:', datos);

    this.servicioAsignacion.trasladarSustancia(datos).subscribe({
      next: (res: any) => {
        alert(res.mensaje || 'Traslado realizado con éxito');
        this.cargarSustancias();
        this.inventarioDestino = null;
        this.cantidadTraslado = null;
        this.sustanciaSeleccionada = null;
        this.ubicacionTraslado = '';

        const modalEl = document.getElementById('modalTraslado');
        const modal = bootstrap.Modal.getInstance(modalEl!);
        modal?.hide();
      },
      error: (err: any) => {
        console.error('Error backend:', err);
        alert(err.error?.body || 'Error al trasladar sustancia');
      }
    });
  }

  abrirHistorial(asignacion: any) {
    if (!asignacion) return;

    this.historialSustancia = asignacion;

    this.servicioMovimientos.listarMovimientos(asignacion.idinventario_sustancia).subscribe({
      next: (res: any) => {
        this.historial = res.body || res;
        const modalEl = document.getElementById('modalHistorial');
        if (modalEl) {
          this.modalHistorial = new bootstrap.Modal(modalEl);
          this.modalHistorial.show();
        }
      },
      error: (err: any) => {
        console.error('Error al cargar historial:', err);
        alert('No se pudo cargar el historial de movimientos');
      }
    });
  }

  buscarSustancias() {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtro).filter(([_, v]) => v != null && v !== '')
    );

    filtrosLimpios['inventarioId'] = this.idInventario;

    this.servicioAsignacion.buscarSustanciasInventario(filtrosLimpios).subscribe({
      next: (res: any) => {
        this.sustanciasAsignadas = res.body || res;
      },
      error: (err) => console.error('Error al buscar sustancias del inventario:', err)
    });
  }

  cargarInfoInventario() {
    this.servicioInventario.obtenerInventario(this.tabla).subscribe({
      next: (res: any) => {
        const inv = res.body || res;

        this.esPrincipal = inv.principal === 1;
        this.nombreInventario = inv.nombretabla;
      },
      error: (err) => console.error('Error al cargar inventario:', err)
    });
  }

  filtrarPorNombreModalAsignacion() {
    this.sustanciasFiltradas = this.sustanciasDisponibles.filter(
      s => s.nombreComercial === this.nombreSeleccionado
    );

    this.sustanciasFiltradasDropdown = [...this.sustanciasFiltradas];

    this.sustancia = null;
    this.busquedaSustancia = '';
  }

  resetFormularioAsignacion() {
    this.nombreSeleccionado = '';
    this.sustancia = null;
    this.sustanciaSeleccionadaObj = null;

    this.sustanciasFiltradas = [];
    this.sustanciasFiltradasDropdown = [];

    this.busquedaSustancia = '';
    this.mostrarDropdown = false;

    this.cantidad = null;
    this.cantidadremanente = null;
    this.gastototal = null;
    this.ubicaciondealmacenamiento = '';
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('modalAsignacion');

    if (modalEl) {

      modalEl.addEventListener('show.bs.modal', () => {
        this.resetFormularioAsignacion();
      });

      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetFormularioAsignacion();
      });

    }
  }

  filtrarDropdown() {
    const texto = this.busquedaSustancia.toLowerCase();

    this.sustanciasFiltradasDropdown = this.sustanciasFiltradas.filter(s =>
      s.codigo.toLowerCase().includes(texto) ||
      s.marca.toLowerCase().includes(texto) ||
      s.lote.toLowerCase().includes(texto) ||
      s.presentacion.toLowerCase().includes(texto)
    );
  }

  seleccionarSustancia(s: any) {
    this.sustancia = s.idsustancia;
    this.sustanciaSeleccionadaObj = s;

    this.busquedaSustancia =
      `${s.codigo} | ${s.marca} | Lote: ${s.lote} | ${s.presentacion}`;

    this.mostrarDropdown = false;
  }

  getClaseVencimiento(fecha: string): string {
    if (!fecha) return '';

    const hoy = new Date();
    const venc = new Date(fecha);

    const diffDias = (venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDias < 0) return 'text-danger';      // vencido
    if (diffDias <= 30) return 'text-warning';   // por vencer
    return 'text-success';                       // vigente
  }

  abrirModalAsignar() {
    this.formAsignacion = {
      sustancia_id: null,
      cantidad: null,
      ubicaciondealmacenamiento: '',
      lote: '',
      fechadevencimiento: ''
    };
  }

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  volver() {
    this.router.navigate(['inventarios']);
  }

}
