import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { IPayData, IPerformerPayments, IPerformerPayouts, IProcessingData, ITips, IUserData } from '../types';
import { PAY_API_URL } from '../../admin/service/payments-table.service';
import { switchMap, tap } from 'rxjs';

@Injectable()
export class PaymentsService {
  protected http = inject(HttpClient);
  protected apiType = inject(PAY_API_URL);
  public domainName = environment.domainName;
  authService = inject(AuthService);

  sendTips$(tips: ITips) {
    return this.http.post<{ userData: IUserData, message: string }>(`${this.domainName}/${this.apiType}/member-pay`, tips)
      .pipe(
        tap(({ userData }) => { this.saveBalance(userData) })
      )
  }

  saveBalance(balance: IUserData) {
    this.authService.setUserData(balance);
  }

  processPay$(payData: IPayData){
    return this.http.post(`${this.domainName}/admin/payment/pay`, payData)
  }

  getDataForProcessingById$(id: number) {
    return this.http.get<IProcessingData>(`${this.domainName}/${this.apiType}/${id}`);
  }

  getPayoutsById(id: number) {
    return this.http.get<IPerformerPayouts[]>(`${this.domainName}/${this.apiType}/${id}`)
  }

  getPaymentsById(id: number) {
    return this.http.get<IPerformerPayments[]>(`${this.domainName}/${this.apiType}/${id}`)
  }

  getDataById<T>(id: number) {
    return this.http.get<T[]>(`${this.domainName}/${this.apiType}/${id}`);
  }

  getBalance$(memberId: number) {
    return this.http.post<any>(`${this.domainName}/${this.apiType}/member-balance/${memberId}`, { memberId })
  }

  updateBalance$(memberId: number) {
    return this.getBalance$(memberId).pipe(tap(({ userData }) => { this.saveBalance(userData) }))
  }

  checkBalanceForPrivateSession$(memberId: number) {
    return this.updateBalance$(memberId).pipe(
      switchMap(() => this.authService.getTokensAmount$())
    )
  }
}

