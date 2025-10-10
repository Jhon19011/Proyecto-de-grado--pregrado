import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private servicioAsignacion: InventarioSustanciaService, private servicioSustancias: SustanciasService, private servicioMovimientos: MovimientosService, private servicioInventario: InventarioService) { }

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

  modalMov: any;
  modalRef: any;
  esPrincipal: boolean = false;
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
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : res.body;
        console.log('🔍 Datos recibidos del backend:', lista);
        this.sustanciasAsignadas = [...lista];
        if (lista.length > 0) {
          this.esPrincipal = lista[0].principal === 1; // detecta si este inventario es el principal
        }
      },
      error: (err: any) => console.error('Error al listar sustancias asignadas:', err)
    });
  }



  cargarDisponibles() {
    this.servicioSustancias.listarSustancias().subscribe({
      next: (res: any) => {
        const todas = res.body || res;
        console.log('🌐 Sustancias registradas en la sede:', todas);

        // Filtrar las que ya están asignadas al inventario actual
        const idsAsignadas = this.sustanciasAsignadas.map(s => s.idsustancia);
        this.sustanciasDisponibles = todas.filter((s: any) => !idsAsignadas.includes(s.idsustancia));

        console.log('Sustancias disponibles para asignar:', this.sustanciasDisponibles);
      },
      error: (err: any) => console.error('Error al listar sustancias disponibles:', err)
    });
  }


  asignarSustancia() {

    console.log('Datos enviados', {
      tabla: this.tabla,
      sustancia: this.sustancia,
      cantidad: this.cantidad,
      cantidadremanente: this.cantidadremanente,
      gastototal: this.gastototal,
      ubicaciondealmacenamiento: this.ubicaciondealmacenamiento
    });

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
        this.sustancia = null;
        this.cantidad = null;
        this.cantidadremanente = null;
        this.gastototal = null;
        this.ubicaciondealmacenamiento = '';
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
      asignacion.nombre ||
      asignacion.sustancia ||
      asignacion.sustancia_nombre ||
      '(sin nombre)';

    this.movimientoSeleccionado = {
      idinventario_sustancia: asignacion.idinventario_sustancia,
      nombre_sustancia: nombre,
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
    console.log('🧪 Sustancia seleccionada:', item);
    this.sustanciaSeleccionada = item;

    // Mostrar el modal
    const modalEl = document.getElementById('modalTraslado');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();

    this.servicioInventario.listarSecundarios().subscribe({
      next: (res: any) => {
        this.inventariosSecundarios = res.body || res;
        console.log('Inventarios secundarios cargados:', this.inventariosSecundarios);
      },
      error: (err: any) => {
        console.error('Error al listar secundarios:', err);
      }
    });
  }

  // Confirmar traslado
  confirmarTraslado() {
    console.log('🚀 confirmando traslado', {
      inventarioDestino: this.inventarioDestino,
      cantidadTraslado: this.cantidadTraslado,
      sustanciaSeleccionada: this.sustanciaSeleccionada
    });

    if (!this.inventarioDestino || !this.cantidadTraslado || !this.sustanciaSeleccionada) {
      alert('Todos los campos son obligatorios');
      return;
    }

    console.log('🧩 Estructura sustanciaSeleccionada:', this.sustanciaSeleccionada);

    // Detectar todos los posibles campos para la sustancia
    console.log('🔎 posibles IDs:',
      this.sustanciaSeleccionada.sustancia,
      this.sustanciaSeleccionada.idsustancia,
      this.sustanciaSeleccionada.id,
      this.sustanciaSeleccionada.idinventario_sustancia
    );

    // Detectar ID correcto de sustancia
    const idSustancia = this.sustanciaSeleccionada.idsustancia;

    if (!idSustancia) {
      alert('No se encontró el ID de la sustancia.');
      console.log('Objeto sustanciaSeleccionada:', this.sustanciaSeleccionada);
      return;
    }

    const datos = {
      destino_id: this.inventarioDestino,
      sustancia_id: idSustancia,
      cantidad: this.cantidadTraslado,
      motivo: 'Traslado interno'
    };

    console.log('Enviando al backend:', datos);

    this.servicioAsignacion.trasladarSustancia(datos).subscribe({
      next: (res: any) => {
        alert(res.mensaje || 'Traslado realizado con éxito');
        this.cargarSustancias();
        this.inventarioDestino = null;
        this.cantidadTraslado = null;
        this.sustanciaSeleccionada = null;

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

}
