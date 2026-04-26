import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, switchMap, tap } from 'rxjs';
import { HttpService } from '../shared/services/http.abstaract.service';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from '../shared/services/auth.service';
import { DOCUMENT } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ILoginData } from '../shared/types';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthService extends HttpService<unknown> {
  route = inject(ActivatedRoute);
  router = inject(Router);
  authService = inject(AuthService);
  DOCUMENT = inject(DOCUMENT);
  translocoService = inject(TranslocoService);

  constructor() {
    super();

    const window = this.DOCUMENT.defaultView;
    this.route.queryParams
      .pipe(
        tap(() => {
          if (this.authService.isBrowser && window) {
            const currentUrl = new URL(window.location.href);

            if (currentUrl.pathname.includes('/bs/token-login')) {
              const newPath = currentUrl.pathname.replace('/bs/', '/#/');
              const newUrl = `${currentUrl.origin}${newPath}${currentUrl.search}`;
              window.history.replaceState({}, '', newUrl);
            }
          }
        }),
        map(params => ({
          token: params['token'],
          path: params['path']
        })),
        filter(f => f.token),
        switchMap(s => this.sendToken$(s.token)),
        takeUntilDestroyed()
      )
      .subscribe(({token, userData, path, lang }) => {
        this.translocoService.setActiveLang(lang);
        this.authService.clearStorage();
        this.authService.setUserData(userData)
        this.authService.setToken(token, this.authService.TOKEN_KEY);
        this.router.navigate([path || '/performers']);
      });
  }

  sendToken$(token: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('token', token);

    return this.http.post<ILoginData>(`${this.domainName}/member-login`, body.toString(), {headers})
  }
}
