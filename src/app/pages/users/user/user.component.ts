import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import { Observable} from 'rxjs';
import Swal from 'sweetalert2';


import { User, Rol, SitesList } from '../../../interfaces/user-interface';
import { Customer } from '../../../interfaces/customer-interface';
import {UserService } from '../../../services/user.service';
import { CustomerService } from '../../../services/customer.service';

interface ErrorValidate{
  [s:string]:boolean
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {


  public userForm: FormGroup;
  public currentUser:User;
  public userId:string;
  public newUser:boolean;
  public pageTitle:string;
  public languages: any[];
  public roles: any[];
  public customers:Customer[];
  public filterCustomer:string='';
  public page:number=0;
  public linesPages:number=8;
  public filterLines:number=0;
  public prevRelationship:string='';
  

  constructor(private fb: FormBuilder,
    private userServices:UserService,
    private customerServices:CustomerService,
    private ActivatedRoute:ActivatedRoute,
    private router:Router

  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    
    this.userId= this.ActivatedRoute.snapshot.paramMap.get('id');
    if (this.userId==='nuevo'){
      this.newUser=true;
      this.pageTitle='Alta nuevo usuario';
    }else{
      this.newUser=false;
      this.pageTitle='Modificación datos de usuario';
      this.userServices.getUserById(this.userId)
      .subscribe(resp=>{
        this.currentUser=resp.data[0];
        this.loadData(resp.data[0]);
        
        })
    }   
    this.userServices.getLanguages()
      .subscribe(resp=>{
        if (resp.result===true) this.languages=resp.data;
        })
    this.userServices.getRoles()
      .subscribe(resp=>{
        if (resp.result===true) this.roles=resp.data;
        })
    this.customerServices.getCustomers()
      .subscribe(resp=>{
        if (resp.result===true) this.customers=resp.data;
        });
    this.crearListeners();
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
    return this.userForm.get('relacionUsuario').invalid && this.userForm.get('relacionUsuario').touched;
  }
  get categoria(){
    return this.userForm.get('categoria') as FormArray;
  }
  get cliente(){
    return this.userForm.get('cliente') as FormArray;
  }
  // get exceptionsSites(){
  //   return this.userForm.get('excepciones') as FormArray;
  // }
  
  crearFormulario() {
    this.userForm = this.fb.group({
      nombre:         ['', Validators.required],
      apellido:       ['', Validators.required],
      ultimoAcceso:   [{value:'',disabled:true}],
      fechaAlta:      [{value:'',disabled:true}],
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
 //     excepciones: this.fb.array([]),
      customerSearch:  [],
    });

   // ^(?=.*[a-z]) al menos una letra minuscula
   // (?=.*[A-Z]) al menos una letra mayuscula
   // (?=.*[0-9]) al menos un número
   // [a-zA-Z0-9]{8,}$ Caracteres validos y longitud minima


  }


// 
  loadData(user:User){  
    let cat=[], cus=[];
  
    user.categories.forEach(elem=>{
      cat.push(this.newCategoria(elem.id,elem.description,elem.color))
    });
    user.customerUserList.forEach(elem=>{
      cus.push(this.newCliente(elem.id,elem.id_customer,elem.name,elem.exception))
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
    this.userForm.get('fechaAlta').patchValue(user.entryDate);
    this.userForm.get('notas').patchValue(user.notes);

    
    this.userForm.setControl('categoria',this.fb.array(cat||[]));
    this.userForm.setControl('cliente',this.fb.array(cus||[]));


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
    });
    this.userForm.get('nuevaPassword').valueChanges.subscribe(a=>{
     if (this.userForm.get('nuevaPassword').value){
       this.userForm.get('password').enable();
      }  
      else{
        this.userForm.get('password').disable();
        this.userForm.get('password').patchValue(null)
    }
    });
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

  addCategoria(){
    //  this.customerForm.get('regionMercado').markAsUntouched();
      this.categoria.push(this.newCategoria(null,null,null));
    }

  addCliente(){
       this.cliente.push(this.newCliente(null,null,null,null));
  }

  removeCategoria(i:number){
    this.categoria.removeAt(i);
    this.userForm.markAsTouched();
  }
  removeCliente(i:number){
    this.cliente.removeAt(i);
    this.userForm.markAsTouched();
  }
  
  selectCliente(id:number,name:string){
    const rol= this.roles.find(a=> a.id==this.userForm.get('rol').value);

// Comprobamos que el customer no esta ya seleccionado
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
        Swal.fire({
          title: this.userForm.get('rol').touched?`El rol ${rol.description}`:'Es necesario elegir un rol',
          text:this.userForm.get('rol').touched?'no permite seleccionar clientes':'para seleccionar clientes',
          confirmButtonColor: '#007bff',
          icon:'info'
        });
        break;
      case 1:
        if (this.cliente.controls.length==0){
          this.cliente.push(this.newCliente(null,id,name,0));
          this.cliente.controls[this.cliente.controls.length-1].get('nombre').markAsTouched();
          
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
          this.cliente.push(this.newCliente(null,id,name,0));
          this.cliente.controls[this.cliente.controls.length-1].get('nombre').markAsTouched();
      break; 
    }
    return
  }

  selectIdioma(elem:number){
    return elem===this.userForm.get('idioma').value?true:false;
  }

  selectRol(elem:number){
    return elem===this.userForm.get('rol').value?true:false;
  }

  rolOtros(){
  return this.userForm.get('rol').value===3?true:false
  }

  rolSuperuser(){
  return this.userForm.get('rol').value===0?true:false
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

  onSubmit() {
    if (this.userForm.touched){
      let invalidListCustomer=(this.cliente.controls.length==0 
                  && Number(this.userForm.get('rol').value)!=0);

      if( this.userForm.invalid || invalidListCustomer){
        Swal.fire({
          title: invalidListCustomer?'Falta seleccionar el cliente':'Datos incorrectos' ,
          text:'por favor revise la información introducida',
          confirmButtonColor: '#007bff',
          icon:'error'
        });
      } else{
        let peticionHtml: Observable <any>;
        let cat=[], cus=[], sit=[];    
        // Preparar los datos
        cat=this.respCategoria();
        cus=this.respCliente();
        sit=this.userId!='nuevo'?this.currentUser.sitesLists:[];
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
              sitesLists          :sit
        }

        if (this.userId==='nuevo'){
          peticionHtml=this.userServices.saveUser(respuesta);
        }else{
          peticionHtml=this.userServices.updateUser(respuesta);
        };

        peticionHtml.subscribe(resp=>{     
          Swal.fire({
            title: `El registro ${resp.data.name}`,
            text:'se actualizó correctamente',
            confirmButtonColor: '#007bff',
            icon:'success'
          });
          this.userForm.reset();
          this.router.navigate(['/user-list']);
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
    if (this.userForm.touched){
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
          this.userForm.reset();
          this.router.navigate(['/user-list']);          
        }
      });
    }else{
      this.userForm.reset();
      this.router.navigate(['/user-list']);          

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
          customerId:elem.id_customer,
          name:elem.name,        
          exception:elem.exception,        
          deleted:true
        })
      }
    });
  }

  return r;
}
msgError(campo: string): string {


  if(this.userForm.get(campo).hasError('required')) return 'El campo es obligatorio';
  if(this.userForm.get(campo).hasError('pattern') && campo=='email')  return 'Formato incorrecto. La dirección no es valida';
  if(this.userForm.get(campo).hasError('pattern') && campo=='password')  return 'Formato incorrecto. Debe tener al menos ocho carácteres, una letra mayúscula, una minúscula y un dígito';
  if(this.userForm.get(campo).hasError('exists'))   return 'El email introducido ya existe';
  if(this.userForm.get(campo).hasError('minlength'))
    return `La longitud mínima del campo ${campo} es ${this.userForm.get(campo).errors.minlength.requiredLength}`;
  if(this.userForm.get(campo).hasError('maxlength'))
    return `La longitud máxima del campo ${campo} es ${this.userForm.get(campo).errors.maxlength.requiredLength}`;

  return
}
}
