import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import {Sort} from '@angular/material/sort'; 

import { Venue } from '../../../interfaces/venue-interface';
import { VenueService } from '../../../services/venue.service';
import { UtilService } from '../../../services/util.service';
import { GlobalDataService } from '../../../services/global-data.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-venues-list',
  templateUrl: './venues-list.component.html',
  styleUrls: ['./venues-list.component.css']
})
export class VenuesListComponent implements OnInit {

  public venues:Venue[];
  public cargando:boolean=false;
  public filterVenue:string='';
  public page:number=0;
  public linesPages:number=9;
  public closeResult = '';
  public linesPagesModal:number=8;
  public pageModal:number=0;
  public filterSite:string='';
  public modalReference:NgbModalRef;
  public sortedData:Venue[];
  public activeLang:string = this.globalDataServices.getStringUserLanguage();

  constructor(private venueServices:VenueService,
    private UtilService:UtilService,
    private translate: TranslateService,
    private globalDataServices:GlobalDataService,
    private loginServices:LoginService,
    private router:Router,
    config: NgbModalConfig,  
    private modalService: NgbModal) {
      config.backdrop = 'static';
      config.keyboard = false; 
     }

  ngOnInit(): void {
    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);
    this.cargando=true;
    this.venueServices.getVenues(null) 
    .subscribe(resp=>{    
      if (resp.result===true){ 
        this.venues=resp.data;     
        this.cargando=false;   
        this.sortedData=this.venues.slice();
      }
    },
    err=>{console.log(err);
      this.loginServices.accessErrorText(err)
      .then(resp=>{
        this.loginServices.logout();
        this.router.navigate(['/login']);    
      })
    });
  }

  editVenue(venue:Venue){
    this.router.navigate(['/home/venue',venue.id]);
  }

  removeVenue(venue:Venue){

    let unsubscribeSites:boolean=true;
    let msg1:string='';
    let msg2:string='';    
    // comprobamos que todos los sites del venue esta de baja o no instalados
    for (let i=0;i<venue.sites.length;i++){
      
      if (venue.sites[i].status.id==2 || venue.sites[i].status.id==3) {
        unsubscribeSites=false;
        i=venue.sites.length
      }
    }

    if (unsubscribeSites){

      this.translate.get('general.modalClosePage14')
      .subscribe(res=>msg1=res);

      Swal.fire({
        title: msg1,
        text: `${venue.name}`,
        icon: 'question',
        allowOutsideClick:false,
        cancelButtonText:'Cancelar',
        confirmButtonColor: '#007bff',
        showConfirmButton:true,
        showCancelButton:true,
      }).then(resp=>{
        if (resp.value){
          this.venueServices.deleteVenue(venue.id.toString())
          .subscribe(resp=>{
       //     this.venues.splice(this.venues.findIndex(e=> e.id===venue.id),1);
            this.sortedData.splice(this.sortedData.findIndex(e=> e.id===venue.id),1);
            if(this.page===this.sortedData.length) this.page -=this.linesPages;
          });
      }
      })
    }else{
      this.translate.get('general.modalClosePage15')
      .subscribe(res=>msg1=res);
      this.translate.get('general.modalClosePage13', {value1: venue.name})
      .subscribe(res=>msg2=res);
      
      Swal.fire({
        title: msg1,
        text:msg2,
        allowOutsideClick:false,
        confirmButtonColor: '#007bff',
        icon:'error'
      });
    }
    return
  }

  sitesList(content:any,i:number){
   this.modalReference=this.modalService.open(content, {ariaLabelledBy: 'modal-sites',  size: 'xl' , scrollable: true} );

  this.modalReference.result.then((result) => { 
    this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        if(reason=='Cross click'){
          return     
        }
    });
  }

  editSite(id:number){
    this.modalReference.close();
    this.router.navigate(['/home/site',id]);
  }


  sortData(sort: Sort) {
    const data = this.venues.slice(); 
    
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.UtilService.compare(a.id, b.id, isAsc);
        case 'nombre':
          return this.UtilService.compare(a.name, b.name, isAsc);
        case 'localizacion':
          return this.UtilService.compare(a.location[a.location.length-1].territorialEntityName, b.location[b.location.length-1].territorialEntityName, isAsc);
        case 'direccion':
          return this.UtilService.compare(a.roadType.description, b.roadType.description, isAsc);         

        default:
          return 0;          
      }
    });
  }

  buscar(tecla:string){
    this.page=0;
    return  
  }
  nextPage(){
    this.page +=this.linesPages;
    return  
  }
  prevPage(){
    this.page -=this.linesPages;
    return  
  }

  nextPageModal(){
    this.pageModal +=this.linesPagesModal;
    return  
  }
  prevPageModal(){
    this.pageModal -=this.linesPagesModal;
    return  
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
