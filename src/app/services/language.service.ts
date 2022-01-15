import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  supportedLanguages=['es','en'];
  defaultLanguage='en';

  constructor(private translate:TranslateService) { }

  getLanguage(){

    const userLanguage= this.translate.getBrowserLang();
    console.log('en el serviceLanguage',userLanguage)
    const validLanguage=this.supportedLanguages.includes(userLanguage)?userLanguage:this.defaultLanguage;
    localStorage.setItem('language',validLanguage);
    return validLanguage;

  }
}
