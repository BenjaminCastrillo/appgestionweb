import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private translate: TranslateService,) { }

  validationFieldError(error:any,campo:string){

      let textMsg:string='';
  
      let messages:{[key: string]: string}= {
        required:   'error.validationField1',
        email:      'error.validationField2',
        pattern:    'error.validationField2',  // formato incorrecto
        pattern1:   'error.validationField11', // formato Dirección email erronea
        pattern2:   'error.validationField12', // formato password erroneo
        exists:     'error.validationField3', // el ID ya existe
        exists2:     'error.validationField13', // el email ya existe
        minlength:  'error.validationField4',
        maxlength:  'error.validationField5',
      }
      
      const propiedades=Object.getOwnPropertyNames(error);
      let primerError=propiedades[0];
      if(primerError=='pattern' && campo=='email') primerError='pattern1';
      if(primerError=='pattern' && campo=='password') primerError='pattern2';
      if(primerError=='exists' && campo=='email') primerError='exists2';

      const codigoMsg=messages[primerError]||'error.validationField3';

      if(primerError==='minlength' || primerError==='maxlength'){

        let obj={
          value1:campo,
          value2:error[primerError].requiredLength
        };
        this.translate.get(codigoMsg,obj)
        .subscribe(res=>{
          textMsg=res;
        });  
      }
      else{
        this.translate.get(codigoMsg)
        .subscribe(res=>{
          textMsg=res;
        });
      }
      return textMsg;
    }

    validationArrayFieldError(elemento:any){

      let textMsg:string='';
      let messages:{[key: string]: string}= {
        required:   'error.validationField1',
        email:      'error.validationField2',
        pattern:    'error.validationField2',  // formato incorrecto
        exists:     'error.validationField10', // el codigo ya existe
        minlength:  'error.validationField4',
        maxlength:  'error.validationField6',
        wrongStartDay:  'error.validationFieldXXXXXXX',
        wrongStartDate:  'error.validationField7',
        wrongEndTime:  'error.validationField8',
        wrongStartTime:  'error.validationField9',



      }
      const propiedades=Object.getOwnPropertyNames(elemento.errors);
      let primerError=propiedades[0];

      const codigoMsg=messages[primerError]||'error.validationField3';

      if(primerError==='minlength' || primerError==='maxlength'){

        let obj={
           value1: elemento.errors.maxlength.requiredLength
        };
        this.translate.get(codigoMsg,obj)
        .subscribe(res=>{
          textMsg=res;
        });  
      }
      else{
        this.translate.get(codigoMsg)
        .subscribe(res=>{
          textMsg=res;
        });
      }
      return textMsg;
    }
}
