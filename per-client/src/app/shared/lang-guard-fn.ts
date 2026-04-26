import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { DOCUMENT } from '@angular/common';

export const langGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const translocoService = inject(TranslocoService);
  const document = inject(DOCUMENT);

  const lang = route.queryParamMap.get('lang');
  const referrer = document.referrer;
  const currentOrigin = document.location.origin;

  const isExternalReferrer =
    !referrer || !referrer.startsWith(currentOrigin);

  if (isExternalReferrer && lang) {
    translocoService.setActiveLang(lang);
  }

  return true;
};
