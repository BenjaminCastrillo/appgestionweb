import { compileNgModule } from '@angular/compiler';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'territorialentities'
})
export class TerritorialentitiesPipe implements PipeTransform {

  transform(value: any[],indice:number): unknown {
    return value[indice];
  }

}
