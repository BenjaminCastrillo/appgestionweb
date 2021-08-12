import { Pipe, PipeTransform } from '@angular/core';
import { Venue } from '../interfaces/venue-interface';

@Pipe({
  name: 'venue'
})
export class VenuePipe implements PipeTransform {

  transform(venues: Venue[], text: string,page:number,linesPage:number,longArray?:number): Venue[] {
    let resultado=[];

    if (text===''){ 
      venues.forEach(element => { element.filter=false });
      return venues.slice(page,page+linesPage) 
    }

    for(let venue of venues){ 
      if (venue.id.toString().toLowerCase().indexOf(text.toLowerCase())>-1 ||
          venue.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          venue.address.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          venue.customer.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          venue.location.findIndex(e=>e.territorialEntityName.toLowerCase().includes(text.toLowerCase()))>-1)      
      {
        venue.filter=(venue.customer.name.toLowerCase().indexOf(text.toLowerCase())>-1 )?true:false;
        resultado.push(venue);
      }
    }

    return resultado.slice(page,page+linesPage);
  }

}
