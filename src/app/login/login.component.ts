import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import Swal from 'sweetalert2';

import { LoginService } from '../services/login.service';
import { GlobalDataService } from '../services/global-data.service';
import { LoginUser } from '../interfaces/loginUser-interface';

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
  public activeLang:string = this.globalDataServices.getStringUserLanguage();
  public userLanguage:string=null;

  constructor(private fb: FormBuilder,
    private loginServices:LoginService,
    private globalDataServices:GlobalDataService,
    private translate: TranslateService,
    private router:Router,
    ) {}
     
    ngOnInit(): void {
 
    this.translate.setDefaultLang(this.activeLang);
    this.translate.use(this.activeLang);
  
      
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
    if(this.loginForm.get(campo).hasError('required')) 
    {
      this.translate.get('error.validationField1')
      .subscribe(res=>(message=res));
    }
    return message;
  }

  onSubmit() {
    if (this.loginForm.touched && !this.loginForm.invalid){  
      let msg1:string=null;
      let msg2:string=null;
      let peticionHtml: Observable <any>;
      
      let respuesta:LoginUser ={
            user                :this.loginForm.get('user').value,              
            password            :this.loginForm.get('password').value,
            app                 :'0'
      }

      peticionHtml=this.loginServices.loginUser(respuesta);

      peticionHtml.subscribe(resp=>{     

        if (this.loginForm.get('rememberUser').value){
          localStorage.setItem('email',this.loginForm.get('user').value)
        }else{
          localStorage.removeItem('email');
        }
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
        this.translate.get('login.textError1')
          .subscribe(res=>msg1=res);
        this.translate.get('login.textError2')
          .subscribe(res=>msg2=res);
        Swal.fire({
          icon: 'error',
          title: msg1,
          text: msg2,
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
    }else{
      console.log('No hago nada y sigo en la página ');
    } 
    return;
  }

 
}
