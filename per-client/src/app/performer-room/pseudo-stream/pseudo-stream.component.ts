import { Component, Input, inject } from '@angular/core';
import { OnlyGuestDirective } from '../../shared/only-guest.directive';
import { OnlyMemberDirective } from '../../shared/only-member.directive';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
    selector: 'perf-room-pseudo-stream',
    imports: [
      OnlyMemberDirective,
       OnlyGuestDirective,
        RouterLink,
        TranslocoDirective
      ],
    templateUrl: './pseudo-stream.component.html',
    styleUrl: './pseudo-stream.component.scss'
})
export class PseudoStreamComponent {
  @Input() status: string = 'offline';
  @Input() performerName: string | undefined;
  authService = inject(AuthService);
  signupUrl = environment.signupUrl;
}
