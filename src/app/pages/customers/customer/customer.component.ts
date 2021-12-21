import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable} from 'rxjs';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';



import { CustomerService } from '../../../services/customer.service';
import { UploadService  } from '../../../services/upload.service';
import { Customer,Week, Month } from '../../../interfaces/customer-interface';
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
  public tituloPagina:string;

  public filesImagenMarca: Array <ImagenesFile> =[];
  public binariosImagenMarca:Array <String> = [];
  public photoSelected: string | ArrayBuffer;
  public week:Week[]=[];
  public month:Month[]=[];
  public ordenHorario:number=0;
  public indiceHorario:number=0;
  
  public closeResult = '';

  private urlImage='http://192.168.1.42:3700/brandimage/';
  private imageDefault='../../../../assets/img/noimage.png';



  public horarioArray: FormArray;
  
  constructor(private fb: FormBuilder,
              private customerServices:CustomerService,
              private uploadServices:UploadService,
              private utilService:UtilService,
              private ActivatedRoute:ActivatedRoute,
              private router:Router,
              config: NgbModalConfig, private modalService: NgbModal) 
  {               
      config.backdrop = 'static';
      config.keyboard = false; 
      this.crearFormulario();

  }
  ngOnInit(): void {
   
    this.customerId= this.ActivatedRoute.snapshot.paramMap.get('id');
    if (this.customerId==='nuevo'){
      this.newCustomer=true;
      this.tituloPagina='Alta nuevo cliente';
    }else{
      this.newCustomer=false;
      this.tituloPagina='Modificación datos de cliente';
      this.customerForm.get('identification').disable();
      this.customerServices.getCustomerById(this.customerId)
      .subscribe(resp=>{
          this.currentCustomer=resp.data[0];
          this.loadData(this.currentCustomer);
        })
    }      
    this.customerServices.getWeek()
    .subscribe(resp=>{
      this.week=resp;
    });    
    this.customerServices.getMonth()
    .subscribe(resp=>{
      this.month=resp;
    });  
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
  });


}

  loadData(customer:Customer){  
    let mr=[], ls=[], co=[], br=[],sc=[],scw=[];

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
    customer.sitesComercialCodes.forEach(elem=>{
        co.push(this.newCodigo(elem.id,elem.acronym))
    });

    customer.schedules.forEach((elem,ind)=>{
      sc.push(this.newHorario(elem.id,elem.description,elem.startDate.id.substring(0,2).replace(/^0+/, ''),elem.startDate.id.substring(2).replace(/^0+/, '')))    
      scw.push(new Array())
      elem.weekly.forEach(e=>{
        scw[ind].push(this.newHorarioSemanal(e.day,e.descriptionDay,e.openingTime1,e.closingTime1,e.openingTime2,e.closingTime2))
      })
  
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
      acronymCodigo: [b, [Validators.required,Validators.maxLength(5)]]// validador asincrono],
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
      horaApertura1:         [c,[Validators.required]],
      horaCierre1:           [d,[Validators.required]],
      horaApertura2:         [e],
      horaCierre2:           [f],
    },{
      validators: this.customerServices.timeCloseCorrect('horaApertura1','horaCierre1',
                                                          'horaApertura2','horaCierre2')

    });
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
  selectMesHorario(elem:number,i:number){
     return elem==this.horario.at(i).get('mesInicio').value?true:false;
  }
  
  // setHorario(i:number,a:FormGroup){
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
    let hi:string;
    console.log('lo que voy a grabar del customer',this.customerForm)
    if (this.customerForm.touched){
      
      if( this.customerForm.invalid){
        let mensajeError='Datos Incorrectos';       
        if(this.customerForm.get('horario').invalid){
          let horarioIncorrecto=this.horario.controls.find(elem=>elem.invalid);
          hi=horarioIncorrecto.get('descripcionHorario').value==null?'':horarioIncorrecto.get('descripcionHorario').value
          mensajeError = 'Falta completar el horario ' + hi;
        }
        Swal.fire({
        title: mensajeError,
        text:'por favor revise la información introducida',
        confirmButtonColor: '#007bff',
        icon:'error',
        allowOutsideClick:false,
        });

      } else{
        let peticionHtml: Observable <any>;
        let mr=[], ls=[], co=[], br=[], sc=[];    
        // Preparar los datos
        br=this.respMarca();
        mr=this.respRegionMercado();
        ls=this.respLocalizacionPantalla();
        co=this.respCodigo();
        sc=this.respHorario();

        let respuesta:Customer ={
              id                  :this.customerId==='nuevo'?null:Number(this.customerId),
              identification      :this.customerForm.get('identification').value,
              name                :this.customerForm.get('nombre').value,
              contactName         :this.customerForm.get('nombreContacto').value,
              phoneNumber         :this.customerForm.get('telefono').value,
              entryDate           :this.currentCustomer.entryDate,
              brands              :br,
              marketRegions       :mr,
              locationsScreen     :ls,
              sitesComercialCodes :co,
              schedules           :sc
        }
        if (this.customerId==='nuevo'){
          peticionHtml=this.customerServices.saveCustomer(respuesta);
        }else{
          peticionHtml=this.customerServices.updateCustomer(respuesta);
        }
        peticionHtml.subscribe(resp=>{
          if (this.filesImagenMarca.length>0){
            this.subirArchivo();
          }
          Swal.fire({
            title: `El registro ${resp.data.name}`,
            text:'se actualizó correctamente',
            allowOutsideClick:false,
            confirmButtonColor: '#007bff',
            icon:'success'
          });
          this.customerForm.reset();
          this.router.navigate(['/customer-list']);
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
    if (this.customerForm.touched){
      Swal.fire({
        title:'¿Desea abandonar la página?',
        text: 'los cambios realizados se perderán',
        icon: 'info',
        confirmButtonColor: '#007bff',
        cancelButtonText:'Cancelar',
        showConfirmButton:true,
        showCancelButton:true,
        allowOutsideClick:false,
      }).then(resp=>{
        if (resp.value){
          this.customerForm.reset();
          this.router.navigate(['/customer-list']);          
        }
      });
    }else{
      this.customerForm.reset();
      this.router.navigate(['/customer-list']);          

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
          console.log(res);
        },
        err=>{
          console.log(err);
        });
    } catch{
    }
    
    return
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
        acronym:elem.get('acronymCodigo').value.trim(),
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

  msgError(campo: string): string {
    let message: string = null;

    if(this.customerForm.get(campo).hasError('required')) return 'El campo es obligatorio';
    if(this.customerForm.get(campo).hasError('pattern'))  return 'Formato incorrecto';
    if(this.customerForm.get(campo).hasError('exists'))   return 'El id introducido ya existe';
    if(this.customerForm.get(campo).hasError('minlength'))
      return `La longitud mínima del campo ${campo} es ${this.customerForm.get(campo).errors.minlength.requiredLength}`;
    if(this.customerForm.get(campo).hasError('maxlength'))
      return `La longitud máxima del campo es ${this.customerForm.get(campo).errors.maxlength.requiredLength}`;

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
      default:
        return;
    }
    if (controlElementoArray.hasError('required')) return 'El campo es obligatorio';  
    if (controlElementoArray.hasError('maxlength'))   
        return `La longitud máxima del campo es ${controlElementoArray.errors.maxlength.requiredLength}`;
    if (controlElementoArray.hasError('pattern')) return 'Formato incorrecto';  
    if (controlElementoArray.hasError('wrongStartDay')) return 'NUNCA SALTO';  
    if (controlElementoArray.hasError('wrongStartDate')) return 'El dia de inicio del periodo es incorrecto';  
    if (controlElementoArray.hasError('wrongEndTime')) return 'La hora de cierre es incorrecta';  
    
    if (controlElementoArray.hasError('wrongStartTime')) return 'La hora de apertura es incorrecta';  
    
    
    
    return message;
  }

}
