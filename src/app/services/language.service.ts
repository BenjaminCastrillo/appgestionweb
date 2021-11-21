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
    return this.supportedLanguages.includes(userLanguage)?userLanguage:this.defaultLanguage;

  }
}
