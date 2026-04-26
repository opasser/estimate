import { inject, Pipe, PipeTransform } from '@angular/core';
import { visionEnvironment } from './environment.vision';
import { VAuthService } from './v-auth.service';

@Pipe({
  name: 'vImageUrl',
  standalone: true,
})
export class VImageUrlPipe implements PipeTransform {
  authService = inject(VAuthService);
  transform(value: string | undefined, width?: number): string {

    if (!value) return '';

    const widthParam = width ? `&width=${width}` : '';

    return `${visionEnvironment.domainName}/api/performer/performer-asset?token=${
      this.authService.getToken(this.authService.VISION_TOKEN_KEY)
    }&assetFilePath=${value}${widthParam}`
  }
}
