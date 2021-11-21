import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomersListComponent} from './pages/customers/customers-list/customers-list.component';
import {CustomerComponent} from './pages/customers/customer/customer.component';
import {UsersListComponent} from './pages/users/users-list/users-list.component';
import {UserComponent} from './pages/users/user/user.component';
import {UserExceptionsComponent} from './pages/users/user-exceptions/user-exceptions.component';
import {VenuesListComponent} from './pages/venues/venues-list/venues-list.component';
import {VenueComponent} from './pages/venues/venue/venue.component';
import {HomeComponent} from './pages/home/home.component';
import {SitesListComponent} from './pages/sites/sites-list/sites-list.component';
import {SiteComponent} from './pages/sites/site/site.component';

const routes: Routes = [
  {
    path:'home',
    component:HomeComponent
  },
  {
    path:'user-list',
    component:UsersListComponent
  },
  {
    path:'user-exceptions/:id',
    component:UserExceptionsComponent
  },
  {
    path:'user/:id',
    component:UserComponent
  },
  {
    path:'customer-list',
    component:CustomersListComponent  
  },
  {
    path:'customer/:id',
    component:CustomerComponent  
  },
  {
  path:'venue-list',
  component:VenuesListComponent
  },
  {
    path:'venue/:id',
    component:VenueComponent
  },
  {
    path:'site-list',
    component:SitesListComponent
  },
  {
    path:'site/:id',
    component:SiteComponent
  },
  {
    path:'**',
    redirectTo:'/home'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
// export const APP_ROUTING=RouterModule.forRoot(APP_ROUTES);
