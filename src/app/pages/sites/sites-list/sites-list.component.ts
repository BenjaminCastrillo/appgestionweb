import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute } from '@angular/router';
import {Sort} from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import { GlobalDataService } from '../../../services/global-data.service';
import { LoginService } from '../../../services/login.service';
import { SiteService } from '../../../services/site.service';
import { Site, siteStatus } from '../../../interfaces/site-interface';
import { VenueService } from '../../../services/venue.service';
import { Venue } from '../../../interfaces/venue-interface';
import { UtilService } from '../../../services/util.service';

 

@Component({
  selector: 'app-sites-list',
  templateUrl: './sites-list.component.html',
  styleUrls: ['./sites-list.component.css']
})
export class SitesListComponent implements OnInit {

  public venues:Venue[];
  public cargando:boolean=false;
  public filterSite:string='';
  public page:number=0;
  public linesPages:number=9;
  public listSites:Site[];
  public sortedData:Site[];
  public venueId:string;
  public venueName:string;

  public activeLang:string = this.globalDataServices.getStringUserLanguage();

  constructor(private venueServices:VenueService,
              private siteServices:SiteService,
              private loginServices:LoginService,
              private UtilServices:UtilService,
              private translate: TranslateService,
              private globalDataServices:GlobalDataService,
              private router:Router,
              private ActivatedRoute:ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);
    this.venueId= this.ActivatedRoute.snapshot.paramMap.get('id');
    this.cargando=true;

    if (this.venueId==='todos'){
      this.venueServices.getVenues()
      .subscribe(resp=>{    
        if (resp.result===true){ 
          this.venues=resp.data;     
    //      console.log(this.venues)
          // Cargamos array de sites
         this.sortedData=this.listSites=this.venueServices.cargarSites(this.venues);
        //  this.sortedData=this.listSites.slice();
          this.cargando=false;   
        }
      },
      err=>{console.log(err);
        this.loginServices.accessErrorText(err)
        .then(resp=>{
          this.loginServices.logout();
          this.router.navigate(['/login']);    
        })
      }
      );
    }else{
      this.venueServices.getVenueById(this.venueId)  
      .subscribe(resp=>{    
        if (resp.result===true){ 
          this.venues=resp.data;     
          // Cargamos array de sites
          this.sortedData=this.listSites=this.venueServices.cargarSites(this.venues);
        //  this.sortedData=this.listSites.slice();
          this.cargando=false;   
        }
      },
      err=>{console.log(err);
        this.loginServices.accessErrorText(err)
        .then(resp=>{
          this.loginServices.logout();
          this.router.navigate(['/login']);    
        })
      }
      );
    }
            
  } 
  
  sortData(sort: Sort) {
    const data = this.listSites.slice(); 
    
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
 
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.UtilServices.compare(a.id, b.id, isAsc);
        case 'codigo':
          return this.UtilServices.compare(a.siteComercialId, b.siteComercialId, isAsc);
        case 'local':
          return this.UtilServices.compare(a.name, b.name, isAsc);
        case 'localizacion':
          return this.UtilServices.compare(a.descriptionLocation, b.descriptionLocation, isAsc);         
        case 'situacion':
          return this.UtilServices.compare(a.screenLocation.description, b.screenLocation.description, isAsc);
        case 'estado':
          return this.UtilServices.compare(a.status.id, b.status.id, isAsc);         

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

  editSite(site:Site){
  
    this.router.navigate(['/home/site',site.id]);
  }

  removeSite(site:Site){
  
    let msg1:string='';
    let msg2:string='';

    if (site.status.id===1){
      this.translate.get('general.modalClosePage14')
      .subscribe(res=>msg1=res);
      this.translate.get('general.modalClosePage17', 
                  {value1: site.siteComercialId,
                  value2: site.name})
      .subscribe(res=>msg2=res);

      Swal.fire({
        title:msg1,
        text: msg2,
        icon: 'question',
        cancelButtonText:'Cancelar',
        confirmButtonColor: '#007bff',
        allowOutsideClick:false,
        showConfirmButton:true,
        showCancelButton:true,
      }).then(resp=>{
        if (resp.value){
          this.siteServices.deleteSite(site.id.toString())
          .subscribe(resp=>{
        //    this.listSites.splice(this.listSites.findIndex(e=> e.id===site.id),1);
            this.sortedData.splice(this.sortedData.findIndex(e=> e.id===site.id),1);
            if(this.page===this.sortedData.length) this.page -=this.linesPages; 
          },
            error=>{
              this.translate.get('general.modalClosePage12')
              .subscribe(res=>msg1=res);
              this.translate.get('general.modalClosePage13', {value1: site.siteComercialId})
              .subscribe(res=>msg2=res);

              Swal.fire({
                title: msg1,
                text: msg2,
                confirmButtonColor: '#007bff',
                allowOutsideClick:false,
                icon:'error'
              });
              console.log(error.error.result);
            });
        }
      })
    }else{
      this.translate.get('general.modalClosePage18')
      .subscribe(res=>msg1=res);
      this.translate.get('general.modalClosePage13', {value1: site.siteComercialId})
      .subscribe(res=>msg2=res);

      Swal.fire({
        title: msg1,
        text:msg2,
        confirmButtonColor: '#007bff',
        allowOutsideClick:false,
        icon:'error'
      });
    }
  return
  
  }
// unsubscribeSite(site:Site,i:number) {
  
//   const a:siteStatus={
//     siteId: site.id,
//     newStatus:4
//   }
  
//   let msg1:string='';
//   let msg2:string='';

//   if (site.status.id!=1){
//     this.translate.get('general.modalClosePage19')
//     .subscribe(res=>msg1=res);
//     this.translate.get('general.modalClosePage17', 
//                       {value1: site.siteComercialId,
//                       value2: site.name})
//     .subscribe(res=>msg2=res);
//     Swal.fire({
//       title:msg1,
//       text: msg2,
//       icon: 'question',
//       cancelButtonText:'Cancelar',
//       confirmButtonColor: '#007bff',
//       allowOutsideClick:false,
//       showConfirmButton:true,
//       showCancelButton:true,
//     }).then(resp=>{
//       if (resp.value){
//         this.siteServices.updateStatusSite(a)
//         .subscribe(resp=>{
//   //        this.listSites.splice(this.listSites.findIndex(e=> e.id===site.id),1);
//           this.listSites[i].status.id=4;
//           },
//           error=>{
//             this.translate.get('general.modalClosePage12')
//             .subscribe(res=>msg1=res);
//             this.translate.get('general.modalClosePage13', {value1: site.siteComercialId})
//             .subscribe(res=>msg2=res);

//             Swal.fire({
//               title: msg1,
//               text:msg2,
//               confirmButtonColor: '#007bff',
//               allowOutsideClick:false,
//               icon:'error'
//             });
//             console.log(error.error.result);
//           });
//       }
//     })
//   }else{
//     Swal.fire({
//       title: 'Lo siento, sólo se pueden dar de baja los emplazamientos activos',
//       text:`El emplazamiento ${site.siteComercialId} no se dará de baja`,
//       allowOutsideClick:false,
//       confirmButtonColor: '#007bff',
//       icon:'error'
//     });
//   }


// return
// }

}
