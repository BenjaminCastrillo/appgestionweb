import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service'; 
import {GlobalDataService} from '../../services/global-data.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

   public userName=localStorage.getItem('user');
   public activeLang = this.globalDataServices.getStringUserLanguage();

  constructor(private loginServices:LoginService,
    private globalDataServices:GlobalDataService, 
    private translate: TranslateService,
    private router:Router) { }

  ngOnInit(): void {
    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);
  }

  logout(){
    console.log('en logout');
    this.loginServices.logout();
    this.router.navigateByUrl('/login');

  }
  buscarElemento(texto:string){
  texto=texto.trim();
  if(texto.length===0){
    return;
  }
    console.log(texto);
  }
}
