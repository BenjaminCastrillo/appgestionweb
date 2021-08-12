import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerPipe } from './customer.pipe';
import { UserPipe } from './user.pipe';
import { VenuePipe } from './venue.pipe';
import { NotdeletedbrandsPipe } from './notdeletedbrands.pipe';



@NgModule({
  declarations: [CustomerPipe,UserPipe, VenuePipe, NotdeletedbrandsPipe],
  imports: [
    CommonModule
  ],
  exports:[
    CustomerPipe,
    UserPipe,
    VenuePipe,
    NotdeletedbrandsPipe
  ]
})
export class PipesModule { }