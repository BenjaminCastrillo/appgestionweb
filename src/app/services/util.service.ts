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
  

}