import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject} from 'rxjs';
import { LoginUser } from '../interfaces/loginUser-interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url='http://192.168.1.42:3700';
  private lang=1;
  private token:string;

  constructor( private http:HttpClient ) { 
    this.token=localStorage.getItem('token')
  }

  loginUser(user:LoginUser):Observable<any>{ 
    return this.http.post(`${this.url}/login/`,user,{observe:'response'})
    .pipe(
      map(resp=>{
        console.log(resp)
    //    this.saveToken(resp.idToken)
      })
    );
  }
  private saveToken(idToken:string){

    let headers = new HttpHeaders({
      'Content-Type':'form-data',
      'token':this.token
    })

    localStorage.setItem('token',idToken);

  }
}


