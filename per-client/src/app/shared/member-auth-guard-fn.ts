import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const memberAuthGuard = (): boolean => {
  const authService = inject(AuthService);
  const isAuth = authService.isAuthMember;

  if(!isAuth && authService.isBrowser){
    authService.clearStorage()
  }

  return true;
}
