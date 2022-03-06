import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {  TranslateModule} from '@ngx-translate/core';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [NavbarComponent, FooterComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule
  ],
  exports:[NavbarComponent,FooterComponent]
})
export class ComponentsModule { }
