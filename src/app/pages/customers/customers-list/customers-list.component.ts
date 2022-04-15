import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import {Sort} from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';

import { CustomerService } from '../../../services/customer.service';
import { VenueService } from '../../../services/venue.service';
import {GlobalDataService} from '../../../services/global-data.service';
import { Customer } from '../../../interfaces/customer-interface';
import { Venue } from '../../../interfaces/venue-interface';
import { UtilService } from '../../../services/util.service';
import { LoginService } from '../../../services/login.service';

 

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent implements OnInit {

  public customers:Customer[];
  public cargando:boolean=false;
  public filterCustomer:string='';
  public page:number=0;
  public linesPages:number=9;
  public sortedData:Customer[];
  public modalReference:NgbModalRef;
  public closeResult = '';
  public venues:Venue[];
  public activeLang = this.globalDataServices.getStringUserLanguage();

  
  constructor(private customerServices:CustomerService,
    private venueService:VenueService,
    private utilService:UtilService,
    private globalDataServices:GlobalDataService,
    private loginServices:LoginService,
    private router:Router,
    private translate: TranslateService,
    config: NgbModalConfig,  
    private modalService: NgbModal ) {
      config.backdrop = 'static';
      config.keyboard = false; 
    }
    
    ngOnInit(): void {
      
    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);
    this.cargando=true;
    this.customerServices.getCustomers()
    .subscribe(resp=>{
      if (resp.result===true) this.customers=resp.data;
      this.cargando=false;
      this.sortedData=this.customers.slice();
      },
      err=>{console.log(err);
        this.loginServices.accessErrorText(err)
        .then(resp=>{
          this.loginServices.logout();
          this.router.navigate(['/login']);    
        })
      });
    
  }

  removeCustomer(customer:Customer,i:number){

    let msg1:string='';
    let msg2:string='';

    this.translate.get('general.modalClosePage14')
    .subscribe(res=>msg1=res);

    Swal.fire({
      title: msg1,
      text: `${customer.name}`,
      icon: 'question',
      allowOutsideClick:false,
      cancelButtonText:'Cancelar',
      confirmButtonColor: '#007bff',
      showConfirmButton:true,
      showCancelButton:true,
    }).then(resp=>{
      if (resp.value){
        
        this.customerServices.deleteCustomer(customer.id.toString())
        .subscribe(resp=>{
          this.sortedData.splice(this.sortedData.findIndex(e=> e.id===customer.id),1);
    
          if(this.page===this.sortedData.length) this.page -=this.linesPages;
          
        },
        error=>{
          this.translate.get('general.modalClosePage12')
          .subscribe(res=>msg1=res);
          this.translate.get('general.modalClosePage13', {value1: customer.name})
          .subscribe(res=>msg2=res);

          Swal.fire({
            title: msg1,
            text: msg2,
            confirmButtonColor: '#007bff',
            icon:'error',
            allowOutsideClick:false
          });
        });
      }
    })

  return
  }
  editCustomer(customer:Customer){

    this.router.navigate(['/home/customer',customer.id]);
  }

  venuesList(content:any,i:number){

    this.venueService.getVenueByCustomer(this.sortedData[i].id)
    .subscribe(resp=>{
      if (resp.result===true){
        this.venues=resp.data
        this.modalReference=this.modalService.open(content, {ariaLabelledBy: 'modal-venues',  size: 'xl' , scrollable: true} );
        this.modalReference.result.then((result) => { 
          this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              if(reason=='Cross click'){
                return     
              }
          });
      } else{
        this.venues=[];
      }
    });
  }

  editVenue(venueId:number){
    this.modalReference.close();
    this.router.navigate(['/home/venue',venueId]);
  }

  sitesList(venueId:number,ind:number){
    if (this.venues[ind].sites.length>0){
      this.modalReference.close();
      this.router.navigate(['/home/site-list',venueId]);
    }
    return
  }


  sortData(sort: Sort) {
    const data = this.customers.slice(); 
    
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.utilService.compare(a.id, b.id, isAsc);
        case 'cif':
          return this.utilService.compare(a.identification, b.identification, isAsc);
        case 'nombre':
          return this.utilService.compare(a.name, b.name, isAsc);
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
