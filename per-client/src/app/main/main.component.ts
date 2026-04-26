import { Component, inject } from '@angular/core';
import { BannerService } from '../banner/banner.service';
import { IBanner } from '../shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BannerComponent } from '../banner/banner.component';
import { templatePaths } from '../../pre-build/template.env';
import { BannerText } from '../banner-text/banner-text';

export interface IShowBanner {
 [key: string]: IBanner[]
}

@Component({
  selector: 'app-main',
  imports: [
    BannerComponent,
    BannerText
  ],
  templateUrl: templatePaths.main.templateUrl,
  styleUrl: templatePaths.main.styleUrl,
  // templateUrl: './main.component.html',
  // styleUrl: './main.component.scss'
})
export class MainComponent {
  bannerService = inject(BannerService);
  banners!: IShowBanner;
  role!: string;
  sections = this.bannerService.sections;

  constructor() {
    this.bannerService.getBannerData$([
      this.sections.top,
      this.sections.mid,
      this.sections.bot,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(({banners, role}) => {
        this.banners = banners;
        this.role = role;
      })
  }
}
