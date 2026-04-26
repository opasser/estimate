import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input } from '@angular/core';
import { Fancybox } from '@fancyapps/ui';
import { VImageUrlPipe } from '../../v-image-url.pipe';

@Component({
    selector: 'vision-gallery',
  imports: [VImageUrlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './v-gallery.component.html',
    styleUrl: './v-gallery.component.scss'
})
export class VGalleryComponent {
  performers = input.required<Vision.IPerformerContent[]>();
  assetType = input.required<string>();
  dynamicWidth = 300

  elRef = inject(ElementRef);
  thumbnails: { [key: string]: string } = {};
  protected readonly VImageUrlPipe = VImageUrlPipe;

  constructor() {
    effect(() => {
      if(this.performers()?.length) {
        this.performers().forEach(performer => {
          if (performer.assetType.includes("Video Thumbnail")) {
            this.thumbnails[performer.assetFile] = performer.assetFilePath
          }
        })
      }
    });
  }

  ngOnInit() {
    Fancybox.bind(this.elRef.nativeElement, '[data-fancybox]', {});
  }

  ngOnDestroy() {
    Fancybox.unbind(this.elRef.nativeElement);
    Fancybox.close();
  }

  getImageWidth(): number {
    return this.dynamicWidth; // Здесь можно добавить логику вычисления ширины
  }

  checkAssetType(imageType: string, type: string) {
    return imageType.includes(type)
  }

  getPlaceholder(performer: Vision.IPerformerContent): string {
    const baseName = performer.assetFile.split('_')[0];

    const placeholder = this.performers().find(p =>
      p.assetType.includes('Thumbnail') &&
      p.assetType.includes(performer.assetType.replace('Videos', '')) &&
      p.assetFile.startsWith(baseName)
    );

    return  placeholder?.assetFilePath || '' ;
  }
}
