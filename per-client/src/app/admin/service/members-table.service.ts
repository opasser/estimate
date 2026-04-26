import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpService } from '../../shared/services/http.abstaract.service';
import { IMember } from '../../shared/types';

export const MEM_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable()
export class MembersTableService extends HttpService<IMember> {
  protected override apiType = inject(MEM_API_URL);
}
