import { Component, input } from '@angular/core';
import { CdnPipe } from '../cdn.pipe';

@Component({
    selector: 'app-view-avatar',
    imports: [CdnPipe],
    templateUrl: './view-avatar.component.html',
    styleUrl: './view-avatar.component.scss'
})
export class ViewAvatarComponent {
  imageUrl = input<string | null>(null);
  altText = input<string>('Avatar');
  width = input<number | null>(null);
}
