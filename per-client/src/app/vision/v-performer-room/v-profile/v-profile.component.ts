import { Component, input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { TranslocoPipe } from "@jsverse/transloco";
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'vision-profile',
  imports: [KeyValuePipe, TranslocoModule],
  providers: [TranslocoPipe],
  templateUrl: './v-profile.component.html',
  styleUrl: './v-profile.component.scss'
})
export class VProfileComponent {
  profile = input.required<Vision.IPerformerProfile>();
}
