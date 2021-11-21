import { Pipe, PipeTransform } from '@angular/core';
import { Site } from '../interfaces/site-interface';

@Pipe({
  name: 'site'
})
export class SitePipe implements PipeTransform {

  transform(listSites: Site[], text: string,page:number,linesPage:number,longArray?:number): Site[] {
   
    let resultado=[];

    if (text===''){ 
      listSites.forEach(element => { element.filter=false });
      return listSites.slice(page,page+linesPage) 
    }
let i=0;
    for(let sites of listSites){ 
       if (sites.id.toString().toLowerCase().indexOf(text.toLowerCase())>-1 ||
       sites.siteComercialId.toLowerCase().indexOf(text.toLowerCase())>-1 ||
       sites.address.toLowerCase().indexOf(text.toLowerCase())>-1 ||
       sites.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
       sites.postalCode.toLowerCase().indexOf(text.toLowerCase())>-1 ||
       sites.customer.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
       sites.location.findIndex(e=>e.territorialEntityName.toLowerCase().includes(text.toLowerCase()))>-1)
       {
        sites.filter=(sites.customer.name.toLowerCase().indexOf(text.toLowerCase())>-1 )?true:false;
        resultado.push(sites);
    }


  }
  return resultado.slice(page,page+linesPage);
  }
}
