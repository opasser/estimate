import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const performerAuthGuard = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthPerformer;

  if(!isAuth && authService.isBrowser) {
    authService.clearStorage();
    router.navigate(['/performer-login']);
  }

  return isAuth;
}


export const privateSessionGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthPerformer;

  if(!isAuth && authService.isBrowser) {
    authService.clearStorage()
    router.navigate(['/performer-login']);
  }

  return isAuth;
}
