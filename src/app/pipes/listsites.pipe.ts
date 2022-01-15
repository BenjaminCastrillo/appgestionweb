import { Pipe, PipeTransform } from '@angular/core';
import { SitesList } from '../interfaces/user-interface';

@Pipe({
  name: 'listsites'
})
export class ListsitesPipe implements PipeTransform {

 
  transform(listSites: SitesList[], text: string,page:number,linesPage:number): SitesList[] {
   
    let resultado=[];
    if (text===''){ 
      return listSites.slice(page,page+linesPage) 
    }

    for(let sites of listSites){      
      if (sites.siteId.toString().toLowerCase().indexOf(text.toLowerCase())>-1 ||
         sites.siteComercialId.toLowerCase().indexOf(text.toLowerCase())>-1 ||
         sites.venueName.toLowerCase().indexOf(text.toLowerCase())>-1)
      {
        resultado.push(sites);
      }
    }
    return resultado.slice(page,page+linesPage);

  }
}
