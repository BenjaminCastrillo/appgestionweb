import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatRadioModule} from '@angular/material/radio';
import {MatIconModule} from '@angular/material/icon';
import {  TranslateModule} from '@ngx-translate/core';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ComponentsModule } from '../components/components.module';

import { PipesModule } from '../pipes/pipes.module';
import { HomeComponent } from './home/home.component';
import { CustomerComponent } from './customers/customer/customer.component';
import { CustomersListComponent } from './customers/customers-list/customers-list.component';
import { UserComponent } from './users/user/user.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { VenuesListComponent } from './venues/venues-list/venues-list.component';
import { VenueComponent } from './venues/venue/venue.component';
import { SitesListComponent } from './sites/sites-list/sites-list.component';
import { SiteComponent } from './sites/site/site.component';
import { PagesComponent } from './pages.component';


@NgModule({
  declarations: [
    HomeComponent, 
    CustomersListComponent,
    CustomerComponent,
    PagesComponent,  
    SiteComponent,
    SitesListComponent, 
    UserComponent, 
    UsersListComponent,
    VenueComponent, 
    VenuesListComponent, 
    ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    PipesModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule,
    ComponentsModule,
    MatRadioModule,
    MatIconModule,
    TranslateModule,
    MatSortModule,
   // MatButtonModule,
  ],
  exports:[
    CustomerComponent, 
    CustomersListComponent,
    HomeComponent, 
    UserComponent,
    UsersListComponent,
    VenueComponent, 
    VenuesListComponent,
    ]
})
export class PagesModule { }
