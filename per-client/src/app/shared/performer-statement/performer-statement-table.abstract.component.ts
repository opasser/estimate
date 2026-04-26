import { Component, DestroyRef, inject } from '@angular/core';
import { PaymentsService } from '../services/payments.service';
import { AuthService } from '../services/auth.service';
import { ITableItemAction } from '../types';
import { filter, of, switchMap, take } from 'rxjs';

@Component({
  template: '',
  standalone: true
})
export abstract class PerformerStatementComponent<T>{
  authService = inject(AuthService);
  paymentService = inject(PaymentsService);

  actionsList:ITableItemAction[] | [] = [];
  itemsList: any[] = [];
  displayedColumns: string[] = [];
  isLoadingResults = false;
  destroyRef = inject(DestroyRef);

 constructor() {
    this.getTableData()
  }

  getTableData() {
    of(this.authService.getPerformer().id)
      .pipe(
        filter(Boolean),
        switchMap(id => {
          return this.paymentService.getDataById<T>(id);
        }),
        take(1)
      ).subscribe(balance => {
        this.itemsList = balance;

        if(!this.displayedColumns.length && balance.length > 0 ) {
          (this.displayedColumns = [...Object.keys(balance[0] as keyof T)]);
        }
    })
  }

  getAction(event: any){}
}
