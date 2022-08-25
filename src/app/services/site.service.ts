import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SitesResponse, Site, ScreenLocation, ScreenBrand, ScreenType, ScreenModel, Orientation, SiteStatus, AspectRatio } from '../interfaces/site-interface';
import { SitesListResponse } from '../interfaces/user-interface';
import { Venue } from '../interfaces/venue-interface';
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

  updateStatusSite(a:SiteStatus):Observable<any>{
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

  getAspectRatio(customerId:number):Observable<AspectRatio[]>{

    return this.http.get<any>(`${this.url}/aspectratio/${customerId}`)
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

  // la dejo de ejemplo para una promesa pero no la uso
  
  cargarSitesB(venues:Venue[]):Promise <Site[]>{

    return new Promise (resolve=>{
      let localizacion:string;
      let a=[];
  
      for (let i=0;i<venues.length;i++){
  
        let loc=venues[i].location.length>1?'('+venues[i].location[venues[i].location.length-2].territorialEntityName+')':null;
        localizacion=venues[i].location[venues[i].location.length-1].territorialEntityName+' '+loc
    
        for (let ii=0;ii<venues[i].sites.length;ii++){    
         
           a.push({                   
            id:              venues[i].sites[ii].id,
            siteComercialId: venues[i].sites[ii].siteComercialId,
            idpti:           venues[i].sites[ii].idpti,
            venueId:         venues[i].id,
            name:            venues[i].name,
            customer:        venues[i].customer,
            network:         venues[i].sites[ii].network,
            status:          venues[i].sites[ii].status,
            entryDate:       venues[i].sites[ii].entryDate,
            publicScreen:    venues[i].sites[ii].publicScreen,
            on_off:          venues[i].sites[ii].on_off,
            text:            venues[i].sites[ii].text,
            screenLocation:  venues[i].sites[ii].screenLocation,
            category:        venues[i].sites[ii].category,
            screen:          venues[i].sites[ii].screen,
            player:          venues[i].sites[ii].player,
            filter:          null,
            location:        venues[i].location,
            descriptionLocation:localizacion,
            roadType:        venues[i].roadType,
            address:         venues[i].address,
            streetNumber:    venues[i].streetNumber,
            postalCode:      venues[i].postalCode,
            latitude:        venues[i].latitude,
            longitude:       venues[i].longitude,
          });
        }
      }
  
      resolve (a);
  
    })
  
  }

}
