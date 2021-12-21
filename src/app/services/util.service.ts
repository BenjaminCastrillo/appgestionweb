import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }
  
  ramdonNumber(max:number,min:number){
  return Math.floor((Math.random()*(max-min+1))+min);

  }
  zeroFill( numero:string, width:number )
  {
  while (numero.length<width){
    numero='0'+numero
  }
  return numero 
  }
  // Metodo para ordenar listas de datos
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}