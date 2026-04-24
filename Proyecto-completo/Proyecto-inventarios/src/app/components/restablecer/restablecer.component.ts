import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecuperarPassService } from '../../services/recuperar-pass.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restablecer',
  imports: [FormsModule, CommonModule],
  templateUrl: './restablecer.component.html',
  styleUrl: './restablecer.component.css'
})
export class RestablecerComponent {
  token!: string;
  nuevaContrasena = '';

  constructor(private route: ActivatedRoute, private recpass: RecuperarPassService, private router: Router){
    this.token = this.route.snapshot.queryParamMap.get('token')!;
  }

  restablecer() {
    this.recpass.restablecerContrasena(this.token, this.nuevaContrasena).subscribe({
      next: res => {
        alert(res.body.mensaje || 'Contraseña actualizada');
        this.router.navigate(['/login']);
      },
      error: err => alert(err.error.body || 'Error al restablecer contraseña')
    });
  }
}
