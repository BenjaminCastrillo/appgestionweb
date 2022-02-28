import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS,HttpClient} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import localEs from '@angular/common/locales/es';
import {registerLocaleData} from '@angular/common';

 registerLocaleData(localEs);

import { AppRoutingModule } from './app-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; 
import { TranslateService , TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { PagesModule} from  './pages/pages.module';
import { LoginComponent } from './login/login.component';
import { PagenofoundComponent } from './pagenofound/pagenofound.component';

import { UploadService } from './services/upload.service';
import { UtilService } from './services/util.service';
import { GlobalDataService } from './services/global-data.service';
import { UserService } from './services/user.service';
import { CustomerService } from './services/customer.service';
import { VenueService } from './services/venue.service';
import { SiteService } from './services/site.service';
import { LoginService } from './services/login.service';
import { LanguageService } from './services/language.service';

import { TokenInterceptor } from './interceptors/token.interceptor';
import { HomeComponent } from './pages/home/home.component';


// export function HttpLoaderFactory(http:HttpClient){
// return new TranslateHttpLoader(http) 
// }

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PagenofoundComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader:{
           provide: TranslateLoader,
           useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http ,'./assets/i18n/', '.json');
        },
           deps:[HttpClient]
         }

        }),
    // ComponentsModule,
    PagesModule,
    
 
//    TimepickerModule.forRoot(),

// config:{
//   loader:{
//     provide: TranslateLoader,
//     useFactory:HttpLoaderFactory,
//     deps:[HttpClient]
//   }
// }

  ],
  providers: [
    CustomerService,
    UploadService,
    UtilService,
    UserService,
    VenueService,
    SiteService,
    GlobalDataService,
    LoginService,
    {  provide:LOCALE_ID,
      deps:[LanguageService],
      useFactory:(languageService)=>languageService.getLanguage()
    },
    {
      provide:HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
// useValue:'es'
export class AppModule { }
