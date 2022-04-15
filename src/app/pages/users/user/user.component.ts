import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Observable} from 'rxjs';

import Swal from 'sweetalert2';
import {NgbModal, NgbModalConfig,ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Sort} from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core'; 

import { Site, ScreenLocation } from '../../../interfaces/site-interface';
import { User, Rol, SitesList, CustomerUserList } from '../../../interfaces/user-interface';
import { Customer } from '../../../interfaces/customer-interface';
import { CustomerService } from '../../../services/customer.service';
import { GlobalDataService } from '../../../services/global-data.service';
import { LoginService } from '../../../services/login.service';
import { SiteService } from '../../../services/site.service';
import { UtilService } from '../../../services/util.service';
import { UserService } from '../../../services/user.service';

interface ErrorValidate{
  [s:string]:boolean
}
interface excepcionesType{
  id:number;
  description:string
}

interface ExcepcionesBorradas{
  idRelacion:      number;
  idEmplazamiento:number
}

interface ListaExcepciones{

  idEmplazamiento:     number;
  codigoComercial:     string;
  nombreLocal:         string;
  idCliente:           number;
  nombreCliente:       string;
  excepcion:           number;  
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  
  
  public currentUser:User;
  public userForm: FormGroup;
  public userId:string;
  public customers:Customer[];
  public filterCustomer:string='';
  public filterLines:number=0;
  public filterSite:string='';
  public languages: any[];
  public linesPages:number=6;
  public linesPages2:number=6;
  public newUser:boolean;
  public page:number=0;
  public page2:number=0;
  public pageTitle:string;
  public prevRelationship:string='';
  public roles: any[];
  public sites: SitesList[]=[];
  public tiposExcepciones:excepcionesType[]=[
    {
      id:1,
      description:'Solo los sites indicados'
    },
    {
      id:2,
      description:'Excepto los sites indicados'
    }
  ];
  public excepcionesCliente:SitesList[];
  public excepcionesBorradas:ExcepcionesBorradas[];
  public codigoCliente:number=0;
  public closeResult = '';
  public rolAnterior:number=0;
  public sortedData:SitesList[]=[];
  public listaExcepcionesActiva:SitesList[];
  public activeLang = this.globalDataServices.getStringUserLanguage();

  
  constructor(
    private ActivatedRoute:ActivatedRoute,
    private fb: FormBuilder,
    private router:Router,
    private translate: TranslateService,
    private customerServices:CustomerService,
    private siteServices:SiteService,
    private userServices:UserService,
    private UtilService:UtilService, 
    private loginServices:LoginService,
    private globalDataServices:GlobalDataService,
    config: NgbModalConfig, private modalService: NgbModal  
    ) {
      config.backdrop = 'static';
      config.keyboard = false; 
      this.translate.setDefaultLang(this.activeLang);
      this.translate.use(this.activeLang);
      this.crearFormulario();
  }

  ngOnInit(): void {
    
    this.userId= this.ActivatedRoute.snapshot.paramMap.get('id');
    if (this.userId==='nuevo'){
      this.newUser=true;
   //   this.pageTitle='Alta nuevo usuario';
    }else{
      this.newUser=false;
    //  this.pageTitle='Modificación datos de usuario';
      this.userServices.getUserById(this.userId)
      .subscribe(resp=>{
          this.currentUser=resp.data[0];
          this.rolAnterior=this.currentUser.rol.id;
          console.log('el usuario recibido',this.currentUser);
          this.loadData(resp.data[0]);      
        },
        error=>{ 
          // Visualización del error al usuario
          this.loginServices.accessErrorText(error)
              .then(resp=>{
                this.salidaForzada();   
          })
        })
    }   
    this.userServices.getLanguages()
      .subscribe(resp=>{
        if (resp.result===true) this.languages=resp.data;
      },
      error=>{ 
        this.loginServices.accessErrorText(error)
        .then(resp=>{
         this.salidaForzada();
        });
      });
    this.userServices.getRoles()
      .subscribe(resp=>{
        if (resp.result===true) this.roles=resp.data;
      },
      error=>{ 
        this.loginServices.accessErrorText(error)
        .then(resp=>{
           this.salidaForzada();
        });
      });
    this.customerServices.getCustomers()
      .subscribe(resp=>{
        if (resp.result===true) this.customers=resp.data;
      },
      error=>{ 
        this.loginServices.accessErrorText(error)
        .then(resp=>{
           this.salidaForzada();
        });
      });
    this.crearListeners();
  }
 
  salidaForzada(){
    this.userForm.reset();
    this.loginServices.logout();
    this.router.navigate(['/login']);    
    return
  }

  get nombreNoValido() {
    return (
      this.userForm.get('nombre').invalid &&
      this.userForm.get('nombre').touched
    );
  }
  get apellidoNoValido() {
    return (
      this.userForm.get('apellido').invalid &&
      this.userForm.get('apellido').touched
    );
  }
  get emailNoValido(){
    return this.userForm.get('email').invalid && this.userForm.get('email').touched;
  }
  get passwordNoValido(){
    return this.userForm.get('password').invalid && this.userForm.get('password').touched;
  }
  get idiomaNoValido(){
    return this.userForm.get('idioma').invalid && this.userForm.get('idioma').touched;
  }
  get rolNoValido(){
    return this.userForm.get('rol').invalid && this.userForm.get('rol').touched;
  }
  get relacionUsuarioNoValido(){
    return this.userForm.get('relacionUsuario').invalid 
    && this.userForm.get('relacionUsuario').touched;
  }
  get clienteForSitesNoValido(){
    return this.userForm.get('customerSearch2').invalid && this.userForm.get('customerSearch2').touched;
  }
  get excepcionNoValido(){
    return this.userForm.get('excepcion').invalid && this.userForm.get('excepcion').touched;
  }
  get categoria(){
    return this.userForm.get('categoria') as FormArray;
  }
  get cliente(){
    return this.userForm.get('cliente') as FormArray;
  }
  get excepciones(){
    return this.userForm.get('excepciones') as FormArray;
  }
  get rolOtros(){
    return this.userForm.get('rol').value===3?true:false
  }
  get rolSuperuser(){
    return this.userForm.get('rol').value===0?true:false
  }

  // get exceptionsSites(){
  //   return this.userForm.get('excepciones') as FormArray;
  // }
  
  crearFormulario() {
    this.userForm = this.fb.group({
      nombre:         ['', Validators.required],
      apellido:       ['', Validators.required],
      ultimoAcceso:   [{value:'',disabled:true}],
      email:          ['', [Validators.required,
                      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]
                      ,this.existsEmailUser.bind(this)],
      nuevaPassword:  [''],
      password:       ['', [Validators.required,Validators.minLength(8),
                      Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[a-zA-Z0-9]{8,}$')]],
      rol:            ['', Validators.required],
      idioma:         ['', Validators.required],
      bloqueado:      [false, Validators.required],
      relacionUsuario:[''],
      notas:          [],
      cliente: this.fb.array([]),
      categoria: this.fb.array([]),
      excepciones: this.fb.array([]),
      customerSearch: [],
      siteSearch: [],
      // customerSearch2:[],
      exceptionType:  []
  

    });

   // ^(?=.*[a-z]) al menos una letra minuscula
   // (?=.*[A-Z]) al menos una letra mayuscula
   // (?=.*[0-9]) al menos un número
   // [a-zA-Z0-9]{8,}$ Caracteres validos y longitud minima
  }


// 
  loadData(user:User){  
    let cat=[], cus=[], exc=[]
  
    user.categories.forEach(elem=>{
      cat.push(this.newCategoria(elem.id,elem.description,elem.color))
    });
    user.customerUserList.forEach(elem=>{
      cus.push(this.newCliente(elem.id,elem.customerId,elem.customerName,elem.exception))
    });
    console.log('Lista de clientes del usuario',user.customerUserList);
    console.log('Lista de sites',user.sitesList);
    user.sitesList.forEach(elem=>{
      console.log('elemento que falla',elem);
      exc.push(this.newExceptionEmplazamiento(elem.id,elem.siteId,elem.siteComercialId,
        elem.venueName,elem.customer.id,elem.customer.name,
        user.customerUserList.find(e=>e.customerId==elem.customer.id).exception))
      });

    this.userForm.get('nombre').patchValue(user.name);
    this.userForm.get('apellido').patchValue(user.surname);
    this.userForm.get('email').patchValue(user.email);
    this.userForm.get('nuevaPassword').patchValue(this.newUser?true:false);
    this.userForm.get('password').patchValue(null);
    this.userForm.get('idioma').patchValue(user.languageId);
    this.userForm.get('bloqueado').patchValue(user.blocked);
 
   // this.userForm.get('rol').patchValue(1);
    this.userForm.get('rol').patchValue(user.rol.id);
    this.userForm.get('relacionUsuario').patchValue(user.relationship);
    this.userForm.get('ultimoAcceso').patchValue(user.lastAccess);
 //   this.userForm.get('fechaAlta').patchValue(user.entryDate);
    this.userForm.get('notas').patchValue(user.notes);

    
    this.userForm.setControl('categoria',this.fb.array(cat||[]));
    this.userForm.setControl('cliente',this.fb.array(cus||[]));
    this.userForm.setControl('excepciones',this.fb.array(exc||[]));
    this.sortedData=this.listaExcepcionesActiva=this.cargarExcepciones(null);

  return
  }


  crearListeners(){

    this.userForm.get('customerSearch').valueChanges.subscribe(a=>{
      this.filterCustomer=a;
      this.page=0;
    });

    this.userForm.get('rol').valueChanges.subscribe(a=>{
      if (Number(a)===3){
        this.userForm.get('relacionUsuario').patchValue(this.prevRelationship);
        this.userForm.get('relacionUsuario').enable();
      }else{
        this.userForm.get('relacionUsuario').disable();
        this.prevRelationship=this.userForm.get('relacionUsuario').value;
        this.userForm.get('relacionUsuario').patchValue(null);
      }
      if ((a==0 && this.rolAnterior==3) || 
          (a==1 && this.rolAnterior==3) || 
          (a==0 && this.rolAnterior==1)){
        console.log('vamos a borrar clientes y excepciones');
        // eliminamos clientes y excepciones 
        this.cliente.controls.splice(0);
        this.excepciones.controls.splice(0);
      }
      this.rolAnterior=a;
    });

    this.userForm.get('nuevaPassword').valueChanges.subscribe(a=>{
     if (this.userForm.get('nuevaPassword').value){
       this.userForm.get('password').enable();
      }  
      else{
        this.userForm.get('password').disable();
        this.userForm.get('password').patchValue(null);
    }
    });
       
    this.userForm.get('siteSearch').valueChanges.subscribe(a=>{  
      this.filterSite=a;
      this.page=0;
    });

    this.userForm.get('exceptionType').valueChanges.subscribe(a=>{  
   // actualizamos el tipo de excepcion a todos los emplazamientos
       if (this.excepcionesCliente != undefined) {   
        this.excepcionesCliente.forEach(elem=>{
          elem.exception=a;
        });
        const i=this.cliente.controls.findIndex(b=>b.get('idCliente').value=== this.codigoCliente);
        this.cliente.controls[i].get('excepcion').patchValue(a);
       }
    });
    return
  }

  newCategoria(a:number|null,b:string|null,c:string|null): FormGroup {
    return this.fb.group({
      idCategoria: [a],
      descripcionCategoria: [b,Validators.required],
      colorCategoria: [c],
    });
  }

  newCliente(a:number|null,b:number|null,c:string|null,d:number|null): FormGroup {
    return this.fb.group({
      id: [a],
      idCliente: [b,Validators.required],
      nombre: [c],
      excepcion: [d,Validators.required],
    });
  }
  newExceptionEmplazamiento(a:number|null,b:number,c:string,d:string,e:number,f:string,g:number): FormGroup {
    return this.fb.group({
      id:                  [a],
      idEmplazamiento:     [b,Validators.required],
      codigoComercial:     [c,Validators.required],
      nombreLocal:         [d,Validators.required],
      idCliente:           [e,Validators.required],
      nombreCliente:       [f,Validators.required],
      excepcion:           [g],     
    });
  }

  addCategoria(){
      this.categoria.push(this.newCategoria(null,null,null));
    }

  removeCategoria(i:number){
    this.categoria.removeAt(i);
    this.userForm.markAsTouched();
  }

  removeCliente(i:number){
    const codCliente=this.cliente.controls[i].get('idCliente').value;
    this.cliente.removeAt(i);
    //this.userForm.get('customerSearch2').reset();
    //this.userForm.get('customerSearch2').patchValue(this.cliente.length>0?this.customersChoice[0].customerId:null);
    this.userForm.get('exceptionType').patchValue(0);
    this.userForm.markAsTouched();
    this.removeExcepcionesByCustomer(codCliente);
    return;
  }
  
  removeExcepcion(i:number){

    this.excepcionesBorradas.push({
        idRelacion:      this.excepcionesCliente[i].id,
        idEmplazamiento:this.excepcionesCliente[i].siteId
    });
 
    this.excepcionesCliente.splice(i,1);

    console.log(this.excepcionesBorradas);

  }

  removeExcepcionesByCustomer(idCliente:number){

    const newExc=this.excepciones.controls.filter(elem=>(elem.get('idCliente').value!=idCliente));
    this.userForm.setControl('excepciones',this.fb.array(newExc||[]))
    return;

  }

  selectIdioma(elem:number){
    return elem==this.userForm.get('idioma').value?true:false;
  }

  selectRol(elem:number){
    return elem==this.userForm.get('rol').value?true:false;
  }

  selectCliente(id:number,name:string){
    const rol = this.roles.find(a=> a.id==this.userForm.get('rol').value);  
    // Comprobamos si el customer esta seleccionado
    if (this.cliente.controls.find(a=>a.get('idCliente').value==id)){
      Swal.fire({
        title: `El cliente ${name}`,
        text:'ya esta seleccionado',
        confirmButtonColor: '#007bff',
        icon:'info'
      });
      return
   }
    switch (Number(this.userForm.get('rol').value)){
      case 0:
       console.log('x',this.userForm.get('rol').value, typeof this.userForm.get('rol').value)
        Swal.fire({
          title: this.userForm.get('rol').value=='0'?`El rol ${rol.description}`:'Es necesario elegir un rol',
          text:this.userForm.get('rol').value=='0'?'no permite seleccionar clientes':'para seleccionar clientes',
          confirmButtonColor: '#007bff',
          icon:'info'
        });
        break;
      case 1:  
        if (this.cliente.controls.length==0){
          this.cliente.push(this.newCliente(null,id,name,1));
          this.cliente.controls[this.cliente.controls.length-1].get('nombre').markAsTouched();
          this.userForm.get('exceptionType').patchValue(1);

        }else{
          Swal.fire({
            title: `El rol ${rol.description}`,
            text:'solo permite seleccionar un cliente',
            confirmButtonColor: '#007bff',
            icon:'info'
          });
        }
        break;
        case 3:
          this.cliente.push(this.newCliente(null,id,name,1));
          this.cliente.controls[this.cliente.controls.length-1].get('nombre').markAsTouched();
       //   this.userForm.get('customerSearch2').patchValue(null);
          this.userForm.get('exceptionType').patchValue(1);
          break; 
    }
    return
  }

  selectExcepcion(elem:number){
    return elem==this.userForm.get('excepcion').value?true:false; 
  }

  setExcepciones(content:any,codCliente:number,i:number){
 
    this.codigoCliente=codCliente;
    i = this.cliente.controls.findIndex(a=>a.get('idCliente').value==codCliente);

    this.userForm.get('exceptionType').patchValue(this.cliente.controls[i].get('excepcion').value);

    this.cargarSites(codCliente);
    this.excepcionesBorradas=[];
    this.excepcionesCliente=this.cargarExcepciones(codCliente);
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',  size: 'xl' }).result.then((result) => {
      this.actualizarFormExcepciones();
      this.excepciones.markAsTouched();
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      if(reason=='Cross click'){
        // cargamos las excepciones inciales por pulsar X
       
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

  cargarSites(cod:number){

    this.siteServices.getSiteByIdCustomer(cod)
    .subscribe(resp=>{
      this.sites=resp.data;
    });
  }

  cargarExcepciones(cod:number|null){

    let exc:SitesList[]=[];
  
    this.excepciones.controls.forEach(elem=>{   
      if (cod===null || elem.get('idCliente').value==cod){
        exc.push(          
            {id:            elem.get('id').value,
              siteId:        elem.get('idEmplazamiento').value,
              siteComercialId: elem.get('codigoComercial').value, 
              venueName:     elem.get('nombreLocal').value,
              customer:{ id:elem.get('idCliente').value,
                        identification:null,
                        name:elem.get('nombreCliente').value,
            },
              exception:elem.get('excepcion').value,
              deleted: false
            });
      }
    });
    return exc
  }

  actualizarFormExcepciones(){

      // cargamos y actualizamos la lista de excepciones en el formulario
      this.excepcionesCliente.forEach(elem => {
        let i = this.excepciones.controls.findIndex(a=>a.get('idEmplazamiento').value==elem.siteId);
        if (i===-1){
          console.log('es nuevo',elem);
          // insertamos el nuevo
          this.excepciones.push(this.newExceptionEmplazamiento(elem.id,elem.siteId,elem.siteComercialId,
            elem.venueName,elem.customer.id,elem.customer.name,elem.exception));
        }else{
          console.log('ya existia',elem);
          // actualizamos el tipo de excepcion
          this.excepciones.controls[i].get('excepcion').patchValue(elem.exception);
        }
      });
       // borramos y actualizamos la lista de excepciones en el formulario
       
       if( this.excepcionesBorradas.length>0){
        this.excepcionesBorradas.forEach(elem => {
          let i = this.excepciones.controls.findIndex(a=>a.get('idEmplazamiento').value==elem.idEmplazamiento);
          if (i!=-1){
            this.excepciones.removeAt(i);
          }        
        })     
      }
      console.log('el formulario',this.excepciones.controls);
      this.sortedData=this.listaExcepcionesActiva=this.cargarExcepciones(null);
      console.log('la sort',this.sortedData);
    return
  }

  selectSite(idSite:number,siteComercialId:string,venueName:string,customerId:number,customerName:string){
    
     // Comprobamos si el emplazamiento esta seleccionado
    if (this.excepcionesCliente.find(a=>a.siteId==idSite)){
      Swal.fire({
        title: `El emplazamiento ${siteComercialId}`,
        text:'ya esta seleccionado',
        confirmButtonColor: '#007bff',
        icon:'info'
      });      
    }else{

      // Comprobamos que no lo hallamos borrado previamente para obtener el codigo de relacion que tenia
      let codRelacion:number=null;
      const i= this.excepcionesBorradas.findIndex(a=>a.idEmplazamiento==idSite);
      if (i!=-1){
        codRelacion=this.excepcionesBorradas[i].idRelacion;
        this.excepcionesBorradas.splice(i,1);
      }

      this.excepcionesCliente.push(          
        {id:             codRelacion,
          siteId:        idSite,
          siteComercialId: siteComercialId, 
          venueName:     venueName,
          customer:{ id:customerId,
                    identification:null,
                    name:customerName,
        },
          exception:this.userForm.get('exceptionType').value,
          deleted: false
        });


    }
    return
  }

  buscar(tecla:string){
    this.page=0;
    this.page2=0;
    return  
  }
  nextPage(num:number){
    switch (num){
      case 1:
        this.page +=this.linesPages; 
        break;
      case 2:
        this.page2 +=this.linesPages2;
        break;
    }
    return  
  }
  prevPage(num:number){
    switch (num){
      case 1:
        this.page -=this.linesPages;
        break;
      case 2:
        this.page2 -=this.linesPages2;
        break;
    }
    return  
  }

  sortData(sort: Sort) {
    const data = this.listaExcepcionesActiva.slice(); 
    console.log(data);
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.UtilService.compare(a.siteId, b.siteId, isAsc);
        case 'idComercial':
          return this.UtilService.compare(a.siteComercialId, b.siteComercialId, isAsc);
        case 'nombreLocal':
          return this.UtilService.compare(a.venueName, b.venueName, isAsc);
        case 'nombreCliente':
          return this.UtilService.compare(a.customer.name, b.customer.name, isAsc);         
        case 'excepcion':
          return this.UtilService.compare(a.exception, b.exception, isAsc);  
        default:
          return 0;          
      }
    });
  }

  onSubmit() {
    let msg1:string=null;
    let msg2:string=null;
    let msg3:string=null;
    console.log(this.userForm)

    if (this.userForm.touched){
      let invalidListCustomer=(this.cliente.controls.length==0 
                  && Number(this.userForm.get('rol').value)!=0);

      if( this.userForm.invalid || invalidListCustomer){

        this.translate.get('general.modalClosePage9')
        .subscribe(res=>msg1=res);
        this.translate.get('general.modalClosePage6')
        .subscribe(res=>msg2=res);
        this.translate.get('general.modalClosePage8')
        .subscribe(res=>msg3=res);

        Swal.fire({
          title: invalidListCustomer?msg1:msg2,
          text:msg3,
          confirmButtonColor: '#007bff',
          allowOutsideClick:false,
          icon:'error'
        });
      } else{
        let peticionHtml: Observable <any>;
        let cat=[], cus=[], sit=[],exc=[];    
        // Preparar los datos
        cat=this.respCategoria();
        cus=this.respCliente();
        exc=this.respExcepciones();
        console.log('excepciones',exc);
 //       sit=this.userId!='nuevo'?this.currentUser.sitesList:[];
        let objectRol:Rol= this.roles.find(a=>a.id==Number(this.userForm.get('rol').value));

        let respuesta:User ={
              id                  :this.userId==='nuevo'?null:Number(this.userId),
              name                :this.userForm.get('nombre').value,
              surname             :this.userForm.get('apellido').value,
              email               :this.userForm.get('email').value,
              newPassword         :this.userForm.get('nuevaPassword').value,           
              password            :this.userForm.get('password').value,
              rol                 :objectRol,          
              relationship        :Number(this.userForm.get('rol').value)==3?this.userForm.get('relacionUsuario').value:null,
              blocked             :this.userForm.get('bloqueado').value,
              notes               :this.userForm.get('notas').value,
              languageId          :Number(this.userForm.get('idioma').value),
              lastAccess          :this.userForm.get('ultimoAcceso').value,
              categories          :cat,
              customerUserList    :cus,
              sitesList           :exc,
        }

        console.log('enviamos al servidor',respuesta);
        if (this.userId==='nuevo'){
          peticionHtml=this.userServices.saveUser(respuesta);
        }else{
          peticionHtml=this.userServices.updateUser(respuesta);
        };

        peticionHtml.subscribe(resp=>{     

          this.translate.get('general.modalClosePage4', {value1: resp.data.name})
          .subscribe(res=>msg1=res);
          this.translate.get('general.modalClosePage5')
            .subscribe(res=>msg2=res);

          Swal.fire({
            title: msg1,
            text:msg2,
            allowOutsideClick:false,
            confirmButtonColor: '#007bff',
            icon:'success'
          });
          this.userForm.reset();
          this.router.navigate(['/home/user-list']);
        },
        error=>{
          console.log(error);
        })
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

    if (this.userForm.touched){

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
          this.userForm.reset();
          this.router.navigate(['/home/user-list']);          
        }
      });
    }else{
      this.userForm.reset();
      this.router.navigate(['/home/user-list']);          

    }
    return;
  }

  // validacion asincrona de email
  existsEmailUser(control:FormControl,a:any[]):Promise<ErrorValidate>|Observable<ErrorValidate>{
    let email=control.value;
   
    if (!control.value || control.pristine){
      return Promise.resolve(null);
    }
    return new Promise ((resolve,reject)=>{
       this.userServices.getUserByEmail(email)
       .subscribe(
         resp=>{      
          if (resp.data.length===0){ // no encuentro email
             resolve(null);
          }else if (this.newUser){ // es nuevo usuario
                  resolve ({exists:true});
                }else if(resp.data[0].id==this.currentUser.id) { // es el mismo usuario que modifico
                       resolve(null);
                  }else {               
                   resolve ({exists:true});
                  }
        },
        error=>{
          resolve(null);
        })
     });
  }



  /*
  Preparamos la tabla de categorias para actualizar los datos del servidor.
*/  
respCategoria(){
  let r=[];
  
  this.categoria.controls.forEach((elem,index) => {
    r.push({
      id:elem.get('idCategoria').value,
      description:elem.get('descripcionCategoria').value,
      color:elem.get('colorCategoria').value!==null?elem.get('colorCategoria').value:'#000000',
      deleted:false
    })
  });
  if (this.userId!='nuevo'){   
    this.currentUser.categories.forEach((elem,index) => {    
      let resultado = r.find(a=>a.id===elem.id)
      if(resultado===undefined){
        r.push({
          id:elem.id,
          description:elem.description,
          color:elem.color,        
          deleted:true
        })
      }
    });
  }

  return r;
}



respCliente(){
  let r=[];
  
  this.cliente.controls.forEach((elem,index) => {
    r.push({
      id:elem.get('id').value,
      customerId:elem.get('idCliente').value,
      name:elem.get('nombre').value,
      exception:elem.get('excepcion').value,
      deleted:false
    })
  });

  if (this.userId!='nuevo'){   
    this.currentUser.customerUserList.forEach((elem,index) => {    
      let resultado = r.find(a=>a.id===elem.id)
      if(resultado===undefined){
        r.push({
          id:elem.id,
          customerId:elem.customerId,
          name:elem.customerName,
          exception:elem.exception,        
          deleted:true
        })
      }
    });
  }

  return r;
}


 /*
  Preparamos la tabla de excepciones para actualizar los datos del servidor.
*/  
respExcepciones(){
  let r=[];
  
  this.excepciones.controls.forEach((elem,index) => {
    r.push({
      id:              elem.get('id').value,
      siteId:          elem.get('idEmplazamiento').value,  
      siteComercialId: elem.get('codigoComercial').value,
      venueName:       elem.get('nombreLocal').value,
      customer:{
                id:elem.get('nombreLocal').value,
                identification:null,
                name:elem.get('nombreLocal').value
      },
  //    exception:       elem.get('excepcion').value,
      deleted:         false
    })
  });
  if (this.userId!='nuevo'){   
    this.currentUser.sitesList.forEach((elem,index) => {    
      let resultado = r.find(a=>a.id===elem.id)
      if(resultado===undefined){
        r.push({
          id:elem.id,
          siteId:elem.siteId,
          siteComercialId:elem.siteComercialId,
          venueName:elem.venueName,    
          customer:{
            id:elem.customer.id,
            identification:elem.customer.identification,
            name:elem.customer.name
          },
          deleted:true
        })
      }
    });
  }

  return r;
}

msgError(campo: string): string {

  let message: string = null;

  if(this.userForm.get(campo).hasError('required'))
      this.translate.get('error.validationField1')
      .subscribe(res=>(message=res));

  if(this.userForm.get(campo).hasError('pattern') && campo=='email')
      this.translate.get('error.validationField11')
      .subscribe(res=>(message=res));

  if(this.userForm.get(campo).hasError('pattern') && campo=='password')
      this.translate.get('error.validationField12')
      .subscribe(res=>(message=res));

  if(this.userForm.get(campo).hasError('exists'))
      this.translate.get('error.validationField13')
      .subscribe(res=>(message=res));
  

    if(this.userForm.get(campo).hasError('minlength'))    
      this.translate.get('error.validationField4', 
          {value1: campo,
           value2: this.userForm.get(campo).errors.minlength.requiredLength})
      .subscribe(res=>(message=res));
    
    if(this.userForm.get(campo).hasError('maxlength'))    
        this.translate.get('error.validationField5', 
              {value1: campo,
               value2: this.userForm.get(campo).errors.maxlength.requiredLength})
        .subscribe(res=>(message=res));

    return message;
}
}
