import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  constructor(private router: Router){ }

    email: string = "Prueba1@prueba.com";
    password: number = 1234
  

  login(email: string, password: number){
    if(email == this.email && password == this.password){
      this.router.navigate(['inicio']);
    }
    else{
      alert("usuario o contraseña invalidos");
    }
  }


}
