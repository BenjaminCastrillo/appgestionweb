import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { Observable,throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { GlobalDataService } from '../services/global-data.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private globalData:GlobalDataService,
    private router:Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
 
  console.log('en el interceptor', request.urlWithParams);
  const token=this.globalData.getToken();
  const headers= new HttpHeaders({
   'authorization':token 
  });
  
  const requestClone= request.clone({
      headers
  });

  return next.handle(requestClone).pipe(
      catchError(this.manejarError));

  }

  manejarError(error:HttpErrorResponse){

    let txtError=''
    console.log('sucedio un error en el interceptor',error,error.status);

    const err=error.status;
    switch (err) {
      case 0:
        txtError='Error del servidor';  
        break;
      case 401:
        txtError='Error de acceso';  
        break;
      case 550:
        txtError='Error del servidor';  
        break;    
      default:
        txtError='Error desconocido'; 
    }
//      this.router.navigateByUrl('/login');
    console.log('EL TEXTO',txtError);
 
    return throwError(txtError)
  }

}
