import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable} from 'rxjs';
import Swal from 'sweetalert2';
import {FormBuilder, FormGroup,Validators, FormArray} from '@angular/forms';


import { CustomerService } from '../../../services/customer.service';
import { UploadService } from '../../../services/upload.service';
import { Customer } from '../../../interfaces/customer-interface';
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

  private urlImage='http://192.168.1.42:3700/brandimage/';
  private imageDefault='../../../../assets/img/noimage.png';
  
  constructor(private fb: FormBuilder,
              private customerServices:CustomerService,
              private uploadServices:UploadService,
              private utilService:UtilService,
              private ActivatedRoute:ActivatedRoute ,
              private router:Router
              ) {
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
          this.loadData(resp.data[0]);
        })
    }      
    
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
  get telefonoNoValido() {
    return (
      this.customerForm.get('telefono').invalid &&
      this.customerForm.get('telefono').touched
    );
  } 
  get marca(): FormArray {
    return this.customerForm.get('marca') as FormArray;
  }
  get regionMercado(){
    return this.customerForm.get('regionMercado') as FormArray;
  }
  get localizacionPantalla(){
    return this.customerForm.get('localizacionPantalla') as FormArray;
  }
  get codigo(){
    return this.customerForm.get('codigo') as FormArray;
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
    fechaAlta:[{value:'',disabled:true}],
    telefono: ['', [Validators.required, Validators.pattern('[0-9]*'),Validators.maxLength(18)]],
    marca: this.fb.array([]),
    regionMercado:this.fb.array([]),
    localizacionPantalla:this.fb.array([]),
    codigo:this.fb.array([])
  });
}
// crearListeners(){
    

  //   this.customerForm.valueChanges.subscribe(valor=>{

  //   })
  // }

  loadData(customer:Customer){  
    let mr=[], ls=[], co=[], br=[];
    
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
   
    this.customerForm.get('identification').patchValue(customer.identification);
    this.customerForm.get('nombre').patchValue(customer.name);
    this.customerForm.get('fechaAlta').patchValue(customer.entryDate);
    this.customerForm.get('telefono').patchValue(customer.phoneNumber);
  
    this.customerForm.setControl('marca',this.fb.array(br||[]));
    this.customerForm.setControl('regionMercado',this.fb.array(mr||[]));
    this.customerForm.setControl('localizacionPantalla',this.fb.array(ls||[]));
    this.customerForm.setControl('codigo',this.fb.array(co||[]));
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
      acronymCodigo: [b, [Validators.required,Validators.maxLength(5)]],
    });
  }

  addMarca() {
    this.marca.push(this.newMarca(null,null,null,null));
    this.binariosImagenMarca.push(null);
  }
  addRegionMercado(){
  //  this.customerForm.get('regionMercado').markAsUntouched();
    this.regionMercado.push(this.newRegionMercado(null,null));
  }
  addLocalizacionPantalla(){
    this.localizacionPantalla.push(this.newLocalizacionPantalla(null,null));
  }
  addCodigo(){
    this.codigo.push(this.newCodigo(null,null));
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

  
  onSubmit() {
    
    if (this.customerForm.touched){
      if( this.customerForm.invalid){
        console.log('MENSAJE DATOS ERRONEOS MENSAJE Y SIGO');
      } else{
        let peticionHtml: Observable <any>;
        let mr=[], ls=[], co=[], br=[];    
        // Preparar los datos
        br=this.respMarca();
        mr=this.respRegionMercado();
        ls=this.respLocalizacionPantalla();
        co=this.respCodigo();

        let respuesta:Customer ={
              id                  :this.customerId==='nuevo'?null:Number(this.customerId),
              identification      :this.customerForm.get('identification').value,
              name                :this.customerForm.get('nombre').value,
              phoneNumber         :this.customerForm.get('telefono').value,
              entryDate           :this.customerForm.get('fechaAlta').value,
              brands              :br,
              marketRegions       :mr,
              locationsScreen     :ls,
              sitesComercialCodes :co
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
        acronym:elem.get('acronymCodigo').value,
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

  msgError(campo: string): string {
    let message: string = null;

    if(this.customerForm.get(campo).hasError('required')) return 'El campo es obligatorio';
    if(this.customerForm.get(campo).hasError('pattern'))  return 'Formato incorrecto';
    if(this.customerForm.get(campo).hasError('exists'))   return 'El id introducido ya existe';
    if(this.customerForm.get(campo).hasError('minlength'))
      return `La longitud mínima del campo ${campo} es ${this.customerForm.get(campo).errors.minlength.requiredLength}`;
    if(this.customerForm.get(campo).hasError('maxlength'))
      return `La longitud máxima del campo ${campo} es ${this.customerForm.get(campo).errors.maxlength.requiredLength}`;

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
      default:
        return;
    }
    if (controlElementoArray.hasError('required')) return 'El campo es obligatorio';  
    if (controlElementoArray.hasError('maxlength'))   
        return `La longitud máxima del campo ${campo} es ${controlElementoArray.errors.maxlength.requiredLength}`;
    
    return message;
  }

}
