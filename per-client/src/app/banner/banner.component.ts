import { Component, computed, input } from '@angular/core';
import { IBanner } from '../shared/types';
import { CdnPipe } from '../shared/cdn.pipe';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-banner',
  imports: [CdnPipe, NgTemplateOutlet],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  role = input.required<string>();
  banners = input.required<IBanner[]>();
  lang = input.required<string>();

  showBanners = computed(() => this.banners()
    ?.filter((i) => {
        return (i.scope === this.role()
          || i.scope === 'all'
          || (i.scope === 'preview' && this.role() === 'guest')
          ) && i.locale === this.lang();
      }
    )
  );
}
