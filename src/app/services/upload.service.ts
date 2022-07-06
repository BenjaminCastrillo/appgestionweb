import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject} from 'rxjs';
import { GlobalDataService } from './global-data.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private url='http://192.168.1.42:3700';

  constructor(private http:HttpClient,
    private globalData:GlobalDataService) { }

  uploadImage(file:any,imageType:String):Observable<any>{
    let metodo:string;
    const httpHeaders = new HttpHeaders({
      'enctype':'multipart/form-data'
    });
    switch (imageType){
    case 'B':
      metodo='brandimage';
      break;
    case 'V':
      metodo='venueimage';
      break;
    case 'S':
      metodo='siteimage';
      break;
    case 'C':
      metodo='contentimage';
      break;
    default:
      return
    }
    return this.http.post(`${this.url}/${metodo}`,
        file,{headers:httpHeaders})
  }
  
  getImage(file:string):Observable<any>{ 
    const httpHeaders = new HttpHeaders({
      'enctype':'multipart/form-'
    });

        return this.http.get(`${this.url}/brandimage/${file}`)
  }

/*
Metodo para extraer la base 64 de un fichero de imagen obtenido en un input
   Llamada:
      extraerBase64(image:file).then(imagen =>{
        preImagen=imagen;
        this.binariosImagenMarca[i]=preImagen.base;
        
      });
 */     
  extraerBase64=async($event:any)=>new Promise((resolve,reject)=>{
    try{
      const unsafeImg=window.URL.createObjectURL($event);
     // const image=this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader= new FileReader();
      reader.readAsDataURL($event);
      reader.onload=()=>{
        resolve({
          base:reader.result
        })
      };
      reader.onerror=error=>{
        resolve({
          // blob:$event,
          // image,
          base:null
        })
      };
    } catch (e){
      return null
    }
  });

}
