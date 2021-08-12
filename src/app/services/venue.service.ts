import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { VenuesResponse, Country, Customer } from '../interfaces/venue-interface';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private url='http://192.168.1.42:3700';
  private user=47; // obtener en un futuro del usuario de la aplicación
  private lang=1;  // obtener en un futuro del usuario de la aplicación
  
  constructor(private http:HttpClient,
    private customerServices:CustomerService,) { }

  getVenues():Observable<VenuesResponse>{
    return this.http.get<VenuesResponse>(`${this.url}/venuesandsitesbyuser/${this.user}/${this.lang}`);
  }
  getVenueById(id:string):Observable<VenuesResponse>{
    return this.http.get<VenuesResponse>(`${this.url}/venueandsitesbyid/${id}/${this.user}/${this.lang}`)

  }

  deleteVenue(id:string):Observable<any>{
  

    return this.http.delete(`${this.url}/venues/${id}`);
  }


  getCountries():Observable<Country[]>{
    return this.http.get<any>(`${this.url}/countries/${this.lang}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      }),
      map(paises=>{
          return paises
      })
    )
  }
  
}
