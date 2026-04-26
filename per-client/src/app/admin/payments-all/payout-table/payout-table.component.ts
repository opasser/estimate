import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ItemTableComponent } from '../../../shared/item-table/item-table.component';
import { PAY_API_URL, PaymentsTableService } from '../../service/payments-table.service';
import { EntityTableComponent } from '../../../shared/entity-table/entity-table.abstract.component';

@Component({
  selector: 'app-payout-table',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    PaymentsTableService,
    { provide: PAY_API_URL, useValue: '/admin/payment/payouts' },
  ],
  templateUrl: '../../../shared/entity-table/entity-table.component.html',
  styleUrl: '../../../shared/entity-table/entity-table.component.scss'
})

export class PayoutTableComponent extends EntityTableComponent<any> {

  override itemService = inject(PaymentsTableService);

}
