import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import {CustomersListComponent} from './customers/customers-list/customers-list.component';
import {CustomerComponent} from './customers/customer/customer.component';
import {UsersListComponent} from './users/users-list/users-list.component';
import {UserComponent} from './users/user/user.component';
import {UserExceptionsComponent} from './users/user-exceptions/user-exceptions.component';
import {VenuesListComponent} from './venues/venues-list/venues-list.component';
import {VenueComponent} from './venues/venue/venue.component';
import {HomeComponent} from './home/home.component';
import {SitesListComponent} from './sites/sites-list/sites-list.component';
import {SiteComponent} from './sites/site/site.component';

const routes: Routes = [
 {
    path:'home',
    component:HomeComponent,
    children:[
      // {path:'', component:HomeComponent},
      {path:'user-list', component:UsersListComponent},
      {path:'user-exceptions/:id', component:UserExceptionsComponent},
      {path:'user/:id', component:UserComponent},
      {path:'customer-list', component:CustomersListComponent},
      {path:'customer/:id', component:CustomerComponent},
      {path:'venue-list', component:VenuesListComponent},
      {path:'venue/:id', component:VenueComponent},
      {path:'site-list', component:SitesListComponent},
      {path:'site/:id', component:SiteComponent},
   ]
 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
