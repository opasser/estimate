import { Directive, ElementRef, inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[onlyGuest]',
  standalone: true
})
export class OnlyGuestDirective{
  nativeElement = inject(ElementRef).nativeElement
  authService =inject(AuthService);
  ROLE_GUEST = 'guest';

  constructor() {
    this.nativeElement.style.display = 'none';
      this.authService.role$()
        .pipe(takeUntilDestroyed())
        .subscribe(role => {
          if (role === this.ROLE_GUEST) {
            this.nativeElement.style.removeProperty('display');
          } else {
            this.nativeElement.style.display = 'none';
          }
        })
  }
}
