import { Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  imports: [],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss'
})
export class ToggleButtonComponent {
  @Output() changed = new EventEmitter<boolean>();
  checked = input.required<boolean>();
  label = input.required<string>();
}
