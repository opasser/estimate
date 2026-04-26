import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-payments-table-all',
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  templateUrl: './payments-all.component.html',
  styleUrl: './payments-all.component.scss'
})
export class PaymentsAllComponent {

}
