import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject} from 'rxjs';
import { LoginResponse ,LoginUser } from '../interfaces/loginUser-interface';
import { map } from 'rxjs/operators';
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
  deleteToken(){
    
    // let headers = new HttpHeaders({
      //   'Content-Type':'form-data',
      //   'token':this.token
      // })
      
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
    localStorage.removeItem('language');

    return
  }
}


