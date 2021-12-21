import { Pipe, PipeTransform } from '@angular/core';
import { Customer } from '../interfaces/customer-interface';

@Pipe({
  name: 'home'
})
export class HomePipe implements PipeTransform {

  transform(customers: any, text: string,page_number:number,page_size:number,longArray:number): Customer[] {
    if (text==='') return customers.slice(page_number*page_size,(page_number+1)*page_size) 
    
    console.log('en el pipe:page_number, page_size',page_number,page_size,longArray)
    let resultado=[];
    for(let customer of customers){
      if (customer.id.toString().toLowerCase().indexOf(text.toLowerCase())>-1 ||
          customer.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          customer.identification.toLowerCase().indexOf(text.toLowerCase())>-1)
      {
        resultado.push(customer);
      }
    }
    //resultado=customers;
    page_size= page_size|5;
    page_number= page_number|1;

    --page_number;

    return resultado.slice(page_number*page_size,(page_number+1)*page_size);
  }
}
