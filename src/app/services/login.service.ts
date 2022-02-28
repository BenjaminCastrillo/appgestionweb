import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject} from 'rxjs';
import { LoginResponse ,LoginUser } from '../interfaces/loginUser-interface';
import { map, tap, catchError } from 'rxjs/operators';
import { GlobalDataService } from './global-data.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url=this.globalData.getUrlServer();
  private lang=this.globalData.getUserLanguage();
 // private token:string;

  constructor( private http:HttpClient,
               private globalData:GlobalDataService ) { 
  //  this.token=localStorage.getItem('token')
  }

  loginUser(user:LoginUser):Observable<any>{ 
    return this.http.post(`${this.url}/login/`,user) 
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
}


