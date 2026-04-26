import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vNormString',
  standalone: true
})
export class VNormalizeStringPipe implements PipeTransform {

  transform(value: string): unknown {
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }
}
