import { Component } from '@angular/core';
import { SustanciasService } from '../../services/sustancias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-controladas',
  imports: [CommonModule, FormsModule],
  templateUrl: './controladas.component.html',
  styleUrl: './controladas.component.css'
})
export class ControladasComponent {
  sustancias: any[] = [];

  filtro: any = {
    codigo: '',
    nombreComercial: '',
    unidad: '',
    autorizada: ''
  };
    mostrarFiltros = false;

  constructor(private sustanciasService: SustanciasService, private router: Router) { }

  ngOnInit(): void {
    this.cargarControladas();
  }

  cargarControladas() {

    this.sustanciasService.listarControladas().subscribe({
      next: (res: any) => this.sustancias = res.body || res,
      error: (err) => console.error('Error al listar controladas:', err)
    });
  }

  toggleAutorizacion(sustancia: any) {
    const nueva = sustancia.autorizada ? 0 : 1;

    this.sustanciasService.actualizarAutorizacion(sustancia.idsustancia, {
      autorizada: nueva
    }).subscribe({
      next: () => {
        sustancia.autorizada = nueva;
        alert(`Autorización ${nueva ? 'habilitada' : 'revocada'} con éxito`);
      },
      error: (err) => console.error(err)
    });
  }

  buscarConFiltros() {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtro).filter(([_, v]) => v !== null && v !== '')
    );

    // Si no hay filtros, listar todo
    if (Object.keys(filtrosLimpios).length === 0) {
      this.cargarControladas();
      return;
    }

    this.sustanciasService.buscarControladas(filtrosLimpios).subscribe({
      next: (res: any) => {
        this.sustancias = res.body || res;
        console.log("Resultado filtro controladas:", this.sustancias);
      },
      error: (err) => console.error('Error al buscar controladas:', err)
    });
  }

  limpiarFiltros() {
    this.filtro = {
      codigo: '',
      nombreComercial: '',
      unidad: '',
      autorizada: ''
    };

    this.cargarControladas();
  }

    toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

    volver() {
    this.router.navigate(['inicio']);
  }

}
