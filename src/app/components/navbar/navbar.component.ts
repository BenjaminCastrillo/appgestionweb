import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

   public userName=localStorage.getItem('user');
  constructor() { }

  ngOnInit(): void {
  }

  buscarElemento(texto:string){
  texto=texto.trim();
  if(texto.length===0){
    return;
  }
    console.log(texto);
  }
}
