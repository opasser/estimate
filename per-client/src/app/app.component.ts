import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { AuthService } from './shared/services/auth.service';
import { templatePaths } from '../pre-build/template.env';
import { MemberAuthService } from './members-login/member-auth.service';
import { HeadMetaService } from './shared/services/head-meta.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FooterComponent, HeaderComponent],
    templateUrl: './app.component.html',
    // styleUrl: './app.component.scss'
    styleUrls: [templatePaths.app.styleUrl]
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  memberTokenService = inject(MemberAuthService);
  headMetaService = inject(HeadMetaService);
  coinAmount = toSignal(this.authService.getTokensAmount$(), { initialValue: '0' });

  ngOnInit() {
    if (this.authService.isServer) {
      this.headMetaService.setHead();
    }
  }

  logOut() {
    if(this.router.url === '/') {
      this.authService.clearStorage();
      return
    }

    this.router.navigate(['']).then((e) => {
      //new http token after logout
      if(e) setTimeout(() => {
        this.authService.clearStorage() }, 100)
    });
  }

  activate($event: any) {
    this.headMetaService.setCanonical($event);
  }
}
