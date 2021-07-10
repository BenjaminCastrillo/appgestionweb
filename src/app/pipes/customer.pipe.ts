import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customer'
})
export class CustomerPipe implements PipeTransform {

  transform(customers: any, text: string,page:number,linesPage:number): unknown {
    
    if (text==='') return customers.slice(page,page+linesPage) 
    
    const resultado=[];
    for(let customer of customers){
      if (customer.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          customer.identification.toLowerCase().indexOf(text.toLowerCase())>-1)
      {
        resultado.push(customer);
      }
    }
    return resultado.slice(page,page+linesPage);
  }

}
