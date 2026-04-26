import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'empty',
  standalone: true,
})
export class EmptyStringPipe implements PipeTransform {

  transform(substring: string | null) : string {
    return substring || '-';
  }
}
