import { Pipe, PipeTransform } from '@angular/core';
import {  ScreenModel } from '../interfaces/site-interface';


@Pipe({
  name: 'modelscreen'
})
export class ModelscreenPipe implements PipeTransform {

  transform(value: ScreenModel[], tipoPantallaActual:number,marcaPantallaActual: number): ScreenModel[] {
    
    // let result:ScreenModel[]=[];

  let result:ScreenModel[]= value.filter(e=>e.screenBrandId==marcaPantallaActual 
                         && e.screenTypeId==tipoPantallaActual);

 return result

  }
}
