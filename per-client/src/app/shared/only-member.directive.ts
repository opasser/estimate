import { Directive, ElementRef, inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[onlyMember]',
  standalone: true
})
export class OnlyMemberDirective {
  nativeElement = inject(ElementRef).nativeElement
  authService =inject(AuthService);

  constructor() {
    this.nativeElement.style.display = 'none';
    this.authService.role$()
      .pipe(takeUntilDestroyed())
      .subscribe(role => {
        if (role === 'member') {
          this.nativeElement.style.removeProperty('display');
        } else {
          this.nativeElement.style.display = 'none';
        }
      })
  }
}
