import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'user'
})
export class UserPipe implements PipeTransform {

  transform(users: any, text: string,page:number,linesPage:number): unknown {
    if (text===''){ 
      console.log(page,page+linesPage)
      return users.slice(page,page+linesPage) 
    }
    const resultado=[];
    for(let user of users){
      if (user.name.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          user.surname.toLowerCase().indexOf(text.toLowerCase())>-1 ||
          user.email.toLowerCase().indexOf(text.toLowerCase())>-1) 
      {
        resultado.push(user);
      }
    }
    return resultado.slice(page,page+linesPage);
  }

}
