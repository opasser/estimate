import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpService } from '../../shared/services/http.abstaract.service';
import { IStream } from '../../shared/types';

export const STR_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable()
export class StreamTableService extends HttpService<IStream> {
  protected override apiType = inject(STR_API_URL);
}
