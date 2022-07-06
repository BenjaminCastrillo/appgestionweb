import { Injectable } from '@angular/core';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

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
  // Convertir un string a date dd-mm-yyyy hh:mm:ss

  stringToDate(fecha:Date){

    if (!fecha) return null;
    
    const dia =fecha.toString().replace(/ /g, "").slice(0,2)
    const mes =fecha.toString().replace(/ /g, "").slice(3,5)
    const anno =fecha.toString().replace(/ /g, "").slice(6,10)
    const hora =fecha.toString().replace(/ /g, "").slice(10,12)
    const minuto =fecha.toString().replace(/ /g, "").slice(13,15)
    const segundo =fecha.toString().replace(/ /g, "").slice(16,18)

    return new Date(Number(anno),Number(mes)-1, Number(dia),Number(hora),Number(minuto),Number(segundo));
  }


}