import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { Fancybox } from '@fancyapps/ui';
import { CdnPipe } from '../../shared/cdn.pipe';
import { IOldImage } from '../../shared/types';

@Component({
    selector: 'app-gallery',
    imports: [ CdnPipe ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  gallery = input.required<IOldImage[]>();
  elRef = inject(ElementRef);

  ngOnInit() {
    Fancybox.bind(this.elRef.nativeElement, '[data-fancybox]', {});
  }

  ngOnDestroy() {
    Fancybox.unbind(this.elRef.nativeElement);
    Fancybox.close();
  }
}
