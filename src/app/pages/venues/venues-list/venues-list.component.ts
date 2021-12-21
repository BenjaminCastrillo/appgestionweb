import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { Venue } from '../../../interfaces/venue-interface';
import { VenueService } from '../../../services/venue.service';
import { UtilService } from '../../../services/util.service';
import Swal from 'sweetalert2';
import {Sort} from '@angular/material/sort'; 

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
  public linesPages:number=10;
  public closeResult = '';
  public linesPagesModal:number=8;
  public pageModal:number=0;
  public filterSite:string='';
  public modalReference:NgbModalRef;
  public sortedData:Venue[];

  constructor(private venueServices:VenueService,
    private UtilService:UtilService,
    private router:Router,
    config: NgbModalConfig, 
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.cargando=true;
    this.venueServices.getVenues()
    .subscribe(resp=>{    
      if (resp.result===true){ 
        this.venues=resp.data;     
        this.cargando=false;   
        this.sortedData=this.venues.slice();
      }
    });
  }

  editVenue(venue:Venue){
    this.router.navigate(['/venue',venue.id]);
  }

  removeVenue(venue:Venue){

    let unsubscribeSites:boolean=true;
    
    // comprobamos que todos los sites del venue esta de baja o no instalados
    for (let i=0;i<venue.sites.length;i++){
      
      console.log(venue.sites[i].status.id);
      if (venue.sites[i].status.id==2 || venue.sites[i].status.id==3) {
        unsubscribeSites=false;
        i=venue.sites.length
      }
    }

    if (unsubscribeSites){
      Swal.fire({
        title:'¿Desea borrar el registro?',
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
            this.venues.splice(this.venues.findIndex(e=> e.id===venue.id),1);
            this.sortedData.splice(this.sortedData.findIndex(e=> e.id===venue.id),1);
          });
      }
      })
    }else{
      Swal.fire({
        title: 'Lo siento, sólo se pueden borrar los locales con todos los emplazamientos de baja',
        text:`El local ${venue.name} no se borrará`,
        allowOutsideClick:false,
        confirmButtonColor: '#007bff',
        icon:'error'
      });
    }
    return
  }

  sitesList(content:any,i:number){
   this.modalReference=this.modalService.open(content, {ariaLabelledBy: 'modal-horarios',  size: 'xl' , scrollable: true} );

  //  this.modalService.open(content, {ariaLabelledBy: 'modal-horarios',  size: 'xl' , scrollable: true} ).result.then((result) => {      
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
    this.router.navigate(['/site',id]);
  }


  sortData(sort: Sort) {
    const data = this.venues.slice(); 
    
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      console.log(a,b)
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
