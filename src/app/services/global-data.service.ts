import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {

  urlServer:string='http://192.168.1.42:3700';
  
  urlImageBrand=this.urlServer+'/brandimage/';
  urlImageVenue=this.urlServer+'/venueimage/';
  urlImageSite=this.urlServer+'/siteimage/';

  imageDefault='../../../../assets/img/noimage.png'
  
  supportedLanguages=['es','en'];
  defaultLanguage:string='es';
  languagesArray: {[key: string]: number} = {
    es: 1,
    en: 2
  };

  constructor() { }


  getUrlServer(){
    return this.urlServer;
  }
  getUrlImageBrand(){
    return this.urlImageBrand;
  }
  getUrlImageVenue(){
    return this.urlImageVenue;
  }
  getUrlImageSite(){
    return this.urlImageSite;
  }
  getUrlImageDefault(){
    return this.imageDefault;
  }

  getUserId(){

    const userid = localStorage.getItem('userId')?localStorage.getItem('userId'):'0';
    return userid;
  }
  getToken(){

    const token = localStorage.getItem('token')?localStorage.getItem('token'):'a.a.a';
    return token;
  }
  getUserLanguage(){

    const language=localStorage.getItem('language')?localStorage.getItem('language'):this.defaultLanguage;
    return this.languagesArray[language];
  }
  getStringUserLanguage(){
    return localStorage.getItem('language')?localStorage.getItem('language'):this.defaultLanguage;;
  }


}
