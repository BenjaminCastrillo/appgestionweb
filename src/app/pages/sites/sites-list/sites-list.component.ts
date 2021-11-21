import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Venue, Status } from '../../../interfaces/venue-interface';
import { Site } from '../../../interfaces/site-interface';
import { VenueService } from '../../../services/venue.service';
import { SiteService } from '../../../services/site.service';
import Swal from 'sweetalert2';



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
  public linesPages:number=8;
  public listSites:Site[];


  constructor(private venueServices:VenueService,
              private siteServices:SiteService,
              private router:Router
  ) { }

  ngOnInit(): void {
    this.cargando=true;
    this.venueServices.getVenues()
    .subscribe(resp=>{    
      if (resp.result===true){ 
        this.venues=resp.data;     
        console.log(this.venues);
        // Cargamos array de sites
        this.listSites=this.cargarSites(this.venues)
        this.cargando=false;   
      }
    });
  }
  
  cargarSites(venues:Venue[]){

    let localizacion:string;
    let a=[];

    for (let i=0;i<venues.length;i++){

      let loc=venues[i].location.length>1?'('+venues[i].location[venues[i].location.length-2].territorialEntityName+')':null;
      localizacion=venues[i].location[venues[i].location.length-1].territorialEntityName+' '+loc
  
      for (let ii=0;ii<venues[i].sites.length;ii++){    
       
         a.push({                   
          id:              venues[i].sites[ii].id,
          siteComercialId: venues[i].sites[ii].siteComercialId,
          idpti:           venues[i].sites[ii].idpti,
          venueId:         venues[i].id,
          name:            venues[i].name,
          customer:        venues[i].customer,
          network:         venues[i].sites[ii].network,
          status:          venues[i].sites[ii].status,
          entryDate:       venues[i].sites[ii].entryDate,
          publicScreen:    venues[i].sites[ii].publicScreen,
          on_off:          venues[i].sites[ii].on_off,
          text:            venues[i].sites[ii].text,
          screenLocation:  venues[i].sites[ii].screenLocation,
          category:        venues[i].sites[ii].screenLocation,
          screen:          venues[i].sites[ii].screenLocation,
          player:          venues[i].sites[ii].screenLocation,
          filter:          null,
          location:        venues[i].location,
          descriptionLocation:localizacion,
          roadType:        venues[i].roadType,
          address:         venues[i].address,
          streetNumber:    venues[i].streetNumber,
          postalCode:      venues[i].postalCode,
          latitude:        venues[i].latitude,
          longitude:       venues[i].longitude,

        });
      }
    }
    return a
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
  
    this.router.navigate(['/site',site.id]);
  }

  removeSite(site:Site){
  
    if (site.status.id===1){
    Swal.fire({
      title:'¿Desea borrar el registro?',
      text: `${site.siteComercialId} localizado en ${site.name}`,
      icon: 'question',
      cancelButtonText:'Cancelar',
      confirmButtonColor: '#007bff',
      showConfirmButton:true,
      showCancelButton:true,
    }).then(resp=>{
      if (resp.value){
        this.siteServices.deleteSite(site.id.toString())
        .subscribe(resp=>{
          this.listSites.splice(this.listSites.findIndex(e=> e.id===site.id),1);
          },
          error=>{
            Swal.fire({
              title: 'Lo siento tuvimos un problema',
              text:`El registro de ${site.siteComercialId} no se eliminó`,
              confirmButtonColor: '#007bff',
              icon:'error'
            });
            console.log(error.error.result);
          });
      }
    })
  }else{
    Swal.fire({
      title: 'Lo siento, sólo se pueden eliminar los emplazamientos pendientes de instalar',
      text:`El registro de ${site.siteComercialId} no se eliminará`,
      confirmButtonColor: '#007bff',
      icon:'error'
    });

  }
  return
  }
}
