import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

// example:
// imports: [NgOptimizedImage],
// <img [ngSrc]="'substring' | cdn" ..... >
// <link rel="preconnect" href="cdn-url" />

@Pipe({
  name: 'cdn',
  standalone: true,
})
export class CdnPipe implements PipeTransform {

  transform(substring: string | null) : string {
    if (!substring) { return 'img/no-avatar.webp'}

    return `${environment.cdnUrl || environment.domainName}${substring.trim()}`;
  }
}
