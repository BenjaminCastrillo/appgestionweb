import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { from } from 'rxjs';
import {HttpClientModule} from '@angular/common/http';
// import {MatButtonModule} from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

import localEs from '@angular/common/locales/es';
import {registerLocaleData} from '@angular/common';

 registerLocaleData(localEs);

import { AppRoutingModule } from './app-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'; 
// import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TranslateService , TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
// import { ComponentsModule } from './components/components.module';
import { PagesModule} from  './pages/pages.module';


import { UploadService } from './services/upload.service';
import { UtilService } from './services/util.service';
import { UserService } from './services/user.service';
import { CustomerService } from './services/customer.service';
import { VenueService } from './services/venue.service';
import { SiteService } from './services/site.service';
import { LoginService } from './services/login.service';
import { LanguageService } from './services/language.service';

import { LoginComponent } from './login/login.component';
import { PagenofoundComponent } from './pagenofound/pagenofound.component';


// import {TranslateHttpLoader} from '@ngx-translate/http-loader;
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
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    // ComponentsModule,
    PagesModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    
 
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
    LoginService,
    {  provide:LOCALE_ID,
      deps:[LanguageService],
      useFactory:(languageService)=>languageService.getLanguage()
    }
  ],
  bootstrap: [AppComponent]
})
// useValue:'es'
export class AppModule { }
