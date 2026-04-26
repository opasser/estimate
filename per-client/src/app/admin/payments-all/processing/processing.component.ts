import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, take } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { PaymentsService } from '../../../shared/services/payments.service';
import { PAY_API_URL } from '../../service/payments-table.service';
import { IPayData, IProcessingData } from '../../../shared/types';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-processing',
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    ReactiveFormsModule,
    MatInput,
    MatFormFieldModule,
    CurrencyPipe
  ],
  providers: [
    {provide: PAY_API_URL, useValue: 'admin/payment/processing'},
    PaymentsService,
  ],
  templateUrl: './processing.component.html',
  styleUrl: './processing.component.scss'
})
export class ProcessingComponent {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentsService);
  processingData!: IProcessingData;
  router = inject(Router);
  comment: string = '';

  constructor() {
    this.route.params
      .pipe(
        switchMap(({id}) => this.paymentService.getDataForProcessingById$(id)),
        take(1)
      ).subscribe((data) => this.processingData = data)
  }

  onSubmit() {
    const payData: IPayData = {
      performerId: this.processingData.performerId,
      amount: this.processingData.amount,
      comment: this.comment,
    }

    this.paymentService.processPay$(payData)
      .pipe(take(1)).subscribe(() => this.router.navigate(['/admin/payments/all']));
  }

  disable() {
    return false;
  }
}
