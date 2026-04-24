import { Component } from '@angular/core';
import { RecuperarPassService } from '../../services/recuperar-pass.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  imports: [FormsModule, CommonModule],
  templateUrl: './recuperar.component.html',
  styleUrl: './recuperar.component.css'
})

export class RecuperarComponent {
  correo = '';

  constructor(private recpass: RecuperarPassService, private router: Router) { }

  solicitar() {
    this.recpass.solicitarRecuperacion(this.correo).subscribe({
      next: res => {
        alert('Si el correo está registrado, recibirás un enlace. Revisa bandeja de entrada o spam.');
        this.router.navigate(['/login']);
      },
      error: err => {
        alert(err.error.body || 'Error en la solicitud');
      }
    });
  }
}
