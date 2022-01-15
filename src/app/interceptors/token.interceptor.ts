import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable,throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { GlobalDataService } from '../services/global-data.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private globalData:GlobalDataService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
 //   console.log('paso por el interceptor');

    const token=this.globalData.getToken();
    const headers= new HttpHeaders({
    'authorization':token 
    });

    const requestClone= request.clone({
      headers
    });


    return next.handle(requestClone).pipe(
      catchError(this.manejarError)    
    )
  }

  manejarError(error:HttpErrorResponse){

    console.log('sucedio un error',error);
    return throwError('error personalizado')
  }

}
