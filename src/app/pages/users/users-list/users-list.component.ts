import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../interfaces/user-interface';
import { UserService } from '../../../services/user.service';
import { VenueService } from '../../../services/venue.service';
import { UtilService } from '../../../services/util.service';
import { Venue } from '../../../interfaces/venue-interface';
import { Site } from '../../../interfaces/site-interface';
import { GlobalDataService } from '../../../services/global-data.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import {Sort} from '@angular/material/sort';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

 

// Declaramos las variables para jQuery
declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  public users:User[];
  public cargando:boolean=false;
  public filterUser:string='';
  public page:number=0;
  public linesPages:number=9;
  public filterLines:number=0;
  public sortedData:User[];
  public venues:Venue[];
  public listSites:Site[];
  public modalReference:NgbModalRef;
  public closeResult = '';
  public activeLang:string = this.globalDataServices.getStringUserLanguage();

  constructor(private userServices:UserService,
    private router:Router,
    private utilServices:UtilService,
    private venueServices:VenueService,
    private translate: TranslateService,
    private globalDataServices:GlobalDataService,
    config: NgbModalConfig,  
    private modalService: NgbModal) {
      config.backdrop = 'static';
      config.keyboard = false; 
     }

  ngOnInit(): void {
    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);

    this.cargando=true;
    this.userServices.getUsers()
    .subscribe(resp=>{
      if (resp.result===true){ 
        this.users=resp.data;
        this.cargando=false;
        this.sortedData=this.users.slice();
      }
    },
          err=>{console.log(err);});
  }

  editUser(user:User){
    this.router.navigate(['/home/user',user.id]);
  }

  removeUser(user:User,i:number){
    Swal.fire({
      title:'¿Desea borrar el registro?',
      text: `${user.name} ${user.surname}`,
      icon: 'question',
      cancelButtonText:'Cancelar',
      allowOutsideClick:false,
      confirmButtonColor: '#007bff',
      showConfirmButton:true,
      showCancelButton:true,
    }).then(resp=>{ 
      if (resp.value){
        this.userServices.deleteUser(user.id.toString())
        .subscribe(resp=>{
         // this.users.splice(this.users.findIndex(e=> e.id===user.id),1);
          this.sortedData.splice(this.sortedData.findIndex(e=> e.id===user.id),1);
          if(this.page===this.sortedData.length) this.page -=this.linesPages;  
        },
          error=>{
            Swal.fire({
              title: 'Lo siento tuvimos un problema',
              text:`El registro de ${user.name} ${user.surname} no se eliminó`,
              allowOutsideClick:false,
              confirmButtonColor: '#007bff',
              icon:'error'
            });
            console.log(error.error.result);
          });
      }
 
    });
    return
  }

  sitesUser(content:any,i:number){

    this.venueServices.getVenues(this.users[i].id.toString())
    .subscribe(resp=>{    
      if (resp.result===true){ 
        this.venues=resp.data;     
        // Cargamos array de sites
        console.log('los venues',this.venues);
         this.listSites=this.venueServices.cargarSites(this.venues);
        

        this.modalReference=this.modalService.open(content, {ariaLabelledBy: 'modal-sites',  size: 'xl' , scrollable: true} );
        this.modalReference.result.then((result) => { 
          this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              if(reason=='Cross click'){
                return     
              }
          });     
        }else{
          this.listSites=[];
      }
    });
  }

  editSite(siteId:number){
    this.modalReference.close();
    
    this.router.navigate(['/home/site',siteId]);
  }

  sortData(sort: Sort) {
    const data = this.users.slice(); 
    
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.utilServices.compare(a.id, b.id, isAsc);
        case 'nombre':
          return this.utilServices.compare(a.name, b.name, isAsc);
        case 'apellidos':
          return this.utilServices.compare(a.surname, b.surname, isAsc);
        case 'correo':
          return this.utilServices.compare(a.email, b.email, isAsc);         
        case 'rol':
          return this.utilServices.compare(a.rol.id, b.rol.id, isAsc);  
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
