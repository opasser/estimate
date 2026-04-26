import { inject, Injectable } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { combineLatest, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TSection } from '../shared/types';
import { environment } from '../../environments/environment';
import { IShowBanner } from '../main/main.component';
import { TranslocoService } from '@jsverse/transloco';

enum sections {
  'top' = 'index-top',
  'mid' = 'index-mid',
  'bot' = 'index-bottom',
  'cus' = 'custom'
}

@Injectable({ providedIn: 'root' })
export class BannerService {
  http = inject(HttpClient);
  authService = inject(AuthService);
  translocoService = inject(TranslocoService);
  public domainName = environment.domainName;

  public sections = sections;

  getAll$(section: TSection[] = []) {
    const params = new HttpParams({ fromObject: { section } });

    return this.http.get<{grouped: IShowBanner}>(`${this.domainName}/banners/all`, { params })
      .pipe(map(({grouped}) => grouped));
  }

  getBannerData$(section: TSection[] = []) {
    return combineLatest([
      this.authService.role$(),
      this.getAll$(section)
    ]).pipe(
      map(([role, banners]: [string, IShowBanner]) => ({ role, banners }))
    )
  }

  get curLang(): string {
    return this.translocoService.getActiveLang();
  }
}
