import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject} from 'rxjs';
import { UsersResponse, User } from '../interfaces/user-interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url='http://192.168.1.42:3700';
  
  constructor(private http:HttpClient) { }

  getUsers():Observable<UsersResponse>{
    return this.http.get<UsersResponse>(`${this.url}/users/1`);
  }
}
