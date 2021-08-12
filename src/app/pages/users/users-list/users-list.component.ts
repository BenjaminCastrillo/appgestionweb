import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../interfaces/user-interface';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';


// Declaramos las variables para jQuery
declare var jQuery:any;
declare var $:any;

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  public users:User[];
  public cargando:boolean=false;
  public filterUser:string='';
  public page:number=0;
  public linesPages:number=10;
  public filterLines:number=0;

  constructor(private userServices:UserService,
    private router:Router) { }

  ngOnInit(): void {

    this.cargando=true;
    this.userServices.getUsers()
    .subscribe(resp=>{
      if (resp.result===true){ 
        this.users=resp.data;      
        this.cargando=false;
      }
      });
  }

  editUser(user:User){
    this.router.navigate(['/user',user.id]);
  }
  removeUser(user:User,i:number){
    Swal.fire({
      title:'¿Desea borrar el registro?',
      text: `${user.name} ${user.surname}`,
      icon: 'question',
      cancelButtonText:'Cancelar',
      confirmButtonColor: '#007bff',
      showConfirmButton:true,
      showCancelButton:true,
    }).then(resp=>{
      if (resp.value){
        this.userServices.deleteUser(user.id.toString())
        .subscribe(resp=>{
          this.users.splice(this.users.findIndex(e=> e.id===user.id),1);
          },
          error=>{
            Swal.fire({
              title: 'Lo siento tuvimos un problema',
              text:`El registro de ${user.name} ${user.surname} no se eliminó`,
              confirmButtonColor: '#007bff',
              icon:'error'
            });
            console.log(error.error.result);
          });
      }

    });
    return
  }

  exceptionsUser(user:User){
    this.router.navigate(['/user-exceptions',user.id]);
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
}
