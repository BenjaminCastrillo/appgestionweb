import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject} from 'rxjs';
import { FormControl } from '@angular/forms';
import { UsersResponse, User } from '../interfaces/user-interface';
import { map, delay } from 'rxjs/operators';


interface ErrorValidate{
  [s:string]:boolean
}
@Injectable({
  providedIn: 'root'
})
export class UserService {



  private url='http://192.168.1.42:3700';
  private lang=1;
  
  constructor(private http:HttpClient) { }

  getUsers():Observable<UsersResponse>{
    return this.http.get<UsersResponse>(`${this.url}/users/${this.lang}`)
    .pipe(
      delay(0));
  }

  getUserById(id:string):Observable<UsersResponse>{
    return this.http.get<UsersResponse>(`${this.url}/userbyid/${id}/${this.lang}`);
  }

  getUserByEmail(email:string):Observable<UsersResponse>{
    return this.http.get<UsersResponse>(`${this.url}/userbyemail/${email}/${this.lang}`);
  }

  saveUser(user:User):Observable<any>{

    return this.http.post(`${this.url}/users/`,user);
  }

  updateUser(user:User):Observable<any>{
 
     return this.http.put(`${this.url}/users/`,user);   
  }
  deleteUser(id:string):Observable<any>{
    return this.http.delete(`${this.url}/users/${id}`);
  }

  getLanguages():Observable<any>{
    return this.http.get<any>(`${this.url}/languages`);
  }
  getRoles():Observable<any>{
    return this.http.get<any>(`${this.url}/roles/${this.lang}`);
  }


  
}

