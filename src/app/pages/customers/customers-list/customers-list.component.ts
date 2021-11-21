import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../interfaces/customer-interface';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css']
})
export class CustomersListComponent implements OnInit {

  public customers:Customer[];
  public cargando:boolean=false;
  public filterCustomer:string='';
  public page:number=0;
  public linesPages:number=8;
  


  
  constructor(private customerServices:CustomerService,
    private router:Router ) {

   }

  ngOnInit(): void {

    this.cargando=true;
    this.customerServices.getCustomers()
    .subscribe(resp=>{
      if (resp.result===true) this.customers=resp.data;
      this.cargando=false;
      });
  }

  removeCustomer(customer:Customer,i:number){

  

    Swal.fire({
      title:'¿Desea borrar el registro?',
      text: `${customer.name}`,
      icon: 'question',
      cancelButtonText:'Cancelar',
      confirmButtonColor: '#007bff',
      showConfirmButton:true,
      showCancelButton:true,
    }).then(resp=>{
      if (resp.value){
        

        this.customerServices.deleteCustomer(customer.id.toString())
        .subscribe(resp=>{
          this.customers.splice(this.customers.findIndex(e=> e.id===customer.id),1);
          },
          error=>{
            Swal.fire({
              title: 'Lo siento tuvimos un problema',
              text:`El registro de ${customer.name} no se eliminó`,
              confirmButtonColor: '#007bff',
              icon:'error'
            });
            console.log(error.error.result);
          });
      }
    })

  return
  }
  editCustomer(customer:Customer){

    this.router.navigate(['/customer',customer.id]);
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
