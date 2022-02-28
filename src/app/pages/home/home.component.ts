import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {GlobalDataService} from '../../services/global-data.service';


 

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public cargando:boolean=false;
  public activeLang = this.globalDataServices.getStringUserLanguage();
 

 
  constructor(
    private translate: TranslateService,
    private globalDataServices:GlobalDataService
  ) {   

  } 

  ngOnInit(): void {
    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);
    this.cargando=true;
  
   
  }








}
