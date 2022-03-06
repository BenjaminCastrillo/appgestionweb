import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable,forkJoin} from 'rxjs';
import Swal from 'sweetalert2';
import {FormBuilder, FormGroup,Validators, FormControl,FormArray} from '@angular/forms';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
// import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { TranslateService } from '@ngx-translate/core'; 
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

  private imageDefault=this.globalDataServices.getUrlImageDefault();
  private urlImageBrand=this.globalDataServices.getUrlImageBrand();
  private urlImageVenue=this.globalDataServices.getUrlImageVenue();


  public venueForm: FormGroup;
  public currentVenue:Venue=null;
  public countries:Country[]=[];
  public customers:Customer[]=[];
  public brands:Brand[]=[];
  public marketRegions:MarketRegion[]=[];
  public roadTypes:RoadType[]=[];
  public location:any[]=[]; // lista de valores select localizacion
  public descripcionesOrganizacion:any[]=[];
  public week:Week[]=[];
  public schedules:Schedule[]=[];
  public comercialCodes:SitesComercialCode[]=[];
  public monthsLicense:number[];
 


  // public tituloPagina:string;

  public ordenHorario:number=0;
  public ordenContacto:number=0;
  public venueId:string;
  public newVenue:boolean;
  public marcaBorrada:boolean=false;
  public regionComercialBorrada:boolean=false;
  public lastLocalizacion:number[]=[];
  public prevCountry:number=0;
  public binariosImagenMarca:string;
  public filterSchedules:string='';
  public page:number=0;
  public linesPages:number=8;
  public closeResult = '';
  public binariosImagenLocal:string;
  public filesImagenVenue:ImagenesFile;
  public activeLang = this.globalDataServices.getStringUserLanguage();
 //  public dropdownSettings:IDropdownSettings = {};
  


  constructor(private fb: FormBuilder,
    private venueServices:VenueService,
    private customerServices:CustomerService,
    private ActivatedRoute:ActivatedRoute,
    private uploadServices:UploadService,
    private utilService:UtilService,
    private globalDataServices:GlobalDataService,
    private router:Router,
    private translate: TranslateService,
    config: NgbModalConfig, private modalService: NgbModal

  ) { 
    config.backdrop = 'static';
    config.keyboard = false;     
    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);
    this.crearFormulario();
  }

  ngOnInit(): void {

    this.venueId= this.ActivatedRoute.snapshot.paramMap.get('id');
    if (this.venueId==='nuevo'){
      this.newVenue=true;
  //   this.tituloPagina='Alta nuevo local';   
      // this.binariosImagenMarca=this.imageDefault;
      // this.binariosImagenLocal=this.imageDefault;
      this.crearListeners();
    }else{
      this.newVenue=false;
 //     this.tituloPagina='Modificación datos del local';
      this.venueServices.getVenueAndSiteById(this.venueId)
      .subscribe(resp=>{
          this.currentVenue=resp.data[0];
          console.log('El venue',this.currentVenue);   
          this.venueServices.getSchedules(this.currentVenue.customer.id) 
          .subscribe(resp=>{
            this.schedules=resp
          });      
          this.loadData(resp.data[0]);   
          this.venueForm.get('pais').disable();
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
      console.log('tengo los paises',this.countries);
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

    venue.location.forEach(elem=>{
      console.log('ELEMEMTO',elem);
      lo.push(this.newLocalizacion(elem.id,elem.territorialOrganizationId,
        elem.territorialOrganizationName,elem.hierarchy,elem.territorialEntityId));
      this.lastLocalizacion.push(elem.territorialEntityId);
      this.descripcionesOrganizacion.push(
          {
            hierarchy: elem.hierarchy,
            id: elem.territorialOrganizationId,
            territorialOrganizationName: elem.territorialOrganizationName
          });
      });
      console.log(lo);
      this.descripcionesOrganizacion.sort(function (a,b){
        if (a.hierarchy>b.hierarchy){
          return 1}
        if (a.hierarchy<b.hierarchy){
        return -1
        }
        return 0
      })

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
    
    // cargamos tablas de datos de clientes
    this.getCustomerData(venue.customer.id);  
    
    // cargamos las entidades de la organización

    this.getTerritorialEntities(lo)
    .then(res=>{
      console.log('--------',res);
      this.location=res;
      this.listenerLocalizacion();
    })

  }

  crearListeners(){

    // Detección cambios en el cliente
    this.venueForm.get('cliente').valueChanges.subscribe(a=>{
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
        this.localizacion.clear();
        this.location=[];
        this.lastLocalizacion=[];
        this.getLocationData(codPais) // Organizacion territorial del nuevo pais
        .then(res=>{
          this.venueForm.setControl('localizacion',this.fb.array(res));
          this.venueForm.get('tipoVia').patchValue(null);    
          this.venueForm.get('calle').patchValue(null);    
          this.venueForm.get('numero').patchValue(null);
          this.venueForm.get('codigoPostal').patchValue(null);
          this.listenerLocalizacion();

        });
      }else{
        this.listenerLocalizacion();
      }
    });

    // deteccion campo busqueda horario
    this.venueForm.get('schedulesSearch').valueChanges.subscribe(a=>{
      this.filterSchedules=a;
      this.page=0;
    });
  } 

  listenerLocalizacion(){

    this.localizacion.valueChanges.subscribe(a=>{        

      //  Comprobamos el nivel cambiado y actualizamos los inferiores a null
      let posicionCambio=0;
      // obtenemos la posicion en el array del elemento cambiado
      for (let ind=0;ind<a.length;ind++){   
        if (!this.lastLocalizacion.find(entidad=> entidad==a[ind].idEntidadTerritorial)){
          posicionCambio=ind;
          this.lastLocalizacion[ind]=a[ind].idEntidadTerritorial;
          ind=a.length;
        }   
      }
  
      let inicioFor=a.length-1;
      let finFor=posicionCambio;
    
      // Borramos niveles inferiores
      for (let ind=inicioFor;ind>finFor;ind--){ 
        this.localizacion.removeAt(ind,{emitEvent:false});
        this.venueForm.markAsTouched();
        this.lastLocalizacion.splice(ind,1);
        this.location.splice(ind,1);
        a.splice(ind,1);
      }
      // añadimos nivel si no es el ultimo de la organizacion y el 
      // ultimo introducido tiene algun valor
      if (posicionCambio+1<this.descripcionesOrganizacion.length && 
          a[a.length-1].idEntidadTerritorial){
      
        this.venueServices.getTerritorialEntities(this.descripcionesOrganizacion[posicionCambio+1].id,a[posicionCambio].idEntidadTerritorial)
        .subscribe(resp=>{
          this.location[posicionCambio+1]=resp;       
          console.log('añado un nivel',this.descripcionesOrganizacion[posicionCambio+1].hierarchy);
          this.localizacion.push(this.newLocalizacion(
            this.currentVenue?this.currentVenue.location[this.localizacion.length].id:null,
            this.descripcionesOrganizacion[posicionCambio+1].id,
            this.descripcionesOrganizacion[posicionCambio+1].territorialOrganizationName,
            this.descripcionesOrganizacion[posicionCambio+1].hierarchy,
            null));
          this.lastLocalizacion.push(null)
        });       
      }
    });  
  }


  getLocationData(country:number){
 
    return new Promise<any[]>( resolve=>{
      let a=[];  
      // cuando se selecciona un nuevo pais se inicializa el formArray con la 
      // nueva organizacion y se cargan las entidades del nivel 0
      this.venueServices.getTerritorialOrganization(country) // nueva organizacion del pais
      .subscribe(resp=>{
        
        this.descripcionesOrganizacion=resp;
        this.descripcionesOrganizacion.sort(function (a,b){
          if (a.hierarchy>b.hierarchy){
            return 1}
          if (a.hierarchy<b.hierarchy){
          return -1
          }
          return 0
        })
       
        // Obtenemos la lista de entidades para la primera organizacion
        this.venueServices.getTerritorialEntities(resp[0].id,0)
        .subscribe(ent=>{

          this.location.push(ent);       
           // Creamos la primera fila del formulario de localización
        a.push(this.newLocalizacion(null,resp[0].id,resp[0].territorialOrganizationName,resp[0].hierarchy,null));
          resolve (a);    
        });
      });
    });
  }




  getTerritorialEntities(organizacion:any[]){
    
    return new Promise<any[]>( resolve=>{

      let prevEntity:number=0;
      let entitiesArray:any=[];
      let ObservablesArray:any=[];
      
      console.log('organizacion',organizacion);
      organizacion.forEach( (org,index)=>{
    
        entitiesArray[index]=[org.get("idOrganizacionTerritorial").value,prevEntity];
        prevEntity=org.get("idEntidadTerritorial").value===null?0:org.get("idEntidadTerritorial").value;
      })
      //  creamos el array de observables para la peticion de las entidades
      for(let i=0;i<entitiesArray.length;i++){
        console.log('voy a por los datos de entidades',entitiesArray[i][0],entitiesArray[i][1]);
        ObservablesArray.push(this.venueServices.getTerritorialEntities(entitiesArray[i][0],entitiesArray[i][1]))
      }
      // Resolvemos la promesa cuando se ejecutan todos los observables
      forkJoin(ObservablesArray).subscribe(resp=>{
        resolve (resp) 
      })
    })
   
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
  
  newLocalizacion(a:number,b:number,c:string,d:number|null,e:number): FormGroup {
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
  selectEntidadTerritorial(elem:number,ind:number){
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
 
    let contactName:string;
    let peticionHtml: Observable <any>;
    let sc=[], co=[], lo=[], si=[];
    let msg1:string=null;
    let msg2:string=null;

    if (this.venueForm.touched){
      if( this.venueForm.invalid){
        if(this.contacto.controls.length>0  && this.venueForm.get('contacto').invalid){ // si contacto invalido
            let contactoIncorrecto=this.contacto.controls.find(elem=>elem.invalid);
            contactName=contactoIncorrecto.get('nombre').value==null?'':contactoIncorrecto.get('nombre').value
            this.translate.get('general.modalClosePage10', {value1: contactName})
            .subscribe(res=>msg1=res);   
            
        }  
        this.translate.get('general.modalClosePage8')
        .subscribe(res=>msg2=res);
        
        Swal.fire({
          title: msg1,
          text:msg2,
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
                id:            this.venueForm.get('regionComercial').value===""?null:this.venueForm.get('regionComercial').value,
                description:   null,
                deleted:       null
          },        
          brand:   {
                id:            this.venueForm.get('marca').value===""?null:this.venueForm.get('marca').value,
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

          this.translate.get('general.modalClosePage4', {value1: resp.data.name})
          .subscribe(res=>msg1=res);
          this.translate.get('general.modalClosePage5')
            .subscribe(res=>msg2=res);

          Swal.fire({
            title: msg1,
            text: msg2,
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

  abandonarPagina(){

    let msg1:string=null;
    let msg2:string=null;
    let msg3:string=null;

    if (this.venueForm.touched){

      this.translate.get('general.modalClosePage1')
      .subscribe(res=>msg1=res);
      this.translate.get('general.modalClosePage2')
        .subscribe(res=>msg2=res);
      this.translate.get('general.modalClosePage3')
        .subscribe(res=>msg3=res);

      Swal.fire({
        title:msg1,
        text: msg2,
        icon: 'info',
        confirmButtonColor: '#007bff',
        allowOutsideClick:false,
        cancelButtonText:msg3,
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


  msgError(campo: string): string {
    let message: string = null;

    if(this.venueForm.get(campo).hasError('required'))
        this.translate.get('error.validationField1')
        .subscribe(res=>(message=res));
       
    if(this.venueForm.get(campo).hasError('pattern')) 
        this.translate.get('error.validationField2')
        .subscribe(res=>(message=res));

    if(this.venueForm.get(campo).hasError('deleted')) 
        this.translate.get('error.validationField14')
        .subscribe(res=>(message=res));

    if(this.venueForm.get(campo).hasError('minlength'))    
        this.translate.get('error.validationField4', 
                {value1: campo,
                 value2: this.venueForm.get(campo).errors.minlength.requiredLength})
        .subscribe(res=>(message=res));
    
    if(this.venueForm.get(campo).hasError('maxlength'))    
        this.translate.get('error.validationField5', 
                {value1: campo,
                 value2: this.venueForm.get(campo).errors.maxlength.requiredLength})
        .subscribe(res=>(message=res));

    return message;
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
      case 'idEntidadTerritorial':
        controlElementoArray=this.localizacion.at(i).get('idEntidadTerritorial');  
        break;
      default:
        return;
    } 
    
    if (controlElementoArray.hasError('required'))
        this.translate.get('error.validationField1')
        .subscribe(res=>(message=res));
        
    if (controlElementoArray.hasError('maxlength'))   
        this.translate.get('error.validationField6', 
            {value1: controlElementoArray.errors.maxlength.requiredLength})
        .subscribe(res=>(message=res));

     if (controlElementoArray.hasError('pattern'))
        this.translate.get('error.validationField2')
        .subscribe(res=>(message=res));

    if (controlElementoArray.hasError('wrongStartDay'))
        this.translate.get('error.validationField15')
        .subscribe(res=>(message=res));
 
    
    return message;
  }
}
