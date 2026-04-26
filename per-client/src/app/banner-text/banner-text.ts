import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-banner-text',
  imports: [
    TranslocoDirective
  ],
  templateUrl: './banner-text.html',
  styleUrl: './banner-text.scss',
})
export class BannerText {
  signupUrl = environment.signupUrl;
}
