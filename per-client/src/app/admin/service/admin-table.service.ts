import { inject, Injectable, InjectionToken } from '@angular/core';
import { IAdmin } from '../../shared/types';
import { HttpService } from '../../shared/services/http.abstaract.service';

export const ADM_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable()
export class AdminTableService extends HttpService<IAdmin>{
  protected override apiType = inject(ADM_API_URL);
}
