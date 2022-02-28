import { Pipe, PipeTransform } from '@angular/core';
import { Customer } from '../interfaces/customer-interface';

@Pipe({
  name: 'customer'
})
export class CustomerPipe implements PipeTransform {

  transform(customers: any, text: string,page:number,linesPage:number,longArray:number): Customer[] {
    if (text==='') return customers.slice(page,page+linesPage) 


    let resultado=[];
    for(let customer of customers){
      if (customer.id.toString().toLowerCase().indexOf(text.toLowerCase())>-1 ||
          customer.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          customer.identification.toLowerCase().indexOf(text.toLowerCase())>-1)
      {
        resultado.push(customer);
      } 
    }
    
    return resultado.slice(page,page+linesPage);
  }

}
