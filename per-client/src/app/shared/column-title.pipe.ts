import { Pipe, PipeTransform } from '@angular/core';

enum columnTitles {
  createdAt = 'Created',
  updatedAt = 'Updated',
  amount = 'Amount $',
  sum = 'Sum $'
}

@Pipe({
  name: 'title',
  standalone: true
})
export class TitlePipe implements PipeTransform {

  transform(value: string): unknown {
    const title = columnTitles[value as keyof typeof columnTitles];
    return title || this.capitalize(value);
  }

  capitalize(value: string): string {
    const words = value.replace(/([a-z])([A-Z])/g, '$1 $2');

    return words
      .split(' ')
      .map((word, index) =>
        index === 0
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : word.toLowerCase()
      )
      .join(' ');
  }
}
