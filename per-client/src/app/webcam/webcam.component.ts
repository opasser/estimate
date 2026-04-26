import { Component, input } from '@angular/core';

@Component({
    selector: 'app-webcam',
    imports: [],
    templateUrl: './webcam.component.html',
    styleUrl: './webcam.component.scss'
})
export class WebcamComponent {
  status = input.required<string>()
}
