import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpService } from '../../shared/services/http.abstaract.service';
import { IPayment } from '../../shared/types';

export const PAY_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable()
export class PaymentsTableService extends HttpService<IPayment>{
  protected override apiType = inject(PAY_API_URL);
}
