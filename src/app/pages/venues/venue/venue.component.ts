import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable,forkJoin} from 'rxjs';
import Swal from 'sweetalert2';
import {FormBuilder, FormGroup,Validators, FormControl,FormArray} from '@angular/forms';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
// import { IDropdownSettings } from 'ng-multiselect-dropdown';

import { Venue, Country, Customer, Brand, MarketRegion, PhoneNumber, RoadType, Week, Schedule, Weekly, StartDate } from '../../../interfaces/venue-interface';
import {SitesComercialCode} from '../../../interfaces/customer-interface';
import { VenueService } from '../../../services/venue.service';
import { CustomerService } from '../../../services/customer.service';
import { UploadService  } from '../../../services/upload.service';
import { UtilService } from '../../../services/util.service';
import { GlobalDataService } from '../../../services/global-data.service';


interface ImagenesFile{
  cod:string,
  file:File
}

// interface MultiselectSchedule{
//   item_id:number,
//   item_text:string
// }

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  styleUrls: ['./venue.component.css']
})
export class VenueComponent implements OnInit {

  private imageDefault=this.globalData.getUrlImageDefault();
  private urlImageBrand=this.globalData.getUrlImageBrand();
  private urlImageVenue=this.globalData.getUrlImageVenue();


  public venueForm: FormGroup;
  public currentVenue:Venue=null;
  public countries:Country[]=[];
  public customers:Customer[]=[];
  public brands:Brand[]=[];
  public marketRegions:MarketRegion[]=[];
  public roadTypes:RoadType[]=[];
  public location:any[]=[];
  public week:Week[]=[];
  public schedules:Schedule[]=[];
  public comercialCodes:SitesComercialCode[]=[];
  public monthsLicense:number[];
 



  public ordenHorario:number=0;
  public ordenContacto:number=0;
  public venueId:string;
  public newVenue:boolean;
  public tituloPagina:string;
  public marcaBorrada:boolean=false;
  public regionComercialBorrada:boolean=false;
  public lastLocation:number[]=[];
  public prevCountry:number=0;
  public binariosImagenMarca:string;
  public filterSchedules:string='';
  public page:number=0;
  public linesPages:number=8;
  public closeResult = '';
  public binariosImagenLocal:string;
  public filesImagenVenue:ImagenesFile;
 //  public dropdownSettings:IDropdownSettings = {};
  


  constructor(private fb: FormBuilder,
    private venueServices:VenueService,
    private customerServices:CustomerService,
    private ActivatedRoute:ActivatedRoute,
    private uploadServices:UploadService,
    private utilService:UtilService,
    private globalData:GlobalDataService,
    private router:Router,
    config: NgbModalConfig, private modalService: NgbModal

  ) { 
    config.backdrop = 'static';
    config.keyboard = false; 
    this.crearFormulario();
  }

  ngOnInit(): void {

    this.venueId= this.ActivatedRoute.snapshot.paramMap.get('id');
    if (this.venueId==='nuevo'){
      this.newVenue=true;
      this.tituloPagina='Alta nuevo local';   
      // this.binariosImagenMarca=this.imageDefault;
      // this.binariosImagenLocal=this.imageDefault;
      this.crearListeners();
    }else{
      this.newVenue=false;
      this.tituloPagina='Modificación datos del local';
      this.venueServices.getVenueAndSiteById(this.venueId)
      .subscribe(resp=>{
          this.currentVenue=resp.data[0];
          console.log('El venue',this.currentVenue);   
          this.venueServices.getSchedules(this.currentVenue.customer.id) 
          .subscribe(resp=>{
            this.schedules=resp
          });      
          this.loadData(resp.data[0]);   
          this.crearListeners();
        })
    }  
    this.customerServices.getCustomers()
      .subscribe(resp=>{
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
    });    
    this.venueServices.getRoadTypes()
    .subscribe(resp=>{
      this.roadTypes=resp;
    });     
    this.venueServices.getWeek()
    .subscribe(resp=>{   
      this.week=resp;
    });    
    this.venueServices.getMonthsLicenses()
    .subscribe(resp=>{   
      this.monthsLicense=resp;
    }); 
  
  }

  onItemSelect(item: any) {
  }
  onSelectAll(items: any) {
  }

  onItemDeselect(item: any) {
  }

      
  crearFormulario() {

    this.venueForm = this.fb.group({
      nombre:         ['', Validators.required],
      cliente:        ['', Validators.required],
      marca:          ['',this.deletedBrand.bind(this)],
   //   fechaAlta:      [{value:'',disabled:true}],
      pais:           ['', Validators.required],
      regionComercial:['',this.deletedMarketRegion.bind(this)],
      localizacion:   this.fb.array([]),
      tipoVia:        ['', Validators.required],
      calle:          ['', Validators.required],
      numero:         ['', Validators.required],
      codigoPostal:   ['', [Validators.required,Validators.pattern('[0-9]*'),Validators.maxLength(5)]],
      imagenLocal:    [''],
      nombreArchivo:  [''],
      tocado:         false,
      codigoImagen:   [this.utilService.ramdonNumber(200000,900000).toString()],
      horario:        this.fb.array([]),   
      contacto:       this.fb.array([]),       
      emplazamiento:  this.fb.array([]),  

      schedulesSearch:  [],
    });

  }

  loadData(venue:Venue){
    let lo=[], sc=[], co=[], cop=[];

    console.log('cargo los datos')
    venue.location.forEach(elem=>{
      lo.push(this.newLocalizacion(elem.id,elem.territorialOrganizationId,
        elem.territorialOrganizationName,null,elem.territorialEntityId, 
        elem.territorialEntityName));
        this.lastLocation.push(elem.territorialEntityId);
    });

    venue.schedule.forEach(elem=>{
      sc.push(this.newHorario(elem.id,elem.description,elem.startDate,elem.weekly,elem.idCustomerSchedule))
    });

    venue.contact.forEach((elem,ind)=>{
      co.push(this.newContacto(elem.id,elem.name,elem.email,elem.notes))
      cop.push(new Array())
      elem.phoneNumbers.forEach(e=>{
        cop[ind].push(this.newTelefono(e.id,e.number,e.notes))
      })
    });
   


    this.binariosImagenMarca=(venue.brand.image)?this.urlImageBrand+venue.brand.image:this.imageDefault;
    this.binariosImagenLocal=(venue.image)?this.urlImageVenue+venue.image:this.imageDefault;

    this.prevCountry=venue.country.id;
  //  this.venueForm.get('id').patchValue(venue.id);
    this.venueForm.get('nombre').patchValue(venue.name);
    this.venueForm.get('cliente').patchValue(venue.customer.id);
    this.venueForm.get('marca').patchValue(venue.brand.id);
  //  this.venueForm.get('fechaAlta').patchValue(venue.entryDate);
    this.venueForm.get('pais').patchValue(venue.country.id);
    this.venueForm.get('regionComercial').patchValue(venue.marketRegion.id);
    this.venueForm.get('tipoVia').patchValue(venue.roadType.id);    
    this.venueForm.get('calle').patchValue(venue.address);    
    this.venueForm.get('numero').patchValue(venue.streetNumber);
    this.venueForm.get('codigoPostal').patchValue(venue.postalCode);
    this.venueForm.get('nombreArchivo').patchValue(venue.image);


    this.venueForm.setControl('localizacion',this.fb.array(lo||[]));
    this.venueForm.setControl('horario',this.fb.array(sc||[]));
    this.venueForm.setControl('contacto',this.fb.array(co||[]));
    this.venueForm.setControl('emplazamiento',this.fb.array([]));

    this.contacto.controls.forEach((elem,ind) => {
      this.ordenContacto=ind;
      cop[ind].forEach(element => {
        this.telefonos.push(element)
      });
    });

    this.marcaBorrada=venue.brand.deleted;
    this.regionComercialBorrada=venue.marketRegion.deleted;
    
    console.log('formulario cargado',this.venueForm);
  
    // cargamos tablas de datos de clientes
    this.getCustomerData(venue.customer.id);  
    
    // cargamos las entidades de la organización
    this.getTerritorialEntities(lo)
    .then(res=>{
      this.location=res;
      this.listenerLocation();
    })

  }

  crearListeners(){

    // Detección cambios en el cliente
    this.venueForm.get('cliente').valueChanges.subscribe(a=>{
      console.log('detecto cambio en cliente',a)
      if (!this.newVenue){
        if(a==this.currentVenue.customer.id){
          // Si vuelve a seleccionar el cliente inicial cargo la marca y region comercial iniciales
          this.venueForm.get('marca').patchValue(this.currentVenue.brand.id);
           // Cambiamos la imagen de la marca
          this.binariosImagenMarca=(this.currentVenue.brand.image)?this.urlImageBrand+this.currentVenue.brand.image:this.imageDefault;
          this.venueForm.get('regionComercial').patchValue(this.currentVenue.marketRegion.id);
          // Cargamos los horarios del cliente inicial
          let sc=[];
          this.currentVenue.schedule.forEach(elem=>{
            sc.push(this.newHorario(elem.id,elem.description,elem.startDate,elem.weekly,elem.idCustomerSchedule));
          });
          this.venueForm.setControl('horario',this.fb.array(sc||[]));

        }else{
          this.venueForm.get('marca').patchValue(null);
          this.venueForm.get('regionComercial').patchValue(null);
          this.horario.clear();
        }
      }
      
      this.getCustomerData(a);  
    });

    // Detección cambios en la marca
    this.venueForm.get('marca').valueChanges.subscribe(a=>{
      console.log('detecto cambio en marca',a)
      if (this.brands.length>0){
        let b=this.brands.find(elem=>elem.id==a)
        // Cambiamos la imagen de la marca
        this.binariosImagenMarca=(b===undefined)?this.imageDefault:this.urlImageBrand+b.image;
      }
      if (this.marcaBorrada) this.marcaBorrada=false;
    });

    // Detección cambios en la region comercial
    this.venueForm.get('regionComercial').valueChanges.subscribe(a=>{
      console.log('detecto cambio en region comercial',a)
      if (this.regionComercialBorrada) this.regionComercialBorrada=false;     
    });

    // Detección cambios en el pais
    this.venueForm.get('pais').valueChanges.subscribe(codPais=>{
      console.log('detecto cambios en pais',codPais,this.prevCountry);
      if (this.newVenue || codPais!=this.prevCountry){ // && codPais!=''
        this.prevCountry=codPais;
        this.getLocationData(codPais) // Organizacion territorial del nuevo pais
        .then(res=>{
          this.venueForm.setControl('localizacion',this.fb.array(res));
          this.venueForm.get('tipoVia').patchValue(null);    
          this.venueForm.get('calle').patchValue(null);    
          this.venueForm.get('numero').patchValue(null);
          this.venueForm.get('codigoPostal').patchValue(null);
          this.listenerLocation();
        });
      }else{
        this.listenerLocation();
      }
    });

    // deteccion campo busqueda horario
    this.venueForm.get('schedulesSearch').valueChanges.subscribe(a=>{
      console.log('detecto cambio en schedule buscado',a)
      this.filterSchedules=a;
      this.page=0;
    });
  } 

  listenerLocation(){

    this.localizacion.valueChanges.subscribe(a=>{         
    //  Comprobamos el nivel cambiado y actualizamos los inferiores a null
      for (let ind=0;ind<a.length;ind++){      
        if (a[ind].idEntidadTerritorial!=this.lastLocation[ind]){
          this.lastLocation[ind]=a[ind].idEntidadTerritorial;        
          for (let i=ind+1;i<a.length;i++){
            if (this.localizacion.controls[i].get('idEntidadTerritorial').value!=null){
              this.localizacion.controls[i].get('idEntidadTerritorial').patchValue(null);
              this.lastLocation[i]=null;
            }
          }
          ind= a.length
        }
      };
      this.getTerritorialEntities(this.localizacion.controls)
          .then(res=>{
              this.location=res;
          })     
    });  
  }

 
  get localizacion(): FormArray {
    return this.venueForm.get('localizacion') as FormArray;
  }
  get horario(){
    return this.venueForm.get('horario') as FormArray;
  }
  get weekly(){
    return this.horario.controls[this.ordenHorario].get('weekly') as FormArray;
 }
  get contacto(){
    return this.venueForm.get('contacto') as FormArray;
  }
  get emplazamiento(){
    return this.venueForm.get('emplazamiento') as FormArray;
  }
  get telefonos(){
    return this.contacto.controls[this.ordenContacto].get('telefonos') as FormArray;
  }

  get nombreNoValido() {
    return (
      this.venueForm.get('nombre').invalid &&
      this.venueForm.get('nombre').touched
    );
  }
  get clienteNoValido() {
    return (
      this.venueForm.get('cliente').invalid &&
      this.venueForm.get('cliente').touched
    );
  }
  get codigoComercialNoValido() {
    return (
      this.venueForm.get('cliente').invalid &&
      this.venueForm.get('cliente').touched
    );
  }
  get paisNoValido() {
    return (
      this.venueForm.get('pais').invalid &&
      this.venueForm.get('pais').touched
    );
  }
  get marcaNoValido() {
    let result:boolean
    if(this.newVenue){
      result= this.venueForm.get('marca').invalid &&
                this.venueForm.get('marca').touched
    }else{
      result=this.currentVenue.brand.deleted &&
                this.currentVenue.brand.id==this.venueForm.get('marca').value
    }
    return result
  }

  get regionComercialNoValido() {
    let result:boolean
    if(this.newVenue){
      result= this.venueForm.get('regionComercial').invalid &&
                this.venueForm.get('regionComercial').touched
    }else{
      result=this.currentVenue.marketRegion.deleted && 
              this.currentVenue.marketRegion.id==this.venueForm.get('regionComercial').value
    }
    return result
    
  } 

  get entidadTerritoriallNoValido() {
    return (
      this.venueForm.get('idEntidadTerritorial').invalid &&
      this.venueForm.get('idEntidadTerritorial').touched
    );
  } 
  get tipoViaNoValido() {
    return (
      this.venueForm.get('tipoVia').invalid &&
      this.venueForm.get('tipoVia').touched
    );
  }
  get calleNoValido() {
    return (
      this.venueForm.get('calle').invalid &&
      this.venueForm.get('calle').touched
    );
  }
  get numeroNoValido() {
    return (
      this.venueForm.get('numero').invalid &&
      this.venueForm.get('numero').touched
    );
  }
  get codigoPostalNoValido() {
    return (
      this.venueForm.get('codigoPostal').invalid &&
      this.venueForm.get('codigoPostal').touched
    );
  }
  
  newLocalizacion(a:number,b:number,c:string,d:number|null,e:number,f:string): FormGroup {
    return this.fb.group({
      idLocalizacion: [a],
      idOrganizacionTerritorial: [b],
      nombreOrganizacionTerritorial: [c],
      jerarquia:[d],
      idEntidadTerritorial: [e,Validators.required],
    });
  }

  newHorario(a:number,b:string,c:StartDate,d:Weekly[],e:number|null): FormGroup {

    let horarioForm = this.fb.group({
      idHorario:           [a],
      descripcionHorario:  [b],
      diaInicio:           [c.description, Validators.required],
      weekly:              this.fb.array([]),
      idRelacionHorario:   [e, Validators.required]
    });
    // cargamos los horarios de la semana
    horarioForm.setControl('weekly',this.fb.array(d||[]));
    return horarioForm;
  }
  
  newContacto(a:number,b:string,c:string,d:string): FormGroup {
    return this.fb.group({
      idContacto: [a],
      nombre:     [b,Validators.required],
      email:      [c,[Validators.required,
                  Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      notas:      [d,Validators.maxLength(200)],
      telefonos:  this.fb.array([])
    }); 
  }

  newTelefono(a:number,b:string,c:string): FormGroup {
    return this.fb.group({
      idTelefono:    [a],
      numeroTelefono:[b,[Validators.required, Validators.pattern('[0-9]*'),Validators.maxLength(18)]],
      notasTelefono: [c,Validators.maxLength(200)]
    }); 
  }

  newEmplazamiento(a:number,b:number,c:number): FormGroup {
    return this.fb.group({
      idEmplazamiento:    [a],
      idCodigoComercial:  [b,Validators.required],
      duracionLicencia:   [c,Validators.required]
    }); 
  }

  getCustomerData(customer:number){
    if (customer!=null){
      this.customerServices.getBrandsBytIdCustomer(customer)
        .subscribe(resp=>{
          this.brands=resp;
          this.brands.unshift (
            {
              id:null,
              description:null,
              color:null,
              image:null,
              deleted:false
            }
          )
        });    
      this.customerServices.getMarketRegionsBytIdCustomer(customer)
        .subscribe(resp=>{
          this.marketRegions=resp;
          this.marketRegions.unshift (
            {
              id:null,
              description:null,
              deleted:false
            }
          )
        });  
      this.venueServices.getSchedules(customer) 
        .subscribe(resp=>{
          this.schedules=resp
          // this.b=this.schedules.map(function(a){
          //   let c={
          //     item_id:a.id,
          //     item_text:a.description
          //   }
          //    return c
          //  });
     
        });    
      this.customerServices.getComercialCodeBytIdCustomer(customer) 
        .subscribe(resp=>{
          this.comercialCodes=resp
        });  
        
    }
    return
  }

  getLocationData(country:number){
 
    let newLocalizacion=[];  
    const promesa= new Promise<any[]>( resolve=>{
   
    // cuando se selecciona un nuevo pais se inicializa el formArray con la 
    // nueva organizacion y se cargan las entidades del nivel 0
    this.venueServices.getTerritorialOrganization(country) // nueva organizacion del pais
    .subscribe(resp=>{
    //  this.location=[];
      this.localizacion.clear();
      this.lastLocation=[];
      resp.forEach( (org,index)=>{    
        this.lastLocation.push(null);
        newLocalizacion.push(this.newLocalizacion(null,org.id,org.territorialOrganizationName,org.hierarchy,null,null))
      })    
      // cargamos las entidades de la organización
      this.getTerritorialEntities(newLocalizacion)
          .then(res=>{
            this.location=res;
            resolve (newLocalizacion);    
          })
    });
  });
    return promesa
  }

  getTerritorialEntities(organizacion:any[]){
    
    let prevEntity:number=0;
    let entitiesArray:any=[];
    let ObservablesArray:any=[];
  
    const promesa= new Promise<any[]>( resolve=>{
  
      organizacion.forEach( (org,index)=>{
        if(org.get("idEntidadTerritorial").value==null){
          entitiesArray[index]=[org.get("idOrganizacionTerritorial").value,prevEntity];
          prevEntity=0;
        }else{
          entitiesArray[index]=[org.get("idOrganizacionTerritorial").value,prevEntity];
          prevEntity=org.get("idEntidadTerritorial").value;
        }   
      })
    
      //  creamos el array de observables para la peticion de las entidades
      for(let i=0;i<entitiesArray.length;i++){
        ObservablesArray.push(this.venueServices.getTerritorialEntities(entitiesArray[i][0],entitiesArray[i][1]))
      }
      forkJoin(ObservablesArray).subscribe(resp=>{
        resolve (resp) 
      })
    })
    return promesa
  }

  selectCliente(elem:number){
    return elem==this.venueForm.get('cliente').value?true:false;
  }
  selectMarca(elem:number){
    return elem==this.venueForm.get('marca').value?true:false;
  }
  selectPais(elem:number){
    return elem==this.venueForm.get('pais').value?true:false;
  }
  selectRegionComercial(elem:number){
    return elem==this.venueForm.get('regionComercial').value?true:false;
  }
  selectCodigoComercial(elem:number,i:number){
    return elem==this.emplazamiento.at(i).get('idCodigoComercial').value?true:false;
  }
  selectDuracionLicencia(elem:number,i:number){
    return elem==this.emplazamiento.at(i).get('duracionLicencia').value?true:false;
  }

  selectEntidadTerritorial(elem:number,ind:number,i:number){
   return elem==this.localizacion.controls[ind].get('idEntidadTerritorial').value?true:false;
  }
  selectTipoVia(elem:number){
    return elem==this.venueForm.get('tipoVia').value?true:false;
  }

  selectHorario(id:number,descripcion:string,inicio:StartDate,week:Weekly[]){
// Comprobamos que el horario no esta ya seleccionado


    if (this.horario.controls.find(a=>a.get('idRelacionHorario').value==id)){
      Swal.fire({
        title: `El horario ${descripcion}`,
        text:'ya esta seleccionado',
        confirmButtonColor: '#007bff',
        icon:'info'
      });
      return
    }
    this.horario.push(this.newHorario(null,descripcion,inicio,week,id));
    this.horario.controls[this.horario.controls.length-1].get('idHorario').markAsTouched();
    return;  
  } 

  removeHorario(i:number){
    this.horario.removeAt(i);
    this.venueForm.markAsTouched();
  }

  showHorario(content:any,i:number){
    this.ordenHorario=i;
    this.modalService.open(content, {ariaLabelledBy: 'modal-horarios',  size: 'lg' }).result.then((result) => {
      
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      if(reason=='Cross click'){
        return     
      }
    });

  }

  addcontacto(){
   this.contacto.push(this.newContacto(null,null,null,null));
    return
  }
  
  removeContacto(i:number){
    this.contacto.removeAt(i);
    this.venueForm.markAsTouched();
    return
  }
  addTelefono(i:number){
    this.ordenContacto=i;
    this.telefonos.push(this.newTelefono(null,null,null));
  }

  removeTelefono(i:number){
    this.telefonos.removeAt(i);
    this.venueForm.markAsTouched();
    return
  }
  addEmplazamiento(){
    this.emplazamiento.push(this.newEmplazamiento(null,null,null));
     return
   }
   
  removeEmplazamiento(i:number){
     this.emplazamiento.removeAt(i);
     this.venueForm.markAsTouched();
     return
  }


  showTelefono(content:any,i:number){

    this.ordenContacto=i;
    let prevPhones=[];
    // Guardamos los valores iniciales por si pulsa el boton X
    this.telefonos.controls.forEach((elem,indice) => {
      prevPhones.push({
        idTelefono:elem.get('idTelefono').value,
        numeroTelefono:elem.get('numeroTelefono').value,
        notasTelefono:elem.get('notasTelefono').value,

      });
    });

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',  size: 'lg' }).result.then((result) => {
     
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      if(reason=='Cross click'){
        // cargamos los horarios inciales por pulsa X
        this.telefonos.clear();
        for (let ind=0;ind<prevPhones.length;ind++){
          this.telefonos.push(this.newTelefono(prevPhones[ind].idTelefono,prevPhones[ind].numeroTelefono,prevPhones[ind].notasTelefono));
        }
      }
    });

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

  capturarFile(e:any){
    
    if(e.target.files && e.target.files.length) {
      const reader = new FileReader();      
      const codImage=this.venueForm.get('codigoImagen').value;
      this.venueForm.get('tocado').patchValue(true);
      this.venueForm.get('tocado').markAsTouched();  
      const image:File = e.target.files[0];   
      reader.readAsDataURL(image);
      this.filesImagenVenue={cod:codImage,
                            file:image};
      reader.onload = () => this.binariosImagenLocal = reader.result as string;
    }

    return;
  }


  onSubmit() {
    let mensajeError:string='Datos incorrectos'
    let contactName:string;
    let peticionHtml: Observable <any>;
    let sc=[], co=[], lo=[], si=[];

    if (this.venueForm.touched){
     

      if( this.venueForm.invalid){
        if(this.contacto.controls.length>0  && this.venueForm.get('contacto').invalid){ // si contacto invalido
            let contactoIncorrecto=this.contacto.controls.find(elem=>elem.invalid);
            contactName=contactoIncorrecto.get('nombre').value==null?'':contactoIncorrecto.get('nombre').value
            mensajeError = 'Falta completar el contacto ' + contactName;
        }      
        Swal.fire({
        title: mensajeError ,
        text:'por favor revise la información introducida',
        allowOutsideClick:false,
        confirmButtonColor: '#007bff',
        icon:'error'
        });
      } else{
        sc=this.respHorario();
        co=this.respContacto();
        lo=this.respLocalizacion();
        si=this.respEmplazamiento();

        // Preparar los datos
       
        let respuesta:Venue ={
          id:                  this.venueId==='nuevo'?null:Number(this.venueId),
          customer:{
                id:            this.venueForm.get('cliente').value,
                identification:null,
                name:          null
              },
          name:                this.venueForm.get('nombre').value,
          image:               this.venueForm.get('tocado').value?this.venueForm.get('codigoImagen').value:this.venueForm.get('nombreArchivo').value,
          country:{
                id:            this.venueForm.get('pais').value,
                description:   null
          },
          location:            lo,
          roadType:{           
                id:            this.venueForm.get('tipoVia').value,
                description:   null
          },         
          address:             this.venueForm.get('calle').value,  
          streetNumber:        this.venueForm.get('numero').value,
          postalCode:          this.venueForm.get('codigoPostal').value,
          latitude:            null,
          longitude:           null,
          marketRegion:{
                id:            this.venueForm.get('regionComercial').value,
                description:   null,
                deleted:       null
          },        
          brand:   {
                id:            this.venueForm.get('marca').value,
                description:   null,
                color:         null,
                image:         null,
                deleted:       null
          }, 
          contact:             co,
          schedule:            sc,
          sites:               null,
          newSite:               si,
        }

        console.log('respuesta',respuesta);
  
        if (this.venueId==='nuevo'){
          peticionHtml=this.venueServices.saveVenue(respuesta);
        }else{
          peticionHtml=this.venueServices.updateVenue(respuesta);
        };
  
        peticionHtml.subscribe(resp=>{    
          
          if (this.filesImagenVenue){
            this.subirArchivo();
          }

          Swal.fire({
            title: `El registro ${resp.data.name}`,
            text:'se actualizó correctamente',
            allowOutsideClick:false,
            confirmButtonColor: '#007bff',
            icon:'success'
          });
  
          //this.venueForm.reset();
          this.router.navigate(['/home/venue-list']);
        },
        error=>{
          console.log(error);
        });
      };
    }else{
      console.log('No hago nada y sigo en la página ');
    }  
    return;
  }


  respHorario(){
    let r=[];
  
    this.horario.controls.forEach((elem,index) => {
      r.push({   
        id:                 elem.get('idHorario').value,
        idCustomerSchedule: elem.get('idRelacionHorario').value,
        description:        elem.get('descripcionHorario').value,
        startDate:{
                id:         null,
                description:elem.get('diaInicio').value,
        },      
        weekly:             elem.get('weekly').value,
        deleted:            false      
      })
    });
    if (this.venueId!='nuevo'){    // buscamos los borrados y los incluimos en el array
      this.currentVenue.schedule.forEach((elem,index) => {    
        let resultado = r.find(a=>a.id===elem.id)
        if(resultado===undefined){
          r.push({
            id:                 elem.id,
            idCustomerSchedule: elem.idCustomerSchedule,
            description:        elem.description,
            startDate:          elem.startDate,
            weekly:             elem.weekly,
            deleted:            true  
          })
        }
      });
    }

    return r;

  }

  respContacto(){
    let r=[],c=[];
    this.contacto.controls.forEach((elem,index) => {
      this.ordenContacto=index;

      // cargamos los telefonos
      c=[];     
      this.telefonos.controls.forEach((e) => {
        c.push({   
          id:      e.get('idTelefono').value,
          number:  e.get('numeroTelefono').value,
          notes:   e.get('notasTelefono').value,
          deleted: false
        })
      });
      if (this.venueId!='nuevo'){  
        let b=this.currentVenue.contact.find(a=>a.id==elem.get('idContacto').value)
    // en b esta el contacto en la lista inicial que estamos tratando en
  // buscamos los borrados y los incluimos en el array
        if (b!=undefined){    // Si el contacto esta en la lista inicial     
          b.phoneNumbers.forEach((e) => {  
            let resultado = c.find(a=>a.id===e.id) //
            if(resultado===undefined){
              c.push({
                id:      e.id,
                number:  e.number,
                notes:   e.notes,
                deleted: true
              });
            }
          });
        }
      }
      r.push({   
        id:           elem.get('idContacto').value,
        name:         elem.get('nombre').value,
        email:        elem.get('email').value,
        notes:        elem.get('notas').value,
        phoneNumbers: c,
        deleted:      false       
      })
    });

    // Tratamos los contactos borrados
    if (this.venueId!='nuevo'){  
      this.currentVenue.contact.forEach((elem) => {    
        let resultado = r.find(a=>a.id===elem.id)
        if(resultado===undefined){
          c=[];
          elem.phoneNumbers.forEach((e) => {  
            c.push({
              id:      e.id,
              number:  e.number,
              notes:   e.notes,
              deleted: true
            });
          })

          r.push({
            id:           elem.id,
            name:         elem.name,
            email:        elem.email,
            notes:        elem.notes,
            phoneNumbers: c,
            deleted:       true
          })

        }
      });
    }    
  
    return r;

  }

  respLocalizacion(){
    let r=[];
  
    this.localizacion.controls.forEach((elem,index) => {
      r.push({   
        id:                          elem.get('idLocalizacion').value,
        territorialOrganizationId:   elem.get('idOrganizacionTerritorial').value,
        territorialOrganizationName: null,
        hierarchy:                   elem.get('jerarquia').value,
        territorialEntityId:         elem.get('idEntidadTerritorial').value,
        territorialEntityName:       null
      })
    });
    return r;

  }

  
  respEmplazamiento(){
    let r=[];
  
    this.emplazamiento.controls.forEach((elem,index) => {
      r.push({   
        comercialCodeId:  elem.get('idCodigoComercial').value,
        licenseDuration:  elem.get('duracionLicencia').value,
      })
    });
    return r;

  }

  subirArchivo():any{
    const fd= new FormData();
    
    try{
        fd.append('image',this.filesImagenVenue.file);
        fd.append('imageCode',this.filesImagenVenue.cod);
      this.uploadServices.uploadImage(fd,'V')
        .subscribe(res=>{
          console.log(res);
        },
        err=>{
          console.log(err);
        });
    } catch{
    }
    
    return
  }

  // Validadores

  deletedBrand(control:FormControl):{[s:string]:boolean}{
    if (this.currentVenue && 
        (control.value==this.currentVenue.brand.id && this.currentVenue.brand.deleted))   
        return {
                deleted:true
              }
    return null
  }

  deletedMarketRegion(control:FormControl):{[s:string]:boolean}{
    if (this.currentVenue && 
        (control.value==this.currentVenue.marketRegion.id && this.currentVenue.marketRegion.deleted))   
        return {
                deleted:true
              }
    return null
  }

  abandonarPagina(){
    if (this.venueForm.touched){
      Swal.fire({
        title:'¿Desea abandonar la página?',
        text: 'los cambios realizados se perderán',
        icon: 'info',
        confirmButtonColor: '#007bff',
        allowOutsideClick:false,
        cancelButtonText:'Cancelar',
        showConfirmButton:true,
        showCancelButton:true,
      }).then(resp=>{
        if (resp.value){
          this.router.navigate(['/home/venue-list']);          
        }
      });
    }else{
      this.router.navigate(['/home/venue-list']);          
    }
    return;
  }
  msgError(campo: string): string {
  
    if(this.venueForm.get(campo).hasError('required')) return 'El campo es obligatorio';
    if(this.venueForm.get(campo).hasError('deleted')) return 'El campo fue borrado';
    if(this.venueForm.get(campo).hasError('pattern'))  return 'Formato incorrecto';
    if(this.venueForm.get(campo).hasError('minlength'))
      return `La longitud mínima del campo ${campo} es ${this.venueForm.get(campo).errors.minlength.requiredLength}`;
    if(this.venueForm.get(campo).hasError('maxlength'))
      return `La longitud máxima del campo ${campo} es ${this.venueForm.get(campo).errors.maxlength.requiredLength}`;
  
    return ;
  }

  msgErrorArray(campo: string, i: number): string {
    let message: string = null;
    let controlElementoArray: any;

    switch (campo) {
      case 'diaInicio':
        controlElementoArray=this.horario.at(i).get('diaInicio');  
        break;
     
      case 'descripcionHorario':
        controlElementoArray=this.horario.at(i).get('descripcionHorario');  
        break;
      case 'numeroTelefono':
        controlElementoArray=this.telefonos.at(i).get('numeroTelefono');  
        break;
      case 'email':
        controlElementoArray=this.contacto.at(i).get('email');  
        break;
      case 'notas':
        controlElementoArray=this.contacto.at(i).get('notas');  
        break;
      case 'notasTelefono':
        controlElementoArray=this.contacto.at(i).get('notasTelefono');  
        break;
      case 'idCodigoComercial':
        controlElementoArray=this.emplazamiento.at(i).get('idCodigoComercial');  
        break;
      case 'duracionLicencia':
        controlElementoArray=this.emplazamiento.at(i).get('duracionLicencia');  
        break;
      default:
        return;
    }
    
    if (controlElementoArray.hasError('required')) return 'El campo es obligatorio';  
    if (controlElementoArray.hasError('maxlength'))   
        return `La longitud máxima del campo es ${controlElementoArray.errors.maxlength.requiredLength} caracteres`;
    if (controlElementoArray.hasError('pattern')) return 'Formato incorrecto';  
    if (controlElementoArray.hasError('wrongStartDay')) return 'Fecha de inicio del periodo incorrecta DDMM';  
    return message;
  }
}
