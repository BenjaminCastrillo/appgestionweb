import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject} from 'rxjs';
import { CustomersResponse, Customer } from '../interfaces/customer-interface';


interface ErrorValidate{
  [s:string]:boolean
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  

  private url='http://192.168.1.42:3700';

  constructor(private http:HttpClient) {

   }


  getCustomers():Observable<CustomersResponse>{
    return this.http.get<CustomersResponse>(`${this.url}/customers`);
  }
  
  getCustomerById(id:string){
    return this.http.get<CustomersResponse>(`${this.url}/customers/${id}`);
  }
  
  getCustomersByIdentification(id:string):Observable<CustomersResponse>{
    return this.http.get<CustomersResponse>(`${this.url}/customerbyidentification/${id}`);
  }
  
  saveCustomer(customer:Customer):Observable<any>{
    return this.http.post(`${this.url}/customers/`,customer);
  }

  updateCustomer(customer:Customer):Observable<any>{
     return this.http.put(`${this.url}/customers/`,customer);
  }

  updateImageBrand(file:any):Observable<any>{

    const id='11'
    const httpHeaders = new HttpHeaders({
      'enctype':'multipart/form-data'
    })
     return this.http.post(`${this.url}/customerbrandimage/${id}/ZZ`,file,{headers:httpHeaders});
    }

    deleteCustomer(id:string):Observable<any>{
      return this.http.delete(`${this.url}/customers/${id}`);
    }
// Validaciones sincronas


  // Validaciones asíncronas 
  existsIdCustomer(control:FormControl):Promise<ErrorValidate>|Observable<ErrorValidate>{
    let identification=control.value;

    if (!control.value){
      return Promise.resolve(null);
    }
     return new Promise ((resolve,reject)=>{
       this.getCustomersByIdentification(identification)
       .subscribe(
         resp=>{
            if (resp.data.length>0) 
            {
              resolve ({exists:true});
         }
            else resolve(null);
          },
          error=>{
            resolve(null);
          })
     });
  }
  
}
