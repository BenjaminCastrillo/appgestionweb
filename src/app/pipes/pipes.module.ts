import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerPipe } from './customer.pipe';
import { UserPipe } from './user.pipe';
import { VenuePipe } from './venue.pipe';
import { NotdeletedbrandsPipe } from './notdeletedbrands.pipe';
import { NotdeletedmarketregionPipe } from './notdeletedmarketregion.pipe';
import { TerritorialentitiesPipe } from './territorialentities.pipe';
import { SchedulesPipe } from './schedules.pipe';
import { SitePipe } from './site.pipe';
import { NotdeletedscreenlocationPipe } from './notdeletedscreenlocation.pipe';
import { ModelscreenPipe } from './modelscreen.pipe';
import { HomePipe } from './home.pipe';
import { ListsitesPipe } from './listsites.pipe';



@NgModule({
  declarations: [CustomerPipe,
    UserPipe, 
    VenuePipe, 
    NotdeletedbrandsPipe, 
    NotdeletedmarketregionPipe, 
    TerritorialentitiesPipe, 
    SchedulesPipe, 
    SitePipe, 
    NotdeletedscreenlocationPipe, 
    ModelscreenPipe, 
    HomePipe, ListsitesPipe],

  imports: [
    CommonModule
  ],
  
  exports:[
    CustomerPipe,
    UserPipe,
    VenuePipe,
    NotdeletedbrandsPipe,
    NotdeletedmarketregionPipe,
    TerritorialentitiesPipe,
    NotdeletedscreenlocationPipe,
    SchedulesPipe,
    SitePipe,
    ModelscreenPipe,
    HomePipe,
    ListsitesPipe
  ]
})
export class PipesModule { }