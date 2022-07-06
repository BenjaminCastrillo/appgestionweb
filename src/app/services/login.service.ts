import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject} from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { LoginResponse ,LoginUser } from '../interfaces/loginUser-interface';
import { GlobalDataService } from './global-data.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url=this.globalData.getUrlServer();
  private lang=this.globalData.getUserLanguage();
 // private token:string;

  constructor( private http:HttpClient, 
               private globalData:GlobalDataService,
               private translate:TranslateService, ) { 
  //  this.token=localStorage.getItem('token')
  }

  loginUser(user:LoginUser):Observable<any>{ 
    return this.http.post(`${this.url}/login/`,user);
  }

  validarToken():Observable<boolean>{ 
    let userId=localStorage.getItem('userId')
    return this.http.get(`${this.url}/validtoken/${userId}`)
    .pipe(
      tap((resp:any)=>{
          if (resp.result)
          localStorage.setItem('token',resp.token);
      }),
      map(resp=>true),
      catchError(err=> of(false))
    );
  
  }

  deleteToken(){
    
      localStorage.setItem('token','');
      localStorage.setItem('user','');
      localStorage.setItem('userId','');
      
  }

  saveToken(token:string,user:string,userId:string){
      
    localStorage.setItem('token',token);
    localStorage.setItem('user',user);
    localStorage.setItem('userId',userId);

  }
  logout(){
      
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
 //   localStorage.removeItem('language');

    return
  }


  accessErrorText(errorCode:number,origen?:string){

    return new Promise (resolve=>{
    
      let msg1:string=null;
      let msg2:string=null;

    
      let mensajes={
        0:   'error.server1',
        400: 'error.server2',
        401:origen?'login.textError1':'error.server3',
        403: 'error.server7',
        500: 'error.server4',
        503: 'error.server5',
      }
  
      this.translate.get(mensajes[errorCode]===undefined?'error.server6':mensajes[errorCode])
      .subscribe(res=>msg1=res);  
      
      this.translate.get(origen?'login.textError2':'login.textError4')
      .subscribe(res=> msg2=res); 
  
  
      Swal.fire({
        title: msg1,
        text:msg2,
        confirmButtonColor: '#007bff',
        icon:'error'
      }).then(resp=>{
        resolve ('a');
      });
  
    });
  }
}


