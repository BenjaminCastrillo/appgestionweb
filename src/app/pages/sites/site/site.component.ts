import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup,Validators, FormControl,FormArray} from '@angular/forms';
import { Observable,forkJoin} from 'rxjs';
import Swal from 'sweetalert2';

import { TranslateService } from '@ngx-translate/core'; 

import { Site, ScreenLocation, Orientation, ScreenType, ScreenModel } from '../../../interfaces/site-interface';
import { Venue, ScreenBrand } from '../../../interfaces/venue-interface';

import { GlobalDataService } from '../../../services/global-data.service';
import { LoginService } from '../../../services/login.service';
import { SiteService } from '../../../services/site.service';
import { UploadService  } from '../../../services/upload.service';
import { UtilService } from '../../../services/util.service';
import { VenueService } from '../../../services/venue.service';


interface ImagenesFile{
  cod:string,
  file:File
}

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.css']
})
export class SiteComponent implements OnInit {

 
  private imageDefault=this.globalDataServices.getUrlImageDefault();
  private urlImageVenue=this.globalDataServices.getUrlImageVenue();
  private urlImageBrand=this.globalDataServices.getUrlImageBrand();
  private urlImageSite=this.globalDataServices.getUrlImageSite();

  public siteForm: FormGroup;
  public currentSite: Site;
  public currentVenue:Venue;
  public screenLocations:ScreenLocation[]=[];
  public screenBrands:ScreenBrand[]=[];
  public screenModels:ScreenModel[]=[];
  public screenTypes:ScreenType[]=[];
  public screenOrientations:Orientation[]=[];
 
 
  public siteId:string;
  public tituloPagina='Modificación datos del emplazamiento'; 
  public binariosImagenVenue:string;
  public binariosImagenMarca:string;
  public localizacionPantallaBorrada:boolean=false;
  public binariosImagenEmplazamiento:string;
  public filesImagenSite:ImagenesFile;
  // Datos de pantalla calculados
  public anchoPantalla:number=0;
  public altoPantalla:number=0;
  public resolucionAncho:number=0;
  public resolucionAlto:number=0;
  public pulgadasPantalla:number=0;
  public pixelesPantalla:number=0;
  // Datos modelo seleccionado
  public modeloPantallaSeleccionado:ScreenModel;

  public tipoPantallaActual:number=0;
  public marcaPantallaActual:number=0;

  public tipoPantallaPanelLed:boolean;
  public activeLang = this.globalDataServices.getStringUserLanguage();



  constructor(private fb: FormBuilder,
    private venueServices:VenueService,
    private siteServices:SiteService,
    private ActivatedRoute:ActivatedRoute,
    private uploadServices:UploadService,
    private utilServices:UtilService,
    private loginServices:LoginService,
    private globalDataServices:GlobalDataService,
    private translate: TranslateService,
    private router:Router,) 
    {
      this.translate.setDefaultLang(this.activeLang);
      this.translate.use(this.activeLang);
      this.crearFormulario();
     }

  ngOnInit(): void {
    this.siteId= this.ActivatedRoute.snapshot.paramMap.get('id');

      this.siteServices.getSiteById(this.siteId)
      .subscribe(resp=>{
        this.currentSite=resp.data[0];
        console.log('El site',this.currentSite);
        
        this.venueServices.getVenueById(this.currentSite.venueId.toString())
        .subscribe(resp=>{
          this.currentVenue=resp.data[0];
          this.binariosImagenVenue=(this.currentVenue.image)?this.urlImageVenue+this.currentVenue.image:this.imageDefault;
          this.binariosImagenMarca=(this.currentVenue.brand.image)?this.urlImageBrand+this.currentVenue.brand.image:this.imageDefault;
          this.binariosImagenEmplazamiento=(this.currentSite.image)?this.urlImageSite+this.currentSite.image:this.imageDefault;
        },
        error=>{ 
          this.loginServices.accessErrorText(error)
              .then(resp=>{
                this.salidaForzada();   
              })
        });

        this.siteServices.getScreenLocations(this.currentSite.customer.id)
        .subscribe(resp=>{
            this.screenLocations=resp;
            if (this.screenLocations.length>0){
              this.screenLocations.unshift (
                {
                  id:null,
                  description:null,
                  deleted:false
                })
            }
        });  

        this.siteServices.getScreenTypes()
        .subscribe(resp=>{
            this.screenTypes=resp;
        });

        this.siteServices.getScreenBrands()
        .subscribe(resp=>{
            this.screenBrands=resp;
        });

        this.siteServices.getScreenOrientations()
        .subscribe(resp=>{
            this.screenOrientations=resp;
        });
        
        this.loadData(this.currentSite);   
        this.crearListeners();
      },
    error=>{ 
      this.loginServices.accessErrorText(error)
          .then(resp=>{
            this.salidaForzada();  
          })
    });
   
   return
  }

  salidaForzada(){
    this.siteForm.reset();
    this.loginServices.logout();
    this.router.navigate(['/login']);    
    return
  }

  get localizacion(){
    return this.currentVenue.location;
  }
  get categorias(){
    return this.currentSite.category;
  }
  get tipoPantallaSeleccionado(){
    return this.siteForm.get('tipoPantalla').value
  }


  crearFormulario() {
  this.siteForm = this.fb.group({
    localizacionPantalla:  ['',this.deletedLocalizacionPantalla.bind(this)],
    texto:                 [''],
 //   fechaAlta:             [{value:'',disabled:true}],
    nombreArchivo:         [''],
    tocado:                false,
    codigoImagen:          [this.utilServices.ramdonNumber(200000,900000).toString()],
    tipoPantalla:          ['', Validators.required],
    marcaPantalla:         ['', Validators.required],
    modeloPantalla:        ['', Validators.required],
    orientacionPantalla:   ['', Validators.required],
    numeroSeriePantalla:   [''],
    numeroSerieReproductor:[''],
    orientacionReproductor:['', Validators.required],
    observaciones:         [''],
    modulosAncho:          [{value:'',disabled:true}, Validators.pattern('[1-9]*')],
    modulosAlto:           [{value:'',disabled:true}, Validators.pattern('[1-9]*')] 
  });
  
  //   validación con decimales Validators.pattern('^[0-9]+(,[0-9]+)?$')],


  }

  loadData(site:Site){
    


    this.tipoPantallaPanelLed=site.screen.screenType.panel;
   
    this.siteForm.get('localizacionPantalla').patchValue(site.screenLocation.id);
    this.siteForm.get('texto').patchValue(site.text);
    this.siteForm.get('nombreArchivo').patchValue(site.image);
    this.siteForm.get('tipoPantalla').patchValue(site.screen.screenType.id);
    this.siteForm.get('marcaPantalla').patchValue(site.screen.screenBrand.id);
    this.siteForm.get('modeloPantalla').patchValue(site.screen.screenModel.id);
    this.siteForm.get('orientacionPantalla').patchValue(site.screen.orientation.id);
    this.siteForm.get('numeroSeriePantalla').patchValue(site.screen.serialNumber);
    this.siteForm.get('modulosAncho').patchValue((site.screen.modulesWidth));
    this.siteForm.get('modulosAlto').patchValue((site.screen.modulesHeight));
    this.siteForm.get('observaciones').patchValue(site.screen.situation);
    this.siteForm.get('numeroSerieReproductor').patchValue(site.player.serialNumber);
    this.siteForm.get('orientacionReproductor').patchValue(site.player.orientation.id);
    
    
    this.localizacionPantallaBorrada=site.screenLocation.deleted;

    // Datos calculados para visualización
    this.anchoPantalla=site.screen.screenWidth;
    this.altoPantalla=site.screen.screenHeight;
    this.resolucionAncho=site.screen.resolutionWidth;
    this.resolucionAlto=site.screen.resolutionHeight;
    this.pulgadasPantalla=site.screen.inches;
    this.pixelesPantalla=site.screen.pixel;

  // Desabilitamos el número de paneles si la pantalla es LCD
    // if( site.screen.screenType.panel === null || !site.screen.screenType.panel ) {
    //   this.siteForm.get('modulosAncho').disable();
    //   this.siteForm.get('modulosAlto').disable();
    // }
  // Cargamos la lista de modelos  
    this.siteServices.getScreenModels()
    .subscribe(resp=>{
      this.screenModels=resp;    
      console.log('this.screenModels',this.screenModels);
      if (site.screen.screenModel.id){ // Si el site tiene modelo de pantalla obtenemos los datos (Si hay modelo tambien hay tipo y pantalla)
        this.screenModelData(site.screen.screenModel.id)
        .then(res=>{
          this.modeloPantallaSeleccionado=res;
          console.log('en la respuesta de la promesa',this.modeloPantallaSeleccionado);
         //  Desabilitamos campos del número de paneles si la pantalla es LCD
          if ( this.modeloPantallaSeleccionado.panel ) {
            this.siteForm.get('modulosAncho').enable();
            this.siteForm.get('modulosAlto').enable();
        }

        this.tipoPantallaActual=this.modeloPantallaSeleccionado.screenTypeId;
        this.marcaPantallaActual=this.modeloPantallaSeleccionado.screenBrandId;
        });
      }
    });  
console.log('salgo de cargar datos');
    return

  }

  crearListeners(){

    // Detección cambios en la localización de la pantalla 
    this.siteForm.get('localizacionPantalla').valueChanges.subscribe(a=>{
      console.log('detecto cambio en la localización de la pantalla',a)
      if (this.localizacionPantallaBorrada) this.localizacionPantallaBorrada=false;     
    });

    // Detección cambios en el tipo de pantalla
    this.siteForm.get('tipoPantalla').valueChanges.subscribe(codTipoPantalla=>{
      console.log('detecto cambios en tipo de pantalla',codTipoPantalla);
      
      this.siteForm.get('marcaPantalla').patchValue(null);   
      this.siteForm.get('modeloPantalla').patchValue(null);   
      this.modeloPantallaSeleccionado=null;

      this.tipoPantallaActual=codTipoPantalla;
 
      const indiceTipoPantalla = this.screenTypes.findIndex(a=>
        {return a.id==codTipoPantalla});

      this.tipoPantallaPanelLed=this.screenTypes[indiceTipoPantalla].panel;

        if(this.tipoPantallaPanelLed){
          this.siteForm.get('modulosAncho').patchValue(0); 
          this.siteForm.get('modulosAlto').patchValue(0); 
          this.siteForm.get('modulosAncho').enable();
          this.siteForm.get('modulosAlto').enable(); 
        }else{
          this.siteForm.get('modulosAncho').patchValue(1); 
          this.siteForm.get('modulosAlto').patchValue(1); 
          this.siteForm.get('modulosAncho').disable();
          this.siteForm.get('modulosAlto').disable();
        }

        this.anchoPantalla=0;
        this.altoPantalla=0;
        this.resolucionAncho=null;
        this.resolucionAlto=null;
        this.pulgadasPantalla=0;
        this.pixelesPantalla=null;

    });

    this.siteForm.get('marcaPantalla').valueChanges.subscribe(codMarcaPantalla=>{
      console.log('detecto cambios en marca de pantalla',codMarcaPantalla);
      
      if (this.siteForm.get('marcaPantalla').value){
        this.siteForm.get('modeloPantalla').patchValue(null);    
      }

      this.marcaPantallaActual=codMarcaPantalla;     

      this.anchoPantalla=0;
      this.altoPantalla=0;
      this.resolucionAncho=null;
      this.resolucionAlto=null;
      this.pulgadasPantalla=0;
      this.pixelesPantalla=null;
    });

    this.siteForm.get('modeloPantalla').valueChanges.subscribe(codModeloPantalla=>{
      console.log('detecto cambios en modelo de pantalla',codModeloPantalla,typeof codModeloPantalla );

      if (this.siteForm.get('modeloPantalla').value){
        console.log('me cuelo',this.siteForm.get('modeloPantalla').value);
        this.screenModelData(codModeloPantalla)
        .then(res=>{ 
          this.modeloPantallaSeleccionado=res;
          console.log('modelo de pantalla actual',this.modeloPantallaSeleccionado)
          const rw:number=res.panel?res.measureWidth/Number(res.pixel):res.resolutionWidth;
          const rh:number=res.panel?res.measureHeight/Number(res.pixel):res.resolutionHeight;
               
          this.anchoPantalla=this.siteForm.get('modulosAncho').value*res.measureWidth;
          this.resolucionAncho=this.siteForm.get('modulosAncho').value*rw;
          
          this.altoPantalla=this.siteForm.get('modulosAlto').value*res.measureHeight
          this.resolucionAlto=this.siteForm.get('modulosAlto').value*rh;

          // this.siteForm.value.modulos.alto
  
          this.pixelesPantalla=res.panel?Number(res.pixel):null;
          this.pulgadasPantalla=res.panel?Math.round(Math.sqrt(Math.pow(this.anchoPantalla,2)+Math.pow(this.altoPantalla,2))/25.4):Number(res.inches);
         
        });
      }
    });

    this.siteForm.get('modulosAncho').valueChanges.subscribe(ancho=>{
      console.log('detecto cambios en número modulos de ancho del led',this.modeloPantallaSeleccionado);
      if (this.modeloPantallaSeleccionado!= undefined){
        this.anchoPantalla=ancho*this.modeloPantallaSeleccionado.measureWidth;
        if (this.tipoPantallaPanelLed){
          this.pulgadasPantalla= Math.round(Math.sqrt(Math.pow(this.anchoPantalla,2)+Math.pow(this.altoPantalla,2))/25.4);
          this.resolucionAncho=ancho*(this.modeloPantallaSeleccionado.measureWidth/Number(this.modeloPantallaSeleccionado.pixel));  
        }else{
          this.resolucionAncho=ancho*(this.modeloPantallaSeleccionado.resolutionWidth);  
        }
      } 
    });
    
    this.siteForm.get('modulosAlto').valueChanges.subscribe(alto=>{
      console.log('detecto cambios en número modulos de alto del led',this.modeloPantallaSeleccionado);
      if (this.modeloPantallaSeleccionado!= undefined){
        
        this.altoPantalla=alto*this.modeloPantallaSeleccionado.measureHeight;
        if (this.tipoPantallaPanelLed){
          this.pulgadasPantalla= Math.round(Math.sqrt(Math.pow(this.anchoPantalla,2)+Math.pow(this.altoPantalla,2))/25.4);
          this.resolucionAlto=alto*(this.modeloPantallaSeleccionado.measureHeight/Number(this.modeloPantallaSeleccionado.pixel));
        }else{
          this.resolucionAlto=alto*(this.modeloPantallaSeleccionado.resolutionHeight);
        }
      }
    });

  }


  get localizacionPantallaNoValido() {
    return (
      this.siteForm.get('localizacionPantalla').invalid &&
      this.siteForm.get('localizacionPantalla').touched
    );

  }
  get tipoPantallaNoValido() {
    return (
      this.siteForm.get('tipoPantalla').invalid &&
      this.siteForm.get('tipoPantalla').touched
    );
  }
  get marcaPantallaNoValido() {
    return (
      this.siteForm.get('marcaPantalla').invalid &&
      this.siteForm.get('marcaPantalla').touched
    );
  }
  get modeloPantallaNoValido() {
    return (
      this.siteForm.get('modeloPantalla').invalid &&
      this.siteForm.get('modeloPantalla').touched
    );
  }

  get textoNoValido(){
    return (
      this.siteForm.get('texto').invalid &&
      this.siteForm.get('texto').touched
    );
  }
  get modulosAnchoNoValido(){
    return (
      this.siteForm.get('modulosAncho').invalid &&
      this.siteForm.get('modulosAncho').touched
    );
  }
  get modulosAltoNoValido(){
    return (
      this.siteForm.get('modulosAlto').invalid &&
      this.siteForm.get('modulosAlto').touched
    );
  }

  get orientacionPantallaNoValido(){
    return (
      this.siteForm.get('orientacionPantalla').invalid &&
      this.siteForm.get('orientacionPantalla').touched
    );
  }


get numeroSeriePantallaNoValido(){
  return (
    this.siteForm.get('numeroSeriePantalla').invalid &&
    this.siteForm.get('numeroSeriePantalla').touched
  );
}

get numeroSerieReproductorNoValido(){
  return (
    this.siteForm.get('numeroSerieReproductor').invalid &&
    this.siteForm.get('numeroSerieReproductor').touched
  );
}
get orientacionReproductorNoValido(){
  return (
    this.siteForm.get('orientacionReproductor').invalid &&
    this.siteForm.get('orientacionReproductor').touched
  );
}

get observacionesNoValido(){
  return (
    this.siteForm.get('observaciones').invalid &&
    this.siteForm.get('observaciones').touched
  );
}
  selectLocalizacionPantalla(elem:number){
    return elem==this.siteForm.get('localizacionPantalla').value?true:false;
  }
  selectTipoPantalla(elem:number){
    return elem==this.siteForm.get('tipoPantalla').value?true:false;
  }
  selectMarcaPantalla(elem:number){
    return elem==this.siteForm.get('marcaPantalla').value?true:false;
  }
  selectModeloPantalla(elem:number){
    return elem==this.siteForm.get('modeloPantalla').value?true:false;
  }
  selectOrientacionPantalla(elem:number){
    return elem==this.siteForm.get('orientacionPantalla').value?true:false;
  }
  selectOrientacionReproductor(elem:number){
    return elem==this.siteForm.get('orientacionReproductor').value?true:false;
  }

  screenModelData(idModeloPantalla:any){
  
    console.log('en la busqueda del modelo',idModeloPantalla)
  let datosModelo:ScreenModel=null;
  return new Promise<ScreenModel>( resolve=>{
      datosModelo= this.screenModels.find(a=> {return a.id===Number(idModeloPantalla)});
      resolve (datosModelo);    
    });
  }


  capturarFile(e:any){
    
    if(e.target.files && e.target.files.length) {
      const reader = new FileReader();      
      const codImage=this.siteForm.get('codigoImagen').value;
      this.siteForm.get('tocado').patchValue(true);
      this.siteForm.get('tocado').markAsTouched();  
      const image:File = e.target.files[0];   
      reader.readAsDataURL(image);
      this.filesImagenSite={cod:codImage,
                            file:image};
      reader.onload = () => this.binariosImagenEmplazamiento = reader.result as string;
    }

    return;
  }


  onSubmit(){
    let mensajeError:string='Datos incorrectos'
    let peticionHtml: Observable <any>;
    let msg1:string=null;
    let msg2:string=null;

    if (this.siteForm.touched){
    
      if( this.siteForm.invalid){    

        this.translate.get('general.modalClosePage8')
        .subscribe(res=>msg1=res);

        Swal.fire({
          title: mensajeError ,
          text: msg1,
          confirmButtonColor: '#007bff',
          allowOutsideClick:false,
          icon:'error'
        });
      } else{
    

        // Preparar los datos
       
        let respuesta:Site ={
            id:             this.currentSite.id,           
            siteComercialId:this.currentSite.siteComercialId,
            idpti:          this.currentSite.idpti,
            venueId:        this.currentSite.venueId,           
            customer:       this.currentSite.customer,    
            network:        this.currentSite.network,    
            status:         this.currentSite.status,    
            entryDate:      this.currentSite.entryDate,      
            image:          this.siteForm.get('tocado').value?this.siteForm.get('codigoImagen').value:this.siteForm.get('nombreArchivo').value,     
            publicScreen:   this.currentSite.publicScreen,   
            on_off:         this.currentSite.on_off,   
            text:           this.siteForm.get('texto').value,     
            screenLocation: {
                             id:           this.siteForm.get('localizacionPantalla').value===''?null:this.siteForm.get('localizacionPantalla').value,
                             description:  this.currentSite.screenLocation.description,
                             deleted:      this.currentSite.screenLocation.deleted,
                             },    
            screen:  {
                            id:              this.currentSite.screen.id,
                            inches:          this.pulgadasPantalla, 
                            screenBrand:     {
                              id:          this.siteForm.get('marcaPantalla').value, 
                              description: null
                            },
                            screenModel:     {
                                            id:this.siteForm.get('modeloPantalla').value,
                                            description:null
                            },
                            resolutionWidth: this.resolucionAncho,
                            resolutionHeight:this.resolucionAlto,
                            screenType:    {
                                          id:this.siteForm.get('tipoPantalla').value,
                                          description:null,
                                          panel: this.tipoPantallaPanelLed
                            },
                            pixel:            this.pixelesPantalla,      
                            orientation:  {
                                             id:this.siteForm.get('orientacionPantalla').value, 
                                              description:null
                                          },
                            screenWidth:      this.anchoPantalla, 
                            screenHeight:     this.altoPantalla,
                            modulesWidth:     this.siteForm.get('modulosAncho').value, 
                            modulesHeight:    this.siteForm.get('modulosAlto').value,
                            serialNumber:     this.siteForm.get('numeroSeriePantalla').value,
                            situation:        this.siteForm.get('observaciones').value,
            },            
            player:  {
                            id:        this.currentSite.player.id, 
                            serialNumber:this.siteForm.get('numeroSerieReproductor').value,   
                            mac:        this.currentSite.player.mac, 
                            orientation:{
                                          id:this.siteForm.get('orientacionReproductor').value, 
                                          description:null
                            },
                            os:         this.currentSite.player.os, 
                            osVersion:  this.currentSite.player.osVersion, 
                            appVersion: this.currentSite.player.appVersion,
                            license:    this.currentSite.player.license
            },            
      }

      console.log('respuesta',respuesta);
  
      
      peticionHtml=this.siteServices.updateSite(respuesta);
  
      peticionHtml.subscribe(resp=>{            
        if (this.filesImagenSite){
           this.subirArchivo();
        }
  

        this.translate.get('general.modalClosePage4', {value1: resp.data.siteComercialId})
        .subscribe(res=>msg1=res);
        this.translate.get('general.modalClosePage5')
          .subscribe(res=>msg2=res);

        Swal.fire({
          title: msg1,
          text: msg2,
          confirmButtonColor: '#007bff',
          allowOutsideClick:false,
          icon:'success'
        });
  
          //this.venueForm.reset();
          this.router.navigate(['/home/site-list/todos']);
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

    if (this.siteForm.touched){
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
        cancelButtonText:msg3,
        allowOutsideClick:false,
        showConfirmButton:true,
        showCancelButton:true,
      }).then(resp=>{
        if (resp.value){
          this.router.navigate(['/home/site-list/todos']);          
        }
      });
    }else{
 
      this.router.navigate(['/home/site-list/todos']);          
    }
    return;
  }

  subirArchivo():any{
    const fd= new FormData();
    
    try{
        fd.append('image',this.filesImagenSite.file);
        fd.append('imageCode',this.filesImagenSite.cod);
   
      this.uploadServices.uploadImage(fd,'S')
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

  deletedLocalizacionPantalla(control:FormControl):{[s:string]:boolean}{
    if (this.currentSite && 
        (control.value==this.currentSite.screenLocation.id && this.currentSite.screenLocation.deleted))   
        return {
                deleted:true
              }
    return null
  }

  msgError(campo: string): string {
    let message: string = null;
  
    if(this.siteForm.get(campo).hasError('required'))
        this.translate.get('error.validationField1')
        .subscribe(res=>(message=res));
       
    if(this.siteForm.get(campo).hasError('pattern')) 
        this.translate.get('error.validationField2')
        .subscribe(res=>(message=res));

    if(this.siteForm.get(campo).hasError('deleted')) 
        this.translate.get('error.validationField14')
        .subscribe(res=>(message=res));

    if(this.siteForm.get(campo).hasError('minlength'))    
      this.translate.get('error.validationField4', 
              {value1: campo,
               value2: this.siteForm.get(campo).errors.minlength.requiredLength})
      .subscribe(res=>(message=res));
  
    if(this.siteForm.get(campo).hasError('maxlength'))    
      this.translate.get('error.validationField5', 
              {value1: campo,
               value2: this.siteForm.get(campo).errors.maxlength.requiredLength})
      .subscribe(res=>(message=res));
      
    return message;
  }

}
