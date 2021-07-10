import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {VenueComponent} from './pages/venue/venue.component';
import {CustomersListComponent} from './pages/customers/customers-list/customers-list.component';
import {CustomerComponent} from './pages/customers/customer/customer.component';
import {SiteComponent} from './pages/site/site.component';
import {UsersListComponent} from './pages/users/users-list/users-list.component';
import {HomeComponent} from './pages/home/home.component';

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
    path:'customer-list',
    component:CustomersListComponent  
  },
  {
    path:'customer/:id',
    component:CustomerComponent  
  },
  {
    path:'venue',
    component:VenueComponent
  },
  {
    path:'site',
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
