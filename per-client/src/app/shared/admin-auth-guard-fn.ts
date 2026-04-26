import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const adminAuthGuard = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthAdmin;

  if(!isAuth && authService.isBrowser){
    authService.clearStorage()
    router.navigate(['/admin-login']);
  }

  return isAuth;
}
