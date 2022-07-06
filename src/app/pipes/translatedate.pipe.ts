import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'; 

@Pipe({
  name: 'translatedate'
})
export class TranslatedatePipe implements PipeTransform {

  constructor(private translateService: TranslateService) { }

  transform(value: Date, format = 'mediumDate'): string {
    const datePipe = new DatePipe(this.translateService.currentLang);

    return datePipe.transform(value, format);

}
}
