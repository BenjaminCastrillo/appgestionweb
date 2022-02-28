import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { LoginService } from 'src/app/services/login.service'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

   public userName=localStorage.getItem('user');
  constructor(private loginServices:LoginService,
    private router:Router) { }

  ngOnInit(): void {
  }

  logout(){
    console.log('en logout');
    this.loginServices.logout();
    this.router.navigateByUrl('/login');

  }
  buscarElemento(texto:string){
  texto=texto.trim();
  if(texto.length===0){
    return;
  }
    console.log(texto);
  }
}
