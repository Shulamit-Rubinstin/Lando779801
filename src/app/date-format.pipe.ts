import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (!value) return value;
    
    // Create a new Date object from the input value
    const date = new Date(value);
    
    // Format the date to 'dd/MM/yyyy'
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
}
