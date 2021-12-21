import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../interfaces/customer-interface';
import { PageEvent } from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import { UtilService } from '../../services/util.service';

 

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public customers:Customer[];
  public cargando:boolean=false;
  public filterCustomer:string='';
  public pageNumber:number=0;
  public pageSize:number=5;
  public pageSizeOptions=[5,10,20,50,100]; 
  public sortedData:Customer[];


 
  constructor(private customerServices:CustomerService,
    private UtilService:UtilService) {   
    
  } 

  ngOnInit(): void {
    this.cargando=true;
    this.customerServices.getCustomers()
    .subscribe(resp=>{
      if (resp.result===true) this.customers=resp.data;
      this.cargando=false;
      this.sortedData=this.customers.slice();
      });
   
  }



  handlePage(e:PageEvent){

    this.pageSize=e.pageSize;
    this.pageNumber=e.pageIndex;
  }


  sortData(sort: Sort) {
    const data = this.customers.slice(); 
    
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      console.log(a,b)
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.UtilService.compare(a.id, b.id, isAsc);
        case 'cif':
          return this.UtilService.compare(a.identification, b.identification, isAsc);
        case 'nombre':
          return this.UtilService.compare(a.name, b.name, isAsc);
        default:
          return 0;
      }
    });
  }

  buscar(tecla:string){

    this.pageNumber=0  ;
    return  
  }
  // nextPage(){

  //   this.pageNumber +=this.pageSize;
  //   return  
  // }
  // prevPage(){

  //   this.pageNumber -=this.pageSize;
  //   return  
  // }


}
