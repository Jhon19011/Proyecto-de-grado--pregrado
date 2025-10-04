import { Component } from '@angular/core';
import { SustanciasService } from '../../services/sustancias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-controladas',
  imports: [CommonModule, FormsModule],
  templateUrl: './controladas.component.html',
  styleUrl: './controladas.component.css'
})
export class ControladasComponent {
  sustancias: any[] = [];

  constructor(private sustanciasService: SustanciasService) { }

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
}
