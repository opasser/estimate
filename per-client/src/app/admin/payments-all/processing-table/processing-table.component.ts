import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { EntityTableComponent } from '../../../shared/entity-table/entity-table.abstract.component';
import { ItemTableComponent } from '../../../shared/item-table/item-table.component';
import { PAY_API_URL, PaymentsTableService } from '../../service/payments-table.service';
import { IProcessingData, ITableItemAction } from '../../../shared/types';

const actionList: ITableItemAction[] = [
    {
      actionName:  'makePayment',
      propertyName: 'performerId',
      iconNane: 'payment',
      tooltip: 'To payment'
    },
  ]

@Component({
  selector: 'app-processing',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [
    PaymentsTableService,
    { provide: PAY_API_URL, useValue: '/admin/payment/processing' },
  ],
  templateUrl: '../../../shared/entity-table/entity-table.component.html',
  styleUrl: '../../../shared/entity-table/entity-table.component.scss'
})
export class ProcessingTableComponent extends EntityTableComponent<IProcessingData> {
  override itemService = inject(PaymentsTableService);
  override actionsList : ITableItemAction[] = actionList;

  makePayment(performerId: number) {
    this.router.navigate(['admin/payments/processing', performerId])
  }
}
