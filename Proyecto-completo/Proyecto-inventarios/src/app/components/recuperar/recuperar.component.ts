import { Component } from '@angular/core';
import { RecuperarPassService } from '../../services/recuperar-pass.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar',
  imports: [FormsModule, CommonModule],
  templateUrl: './recuperar.component.html',
  styleUrl: './recuperar.component.css'
})

export class RecuperarComponent {
  correo = '';

  constructor (private recpass: RecuperarPassService ){}

  solicitar(){
    this.recpass.solicitarRecuperacion(this.correo).subscribe({
      next: res => alert(res.body.mensaje || 'Correo enviado'),
      error: err => alert(err.error.body || 'Error en la solicitud')
    });
  }
}
