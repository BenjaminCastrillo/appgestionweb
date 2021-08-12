import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../interfaces/user-interface';

@Pipe({
  name: 'user'
})
export class UserPipe implements PipeTransform {

  transform(users: any, text: string,page:number,linesPage:number,longArray:number): User[] {

    if (text===''){ 
      users.forEach(element => { element.filter=false });
      return users.slice(page,page+linesPage) 
    }
    const resultado=[];
    for(let user of users){ 
      if (user.id.toString().toLowerCase().indexOf(text.toLowerCase())>-1 ||
          user.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          user.surname.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          user.email.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          user.customerUserList.findIndex(e=>e.name.toLowerCase().includes(text.toLowerCase()))>-1)      
      {
        user.filter=user.customerUserList.findIndex(e=>e.name.toLowerCase().includes(text.toLowerCase()))>-1?true:false;
        resultado.push(user);
      }
    }

    return resultado.slice(page,page+linesPage);
  }

}
