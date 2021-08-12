import { ViewFlags } from '@angular/compiler/src/core';
import { Pipe, PipeTransform } from '@angular/core';
import { Brand } from '../interfaces/venue-interface';

@Pipe({
  name: 'notdeletedbrands'
})
export class NotdeletedbrandsPipe implements PipeTransform {

  transform(value: Brand[], ...args: unknown[]): Brand[] {
    console.log('en la pipe',value);
    let resultado:Brand[];
    
    resultado=value.filter(e=>!e.deleted)
    // value.forEach(e=>{
    //   console.log(e);
    //   if (!e.deleted){
    //     resultado.push(e)
    //     console.log('no deleted');
    //   }

    // })
    console.log(resultado);
    return resultado;  
  }

}
