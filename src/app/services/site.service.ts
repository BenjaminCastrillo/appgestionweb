import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SitesResponse, Site, ScreenLocation, ScreenBrand, ScreenType, ScreenModel, Orientation, siteStatus } from '../interfaces/site-interface';
import { SitesListResponse } from '../interfaces/user-interface';
import { Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { GlobalDataService } from './global-data.service';

@Injectable({
  providedIn: 'root'
})
export class SiteService {

  private url=this.globalData.getUrlServer();
  private lang=this.globalData.getUserLanguage();
  private user=this.globalData.getUserId();

  constructor(private http:HttpClient,
    private globalData:GlobalDataService) { }

  getSiteById(id:string):Observable<SitesResponse>{
    return this.http.get<SitesResponse>(`${this.url}/sitesbyid/${id}/${this.user}/${this.lang}`);                                                  
  }
  getSiteByIdCustomer(id:number):Observable<SitesListResponse>{
    return this.http.get<SitesListResponse>(`${this.url}/sitesbycustomer/${id}/${this.lang}`);                                                  
  }

  updateSite(site:Site):Observable<any>{
    return this.http.put(`${this.url}/sites/`,site);
  }

  deleteSite(id:string):Observable<any>{
    return this.http.delete(`${this.url}/sites/${id}`);
  }

  updateStatusSite(a:siteStatus):Observable<any>{
    return this.http.put(`${this.url}/statusites/`,a);
  }

  getScreenLocations(id:number):Observable<ScreenLocation[]>{

    return this.http.get<any>(`${this.url}/screenlocation/${id}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      })
    )
  }
  getScreenBrands():Observable<ScreenBrand[]>{
    return this.http.get<any>(`${this.url}/screenbrands`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      })
    )
  }
  getScreenModels():Observable<ScreenModel[]>{
    return this.http.get<any>(`${this.url}/screenmodels/${this.lang}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      })
    )
  }

  getScreenTypes():Observable<ScreenType[]>{
    return this.http.get<any>(`${this.url}/screentypes/${this.lang}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      })
    )
  }

  getScreenOrientations():Observable<Orientation[]>{

    return this.http.get<any>(`${this.url}/orientations/${this.lang}`)
    .pipe(
      map (resp=>{
        if (resp.result===true)
            return resp.data
        else 
            return []
      })
    )
  }
}
