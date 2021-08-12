import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { from } from 'rxjs';
import {HttpClientModule} from '@angular/common/http';
import {registerLocaleData} from '@angular/common';
import localEs from '@angular/common/locales/es'

registerLocaleData(localEs);

import { AppRoutingModule } from './app-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { PagesModule} from  './pages/pages.module';

import { UploadService } from './services/upload.service';
import { UtilService } from './services/util.service';
import { UserService } from './services/user.service';
import { CustomerService } from './services/customer.service';
import { VenueService } from './services/venue.service';


@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    ComponentsModule,
    PagesModule,
  ],
  providers: [
    CustomerService,
    UploadService,
    UtilService,
    UserService,
    VenueService,
    {  provide:LOCALE_ID,
      useValue:'es'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
