import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable} from 'rxjs';
import { LoginService } from '../services/login.service';
import { LoginUser } from '../interfaces/loginUser-interface';
import Swal from 'sweetalert2';

interface Login{
  user:string,
  password:string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
 
  public remember=false;
  public email='';
  public loginForm: FormGroup;


  constructor(private fb: FormBuilder,
    private loginServices:LoginService,
    private router:Router,
    ) { }

  ngOnInit(): void {

    if (localStorage.getItem('email')){
      this.remember=true;
      this.email=localStorage.getItem('email')
    }

    this.loginForm = this.fb.group({
      user: [this.email, Validators.required],
      password: ['', Validators.required],
      rememberUser:[this.remember]
    });  
  }

  get usuarioNoValido() {
    return (
      this.loginForm.get('user').invalid &&
      this.loginForm.get('user').touched
    );
  }
  get passwordNoValido() {
    return (
      this.loginForm.get('password').invalid &&
      this.loginForm.get('password').touched
    );
  }


  msgError(campo: string): string {
    let message: string = null;
    if(this.loginForm.get(campo).hasError('required')) return 'El campo es obligatorio';
   
    return message;
  }

  onSubmit() {
    if (this.loginForm.touched){
     
      if( this.loginForm.invalid){
        
      } else{
        let peticionHtml: Observable <any>;
        
        let respuesta:LoginUser ={
              user                :this.loginForm.get('user').value,              
              password            :this.loginForm.get('password').value,
              app                 :'0'
        }

        peticionHtml=this.loginServices.loginUser(respuesta);

        Swal.fire({
          icon: 'info',
          title: 'Espere por favor...',
          allowOutsideClick:false
        })
        Swal.showLoading();
  
        peticionHtml.subscribe(resp=>{     
          console.log('respuesta ',resp);

          if (this.loginForm.get('rememberUser').value){
            localStorage.setItem('email',this.loginForm.get('user').value)
          }else{

         // localStorage.setItem('email','');
          localStorage.removeItem('email');
          }
          Swal.close();
          const name=resp.data.name+' '+resp.data.surname;
          if (resp.result){
            this.loginServices.saveToken(resp.token,name,resp.data.id);
            this.router.navigate(['/home']);
          }else{
            console.log('usuario incorrecto');
          }

        },
        error=>{
          console.log('error', error);
          Swal.fire({
            icon: 'error',
            title: 'Usuario o password incorrecto',
            text: 'Por favor, inténtelo de nuevo',
            allowOutsideClick:false
          })

          // restituyo la situación inicial
          if (localStorage.getItem('email')){
            this.loginForm.get('user').patchValue(localStorage.getItem('email'));
            this.loginForm.get('rememberUser').patchValue(true);
          }else{
            this.loginForm.get('user').patchValue('');           
          }
          this.loginForm.get('password').patchValue('');
          // this.loginForm.reset();

        })
      };
    }else{
      console.log('No hago nada y sigo en la página ');
    }
  
    return;
  }

 
}
