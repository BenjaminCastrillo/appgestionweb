import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../interfaces/user-interface';
import { UserService } from '../../../services/user.service';
import { UtilService } from '../../../services/util.service';
import Swal from 'sweetalert2';
import {Sort} from '@angular/material/sort';
 

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
  public sortedData:User[];

  constructor(private userServices:UserService,
    private router:Router,
    private UtilService:UtilService) { }

  ngOnInit(): void {

    this.cargando=true;
    this.userServices.getUsers()
    .subscribe(resp=>{
      if (resp.result===true){ 
        this.users=resp.data;      
        this.cargando=false;
        this.sortedData=this.users.slice();
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
      allowOutsideClick:false,
      confirmButtonColor: '#007bff',
      showConfirmButton:true,
      showCancelButton:true,
    }).then(resp=>{
      if (resp.value){
        this.userServices.deleteUser(user.id.toString())
        .subscribe(resp=>{
          console.log('estoy aqui')
          this.users.splice(this.users.findIndex(e=> e.id===user.id),1);
          this.sortedData.splice(this.sortedData.findIndex(e=> e.id===user.id),1);
          },
          error=>{
            Swal.fire({
              title: 'Lo siento tuvimos un problema',
              text:`El registro de ${user.name} ${user.surname} no se eliminó`,
              allowOutsideClick:false,
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

  sortData(sort: Sort) {
    const data = this.users.slice(); 
    
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.UtilService.compare(a.id, b.id, isAsc);
        case 'nombre':
          return this.UtilService.compare(a.name, b.name, isAsc);
        case 'apellidos':
          return this.UtilService.compare(a.surname, b.surname, isAsc);
        case 'correo':
          return this.UtilService.compare(a.email, b.email, isAsc);         
        case 'rol':
          return this.UtilService.compare(a.rol.id, b.rol.id, isAsc);  
        default:
          return 0;          
      }
    });
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
