import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalDataService } from '../services/global-data.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {


  constructor(private translate:TranslateService,
    private globalDataServices:GlobalDataService,) { }

  getLanguage(){

    let userLanguage:string= localStorage.getItem('language');
    if (!userLanguage){
       userLanguage= this.translate.getBrowserLang();
    }
    console.log('en el serviceLanguage el idioma del navegador es',userLanguage)
    const validLanguage=this.globalDataServices.supportedLanguages.includes(userLanguage)?userLanguage:this.globalDataServices.defaultLanguage;
    localStorage.setItem('language',validLanguage);
    return validLanguage;
  }

  updateLanguage(newLanguage:string){

    this.translate.setDefaultLang(newLanguage);
    this.translate.use(newLanguage);
    
    localStorage.setItem('language',newLanguage);
    return
  }
}
