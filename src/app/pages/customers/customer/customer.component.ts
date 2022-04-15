import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core'; 
import { Observable} from 'rxjs';
import Swal from 'sweetalert2';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

 
import { Customer, Week, Month, SitesComercialCode, TimeRange } 
        from '../../../interfaces/customer-interface';

import { CustomerService } from '../../../services/customer.service';
import { GlobalDataService } from '../../../services/global-data.service';
import { LoginService } from '../../../services/login.service';
import { UploadService  } from '../../../services/upload.service';
import { UtilService } from '../../../services/util.service';

interface ErrorValidate{
  [s:string]:boolean
}
interface ImagenesFile{
  cod:string,
  file:File
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  
  public customerForm: FormGroup;
  public currentCustomer:Customer;
  public customerId:string;
  public newCustomer:boolean;
//  public tituloPagina:string;

  public filesImagenMarca: Array <ImagenesFile> =[];
  public binariosImagenMarca:Array <String> = [];
  public photoSelected: string | ArrayBuffer;
  public week:Week[]=[];
  public month:Month[]=[];
  public ordenHorario:number=0;
  public indiceHorario:number=0;
  public sitesCodes:SitesComercialCode[]=[];
  
  public closeResult = '';
  public activeLang = this.globalDataServices.getStringUserLanguage();

  private imageDefault=this.globalDataServices.getUrlImageDefault();
  private urlImage=this.globalDataServices.getUrlImageBrand();
  

  public horarioArray: FormArray;
  
  constructor(private fb: FormBuilder,
              private customerServices:CustomerService,
              private uploadServices:UploadService,
              private utilService:UtilService,
              private ActivatedRoute:ActivatedRoute,
              private router:Router,
              private translate: TranslateService,
              private globalDataServices:GlobalDataService,
              private loginServices:LoginService,
              config: NgbModalConfig, private modalService: NgbModal) 
  {               
      config.backdrop = 'static';
      config.keyboard = false; 
      this.translate.setDefaultLang(this.activeLang);
      this.translate.use(this.activeLang);
      this.crearFormulario();
  }
  ngOnInit(): void {
    
    this.customerId= this.ActivatedRoute.snapshot.paramMap.get('id');
    if (this.customerId==='nuevo'){
      this.newCustomer=true;
      this.customerServices.getDefaultTimeRangeName()
      .subscribe(resp=>{
      // Añadimos franja por defecto para todo el dia
        this.addFranjaHoraria(null,resp,'00:00','23:59');
      });  
    }else{
      this.newCustomer=false;
      this.customerForm.get('identification').disable();
      this.customerServices.getCustomerById(this.customerId)
      .subscribe(resp=>{
          this.currentCustomer=resp.data[0];
          console.log(this.currentCustomer)
          this.loadData(this.currentCustomer);
        },
        error=>{ 

          // Visualización del error al usuario
          this.loginServices.accessErrorText(error)
              .then(resp=>{
                this.salidaForzada();  
              })
        })
    }     
    
    this.customerServices.getWeek()
    .subscribe(resp=>{
      this.week=resp;
    },
    error=>{ 
      this.loginServices.accessErrorText(error)
      .then(resp=>{
        this.salidaForzada();
      });
    });    

    this.customerServices.getMonth()
    .subscribe(resp=>{
      this.month=resp;
    },
    error=>{ 
      this.loginServices.accessErrorText(error)
      .then(resp=>{
        this.salidaForzada();
      });
    });  
  
   
  }

  salidaForzada(){
    this.customerForm.reset();
    this.loginServices.logout();
    this.router.navigate(['/login']);    
    return
  }

  get IDNoValido() {
    return (
      this.customerForm.get('identification').invalid && 
      this.customerForm.get('identification').touched
    );
  }
  get nombreNoValido() {
    return (
      this.customerForm.get('nombre').invalid &&
      this.customerForm.get('nombre').touched
    );
  }
  get nombreContactoNoValido() {
    return (
      this.customerForm.get('nombreContacto').invalid &&
      this.customerForm.get('nombreContacto').touched
    );
  }
  get telefonoNoValido() {
    return (
      this.customerForm.get('telefono').invalid &&
      this.customerForm.get('telefono').touched
    );
  }
  get diaInicioNoValido() {
    return (
      this.customerForm.get('diaInicio').invalid && 
      this.customerForm.get('diaInicio').touched
    );
  }
  get mesInicioNoValido() {
    const dia=this.customerForm.get('diaInicio').value;
    return (
      this.customerForm.get('mesInicio').invalid && 
      this.customerForm.get('mesInicio').touched
    );
  }
  get marca(): FormArray {
    return this.customerForm.get('marca') as FormArray;
  }
  get regionMercado(): FormArray{
    return this.customerForm.get('regionMercado') as FormArray;
  }
  get localizacionPantalla(){
    return this.customerForm.get('localizacionPantalla') as FormArray;
  }
  get codigo(){
    return this.customerForm.get('codigo') as FormArray;
  } 
  get horario(){
    return this.customerForm.get('horario') as FormArray;
  }
  get franjaHoraria(){
    return this.customerForm.get('franjaHoraria') as FormArray;
  }
  get weekly(){
     return this.horario.controls[this.ordenHorario].get('weekly') as FormArray;
  }
  


  crearFormulario() {
    this.customerForm = this.fb.group({
      identification: ['',
      [ Validators.required,
        Validators.minLength(6),
        Validators.pattern('[A-Za-z]?[0-9]*[A-Za-z]$'),        
      ],this.customerServices.existsIdCustomer.bind(this.customerServices) // validador asincrono
      ],
      nombre: ['', Validators.required],
      nombreContacto:['', Validators.required],
      // fechaAlta:[{value:'',disabled:true}],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]*'),Validators.maxLength(18)]],
      marca: this.fb.array([]),
      regionMercado:this.fb.array([]),
      localizacionPantalla:this.fb.array([]),
      codigo:this.fb.array([]),
      horario:this.fb.array([]),   
      franjaHoraria:this.fb.array([]),   
  });


}

  loadData(customer:Customer){  
    let mr=[], ls=[], co=[], br=[],sc=[],scw=[],tr=[];

    customer.brands.forEach((elem,index)=>{
      br.push(this.newMarca(elem.description,elem.image,elem.color,elem.id))
      if (elem.image){
        this.binariosImagenMarca[index]=this.urlImage+elem.image;
      }else{
        this.binariosImagenMarca[index]=this.imageDefault;
      }
    });
    customer.marketRegions.forEach(elem=>{
      mr.push(this.newRegionMercado(elem.id,elem.description))
    });
    customer.locationsScreen.forEach(elem=>{
        ls.push(this.newLocalizacionPantalla(elem.id,elem.description))
    });
    customer.sitesComercialCodes.forEach((elem)=>{
        co.push(this.newCodigo(elem.id,elem.acronym))
    });

    customer.schedules.forEach((elem,ind)=>{
      sc.push(this.newHorario(elem.id,elem.description,elem.startDate.id.substring(0,2).replace(/^0+/, ''),elem.startDate.id.substring(2).replace(/^0+/, '')))    
      scw.push(new Array())
      elem.weekly.forEach(e=>{
        scw[ind].push(this.newHorarioSemanal(e.day,e.descriptionDay,e.openingTime1,e.closingTime1,e.openingTime2,e.closingTime2))
      })
  
    });

    customer.timeRanges.forEach(elem=>{
      tr.push(this.newFranjaHoraria(elem.id,elem.description,elem.start_time,elem.end_time))
    });

    this.customerForm.get('identification').patchValue(customer.identification);
    this.customerForm.get('nombre').patchValue(customer.name);
    this.customerForm.get('nombreContacto').patchValue(customer.contactName);
  //  this.customerForm.get('fechaAlta').patchValue(customer.entryDate);
    this.customerForm.get('telefono').patchValue(customer.phoneNumber);
  
    this.customerForm.setControl('marca',this.fb.array(br||[]));
    this.customerForm.setControl('regionMercado',this.fb.array(mr||[]));
    this.customerForm.setControl('localizacionPantalla',this.fb.array(ls||[]));
    this.customerForm.setControl('codigo',this.fb.array(co||[]));
    this.customerForm.setControl('horario',this.fb.array(sc||[]));
    this.customerForm.setControl('franjaHoraria',this.fb.array(tr||[]));
   
 
 //   Bloqueamos los codigos iniciales
    this.codigo.controls.forEach((elem,ind) => {
      elem.get('acronymCodigo').disable();
    });

    this.horario.controls.forEach((elem,ind) => {
      this.ordenHorario=ind;
      scw[ind].forEach(element => {
        this.weekly.push(element)
      });
    });
  return
  }

  newMarca(a:string|null,b:string|null,c:string|null,d: number|null): FormGroup {
    return this.fb.group({
      nombreMarca: [a, Validators.required],
      imagenMarca: [null],
      colorMarca: [c],
      idMarca: [d],
      codigoImagen: [this.utilService.ramdonNumber(2000,9000).toString()],
      tocado:false,
      nombreArchivo: [b]
    });
  }
  newRegionMercado(a:number|null,b:string|null): FormGroup {
    return this.fb.group({
      idRegionMercado: [a],
      nombreRegionMercado: [b,Validators.required],
    });
  }
  newLocalizacionPantalla(a:number|null,b:string|null): FormGroup {
    return this.fb.group({
      idLocalizacionPantalla: [a],
      nombreLocalizacionPantalla: [b,Validators.required],
    });
  }
  newCodigo(a:number|null,b:string|null): FormGroup {

    return this.fb.group({
      idCodigo: [a],
      acronymCodigo: [b, [Validators.required,Validators.maxLength(5),
        Validators.pattern('[A-Za-z0-9]*') ],
      this.customerServices.existsCode.bind(this.customerServices) // validador asincrono
    ],
    });
  }

  newHorario(a:number|null,b:string|null,c:string|null,d:string|null): FormGroup {
    return this.fb.group({
      idHorario:           [a],
      descripcionHorario:  [b,Validators.required],
      diaInicio:           [c,[Validators.required,
                              Validators.pattern('[0-9]*'),
                              Validators.maxLength(2)]],
      mesInicio:           [d,Validators.required],
      weekly:              this.fb.array([]),
                              
    },{
      validators: this.customerServices.dateStartCorrect('diaInicio','mesInicio')
    });
  }

  newHorarioSemanal(a:string|null,b:string|null,c:string|null,
                    d:string|null,e:string|null,f:string|null): FormGroup {
    return this.fb.group({
      idDiaSemana:           [a],
      descripcionDiaSemana:  [b],
      horaApertura1:         [c],
      horaCierre1:           [d],
      horaApertura2:         [e],
      horaCierre2:           [f],
    },{
      validators: this.customerServices.timeCloseCorrect('horaApertura1','horaCierre1',
                                                          'horaApertura2','horaCierre2')
    });
  }

  newFranjaHoraria(a:number|null,b:string|null,c:string|null,d:string|null): FormGroup {
    return this.fb.group({
      idFranjaHoraria: [a],
      nombreFranjaHoraria: [b,Validators.required],
      inicioFranjaHoraria:[c,Validators.required],
      finFranjaHoraria:[d,Validators.required]
    }
    // ,{
    //   validators: this.customerServices.endTimeCorrect('inicioFranjaHoraria','finFranjaHoraria')
    // }
    );
  }
  
  addMarca() {
    this.marca.push(this.newMarca(null,null,null,null));
    this.binariosImagenMarca.push(null);
  }
  addRegionMercado(){
    this.regionMercado.push(this.newRegionMercado(null,null));
  }
  addLocalizacionPantalla(){
    this.localizacionPantalla.push(this.newLocalizacionPantalla(null,null));
  }
  addCodigo(){
    this.codigo.push(this.newCodigo(null,null));
  }
  addHorario(){
    let we=[];
  //  const num:number=Math.random()*50+1;
    const horarioGroup=this.newHorario(null,null,'1',null)
    // creamos horario semanal
    this.week.forEach(elem=>{    
      we.push(this.newHorarioSemanal(elem.id,elem.description,null,null,null,null))
    });
 
    horarioGroup.setControl('weekly',this.fb.array(we||[]));
    this.horario.push(horarioGroup);
  }

  addFranjaHoraria(a:null,b:string|null,c:string|null,d:string|null){
    this.franjaHoraria.push(this.newFranjaHoraria(a,b,c,d));
  }

  removeMarca(marcaIndex: number) {
    this.marca.removeAt(marcaIndex);
    this.customerForm.markAsTouched();
    this.binariosImagenMarca.splice(marcaIndex,1);
  }
  removeRegionMercado(i:number){
    this.regionMercado.removeAt(i);
    this.customerForm.markAsTouched();
  }
  removeLocalizacionPantalla(i:number){
    this.localizacionPantalla.removeAt(i);
    this.customerForm.markAsTouched();
  }
  removeCodigo(i:number){
  this.codigo.removeAt(i);
  this.customerForm.markAsTouched();
  }
  removeHorario(i:number){
    this.horario.removeAt(i);
    this.customerForm.markAsTouched();
  }
  removeFranjaHoraria(i:number){
    this.franjaHoraria.removeAt(i);
    this.customerForm.markAsTouched();
  }
  selectMesHorario(elem:number,i:number){
     return elem==this.horario.at(i).get('mesInicio').value?true:false;
  }
  
  setHorario(content:any,i:number){
    this.ordenHorario=i;
    this.indiceHorario=i;
  
    let prevScheduler=[];
    // Guardamos los valores iniciales por si pulsa el boton X
    this.weekly.controls.forEach((elem,indice) => {
      prevScheduler.push({
        horaInicio1:elem.get('horaApertura1').value,
        horaFin1:elem.get('horaCierre1').value,
        horaInicio2:elem.get('horaApertura2').value,
        horaFin2:elem.get('horaCierre2').value
      });
    });

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',  size: 'lg' }).result.then((result) => {
      if(this.weekly.invalid){
        Swal.fire({
          title: 'El horario no esta bien configurado',
          text:`Por favor revise los datos introducidos`,
          confirmButtonColor: '#007bff',
          icon:'warning'
        });
      }
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      if(reason=='Cross click'){
        // cargamos los horarios inciales por pulsa X
        for (let ind=0;ind<7;ind++){
          this.weekly.controls[ind].get('horaApertura1').patchValue(prevScheduler[ind].horaInicio1);
          this.weekly.controls[ind].get('horaCierre1').patchValue(prevScheduler[ind].horaFin1);
          this.weekly.controls[ind].get('horaApertura2').patchValue(prevScheduler[ind].horaInicio2);
          this.weekly.controls[ind].get('horaCierre2').patchValue(prevScheduler[ind].horaFin2); 
        }
      }
    });

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

  repetirHorarioDia(i:number){

    for (let ind=i+1;ind<7;ind++){
      this.weekly.controls[ind].get('horaApertura1').patchValue(this.weekly.controls[i].get('horaApertura1').value);
      this.weekly.controls[ind].get('horaCierre1').patchValue(this.weekly.controls[i].get('horaCierre1').value);
      this.weekly.controls[ind].get('horaApertura2').patchValue(this.weekly.controls[i].get('horaApertura2').value);
      this.weekly.controls[ind].get('horaCierre2').patchValue(this.weekly.controls[i].get('horaCierre2').value); 
    }
    return
  }

  borrarHorarioDia(i:number){
      this.weekly.controls[i].get('horaApertura1').patchValue(null);
      this.weekly.controls[i].get('horaCierre1').patchValue(null);
      this.weekly.controls[i].get('horaApertura2').patchValue(null);
      this.weekly.controls[i].get('horaCierre2').patchValue(null); 

      this.weekly.controls[i].get('horaApertura1').markAsTouched();  
      this.weekly.controls[i].get('horaCierre1').markAsTouched();
      this.weekly.controls[i].get('horaApertura2').markAsTouched();
      this.weekly.controls[i].get('horaCierre2').markAsTouched(); 

    return
  }
  
  onSubmit() {

    let msg1:string=null;
    let msg2:string=null;

    if ( this.customerForm.touched ){

      const datosErroneos=this.validarDatos();

      if ( this.customerForm.invalid || datosErroneos){

        if (!datosErroneos){

          if(this.customerForm.get('horario').invalid){
            let horarioIncorrecto=this.horario.controls.find(elem=>elem.invalid);
            const hi=horarioIncorrecto.get('descripcionHorario').value==null?'':horarioIncorrecto.get('descripcionHorario').value
            this.translate.get('general.modalClosePage7', {value1: hi})
            .subscribe(res=>msg1=res);  
          } else if (this.customerForm.get('franjaHoraria').invalid){
                    let franjaIncorrecta=this.franjaHoraria.controls.find(elem=>elem.invalid);
                    const fa=franjaIncorrecta.get('nombreFranjaHoraria').value==null?'':franjaIncorrecta.get('nombreFranjaHoraria').value;
                    this.translate.get('error.validationField16', {value1: fa})
                .subscribe(res=>msg1=res); 
                }else{
                  this.translate.get('general.modalClosePage6')
                  .subscribe(res=>msg1=res); 
                }      
          
          this.translate.get('general.modalClosePage8')
          .subscribe(res=>msg2=res);
  
          Swal.fire({
            title: msg1,
            text:  msg2,
            confirmButtonColor: '#007bff',
            icon:'error',
            allowOutsideClick:false,
          });
        }
      } else{
        let peticionHtml: Observable <any>;
        let mr=[], ls=[], co=[], br=[], sc=[], tr=[];    
        // Preparar los datos
        br=this.respMarca();
        mr=this.respRegionMercado();
        ls=this.respLocalizacionPantalla();
        co=this.respCodigo();
        sc=this.respHorario();
        tr=this.respFranjaHoraria();

   
        let respuesta:Customer ={
          id                  :this.customerId==='nuevo'?null:Number(this.customerId),
          identification      :this.customerForm.get('identification').value.toUpperCase(),
          name                :this.customerForm.get('nombre').value,
          contactName         :this.customerForm.get('nombreContacto').value,
          phoneNumber         :this.customerForm.get('telefono').value,
          entryDate           :this.customerId==='nuevo'?null:this.currentCustomer.entryDate,
          brands              :br,
          marketRegions       :mr,
          locationsScreen     :ls,
          sitesComercialCodes :co,
          schedules           :sc,
          timeRanges          :tr
        }
        console.log('la respuesta',respuesta);

        if (this.customerId==='nuevo'){
          peticionHtml=this.customerServices.saveCustomer(respuesta);
        }else{
          peticionHtml=this.customerServices.updateCustomer(respuesta);
        }
        peticionHtml.subscribe(resp=>{
          if (this.filesImagenMarca.length>0){
            this.subirArchivo();
          }

          this.translate.get('general.modalClosePage4', {value1: resp.data.name})
            .subscribe(res=>msg1=res);
          this.translate.get('general.modalClosePage5')
            .subscribe(res=>msg2=res);

          Swal.fire({
            title: msg1,
            text:  msg2,
            allowOutsideClick:false,
            confirmButtonColor: '#007bff',
            icon:'success'
          });
          this.customerForm.reset();
          this.router.navigate(['/home/customer-list']);
        },
        error=>{
          console.log(error);
        })
      };
    }else{
      console.log('No hago nada');
    }
  
    return;
  }
 
  abandonarPagina(){
    let msg1:string=null;
    let msg2:string=null;
    let msg3:string=null;
    if (this.customerForm.touched){
      this.translate.get('general.modalClosePage1')
        .subscribe(res=>msg1=res);
      this.translate.get('general.modalClosePage2')
        .subscribe(res=>msg2=res);
      this.translate.get('general.modalClosePage3')
        .subscribe(res=>msg3=res);

      Swal.fire({
        title: msg1,
        text: msg2,
        icon: 'info',
        confirmButtonColor: '#007bff',
        cancelButtonText:msg3,
        showConfirmButton:true,
        showCancelButton:true,
        allowOutsideClick:false,
      }).then(resp=>{
        if (resp.value){
          this.customerForm.reset();
          this.router.navigate(['/home/customer-list']);          
        }
      });
    }else{
      this.customerForm.reset();
      this.router.navigate(['/home/customer-list']);          

    }

    return;
  }

  capturarFile(e:any,i:number){
    
    if(e.target.files && e.target.files.length) {
      const reader = new FileReader();      
      const codImage=this.marca.controls[i].get('codigoImagen').value;
      this.marca.controls[i].get('tocado').patchValue(true);
      this.marca.controls[i].get('tocado').markAsTouched();  
      const image:File = e.target.files[0];   
      reader.readAsDataURL(image);
      this.filesImagenMarca.push({cod:codImage,
                                  file:image});
      reader.onload = () => this.binariosImagenMarca[i] = reader.result as string;
    }

    return;
  }

  subirArchivo():any{
    const fd= new FormData();
    
    try{
      this.filesImagenMarca.forEach(elem=>{
        fd.append('image',elem.file);
        fd.append('imageCode',elem.cod);
      }) 
      this.uploadServices.uploadImage(fd,'B')
        .subscribe(res=>{
        },
        err=>{
          console.log(err);
        });
    } catch{
    }
    
    return
  }


  validarDatos(){
    let msg1:string=null;
    let msg2:string=null;
    let franjaErronea:number;

    let error:boolean=false;

    if (this.horario.controls.length===0){

      console.log('horario obligatorio');
      error=true;
      this.translate.get('error.validationField18')
      .subscribe(res=>msg1=res);  
    }

    if (this.franjaHoraria.controls.length===0 && !error){

      console.log('FRANJA obligatoria');
      error=true;
      this.translate.get('error.validationField19')
      .subscribe(res=>msg1=res);     
    }
    
    // comnprobamos que las franjas cubran todo el tiempo
    
    if (!error) franjaErronea=this.validarFranjasHorarias();

    if (franjaErronea!=-1 && !error){
      let franjaIncorrecta=this.franjaHoraria.controls[franjaErronea];
      console.log('la franja erronea',franjaIncorrecta)
      const fa=franjaIncorrecta.get('nombreFranjaHoraria').value==null?'':franjaIncorrecta.get('nombreFranjaHoraria').value;
      this.translate.get('error.validationField17', {value1: fa})
      .subscribe(res=>msg1=res);  

      error=true;

    }


    if (error){
      console.log('Entro en el error');
      this.translate.get('general.modalClosePage8')
      .subscribe(res=>msg2=res);

      Swal.fire({
        title: msg1,
        text:  msg2,
        confirmButtonColor: '#007bff',
        icon:'error',
        allowOutsideClick:false,
      });
    }
    return error

  }

  validarFranjasHorarias():number{

    // retorna -1 si coinciden horas de inicio y fin de las franjas
    // retorna indice de la franja erronea 

    let r=[];
    let result:number=-1;

    this.franjaHoraria.controls.forEach((elem,index) => {

        r.push({
          startTime:  parseInt(elem.get('inicioFranjaHoraria').value.substr(0,2),10)*60+parseInt(elem.get('inicioFranjaHoraria').value.substr(3,2),10),
          endTime:    parseInt(elem.get('finFranjaHoraria').value.substr(0,2),10)*60+parseInt(elem.get('finFranjaHoraria').value.substr(3,2),10),
          index:index
        })

    });
    r.sort(function (a, b) {
      // A va primero que B
      if (a.startTime < b.startTime)
          return -1;
      // B va primero que A
      else if (a.startTime > b.startTime)
          return 1;
      // A y B son iguales
      else 
          return 0;
  });

  console.log('ordenada',r);

  for (let i=0;i<r.length-1;i++){
    if (r[i].endTime+1!=r[i+1].startTime){
      result=r[i+1].index;
      i=r.length;
    }

  };
    return result
  }


/*
  Preparamos la tabla de marcas para actualizar los datos del servidor.
*/  
  respMarca(){
    let r=[];
    
    // Guardamos los que quedan  
    this.marca.controls.forEach((elem,index) => {
      r.push({
        id:elem.get('idMarca').value,
        description:elem.get('nombreMarca').value,
        color:elem.get('colorMarca').value!==null?elem.get('colorMarca').value:'#000000',
        image:elem.get('tocado').value?elem.get('codigoImagen').value:elem.get('nombreArchivo').value,
        deleted:false 

      })
    });
    //Buscamos los borrados si el cliente existia
    if (this.customerId!='nuevo'){      
      this.currentCustomer.brands.forEach((elem,index) => {    
        let resultado = r.find(a=>a.id===elem.id);
        if(resultado===undefined){
          r.push({
            id:elem.id,      
            description:elem.description,
            color:elem.color,
            image:elem.image,
            deleted:true
          })
        }
      });
    }
    
    return r;
  }
/*
  Preparamos la tabla de regiones de mercado para actualizar los datos del servidor.
*/  
  respRegionMercado(){
    let r=[];
    
    this.regionMercado.controls.forEach((elem,index) => {
      r.push({
        id:elem.get('idRegionMercado').value,
        description:elem.get('nombreRegionMercado').value,
        deleted:false
      })
    });
    if (this.customerId!='nuevo'){   
      this.currentCustomer.marketRegions.forEach((elem,index) => {    
        let resultado = r.find(a=>a.id===elem.id)
        if(resultado===undefined){
          r.push({
            id:elem.id,
            description:elem.description,        
            deleted:true
          })
        }
      });
    }

    return r;
  }

  /*
  Preparamos la tabla de localizaciones de pantallas para actualizar los datos del servidor.
*/  
  respLocalizacionPantalla(){
    let r=[];

    this.localizacionPantalla.controls.forEach((elem,index) => {
      r.push({
        id:elem.get('idLocalizacionPantalla').value,
        description:elem.get('nombreLocalizacionPantalla').value,
        deleted:false
      })
    });
    if (this.customerId!='nuevo'){   
      this.currentCustomer.locationsScreen.forEach((elem,index) => {    
        let resultado = r.find(a=>a.id===elem.id)
        if(resultado===undefined){
          r.push({
            id:elem.id,
            description:elem.description,        
            deleted:true
          })
        }
      });
    }

    return r;
  }

/*
  Preparamos la tabla de códigos de emplazamientos para actualizar los datos del servidor.
*/  
  respCodigo(){
    let r=[];
  
    this.codigo.controls.forEach((elem,index) => {
      r.push({
        id:elem.get('idCodigo').value,
        acronym:elem.get('acronymCodigo').value.toUpperCase().trim(),
        deleted:false
      })
    });
    if (this.customerId!='nuevo'){   
      this.currentCustomer.sitesComercialCodes.forEach((elem,index) => {    
        let resultado = r.find(a=>a.id===elem.id)
        if(resultado===undefined){
          r.push({
            id:elem.id,
            acronym:elem.acronym,        
            deleted:true
          })
        }
      });
    }  
    return r;
  }

  respHorario(){
    let r=[]
    this.horario.controls.forEach((elem,index) => {
      let rr=[];
      this.ordenHorario=index;
      this.weekly.controls.forEach(e=>{
          rr.push({
            day:           e.get('idDiaSemana').value,
            descriptionDay:e.get('descripcionDiaSemana').value,
            openingTime1:  e.get('horaApertura1').value,
            closingTime1:  e.get('horaCierre1').value,
            openingTime2:  e.get('horaApertura2').value,
            closingTime2:  e.get('horaCierre2').value,
          })
      })
      r.push({
        id:elem.get('idHorario').value,
        description:elem.get('descripcionHorario').value,
        startDate:{
          id: this.utilService.zeroFill(elem.get('diaInicio').value,2)+this.utilService.zeroFill(elem.get('mesInicio').value,2),
          description: null
        },      
        weekly:rr,
        deleted:false
      })
    });
    if (this.customerId!='nuevo'){  
      this.currentCustomer.schedules.forEach((elem,index) => {    
        let resultado = r.find(a=>a.id===elem.id)
        if(resultado===undefined){
          r.push({
            id:elem.id,
            description:elem.description,    
            startDate:elem.startDate,
            weekly:elem.weekly,
            deleted:true
          })
        }
      });
    }  

    return r;
  }

    /*
  Preparamos la tabla de franjas horarias para actualizar los datos del servidor.
*/  
respFranjaHoraria(){
  let r=[];

  this.franjaHoraria.controls.forEach((elem,index) => {
    r.push({
      id:          elem.get('idFranjaHoraria').value,
      description: elem.get('nombreFranjaHoraria').value,
      start_time:  elem.get('inicioFranjaHoraria').value,
      end_time:    elem.get('finFranjaHoraria').value,
      deleted:false
    })
  });

  if (this.customerId!='nuevo'){   
    this.currentCustomer.timeRanges.forEach((elem,index) => {    
      let resultado = r.find(a=>a.id===elem.id)
      if(resultado===undefined){
        r.push({
          id:elem.id,
          description: elem.description,
          start_time:  elem.start_time,
          end_time:    elem.end_time,
          deleted:true
        })
      }
    });
  }  
  return r;
}

  msgError(campo: string): string {
    let message: string = null;

    if(this.customerForm.get(campo).hasError('required'))
        this.translate.get('error.validationField1')
        .subscribe(res=>(message=res));
       
    if(this.customerForm.get(campo).hasError('pattern')) 
        this.translate.get('error.validationField2')
        .subscribe(res=>(message=res));
  
    if(this.customerForm.get(campo).hasError('exists'))
        this.translate.get('error.validationField3')
        .subscribe(res=>(message=res));
    
    if(this.customerForm.get(campo).hasError('minlength'))    
        this.translate.get('error.validationField4', 
                {value1: campo,
                 value2: this.customerForm.get(campo).errors.minlength.requiredLength})
        .subscribe(res=>(message=res));
    
 //     return `La longitud mínima del campo ${campo} es ${this.customerForm.get(campo).errors.minlength.requiredLength}`;
    if(this.customerForm.get(campo).hasError('maxlength'))    
        this.translate.get('error.validationField5', 
                {value1: campo,
                 value2: this.customerForm.get(campo).errors.maxlength.requiredLength})
        .subscribe(res=>(message=res));
    
    return message;
}

  msgErrorArray(campo: string, i: number): string {
    let message: string = null;
    let controlElementoArray: any;

    switch (campo) {
      case 'nombreMarca':
        controlElementoArray=this.marca.at(i).get('nombreMarca');  
        break;
      case 'nombreRegionMercado':
        controlElementoArray=this.regionMercado.at(i).get('nombreRegionMercado');
        break;
      case 'nombreLocalizacionPantalla':
        controlElementoArray=this.localizacionPantalla.at(i).get('nombreLocalizacionPantalla');
        break;
      case 'acronymCodigo':
        controlElementoArray=this.codigo.at(i).get('acronymCodigo');
        break;
      case 'descripcionHorario':
        controlElementoArray=this.horario.at(i).get('descripcionHorario');
        break;
      case 'diaInicio':
          controlElementoArray=this.horario.at(i).get('diaInicio');
      break;
      case 'mesInicio':
        controlElementoArray=this.horario.at(i).get('mesInicio');
        break;
      case 'horaApertura1':
        controlElementoArray=this.weekly.at(i).get('horaApertura1');
        break;
      case 'horaCierre1':
        controlElementoArray=this.weekly.at(i).get('horaCierre1');
        break;
      case 'horaApertura2':
        controlElementoArray=this.weekly.at(i).get('horaApertura2');
        break;
      case 'horaCierre2':
        controlElementoArray=this.weekly.at(i).get('horaCierre2');
        break;
      case 'nombreFranjaHoraria':
        controlElementoArray=this.franjaHoraria.at(i).get('nombreFranjaHoraria');  
        break;
      case 'inicioFranjaHoraria':
        controlElementoArray=this.franjaHoraria.at(i).get('inicioFranjaHoraria');  
        break;
      case 'finFranjaHoraria':
        controlElementoArray=this.franjaHoraria.at(i).get('finFranjaHoraria');  
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

    if (controlElementoArray.hasError('wrongStartDay')) return 'NUNCA SALTO';  

    if (controlElementoArray.hasError('wrongStartDate')) 
        this.translate.get('error.validationField7')
        .subscribe(res=>(message=res));

    if (controlElementoArray.hasError('wrongEndTime')) 
        this.translate.get('error.validationField8')
        .subscribe(res=>(message=res));
   
    if (controlElementoArray.hasError('wrongStartTime')) 
        this.translate.get('error.validationField9')
        .subscribe(res=>(message=res));

    if (controlElementoArray.hasError('exists'))   
        this.translate.get('error.validationField10')
        .subscribe(res=>(message=res));
    
    
    return message;
  }

}
