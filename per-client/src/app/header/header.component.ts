import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { LogoComponent } from "../inc/logo/logo.component";
import { templatePaths } from "../../pre-build/template.env";
import { OnlyMemberDirective } from "../shared/only-member.directive";
import { OnlyGuestDirective } from "../shared/only-guest.directive";
import { ToggleMenuDirective } from "../shared/toggle-menu.directive";
import { environment } from "../../environments/environment";
import { TranslocoDirective } from "@jsverse/transloco";
import { LanguageSwitcherComponent } from "./language-switcher/language-switcher.component";

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    LogoComponent,
    OnlyMemberDirective,
    OnlyGuestDirective,
    ToggleMenuDirective,
    TranslocoDirective,
    LanguageSwitcherComponent,
],
  templateUrl: templatePaths.header.templateUrl,
  styleUrl: templatePaths.header.styleUrl,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  isAuth = input<boolean>(false);
  isAdminAuth = input<boolean>(false);
  isAuthPerformer = input<boolean>(false);
  isAuthMember = input<boolean>(false);
  logOut = output<void>();
  signupUrl = environment.signupUrl;
  coinAmount = input<string>('0');
  tokensTopUp = environment.tokensTopUp;
}
