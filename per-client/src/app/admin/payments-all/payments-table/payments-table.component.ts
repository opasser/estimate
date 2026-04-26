import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { EntityTableComponent } from '../../../shared/entity-table/entity-table.abstract.component';
import { IPayment } from '../../../shared/types';
import { ItemTableComponent } from '../../../shared/item-table/item-table.component';
import { PAY_API_URL, PaymentsTableService } from '../../service/payments-table.service';

@Component({
  selector: 'app-payments-table',
  imports: [
    ReactiveFormsModule,
    ItemTableComponent,
    MatPaginator,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],

  providers: [
    PaymentsTableService,
    { provide: PAY_API_URL, useValue: '/admin/payment/all' },
  ],
  templateUrl: '../../../shared/entity-table/entity-table.component.html',
  styleUrl: '../../../shared/entity-table/entity-table.component.scss'
})
export class PaymentsTableComponent extends EntityTableComponent<IPayment> {

  override itemService = inject(PaymentsTableService);

}
