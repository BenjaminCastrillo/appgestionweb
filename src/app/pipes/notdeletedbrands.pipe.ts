import { ViewFlags } from '@angular/compiler/src/core';
import { Pipe, PipeTransform } from '@angular/core';
import { Brand } from '../interfaces/venue-interface';

@Pipe({
  name: 'notdeletedbrands'
})
export class NotdeletedbrandsPipe implements PipeTransform {

  transform(value: Brand[], marcaBorrada: boolean): Brand[] {
    return marcaBorrada?value:value.filter(e=>!e.deleted);  
  }

}
