import { DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RtcAdaptorService } from '../shared/services/rtc-adaptor.service';
import { AuthService } from '../shared/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[streamVisibility]',
  standalone: true
})
export class StreamVisibilityDirective {
  nativeElement = inject(ElementRef).nativeElement
  authService =inject(AuthService);
  streamVisibility = input<boolean>();
  destroyRef = inject(DestroyRef)

  rtcAdaptorService = inject(RtcAdaptorService);

  constructor() {
    this.nativeElement.style.display = 'none';

    effect(() => {
      this.authService.role$()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(role => {
          if (role === 'member' && this.streamVisibility()) {
            this.nativeElement.style.removeProperty('display');
          } else {
            this.nativeElement.style.display = 'none';
          }
        })
    });
  }
}
