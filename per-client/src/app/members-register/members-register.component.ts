import { Component} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-members-register',
  templateUrl: './members-register.component.html',
  standalone: true,
  styleUrls: ['./members-register.component.css']
})
export class MembersRegisterComponent {
  url!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(environment.iframeRegisterUrl);
  }
}
