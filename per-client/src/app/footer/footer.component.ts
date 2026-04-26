import { Component, input } from '@angular/core';
import { templatePaths } from '../../pre-build/template.env';
import { OnlyGuestDirective } from '../shared/only-guest.directive';
import { environment } from '../../environments/environment';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'app-footer',
    imports: [ OnlyGuestDirective, TranslocoDirective ],
    templateUrl: templatePaths.footer.templateUrl,
    styleUrl: templatePaths.footer.styleUrl
})
export class FooterComponent {
  isAdminAuth = input<boolean>(false);
  signupUrl = environment.signupUrl;
}
