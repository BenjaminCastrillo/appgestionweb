import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PagesRoutingModule } from './pages/pages.routing.module';

import {LoginComponent} from './login/login.component';
import { PagenofoundComponent } from './pagenofound/pagenofound.component';

const routes: Routes = [
  { path:'', redirectTo:'/home',pathMatch:'full'},
  { path:'login', component:LoginComponent},

  { path:'**', component:PagenofoundComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes),
            PagesRoutingModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
// export const APP_ROUTING=RouterModule.forRoot(APP_ROUTES);
