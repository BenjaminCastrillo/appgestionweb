import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable} from 'rxjs';
import Swal from 'sweetalert2';
import {FormBuilder, FormGroup,Validators, FormArray} from '@angular/forms';

import { Venue, Country, Customer, Brand, MarketRegion } from '../../../interfaces/venue-interface';
import { VenueService } from '../../../services/venue.service';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.css']
})
export class VenueComponent implements OnInit {

  public venueForm: FormGroup;
  public currentVenue:Venue;
  public countries:Country[];
  public customers:Customer[];
  public brands:Brand[];
  public marketRegions:MarketRegion[];
  public venueId:string;
  public newVenue:boolean;
  public tituloPagina:string;

  


  constructor(private fb: FormBuilder,
    private venueServices:VenueService,
    private customerServices:CustomerService,
    private ActivatedRoute:ActivatedRoute,
    private router:Router

  ) { 
    this.crearFormulario();
  }

  ngOnInit(): void {

    this.venueId= this.ActivatedRoute.snapshot.paramMap.get('id');
    if (this.venueId==='nuevo'){
      this.newVenue=true;
      this.tituloPagina='Alta nuevo local';
    }else{
      this.newVenue=false;
      this.tituloPagina='Modificación de datos del local';
      this.venueServices.getVenueById(this.venueId)
      .subscribe(resp=>{
          this.currentVenue=resp.data[0];
          console.log('registro actual',this.currentVenue);
          this.crearListeners();
          this.loadData(resp.data[0]);
        //  this.getCustomerData(this.currentVenue.customer.id);
        


      })
    }  
    this.customerServices.getCustomers().subscribe(resp=>{
      if (resp.result===true) {
          this.customers=resp.data.map(elem=> {
            return {id:elem.id, 
                    identification:elem.identification, 
                    name:elem.name}})

      }
    });  
    this.venueServices.getCountries()
      .subscribe(resp=>{
            this.countries=resp;
            console.log('estos son los paises',this.countries)
    });    

  }

  get nombreNoValido() {
    return (
      this.venueForm.get('nombre').invalid &&
      this.venueForm.get('nombre').touched
    );
  }
  get paisNoValido() {
    return (
      this.venueForm.get('pais').invalid &&
      this.venueForm.get('pais').touched
    );
  }
  get marcaNoValido() {
    return (
      this.venueForm.get('marca').invalid &&
      this.venueForm.get('marca').touched
    );
  }

  get regionComercialNoValido() {
    return (
      this.venueForm.get('regionComercial').invalid &&
      this.venueForm.get('regionComercial').touched
    );
  }
  get clienteNoValido() {
    return (
      this.venueForm.get('cliente').invalid &&
      this.venueForm.get('cliente').touched
    );
  }

  crearFormulario() {
    this.venueForm = this.fb.group({
  //    id:           [{value:'',disabled:true}],
      nombre:         ['', Validators.required],
      cliente:        ['', Validators.required],
      marca:          [''],
      fechaAlta:      [{value:'',disabled:true}],
      pais:           ['', Validators.required],
      regionComercial:[''],
  });
}
  loadData(venue:Venue){

  //  this.venueForm.get('id').patchValue(venue.id);
    this.venueForm.get('nombre').patchValue(venue.name);
    this.venueForm.get('cliente').patchValue(venue.customer.id);
    this.venueForm.get('marca').patchValue(venue.brand.id);
    this.venueForm.get('fechaAlta').patchValue(venue.entryDate);
    this.venueForm.get('pais').patchValue(venue.country.id);
    this.venueForm.get('regionComercial').patchValue(venue.marketRegion.id);




    console.log(this.venueForm);
  }
  getCustomerData(customer:number){
    this.customerServices.getBrandsBytIdCustomer(customer)
    .subscribe(resp=>{
          this.brands=resp;
          console.log('marcas',this.brands);

    });    
    this.customerServices.getMarketRegionsBytIdCustomer(customer)
    .subscribe(resp=>{
        this.marketRegions=resp;
    });  

  }
  crearListeners(){

    this.venueForm.get('cliente').valueChanges.subscribe(a=>{
      if (this.venueForm.get('cliente').value==this.currentVenue.customer.id){
        this.venueForm.get('marca').patchValue(this.currentVenue.brand.id);
        this.venueForm.get('regionComercial').patchValue(this.currentVenue.marketRegion.id);
      }
      else{
        this.venueForm.get('marca').patchValue(null);
        this.venueForm.get('regionComercial').patchValue(null);
      }
      this.getCustomerData(this.venueForm.get('cliente').value);
      
    });
    this.venueForm.get('marca').valueChanges.subscribe(a=>{
      console.log('escuchando marca...');
     
    });
  } 

  selectPais(elem:number){
    return elem===this.venueForm.get('pais').value?true:false;
  }
  selectMarca(elem:number){
    return elem===this.venueForm.get('marca').value?true:false;
  }
  selectCliente(elem:number){
    return elem===this.venueForm.get('cliente').value?true:false;
  }
  selectRegionComercial(elem:number){
    return elem===this.venueForm.get('regionComercial').value?true:false;
  }

  onSubmit() {
    if (this.venueForm.touched){
     

        let peticionHtml: Observable <any>;
        // Preparar los datos
       

        // let respuesta:User ={
        //       id                  :this.userId==='nuevo'?null:Number(this.userId),
        //       name                :this.userForm.get('nombre').value,
        //       surname             :this.userForm.get('apellido').value,
        //       email               :this.userForm.get('email').value,
        //       newPassword         :this.userForm.get('nuevaPassword').value,           
        //       password            :this.userForm.get('password').value,
        //       rol                 :objectRol,          
        //       relationship        :Number(this.userForm.get('rol').value)==3?this.userForm.get('relacionUsuario').value:null,
        //       blocked             :this.userForm.get('bloqueado').value,
        //       notes               :this.userForm.get('notas').value,
        //       languageId          :Number(this.userForm.get('idioma').value),
        //       lastAccess          :this.userForm.get('ultimoAcceso').value,
        //       categories          :cat,
        //       customerUserList    :cus,
        //       sitesLists          :sit
        // }

        // if (this.userId==='nuevo'){
        //   peticionHtml=this.userServices.saveUser(respuesta);
        // }else{
        //   peticionHtml=this.userServices.updateUser(respuesta);
        // };

      //   peticionHtml.subscribe(resp=>{     
      //     Swal.fire({
      //       title: `El registro ${resp.data.name}`,
      //       text:'se actualizó correctamente',
      //       confirmButtonColor: '#007bff',
      //       icon:'success'
      //     });
      //     this.venueForm.reset();
      //     this.router.navigate(['/user-list']);
      //   },
      //   error=>{
      //     console.log(error);
      //   })
      // };
    }else{
      console.log('No hago nada y sigo en la página ');
    }
  
    return;
  }


  abandonarPagina(){
    if (this.venueForm.touched){
      Swal.fire({
        title:'¿Desea abandonar la página?',
        text: 'los cambios realizados se perderán',
        icon: 'info',
        confirmButtonColor: '#007bff',
        cancelButtonText:'Cancelar',
        showConfirmButton:true,
        showCancelButton:true,
      }).then(resp=>{
        if (resp.value){
          this.venueForm.reset();
          this.router.navigate(['/venue-list']);          
        }
      });
    }else{
      this.venueForm.reset();
      this.router.navigate(['/venue-list']);          

    }
    return;
  }
  msgError(campo: string): string {
  
    if(this.venueForm.get(campo).hasError('required')) return 'El campo es obligatorio';
    if(this.venueForm.get(campo).hasError('minlength'))
      return `La longitud mínima del campo ${campo} es ${this.venueForm.get(campo).errors.minlength.requiredLength}`;
    if(this.venueForm.get(campo).hasError('maxlength'))
      return `La longitud máxima del campo ${campo} es ${this.venueForm.get(campo).errors.maxlength.requiredLength}`;
  
    return ;
  }
}
