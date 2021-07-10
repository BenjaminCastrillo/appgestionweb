import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { VenueComponent } from './venue/venue.component';
import { SiteComponent } from './site/site.component';
import { CustomerComponent } from './customers/customer/customer.component';
import { CustomersListComponent } from './customers/customers-list/customers-list.component';
import { CustomerPipe } from '../pipes/customer.pipe';
import { UserPipe } from '../pipes/user.pipe';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UserComponent } from './users/user/user.component';

@NgModule({
  declarations: [
    HomeComponent, 
    CustomerComponent, 
    VenueComponent, 
    SiteComponent, 
    CustomersListComponent,
    CustomerPipe,
    UserPipe,
    UserComponent, 
    UsersListComponent,
    ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports:[
    HomeComponent, 
    CustomerComponent, 
    VenueComponent, 
    SiteComponent, 
    UserComponent,
    CustomersListComponent,
    ]
})
export class PagesModule { }
