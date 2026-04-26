import { Component, inject} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-members-login',
  templateUrl: './members-login.component.html',
  standalone: true,
  styleUrls: ['./members-login.component.css']
})
export class MembersLoginComponent {
  url!: SafeResourceUrl;
  translocoService = inject(TranslocoService);

  constructor(private sanitizer: DomSanitizer) {
    const timestamp = Date.now();
    let dynamicUrl!: string;

    this.translocoService.langChanges$
      .pipe( takeUntilDestroyed())
      .subscribe(lang => {
        if (lang === 'en') {
            dynamicUrl = `${environment.iframeLoginUrl}?t=${timestamp}`;
        } else {
            dynamicUrl = `${environment.iframeLoginUrl}?localea=set&locale=${lang}&t=${timestamp}`
        }
            this.url = this.sanitizer.bypassSecurityTrustResourceUrl(dynamicUrl);
      });
  }
}
