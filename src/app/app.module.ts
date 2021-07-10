import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { from } from 'rxjs';
import {HttpClientModule} from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { PagesModule} from  './pages/pages.module';
import { CustomerService } from './services/customer.service';
import { UploadService } from './services/upload.service';
import { UtilService } from './services/util.service';
import { UserService } from './services/user.service';





@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    PagesModule,
  ],
  providers: [
    CustomerService,
    UploadService,
    UtilService,
    UserService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
