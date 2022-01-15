import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Observable, Subject, throwError} from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CustomersResponse, Customer, Brand, MarketRegion, Week, Month, SitesComercialCode } from '../interfaces/customer-interface';
import { GlobalDataService } from './global-data.service';

interface ErrorValidate{
  [s:string]:boolean
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  
  private header= new HttpHeaders();

  private url=this.globalData.getUrlServer();
  private lang=this.globalData.getUserLanguage();

  constructor(private http:HttpClient,
    private globalData:GlobalDataService) {
   } 

  getCustomers():Observable<CustomersResponse>{

    return this.http.get<CustomersResponse>(`${this.url}/customers/${this.lang}`)
  }
  


  getCustomerById(id:string){
    return this.http.get<CustomersResponse>(`${this.url}/customers/${id}/${this.lang}`);
  }
  
  getCustomersByIdentification(id:string):Observable<CustomersResponse>{
    return this.http.get<CustomersResponse>(`${this.url}/customerbyidentification/${id}/${this.lang}`);
  }
 
  
  saveCustomer(customer:Customer):Observable<any>{
    return this.http.post(`${this.url}/customers/`,customer);
  }
  
  updateCustomer(customer:Customer):Observable<any>{
    return this.http.put(`${this.url}/customers/`,customer);
  }

  deleteCustomer(id:string):Observable<any>{
    return this.http.delete(`${this.url}/customers/${id}`);
  }

  getBrandsBytIdCustomer(id:number):Observable<Brand[]>{
    return this.http.get<any>(`${this.url}/brands/${id}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else  
            return []
      }),
      map(marcas=>{
          return marcas
      })
    )
  }

  getMarketRegionsBytIdCustomer(id:number):Observable<MarketRegion[]>{
    return this.http.get<any>(`${this.url}/marketregions/${id}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      }),
      map(regionesMercado=>{
          return regionesMercado
      })
    )
  }

  getComercialCodeBytIdCustomer(id:number):Observable<SitesComercialCode[]>{
    return this.http.get<any>(`${this.url}/sitescode/${id}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      }),
      map(comercialCodes=>{
          return comercialCodes
      })
    )
  }

  getComercialCodeByAcronym(acro:string):Observable<SitesComercialCode[]>{
    return this.http.get<any>(`${this.url}/sitecodebyacronym/${acro}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      }),
      map(comercialCodes=>{
          return comercialCodes
      })
    )
  }

  getWeek():Observable<Week[]>{
    return this.http.get<any>(`${this.url}/weekdays/${this.lang}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      }),
      map(week=>{
          return week
      })
    )
  }


  getMonth():Observable<Month[]>{
    return this.http.get<any>(`${this.url}/months/${this.lang}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      }),
      map(week=>{
          return week
      })
    )
  }


 

 // Validadores
  
 dateStartCorrect(diaInicio:string,mesInicio:string){
  
  return (formGroup:FormGroup)=>{

    const diaInicioControl=formGroup.controls[diaInicio];
    const mesInicioControl=formGroup.controls[mesInicio];
    let diaCorrecto:boolean=false;
    const meses30Dias = new Array(4,6,9,11);
    const meses31Dias = new Array(1,3,5,7,8,10,12);
    

     if (!diaInicioControl.value || isNaN(diaInicioControl.value)) 
      return null
    
    let dia:number = parseInt(diaInicioControl.value,10);
    let mes:number = parseInt(mesInicioControl.value,10);
    
      if ((meses31Dias.includes(mes) && dia<=31) || 
          ( meses30Dias.includes(mes) && dia<=30)) {
            diaCorrecto=true; 
          }else if (dia<=29)  diaCorrecto=true; 
          
      if (diaCorrecto){
        diaInicioControl.setErrors(null);
 //       mesInicioControl.setErrors(null);

      }else{
        diaInicioControl.setErrors({ wrongStartDate:true });
 //       mesInicioControl.setErrors({ wrongStartDate:true });
      }
  } 
}



timeCloseCorrect(timeStart1:string,timeEnd1:string,timeStart2:string,timeEnd2:string){

  return (formGroup:FormGroup)=>{

    const timeStartControl1=formGroup.controls[timeStart1];
    const timeEndControl1=formGroup.controls[timeEnd1];
    const timeStartControl2=formGroup.controls[timeStart2];
    const timeEndControl2=formGroup.controls[timeEnd2];

    
    if (!timeStartControl2.value && !timeEndControl1.value && !timeEndControl2.value){
      return null
    }
    const horaInicio1=timeStartControl1.value?parseInt(timeStartControl1.value.replace(':',''),10):0;
    const horaFin1=timeEndControl1.value?parseInt(timeEndControl1.value.replace(':',''),10):0;
    
    const horaInicio2=timeStartControl2.value?parseInt(timeStartControl2.value.replace(':',''),10):0;
    const horaFin2=timeEndControl2.value?parseInt(timeEndControl2.value.replace(':',''),10):0;


    if (horaFin1>horaInicio1 && horaInicio1!=0){
      timeEndControl1.setErrors(null); // correcto
    }else{
      timeEndControl1.setErrors({ wrongEndTime:true });
    }

    if (horaInicio2==0 && horaFin2==0){
    
      timeStartControl2.setErrors(null);
      timeEndControl2.setErrors(null);
    
    }else{

      if (horaInicio2>horaFin1 && horaFin1!=0){
        timeStartControl2.setErrors(null); // correcto
      }else{
        timeStartControl2.setErrors({ wrongStartTime:true });
      }
  
      if (horaFin2>horaInicio2 && horaInicio2!=0){
        timeEndControl2.setErrors(null); // correcto
      }else{
        timeEndControl2.setErrors({ wrongEndTime:true }); // hora cierre 2 incorrecta
      }  
    }
  }
}

 
  // Validaciones asíncronas 

  existsIdCustomer(control:FormControl):Promise<ErrorValidate>|Observable<ErrorValidate>{
    let identification=control.value;
console.log('voy a validar dni');
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
 
  
  existsCode(control:FormControl):Promise<ErrorValidate>|Observable<ErrorValidate>{
    let code=control.value;

    if (!control.value){
      return Promise.resolve(null);
    }
     return new Promise ((resolve,reject)=>{

      this.getComercialCodeByAcronym(code)
      .subscribe(
        resp=>{
           if (resp.length>0) 
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
