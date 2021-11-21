import { Pipe, PipeTransform } from '@angular/core';
import { Schedule } from '../interfaces/venue-interface';

@Pipe({
  name: 'schedules'
})
export class SchedulesPipe implements PipeTransform {

 

    transform(schedules: any, text: string,page:number,linesPage:number,longArray:number): Schedule[] {
    

      if (text==='') return schedules.slice(page,page+linesPage) 
      
      const resultado=[];
 
      for(let schedule of schedules){
        if (schedule.id.toString().toLowerCase().indexOf(text.toLowerCase())>-1 ||
        schedule.description.toLowerCase().indexOf(text.toLowerCase())>-1 ||
        schedule.startDate.description.toLowerCase().indexOf(text.toLowerCase())>-1
        )
        {
          resultado.push(schedule);
        }
      }
      
      return resultado.slice(page,page+linesPage);


  }

}
