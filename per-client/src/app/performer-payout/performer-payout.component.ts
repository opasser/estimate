import { Component } from '@angular/core';
import { PAY_API_URL } from '../admin/service/payments-table.service';
import { PaymentsService } from '../shared/services/payments.service';
import { IPerformerPayouts } from '../shared/types';
import { ItemTableComponent } from '../shared/item-table/item-table.component';
import {
  PerformerStatementComponent
} from '../shared/performer-statement/performer-statement-table.abstract.component';

@Component({
  selector: 'app-performer-payout',
  imports: [ItemTableComponent],
  providers: [
    { provide: PAY_API_URL, useValue: 'payment/payouts' },
    PaymentsService,
  ],
  templateUrl: '../shared/performer-statement/performer-statement-table.component.html',
  styleUrl: '../shared/performer-statement/performer-statement-table.component.scss'
})
export class PerformerPayoutComponent extends PerformerStatementComponent <IPerformerPayouts>{}
