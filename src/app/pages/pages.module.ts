import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { PipesModule } from '../pipes/pipes.module';
import { HomeComponent } from './home/home.component';

import { CustomerComponent } from './customers/customer/customer.component';
import { CustomersListComponent } from './customers/customers-list/customers-list.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UserComponent } from './users/user/user.component';
import { VenueComponent } from './venues/venue/venue.component';
import { VenuesListComponent } from './venues/venues-list/venues-list.component';
import { SitesListComponent } from './sites/sites-list/sites-list.component';
import { SiteComponent } from './sites/site/site.component';


@NgModule({
  declarations: [
    HomeComponent, 
    UserComponent, 
    UsersListComponent,
    CustomerComponent, 
    CustomersListComponent,
    VenueComponent, 
    VenuesListComponent, SitesListComponent, SiteComponent, 
    ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    PipesModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  exports:[
    HomeComponent, 
    UserComponent,
    UsersListComponent,
    CustomerComponent, 
    CustomersListComponent,
    VenueComponent, 
    VenuesListComponent,
    ]
})
export class PagesModule { }
