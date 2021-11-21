import { Pipe, PipeTransform } from '@angular/core';
import { ScreenLocation } from '../interfaces/site-interface';

@Pipe({
  name: 'notdeletedscreenlocation'
})
export class NotdeletedscreenlocationPipe implements PipeTransform {

  transform(value: ScreenLocation[], localizacionPantallaBorrada: boolean): ScreenLocation[] {

    return localizacionPantallaBorrada?value:value.filter(e=>!e.deleted);  
  }

}
