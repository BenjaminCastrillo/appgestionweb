import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Venue } from '../../../interfaces/venue-interface';
import { VenueService } from '../../../services/venue.service';
import Swal from 'sweetalert2';

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
  public linesPages:number=12;


  constructor(private venueServices:VenueService,
    private router:Router) { }

  ngOnInit(): void {
    this.cargando=true;
    this.venueServices.getVenues()
    .subscribe(resp=>{    
      if (resp.result===true){ 
        this.venues=resp.data;     
        this.cargando=false;   
      }
    });
  }

  editVenue(venue:Venue){
  
    this.router.navigate(['/venue',venue.id]);
  }

  removeVenue(venue:Venue){
    Swal.fire({
      title:'¿Desea borrar el registro?',
      text: `${venue.name}`,
      icon: 'question',
      cancelButtonText:'Cancelar',
      confirmButtonColor: '#007bff',
      showConfirmButton:true,
      showCancelButton:true,
    }).then(resp=>{
      if (resp.value){
        // this.venueServices.deleteVenue(venue.id.toString())
        // .subscribe(resp=>{
          this.venues.splice(this.venues.findIndex(e=> e.id===venue.id),1);
      }

    });
    return
  }

  sitesList(venue:Venue){
    this.router.navigate(['/user-exceptions',venue.id]);
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
}
