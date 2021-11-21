import { Pipe, PipeTransform } from '@angular/core';
import { MarketRegion } from '../interfaces/venue-interface';

@Pipe({
  name: 'notdeletedmarketregion'
})
export class NotdeletedmarketregionPipe implements PipeTransform {

  transform(value: MarketRegion[], regionComercialBorrada: boolean): MarketRegion[] {

    return regionComercialBorrada?value:value.filter(e=>!e.deleted);  
  }

}
