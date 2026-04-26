import { Component } from '@angular/core';
import { PaymentsService } from '../shared/services/payments.service';
import { ItemTableComponent } from '../shared/item-table/item-table.component';
import { filter, map, of, switchMap, take } from 'rxjs';
import { PAY_API_URL } from '../admin/service/payments-table.service';
import { IProcessingData } from '../shared/types';
import {
  PerformerStatementComponent
} from '../shared/performer-statement/performer-statement-table.abstract.component';

@Component({
  selector: 'app-performer-balance',
  imports: [ItemTableComponent],
  providers: [
    {provide: PAY_API_URL, useValue: 'payment/processing'},
    PaymentsService,
  ],
  templateUrl: '../shared/performer-statement/performer-statement-table.component.html',
  styleUrl: '../shared/performer-statement/performer-statement-table.component.scss'
})
export class PerformerBalanceComponent extends PerformerStatementComponent<IProcessingData>  {
  override getTableData() {
    of(this.authService.getPerformer().id)
      .pipe(
        switchMap(id => {
          return this.paymentService.getDataForProcessingById$(id);
        }),
        filter(Boolean),
        map(res => {
          delete (res as Partial<typeof res>)?.performerId;
          return [ res ];
        }),
        take(1)
    ).subscribe(balance => {
      this.itemsList = balance;

      if(!this.displayedColumns.length && balance.length > 0 ) {
        this.displayedColumns = ['performerName', 'amount'];
      }
    })
  }
}
